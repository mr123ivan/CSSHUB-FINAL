package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.Order;
import com.ccshub.ccsHub.entity.OrderDto;
import com.ccshub.ccsHub.entity.Merchandise;
import com.ccshub.ccsHub.repository.OrderRepository;
import com.ccshub.ccsHub.repository.UserRepository;
import com.ccshub.ccsHub.repository.MerchandiseRepository;
import com.ccshub.ccsHub.repository.EventRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MerchandiseRepository merchandiseRepo;

    @Autowired
    private EventRepository eventRepo;

    @GetMapping
    public ResponseEntity<List<Order>> listOrders(@RequestParam(required = false) String keyword) {
        List<Order> orders = (keyword == null || keyword.isBlank())
                ? orderRepo.getAllOrders()
                : orderRepo.searchOrders(keyword);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderDto dto) {
        try {
            System.out.println("Received order creation request: " + dto.toString());
            
            // Create a simplified order with direct JDBC to avoid relationship issues
            Integer orderId = createSimplifiedOrder(dto);
            
            if (orderId != null) {
                // Create a simple response object
                Map<String, Object> response = new HashMap<>();
                response.put("orderId", orderId);
                response.put("message", "Order created successfully");
                response.put("status", "success");
                
                System.out.println("Order created successfully with ID: " + orderId);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create order in database");
            }
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating order: " + e.getMessage());
        }
    }
    
    private Integer createSimplifiedOrder(OrderDto dto) {
        try {
            // Use direct JDBC to insert the order
            String sql = "INSERT INTO orders (user_id, merchandise_id, event_id, total_amount, order_date, payment_status, order_status) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING order_id";
            
            Integer userId = dto.getUserId();
            Integer merchandiseId = dto.getMerchandiseId();
            Integer eventId = dto.getEventId();
            Double totalAmount = dto.getTotalAmount();
            LocalDateTime orderDate = dto.getOrderDate() != null ? dto.getOrderDate() : LocalDateTime.now();
            String paymentStatus = dto.getPaymentStatus() != null ? dto.getPaymentStatus() : "Verification Needed";
            String orderStatus = dto.getOrderStatus() != null ? dto.getOrderStatus() : "Processing";
            
            // Execute the query and get the generated ID
            Integer orderId = orderRepo.getJdbcTemplate().queryForObject(
                sql,
                Integer.class,
                userId,
                merchandiseId,
                eventId,
                totalAmount,
                java.sql.Timestamp.valueOf(orderDate),
                paymentStatus,
                orderStatus
            );
            
            // If we have a receipt image, update it separately to avoid memory issues
            if (dto.getReceiptImageBase64() != null && !dto.getReceiptImageBase64().isEmpty()) {
                try {
                    System.out.println("Receipt image provided, length: " + dto.getReceiptImageBase64().length());
                    byte[] imageBytes = Base64.getDecoder().decode(dto.getReceiptImageBase64());
                    
                    // Update the order with the receipt image
                    String updateSql = "UPDATE orders SET receipt_image = ? WHERE order_id = ?";
                    orderRepo.getJdbcTemplate().update(updateSql, imageBytes, orderId);
                    
                    System.out.println("Receipt image saved for order ID: " + orderId);
                } catch (Exception e) {
                    System.err.println("Error saving receipt image: " + e.getMessage());
                    // Continue without the image rather than failing the whole request
                }
            }
            
            return orderId;
        } catch (Exception e) {
            System.err.println("Error in createSimplifiedOrder: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    @PostMapping("/upload-receipt/{orderId}")
    public ResponseEntity<?> uploadReceipt(
            @PathVariable int orderId,
            @RequestParam("receiptImage") MultipartFile receiptImage) {
        
        Order order = orderRepo.getOrderById(orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            order.setReceiptImage(receiptImage.getBytes());
            // Update payment status
            order.setPaymentStatus("Verification Needed");
            orderRepo.updateOrder(order);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/receipt-image/{orderId}")
    public ResponseEntity<byte[]> getReceiptImage(@PathVariable int orderId) {
        Order order = orderRepo.getOrderById(orderId);
        if (order == null || order.getReceiptImage() == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(order.getReceiptImage());
    }

    @PostMapping("/update/{orderId}")
    public ResponseEntity<?> updateOrder(@PathVariable int orderId, @RequestBody OrderDto dto) {
        Order existingOrder = orderRepo.getOrderById(orderId);
        if (existingOrder == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Get the previous payment status to check if it's being updated to "Approved"
        String previousPaymentStatus = existingOrder.getPaymentStatus();
        
        // Only update the fields that are provided
        if (dto.getPaymentStatus() != null) existingOrder.setPaymentStatus(dto.getPaymentStatus());
        if (dto.getOrderStatus() != null) existingOrder.setOrderStatus(dto.getOrderStatus());
        
        // Update the order
        orderRepo.updateOrder(existingOrder);
        
        // If payment is being approved, update merchandise inventory
        if (dto.getPaymentStatus() != null && 
            dto.getPaymentStatus().equals("Approved") && 
            !"Approved".equals(previousPaymentStatus)) {
            
            // If this is a merchandise order, reduce inventory
            if (existingOrder.getMerchandise() != null) {
                try {
                    // Get current merchandise using correct method name
                    Merchandise merchandise = merchandiseRepo.getMerchandise(existingOrder.getMerchandise().getId());
                    if (merchandise != null) {
                        // Reduce stock by 1
                        int currentStock = merchandise.getStock();
                        if (currentStock > 0) {
                            merchandise.setStock(currentStock - 1);
                            merchandiseRepo.updateMerchandise(merchandise);
                            System.out.println("Updated inventory for merchandise ID " + merchandise.getId() + 
                                              ". New stock: " + (currentStock - 1));
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error updating merchandise inventory: " + e.getMessage());
                    // Don't fail the order update if inventory update fails
                }
            }
        }
        
        return ResponseEntity.ok(existingOrder);
    }

    @PutMapping("/edit/{orderId}")
    public ResponseEntity<Order> editFullOrder(@PathVariable int orderId, @RequestBody OrderDto dto) {
        Order order = orderRepo.getOrderById(orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // Update basic info
        order.setTotalAmount(dto.getTotalAmount());
        if (dto.getOrderDate() != null) {
            order.setOrderDate(dto.getOrderDate());
        }
        
        // Update status fields if provided
        if (dto.getPaymentStatus() != null) {
            // Store previous status to check if payment is being approved
            String previousStatus = order.getPaymentStatus();
            order.setPaymentStatus(dto.getPaymentStatus());
            
            // If payment is being approved, update merchandise inventory
            if (dto.getPaymentStatus().equals("Approved") && 
                !"Approved".equals(previousStatus) && 
                order.getMerchandise() != null) {
                
                try {
                    // Get current merchandise using correct method name
                    Merchandise merchandise = merchandiseRepo.getMerchandise(order.getMerchandise().getId());
                    if (merchandise != null) {
                        // Reduce stock by 1
                        int currentStock = merchandise.getStock();
                        if (currentStock > 0) {
                            merchandise.setStock(currentStock - 1);
                            merchandiseRepo.updateMerchandise(merchandise);
                            System.out.println("Updated inventory for merchandise ID " + merchandise.getId() + 
                                              ". New stock: " + (currentStock - 1));
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error updating merchandise inventory: " + e.getMessage());
                    // Don't fail the order update if inventory update fails
                }
            }
        }
        
        if (dto.getOrderStatus() != null) {
            order.setOrderStatus(dto.getOrderStatus());
        }
        
        // Update references
        order.setUser(userRepo.getUserById(dto.getUserId()));
        order.setMerchandise(merchandiseRepo.getMerchandise(dto.getMerchandiseId()));
        order.setEvent(eventRepo.getEvent(dto.getEventId()));

        // Update receipt image if provided
        if (dto.getReceiptImageBase64() != null && !dto.getReceiptImageBase64().isEmpty()) {
            try {
                byte[] imageBytes = Base64.getDecoder().decode(dto.getReceiptImageBase64());
                order.setReceiptImage(imageBytes);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        orderRepo.updateOrder(order);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable int userId) {
        List<Order> orders = orderRepo.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable int id) {
        orderRepo.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}

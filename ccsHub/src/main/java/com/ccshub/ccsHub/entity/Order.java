package com.ccshub.ccsHub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private int orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = true)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "merchandise_id", nullable = true)
    private Merchandise merchandise;

    private double totalAmount;
    private LocalDateTime orderDate;
    
    @Lob
    @Column(name = "receipt_image", columnDefinition = "LONGBLOB")
    private byte[] receiptImage;
    
    @Column(name = "payment_status")
    private String paymentStatus;
    
    @Column(name = "order_status")
    private String orderStatus;

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    // Getters and Setters
    public int getOrderId() { return orderId; }
    public void setOrderId(int orderId) { this.orderId = orderId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Merchandise getMerchandise() { return merchandise; }
    public void setMerchandise(Merchandise merchandise) { this.merchandise = merchandise; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    
    public byte[] getReceiptImage() { return receiptImage; }
    public void setReceiptImage(byte[] receiptImage) { this.receiptImage = receiptImage; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

}


package com.ccshub.ccsHub.entity;

import java.time.LocalDateTime;

public class OrderDto {

    private int orderId;
    private int userId;
    private Integer eventId; // Nullable
    private Integer merchandiseId; // Nullable
    private double totalAmount;
    private LocalDateTime orderDate;
    private String receiptImageBase64; // For transmitting image data
    private String paymentStatus;
    private String orderStatus;

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    // Constructors
    public OrderDto() {}

    public OrderDto(int userId, Integer eventId, Integer merchandiseId, double totalAmount, String paymentStatus, String orderStatus) {
        this.userId = userId;
        this.eventId = eventId;
        this.merchandiseId = merchandiseId;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.orderStatus = orderStatus;
    }

    // Getters and Setters
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Integer getEventId() {
        return eventId;
    }

    public void setEventId(Integer eventId) {
        this.eventId = eventId;
    }

    public Integer getMerchandiseId() {
        return merchandiseId;
    }

    public void setMerchandiseId(Integer merchandiseId) {
        this.merchandiseId = merchandiseId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getReceiptImageBase64() {
        return receiptImageBase64;
    }
    
    public void setReceiptImageBase64(String receiptImageBase64) {
        this.receiptImageBase64 = receiptImageBase64;
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    public String getOrderStatus() {
        return orderStatus;
    }
    
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
    
    @Override
    public String toString() {
        return "OrderDto{" +
                "userId=" + userId +
                ", merchandiseId=" + merchandiseId +
                ", eventId=" + eventId +
                ", totalAmount=" + totalAmount +
                ", orderDate=" + orderDate +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", orderStatus='" + orderStatus + '\'' +
                ", receiptImageBase64='" + (receiptImageBase64 != null ? "[PROVIDED]" : "null") + '\'' +
                '}';
    }
}

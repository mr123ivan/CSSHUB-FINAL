package com.ccshub.ccsHub.entity;

import java.math.BigDecimal;

public class PaymentDto {
    
    private int userId;
    private Integer eventId;         // Nullable
    private Integer merchandiseId;   // Nullable
    private BigDecimal amount;
    private String status;

    public PaymentDto() {}

    public PaymentDto(int userId, Integer eventId, Integer merchandiseId, BigDecimal amount, String status) {
        this.userId = userId;
        this.eventId = eventId;
        this.merchandiseId = merchandiseId;
        this.amount = amount;
        this.status = status;
    }

    // Getters and Setters

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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

package com.ccshub.ccsHub.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private int paymentId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event eventId;

    @ManyToOne
    @JoinColumn(name = "merchandise_id")
    private Merchandise merchandiseId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(length = 20)
    private String status;


    public int getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(int paymentId) {
        this.paymentId = paymentId;
    }

    public User getUser() {
        return userId;
    }

    public void setUser(User userId) {
        this.userId = userId;
    }

    public Event getEvent() {
        return eventId;
    }

    public void setEvent(Event eventId) {
        this.eventId = eventId;
    }

    public Merchandise getMerchandise() {
        return merchandiseId;
    }

    public void setMerchandise(Merchandise merchandiseId) {
        this.merchandiseId = merchandiseId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
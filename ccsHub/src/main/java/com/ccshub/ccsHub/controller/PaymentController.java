package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.Payment;
import com.ccshub.ccsHub.entity.PaymentDto;
import com.ccshub.ccsHub.repository.PaymentRepository;
import com.ccshub.ccsHub.repository.UserRepository;
import com.ccshub.ccsHub.repository.MerchandiseRepository;
import com.ccshub.ccsHub.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MerchandiseRepository merchandiseRepo;

    @Autowired
    private EventRepository eventRepo;

    @GetMapping
    public ResponseEntity<List<Payment>> listPayments() {
        List<Payment> payments = paymentRepo.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/create")
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentDto dto) {
        Payment payment = new Payment();
        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus());

        payment.setUser(userRepo.getUserById(dto.getUserId()));
        payment.setMerchandise(merchandiseRepo.getMerchandise(dto.getMerchandiseId()));
        payment.setEvent(eventRepo.getEvent(dto.getEventId()));

        paymentRepo.createPayment(payment);
        return ResponseEntity.ok(payment);
    }

    @PutMapping("/edit/{paymentId}")
    public ResponseEntity<Payment> updatePayment(@PathVariable int paymentId, @RequestBody PaymentDto dto) {
        Payment payment = paymentRepo.getPaymentById(paymentId);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus());
        payment.setUser(userRepo.getUserById(dto.getUserId()));
        payment.setMerchandise(merchandiseRepo.getMerchandise(dto.getMerchandiseId()));
        payment.setEvent(eventRepo.getEvent(dto.getEventId()));

        paymentRepo.updatePayment(payment);
        return ResponseEntity.ok(payment);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable int id) {
        paymentRepo.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<PaymentDto>> searchPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer merchandiseId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        List<Payment> payments = paymentRepo.searchPayments(status, userId, eventId, merchandiseId, dateFrom, dateTo);
        List<PaymentDto> dtos = payments.stream().map(payment -> {
            PaymentDto dto = new PaymentDto();
            dto.setAmount(payment.getAmount());
            dto.setStatus(payment.getStatus());

            if (payment.getUser() != null) {
                dto.setUserId(payment.getUser().getUserId());
            }
            if (payment.getEvent() != null) {
                dto.setEventId(payment.getEvent().getEventId());
            }
            if (payment.getMerchandise() != null) {
                dto.setMerchandiseId(payment.getMerchandise().getId());
            }

            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

}

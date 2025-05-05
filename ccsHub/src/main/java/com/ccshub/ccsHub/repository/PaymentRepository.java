package com.ccshub.ccsHub.repository;

import com.ccshub.ccsHub.entity.Payment;
import com.ccshub.ccsHub.entity.Event;
import com.ccshub.ccsHub.entity.Merchandise;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class PaymentRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MerchandiseRepository merchandiseRepo;

    @Autowired
    private EventRepository eventRepo;

    public List<Payment> getAllPayments() {
        List<Payment> payments = new ArrayList<>();
        String sql = "SELECT * FROM payment ORDER BY payment_id";

        SqlRowSet rows = jdbcTemplate.queryForRowSet(sql);
        while (rows.next()) {
            Payment payment = new Payment();
            payment.setPaymentId(rows.getInt("payment_id"));
            payment.setAmount(rows.getBigDecimal("amount"));
            payment.setStatus(rows.getString("status"));
            payment.setPaymentDate(rows.getTimestamp("payment_date").toLocalDateTime());

            payment.setUser(userRepo.getUserById(rows.getInt("user_id")));

            int merchId = rows.getInt("merchandise_id");
            payment.setMerchandise(!rows.wasNull() ? merchandiseRepo.getMerchandise(merchId) : null);

            int eventId = rows.getInt("event_id");
            payment.setEvent(!rows.wasNull() ? eventRepo.getEvent(eventId) : null);

            payments.add(payment);
        }

        return payments;
    }

    public List<Payment> searchPayments(String status, Integer userId, Integer eventId, Integer merchandiseId, String dateFrom, String dateTo) {
        StringBuilder sql = new StringBuilder("SELECT * FROM payment WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isEmpty()) {
            sql.append(" AND status = ?");
            params.add(status);
        }

        if (userId != null) {
            sql.append(" AND user_id = ?");
            params.add(userId);
        }

        if (eventId != null) {
            sql.append(" AND event_id = ?");
            params.add(eventId);
        }

        if (merchandiseId != null) {
            sql.append(" AND merchandise_id = ?");
            params.add(merchandiseId);
        }

        if (dateFrom != null && !dateFrom.isEmpty()) {
            sql.append(" AND payment_date >= ?");
            params.add(java.sql.Timestamp.valueOf(dateFrom + " 00:00:00"));
        }

        if (dateTo != null && !dateTo.isEmpty()) {
            sql.append(" AND payment_date <= ?");
            params.add(java.sql.Timestamp.valueOf(dateTo + " 23:59:59"));
        }

        sql.append(" ORDER BY payment_id");

        SqlRowSet rows = jdbcTemplate.queryForRowSet(sql.toString(), params.toArray());
        List<Payment> results = new ArrayList<>();

        while (rows.next()) {
            Payment payment = new Payment();
            payment.setPaymentId(rows.getInt("payment_id"));
            payment.setAmount(rows.getBigDecimal("amount"));
            payment.setStatus(rows.getString("status"));
            payment.setPaymentDate(rows.getTimestamp("payment_date").toLocalDateTime());

            payment.setUser(userRepo.getUserById(rows.getInt("user_id")));

            merchandiseId = rows.getInt("merchandise_id");
            payment.setMerchandise(!rows.wasNull() ? merchandiseRepo.getMerchandise(merchandiseId) : null);

            eventId = rows.getInt("event_id");
            payment.setEvent(!rows.wasNull() ? eventRepo.getEvent(eventId) : null);

            results.add(payment);
        }


        return results;
    }



    public Payment getPaymentById(int id) {
        String sql = "SELECT * FROM payment WHERE payment_id = ?";
        SqlRowSet row = jdbcTemplate.queryForRowSet(sql, id);

        if (row.next()) {
            Payment payment = new Payment();
            payment.setPaymentId(row.getInt("payment_id"));
            payment.setAmount(row.getBigDecimal("amount"));
            payment.setStatus(row.getString("status"));
            payment.setPaymentDate(row.getTimestamp("payment_date").toLocalDateTime());

            payment.setUser(userRepo.getUserById(row.getInt("user_id")));

            int merchId = row.getInt("merchandise_id");
            payment.setMerchandise(!row.wasNull() ? merchandiseRepo.getMerchandise(merchId) : null);

            int eventId = row.getInt("event_id");
            payment.setEvent(!row.wasNull() ? eventRepo.getEvent(eventId) : null);

            return payment;
        }

        return null;
    }

    public Payment createPayment(Payment payment) {
        String sql = "INSERT INTO payment (user_id, event_id, merchandise_id, amount, status) VALUES (?, ?, ?, ?, ?)";

        Integer eventId = payment.getEvent() != null ? payment.getEvent().getEventId() : null;
        Integer merchandiseId = payment.getMerchandise() != null ? payment.getMerchandise().getId() : null;

        jdbcTemplate.update(connection -> {
            var ps = connection.prepareStatement(sql);
            ps.setInt(1, payment.getUser().getUserId());

            if (eventId != null) {
                ps.setInt(2, eventId);
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }

            if (merchandiseId != null) {
                ps.setInt(3, merchandiseId);
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }

            ps.setBigDecimal(4, payment.getAmount());
            ps.setString(5, payment.getStatus());
            return ps;
        });

        String getIdSql = "SELECT MAX(payment_id) FROM payment";
        Integer id = jdbcTemplate.queryForObject(getIdSql, Integer.class);
        return id != null ? getPaymentById(id) : null;
    }

    public Payment updatePayment(Payment payment) {
        String sql = "UPDATE payment SET amount = ?, status = ?, user_id = ?, event_id = ?, merchandise_id = ? WHERE payment_id = ?";

        Integer eventId = payment.getEvent() != null ? payment.getEvent().getEventId() : null;
        Integer merchandiseId = payment.getMerchandise() != null ? payment.getMerchandise().getId() : null;

        jdbcTemplate.update(connection -> {
            var ps = connection.prepareStatement(sql);
            ps.setBigDecimal(1, payment.getAmount());
            ps.setString(2, payment.getStatus());
            ps.setInt(3, payment.getUser().getUserId());

            if (eventId != null) {
                ps.setInt(4, eventId);
            } else {
                ps.setNull(4, java.sql.Types.INTEGER);
            }

            if (merchandiseId != null) {
                ps.setInt(5, merchandiseId);
            } else {
                ps.setNull(5, java.sql.Types.INTEGER);
            }

            ps.setInt(6, payment.getPaymentId());
            return ps;
        });

        return getPaymentById(payment.getPaymentId());
    }

    public void deletePayment(int id) {
        String sql = "DELETE FROM payment WHERE payment_id = ?";
        jdbcTemplate.update(sql, id);
    }
}

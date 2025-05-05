package com.ccshub.ccsHub.repository;

import com.ccshub.ccsHub.entity.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class EventRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Event> getEvents() {
        String sql = "SELECT * FROM event ORDER BY event_id";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Event event = new Event();
            event.setEventId(rs.getInt("event_id"));
            event.setTitle(rs.getString("title"));
            event.setDescription(rs.getString("description"));
            event.setEventDate(rs.getDate("event_date").toLocalDate());
            event.setLocation(rs.getString("location"));
            event.setImage(rs.getBytes("image")); // ✅ handles image
            return event;
        });
    }
    
    public Event getEvent(int eventId) {
        String sql = "SELECT * FROM event WHERE event_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{eventId}, (rs, rowNum) -> {
            Event event = new Event();
            event.setEventId(rs.getInt("event_id"));
            event.setTitle(rs.getString("title"));
            event.setDescription(rs.getString("description"));
            event.setEventDate(rs.getDate("event_date").toLocalDate());
            event.setLocation(rs.getString("location"));
            event.setImage(rs.getBytes("image")); // ✅ handles image
            return event;
        });
    }

    public List<Event> searchEvents(String keyword) {
        String sql = "SELECT * FROM event WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? ORDER BY event_id";
        String searchPattern = "%" + keyword.toLowerCase() + "%";

        return jdbcTemplate.query(sql, new Object[]{searchPattern, searchPattern}, (rs, rowNum) -> {
            Event event = new Event();
            event.setEventId(rs.getInt("event_id"));
            event.setTitle(rs.getString("title"));
            event.setDescription(rs.getString("description"));
            event.setEventDate(rs.getDate("event_date").toLocalDate());
            event.setLocation(rs.getString("location"));
            event.setImage(rs.getBytes("image"));
            return event;
        });
    }



    public Event createEvent(Event event) {
        try {
            String sql = "INSERT INTO event (title, description, event_date, location, image) " +
                         "VALUES (?, ?, ?, ?, ?) RETURNING event_id";

            Integer eventId = jdbcTemplate.queryForObject(
                    sql, Integer.class,
                    event.getTitle(),
                    event.getDescription(),
                    event.getEventDate(),
                    event.getLocation(),
                    event.getImage()
            );

            return getEvent(eventId);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to create event: " + e.getMessage(), e);
        }
    }

    public Event updateEvent(Event event) {
        try {
            if (event.getImage() != null && event.getImage().length > 0) {
                // Update all fields including image
                String sql = "UPDATE event SET title=?, description=?, event_date=?, location=?, image=? WHERE event_id=?";
                jdbcTemplate.update(sql, event.getTitle(), event.getDescription(),
                        event.getEventDate(), event.getLocation(), event.getImage(), event.getEventId());
            } else {
                // Keep existing image
                String sql = "UPDATE event SET title=?, description=?, event_date=?, location=? WHERE event_id=?";
                jdbcTemplate.update(sql, event.getTitle(), event.getDescription(),
                        event.getEventDate(), event.getLocation(), event.getEventId());
            }

            return getEvent(event.getEventId());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update event: " + e.getMessage(), e);
        }
    }

    public void deleteEvent(int eventId) {
        String sql = "DELETE FROM event WHERE event_id=?";
        jdbcTemplate.update(sql, eventId);
    }
}

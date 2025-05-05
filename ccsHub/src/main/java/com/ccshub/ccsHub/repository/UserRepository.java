package com.ccshub.ccsHub.repository;

import com.ccshub.ccsHub.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users ORDER BY user_id";
        SqlRowSet rows = jdbcTemplate.queryForRowSet(sql);

        while (rows.next()) {
            User user = new User();
            user.setUserId(rows.getInt("user_id"));
            user.setUsername(rows.getString("username"));
            user.setEmail(rows.getString("email"));
            user.setPassword(rows.getString("password"));
            users.add(user);
        }
        return users;
    }

    public User getUserById(int id) {
        String sql = "SELECT * FROM users WHERE user_id=?";
        SqlRowSet row = jdbcTemplate.queryForRowSet(sql, id);
        if (row.next()) {
            User user = new User();
            user.setUserId(row.getInt("user_id"));
            user.setUsername(row.getString("username"));
            user.setEmail(row.getString("email"));
            user.setPassword(row.getString("password"));
            return user;
        }
        return null;
    }

    public List<User> searchByUsername(String keyword) {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users WHERE LOWER(username) LIKE ? ORDER BY user_id";
        SqlRowSet rows = jdbcTemplate.queryForRowSet(sql, "%" + keyword.toLowerCase() + "%");

        while (rows.next()) {
            User user = new User();
            user.setUserId(rows.getInt("user_id"));
            user.setUsername(rows.getString("username"));
            user.setEmail(rows.getString("email"));
            user.setPassword(rows.getString("password"));
            users.add(user);
        }
        return users;
    }

    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email=?";
        SqlRowSet row = jdbcTemplate.queryForRowSet(sql, email);
        if (row.next()) {
            User user = new User();
            user.setUserId(row.getInt("user_id"));
            user.setUsername(row.getString("username"));
            user.setEmail(row.getString("email"));
            user.setPassword(row.getString("password"));
            return user;
        }
        return null;
    }

    public User createUser(User user) {
        String sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?) RETURNING user_id";
        Integer id = jdbcTemplate.queryForObject(sql, Integer.class, user.getUsername(), user.getEmail(),
                user.getPassword());
        return getUserById(id);
    }

    public User updateUser(User user) {
        String sql = "UPDATE users SET username=?, email=?, password=? WHERE user_id=?";
        jdbcTemplate.update(sql, user.getUsername(), user.getEmail(), user.getPassword(), user.getUserId());
        return getUserById(user.getUserId());
    }

    public void deleteUser(int id) {
        String sql = "DELETE FROM users WHERE user_id=?";
        jdbcTemplate.update(sql, id);
    }
}

package com.ccshub.ccsHub.repository;

import com.ccshub.ccsHub.entity.Admin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class AdminRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Admin> getAllAdmins() {
        List<Admin> admins = new ArrayList<>();
        String sql = "SELECT * FROM admin ORDER BY admin_id";

        SqlRowSet rows = jdbcTemplate.queryForRowSet(sql);
        while (rows.next()) {
            Admin admin = new Admin();
            admin.setAdminId(rows.getInt("admin_id"));
            admin.setUsername(rows.getString("username"));
            admin.setRole(rows.getString("role"));
            admin.setPassword(rows.getString("password"));
            admins.add(admin);
        }
        return admins;
    }

    public Admin getAdminById(int id) {
        String sql = "SELECT * FROM admin WHERE admin_id = ?";
        SqlRowSet row = jdbcTemplate.queryForRowSet(sql, id);

        if (row.next()) {
            Admin admin = new Admin();
            admin.setAdminId(row.getInt("admin_id"));
            admin.setUsername(row.getString("username"));
            admin.setRole(row.getString("role"));
            admin.setPassword(row.getString("password"));
            return admin;
        }
        return null;
    }

    public Admin findByUsername(String username) {
        String sql = "SELECT * FROM admin WHERE username = ?";
        SqlRowSet row = jdbcTemplate.queryForRowSet(sql, username);

        if (row.next()) {
            Admin admin = new Admin();
            admin.setAdminId(row.getInt("admin_id"));
            admin.setUsername(row.getString("username"));
            admin.setRole(row.getString("role"));
            admin.setPassword(row.getString("password"));
            return admin;
        }
        return null;
    }

    public Admin createAdmin(Admin admin) {
        String sql = "INSERT INTO admin (username, role, password) VALUES (?, ?, ?) RETURNING admin_id";
        Integer id = jdbcTemplate.queryForObject(sql, Integer.class,
                admin.getUsername(),
                admin.getRole(),
                admin.getPassword()); // Password is already hashed

        return id != null ? getAdminById(id) : null;
    }

    public Admin updateAdmin(Admin admin) {
        String sql = "UPDATE admin SET username = ?, role = ?, password = ? WHERE admin_id = ?";
        jdbcTemplate.update(sql,
                admin.getUsername(),
                admin.getRole(),
                admin.getPassword(), // Password is already hashed
                admin.getAdminId());

        return getAdminById(admin.getAdminId());
    }

    public void deleteAdmin(int id) {
        String sql = "DELETE FROM admin WHERE admin_id = ?";
        jdbcTemplate.update(sql, id);
    }
}
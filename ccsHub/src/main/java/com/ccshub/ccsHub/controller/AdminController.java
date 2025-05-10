package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.Admin;
import com.ccshub.ccsHub.entity.AdminDto;
import com.ccshub.ccsHub.entity.Order;
import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.entity.Event;
import com.ccshub.ccsHub.entity.Merchandise;
import com.ccshub.ccsHub.repository.AdminRepository;
import com.ccshub.ccsHub.repository.OrderRepository;
import com.ccshub.ccsHub.repository.UserRepository;
import com.ccshub.ccsHub.repository.EventRepository;
import com.ccshub.ccsHub.repository.MerchandiseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    @Autowired
    private AdminRepository adminRepo;
    
    @Autowired
    private OrderRepository orderRepo;
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private EventRepository eventRepo;
    
    @Autowired
    private MerchandiseRepository merchandiseRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Admin>> listAdmins() {
        List<Admin> admins = adminRepo.getAllAdmins();
        return new ResponseEntity<>(admins, HttpStatus.OK);
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<Admin> getAdminById(@PathVariable int adminId) {
        Admin admin = adminRepo.getAdminById(adminId);
        if (admin == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(admin, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<String> createAdmin(@RequestBody AdminDto adminDto) {
        Admin admin = new Admin();
        admin.setUsername(adminDto.getUsername());
        admin.setRole(adminDto.getRole());
        admin.setPassword(passwordEncoder.encode(adminDto.getPassword())); // Hash password

        adminRepo.createAdmin(admin);
        return new ResponseEntity<>("Admin created successfully", HttpStatus.CREATED);
    }
    
    @PutMapping("/{adminId}")
    public ResponseEntity<String> updateAdmin(@PathVariable int adminId, @RequestBody AdminDto adminDto) {
        Admin admin = adminRepo.getAdminById(adminId);
        if (admin == null) {
            return new ResponseEntity<>("Admin not found", HttpStatus.NOT_FOUND);
        }

        admin.setUsername(adminDto.getUsername());
        admin.setRole(adminDto.getRole());
        admin.setPassword(passwordEncoder.encode(adminDto.getPassword())); // Hash password

        adminRepo.updateAdmin(admin);
        return new ResponseEntity<>("Admin updated successfully", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable int id) {
        Admin admin = adminRepo.getAdminById(id);
        if (admin == null) {
            return new ResponseEntity<>("Admin not found", HttpStatus.NOT_FOUND);
        }
        adminRepo.deleteAdmin(id);
        return new ResponseEntity<>("Admin deleted successfully", HttpStatus.OK);
    }
}
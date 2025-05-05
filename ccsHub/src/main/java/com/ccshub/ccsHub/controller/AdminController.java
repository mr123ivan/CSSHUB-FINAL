package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.Admin;
import com.ccshub.ccsHub.entity.AdminDto;
import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.repository.AdminRepository;
import com.ccshub.ccsHub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Changed from @Controller to @RestController for RESTful responses
@RequestMapping("/api/admins") // Changed path to fit API standards
public class AdminController {

    @Autowired
    private AdminRepository adminRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<List<Admin>> listAdmins() {
        List<Admin> admins = adminRepo.getAllAdmins();
        return new ResponseEntity<>(admins, HttpStatus.OK);
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<Admin> getAdminById(@PathVariable int adminId) {
        Admin admin = adminRepo.getAdminById(adminId);
        if (admin == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Return 404 if not found
        }
        return new ResponseEntity<>(admin, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<String> createAdmin(@RequestBody AdminDto adminDto) {
        Admin admin = new Admin();
        admin.setUsername(adminDto.getUsername());
        admin.setRole(adminDto.getRole());
        admin.setPassword(adminDto.getPassword());

        User user = userRepo.getUserById(adminDto.getUserId());
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST); // Return error message
        }

        admin.setUserId(user);
        adminRepo.createAdmin(admin);

        return new ResponseEntity<>("Admin created successfully", HttpStatus.CREATED);
    }

    @PutMapping("/{adminId}")
    public ResponseEntity<String> updateAdmin(@PathVariable int adminId, @RequestBody AdminDto adminDto) {
        Admin admin = adminRepo.getAdminById(adminId);
        if (admin == null) {
            return new ResponseEntity<>("Admin not found", HttpStatus.NOT_FOUND); // Return 404 if admin not found
        }

        admin.setUsername(adminDto.getUsername());
        admin.setRole(adminDto.getRole());
        admin.setPassword(adminDto.getPassword());

        User user = userRepo.getUserById(adminDto.getUserId());
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST); // Return error message
        }

        admin.setUserId(user);
        adminRepo.updateAdmin(admin);

        return new ResponseEntity<>("Admin updated successfully", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable int id) {
        Admin admin = adminRepo.getAdminById(id);
        if (admin == null) {
            return new ResponseEntity<>("Admin not found", HttpStatus.NOT_FOUND); // Return 404 if admin not found
        }
        adminRepo.deleteAdmin(id);
        // return new ResponseEntity<>("Admin deleted successfully",
        // HttpStatus.NO_CONTENT); // Return 204 for successful
        // delete

        return new ResponseEntity<>("Admin deleted successfully", HttpStatus.OK); // Return 200 for successful delete
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AdminDto loginDto) {
        List<Admin> admins = adminRepo.getAllAdmins();

        for (Admin admin : admins) {
            if (admin.getUsername().equals(loginDto.getUsername()) &&
                    admin.getPassword().equals(loginDto.getPassword())) {
                return new ResponseEntity<>("Login successful", HttpStatus.OK);
            }
        }

        return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
    }

}

package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.Admin;
import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.repository.UserRepository;
import com.ccshub.ccsHub.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AdminRepository adminRepo;

    @PostMapping("/sync")
    public ResponseEntity<User> syncAzureUser(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("preferred_username");
        if (email == null) {
            email = jwt.getClaimAsString("email"); // Fallback
        }

        String username = jwt.getClaimAsString("given_name") + " " + jwt.getClaimAsString("family_name");

        User user = userRepo.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword("N/A");
            user = userRepo.createUser(user);
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<User>> listUsers(@RequestParam(required = false) String keyword) {
        List<User> users = (keyword == null || keyword.isBlank())
                ? userRepo.getAllUsers()
                : userRepo.searchByUsername(keyword);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        User user = userRepo.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id, @AuthenticationPrincipal Jwt jwt) {
        User user = userRepo.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String email = jwt.getClaimAsString("preferred_username");
        if (email == null) {
            email = jwt.getClaimAsString("email"); // Fallback
        }

        // Find admin by username (assuming username is the email from JWT)
        Admin admin = adminRepo.findByUsername(email);
        if (admin == null || !"ADMIN".equals(admin.getRole())) {
            return ResponseEntity.status(403).build(); // Forbidden if not admin
        }

        userRepo.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
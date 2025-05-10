package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.config.JwtTokenProvider;
import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Email is already registered");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Create new user
        User savedUser = userRepository.createUser(user);
        
        // Generate JWT token
        String token = tokenProvider.generateToken(savedUser, Collections.singletonList("USER"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", savedUser);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        User user = userRepository.findByEmail(email);
        
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        // Generate JWT token
        String token = tokenProvider.generateToken(user, Collections.singletonList("USER"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
}

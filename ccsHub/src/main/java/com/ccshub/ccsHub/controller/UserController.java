package com.ccshub.ccsHub.controller;

import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.entity.UserDto;
import com.ccshub.ccsHub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository repo;

    @PostMapping("/sync")
    public ResponseEntity<User> syncAzureUser(@RequestBody OidcUser oidcUser) {
        String username = oidcUser.getFullName();
        String email = oidcUser.getEmail();

        User user = repo.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword("N/A");
            repo.createUser(user);
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<User>> listUsers(@RequestParam(required = false) String keyword) {
        List<User> users = (keyword == null || keyword.isBlank())
                ? repo.getAllUsers()
                : repo.searchByUsername(keyword);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        User user = repo.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        User user = repo.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}

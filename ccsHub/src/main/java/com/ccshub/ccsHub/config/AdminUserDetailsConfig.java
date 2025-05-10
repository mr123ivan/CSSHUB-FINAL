package com.ccshub.ccsHub.config;

import com.ccshub.ccsHub.entity.Admin;
import com.ccshub.ccsHub.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class AdminUserDetailsConfig {

    @Autowired
    private AdminRepository adminRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Admin admin = adminRepository.findByUsername(username);
            if (admin == null) {
                throw new UsernameNotFoundException("Admin not found: " + username);
            }
            return User.withUsername(admin.getUsername())
                    .password(admin.getPassword())
                    .authorities("ROLE_" + admin.getRole())
                    .build();
        };
    }
}
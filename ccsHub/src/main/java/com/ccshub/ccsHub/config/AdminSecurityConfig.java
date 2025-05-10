package com.ccshub.ccsHub.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@Order(1)
public class AdminSecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher(request -> 
                    request.getRequestURI().startsWith("/api/admins") || 
                    request.getRequestURI().startsWith("/api/events/create") ||
                    request.getRequestURI().startsWith("/api/events/update") ||
                    request.getRequestURI().startsWith("/api/events/delete") ||
                    request.getRequestURI().startsWith("/api/merchandises/create") ||
                    request.getRequestURI().startsWith("/api/merchandises/update") ||
                    request.getRequestURI().startsWith("/api/merchandises/delete") ||
                    request.getRequestURI().startsWith("/api/orders/edit") ||
                    request.getRequestURI().startsWith("/api/users/delete")
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Allow all admin-related endpoints without authentication
                        .anyRequest().permitAll())
                .formLogin(form -> form
                        .loginProcessingUrl("/api/admins/login")
                        .successHandler((request, response, authentication) -> {
                            response.setStatus(200);
                            response.getWriter().write("Login successful");
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(401);
                            response.getWriter().write("Invalid username or password");
                        }))
                .build();
    }
}
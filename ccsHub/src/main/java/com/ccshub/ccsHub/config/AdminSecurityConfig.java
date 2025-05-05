package com.ccshub.ccsHub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Order(1) // Higher priority
public class AdminSecurityConfig {

    @Bean
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/admin/**")
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors
                        .configurationSource(request -> {
                            var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                            corsConfig.setAllowedOrigins(
                                    java.util.List.of("http://localhost:5173"));
                            corsConfig.setAllowedMethods(java.util.List.of("GET", "POST",
                                    "PUT", "DELETE", "OPTIONS"));
                            corsConfig.setAllowedHeaders(java.util.List.of("*"));
                            corsConfig.setAllowCredentials(true); // ✅ Important for
                                                                  // cookies/session
                            return corsConfig;
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/admin/login", "/admin/register").permitAll()
                        .anyRequest().authenticated())
                .formLogin(Customizer.withDefaults()) // simple manual login
                .build();
    }
}

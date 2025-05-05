package com.ccshub.ccsHub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

        private final CustomLogoutHandler logoutHandler;
        private final CustomAuthenticationSuccessHandler successHandler;

        public SecurityConfig(CustomLogoutHandler logoutHandler, CustomAuthenticationSuccessHandler successHandler) {
                this.logoutHandler = logoutHandler;
                this.successHandler = successHandler;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/**",
                                                                "/login/**",
                                                                "/oauth2/**",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/images/**",
                                                                "/favicon.ico")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .addLogoutHandler(logoutHandler))
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(successHandler)
                                                .loginProcessingUrl("/login/oauth2/code/*"))
                                .build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Allow frontend origins
                config.setAllowedOrigins(Arrays.asList(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://127.0.0.1:5173",
                                "http://127.0.0.1:5174",
                                "https://csshub-systeminteg.vercel.app")); 

                // Allow Microsoft Azure OAuth endpoints
                config.setAllowedOriginPatterns(Arrays.asList(
                                "https://*.microsoftonline.com",
                                "https://login.microsoftonline.com"));

                // Allow all common HTTP methods
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));

                // Allow all headers
                config.addAllowedHeader("*");

                // Allow cookies and authorization headers
                config.setAllowCredentials(true);
                
                // Expose response headers that might be needed by the client
                config.setExposedHeaders(Arrays.asList(
                                "Authorization", 
                                "Content-Type",
                                "Access-Control-Allow-Origin",
                                "Access-Control-Allow-Credentials"));

                // Cache preflight response for 1 hour
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
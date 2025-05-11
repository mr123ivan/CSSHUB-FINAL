package com.ccshub.ccsHub.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@Order(2)
public class SecurityConfig {

    private final CustomLogoutHandler logoutHandler;
    private final CustomAuthenticationSuccessHandler successHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CustomLogoutHandler logoutHandler, 
                         CustomAuthenticationSuccessHandler successHandler,
                         JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.logoutHandler = logoutHandler;
        this.successHandler = successHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(request -> !request.getRequestURI().startsWith("/api/admins"))
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/login/**",
                    "/oauth2/**",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/favicon.ico",
                    "/userpage",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/admins/login",
                    "/api/events",
                    "/api/events/**",
                    "/api/merchandises",
                    "/api/merchandises/**",
                    "/api/orders/create",
                    "/api/orders/payment",
                    "/api/payments/**",
                        "/api/orders",
                        "/api/orders/**",
                        "/api/users",
                        "/api/users/**"
                ).permitAll()
                .requestMatchers(
                    "/api/users/delete/**",
                    "/api/events/create",
                    "/api/events/update/**",
                        "/api/payments/**",
                    "/api/events/delete/**",
                        "/api/orders",
                        "/api/orders/**",
                    "/api/merchandises/create",
                    "/api/merchandises/update/**",
                    "/api/merchandises/delete/**"
                ).hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated())
            .oauth2Login(oauth2 -> oauth2
                .successHandler(successHandler)
                .redirectionEndpoint()
                .baseUri("/login/oauth2/code/*"))
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                ))
            .logout(logout -> logout
                .logoutUrl("/logout")
                .addLogoutHandler(logoutHandler))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        converter.setPrincipalClaimName("preferred_username");
        return converter;
    }
}
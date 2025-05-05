package com.ccshub.ccsHub.config;

import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    public CustomAuthenticationSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        String username = oidcUser.getFullName();
        String email = oidcUser.getEmail();

        User user = userRepository.findByEmail(email);

        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword("N/A");
            userRepository.createUser(user);
        }

        // ✅ After syncing, redirect to React userpage
        response.sendRedirect("http://localhost:5173/userpage");// change this
    }
}
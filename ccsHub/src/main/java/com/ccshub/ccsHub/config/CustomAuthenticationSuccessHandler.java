package com.ccshub.ccsHub.config;

import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();

        String username = oidcUser.getGivenName() + " " + oidcUser.getFamilyName();
        String email = oidcUser.getEmail();
        String accessToken = oauthToken.getCredentials().toString(); // Extract JWT access token

        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword("N/A");
            userRepository.createUser(user);
        }

        // Redirect to React userpage with JWT
        String redirectUrl = (request.getServerName().contains("localhost"))
                ? "http://localhost:5173/userpage?token=" + accessToken
                : "https://csshub-systeminteg.vercel.app/userpage?token=" + accessToken;
        response.sendRedirect(redirectUrl);
    }
}
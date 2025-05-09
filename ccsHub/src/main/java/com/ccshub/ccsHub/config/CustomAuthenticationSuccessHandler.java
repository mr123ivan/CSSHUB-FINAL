package com.ccshub.ccsHub.config;

import com.ccshub.ccsHub.entity.User;
import com.ccshub.ccsHub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);
    private final UserRepository userRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public CustomAuthenticationSuccessHandler(UserRepository userRepository, OAuth2AuthorizedClientService authorizedClientService) {
        this.userRepository = userRepository;
        this.authorizedClientService = authorizedClientService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        logger.info("Handling successful authentication for request: {}", request.getRequestURI());

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();

        String username = oidcUser.getName(); // Using 'name' as per user-name-attribute
        String email = oidcUser.getEmail();
        logger.info("OidcUser claims: {}", oidcUser.getClaims());

        if (email == null || email.isBlank()) {
            logger.warn("Email is null or blank, attempting to use preferred_username: {}", oidcUser.getPreferredUsername());
            email = oidcUser.getPreferredUsername();
            if (email == null || email.isBlank()) {
                Object upnClaim = oidcUser.getClaim("upn");
logger.warn("Preferred_username is null or blank, attempting to use upn: {}", upnClaim);

                email = oidcUser.getClaim("upn");
                if (email == null || email.isBlank()) {
                    logger.error("No valid email, preferred_username, or upn found, using fallback email");
                    email = "fallback@" + oauthToken.getName().replaceAll("[^a-zA-Z0-9]", "") + ".com";
                }
            }
        }

        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
            oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName());
        String accessToken = authorizedClient != null ? authorizedClient.getAccessToken().getTokenValue() : null;

        logger.info("OAuth2 Client: {}", authorizedClient);
        logger.info("Extracted access token: {}", accessToken);

        if (accessToken == null) {
            logger.error("Access token is null, authentication might have failed or token not issued.");
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Authentication failed: No access token issued.");
            return;
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword("N/A");
            userRepository.createUser(user);
        }

        String redirectUrl = (request.getServerName().contains("localhost"))
                ? "http://localhost:5173/userpage?token=" + accessToken
                : "https://csshub-systeminteg.vercel.app/userpage?token=" + accessToken;
        logger.info("Redirecting to: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}
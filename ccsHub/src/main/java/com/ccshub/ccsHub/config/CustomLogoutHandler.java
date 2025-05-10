// CustomLogoutHandler.java
package com.ccshub.ccsHub.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.logging.Logger;

@Component
public class CustomLogoutHandler extends SecurityContextLogoutHandler {

    private static final Logger LOGGER = Logger.getLogger(CustomLogoutHandler.class.getName());
    private final ClientRegistrationRepository clientRegistrationRepository;

    public CustomLogoutHandler(ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        super.logout(request, response, authentication);

        String logoutEndpoint = (String) clientRegistrationRepository
                .findByRegistrationId("azure-dev")
                .getProviderDetails()
                .getConfigurationMetadata()
                .get("end_session_endpoint");

        String postLogoutRedirectUri = request.getServerName().contains("localhost")
                ? "http://localhost:5173"
                : "https://csshub-final.vercel.app";

        String logoutUri = UriComponentsBuilder
                .fromHttpUrl(logoutEndpoint)
                .queryParam("post_logout_redirect_uri", postLogoutRedirectUri)
                .encode()
                .toUriString();

        try {
            response.sendRedirect(logoutUri);
        } catch (IOException e) {
            LOGGER.severe("Failed to redirect to Azure AD logout endpoint: " + e.getMessage());
            throw new RuntimeException("Logout redirect failed", e);
        }
    }
}

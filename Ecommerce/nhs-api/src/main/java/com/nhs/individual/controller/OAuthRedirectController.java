package com.nhs.individual.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * OAuth Redirect Controller
 * Provides backward compatibility by redirecting old OAuth2 paths to the correct Spring Boot 3 paths
 */
@RestController
public class OAuthRedirectController {

    /**
     * Redirects old OAuth2 path to the correct Spring Boot 3 path
     * Old: /oauth2/authorize/google
     * New: /oauth2/authorization/google
     * 
     * @param response HTTP response to send redirect
     * @throws IOException if redirect fails
     */
    @GetMapping("/oauth2/authorize/google")
    public void oldPathRedirect(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }
}


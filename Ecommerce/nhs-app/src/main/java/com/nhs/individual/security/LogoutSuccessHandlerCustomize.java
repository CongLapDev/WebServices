package com.nhs.individual.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import java.io.IOException;

public class LogoutSuccessHandlerCustomize implements LogoutSuccessHandler {
    private static final Logger log = LoggerFactory.getLogger(LogoutSuccessHandlerCustomize.class);
    
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.debug("[LogoutSuccessHandler] Logout successful, returning 200 OK");
        
        // Set response status and content type
        response.setStatus(HttpStatus.OK.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        // Write JSON response (no redirect)
        String jsonResponse = "{\"message\":\"Logged out\"}";
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
        
        log.debug("[LogoutSuccessHandler] Logout response sent successfully");
    }
}

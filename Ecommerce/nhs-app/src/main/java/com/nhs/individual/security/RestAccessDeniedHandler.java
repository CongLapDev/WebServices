package com.nhs.individual.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

@Slf4j
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        log.warn("Access denied for request: {} - User: {} - Reason: {}", 
                request.getRequestURI(),
                request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous",
                accessDeniedException.getMessage());
        
        // Return 403 Forbidden for authorization failures (valid token but insufficient permissions)
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String errorMessage = accessDeniedException != null && accessDeniedException.getMessage() != null 
            ? accessDeniedException.getMessage() 
            : "Forbidden: Insufficient permissions";
        response.getWriter().write(
            String.format("{\"error\":\"%s\",\"status\":403,\"message\":\"Access denied\"}", 
                errorMessage.replace("\"", "\\\""))
        );
    }
}

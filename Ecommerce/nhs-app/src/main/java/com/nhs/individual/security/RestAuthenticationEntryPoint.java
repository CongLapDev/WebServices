package com.nhs.individual.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

@Slf4j
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest httpServletRequest,
                         HttpServletResponse httpServletResponse,
                         AuthenticationException e) throws IOException, ServletException {
        // Return 401 Unauthorized for authentication failures (missing/invalid token)
        // 403 Forbidden should be used for authorization failures (valid token but insufficient permissions)
        httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpServletResponse.setContentType("application/json");
        httpServletResponse.setCharacterEncoding("UTF-8");
        String errorMessage = e != null && e.getMessage() != null 
            ? e.getMessage() 
            : "Unauthorized: Authentication required";
        httpServletResponse.getWriter().write(
            String.format("{\"error\":\"%s\",\"status\":401,\"message\":\"Authentication required\"}", 
                errorMessage.replace("\"", "\\\""))
        );
    }

}

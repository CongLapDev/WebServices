package com.nhs.individual.utils;

import com.nhs.individual.secure.JwtProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.util.Optional;

@Component
public class RequestUtils {
    @Autowired
    private JwtProvider jwtProvider;

    public Claims extractJwtClaimFromCookie(HttpServletRequest request, String cookieName)  {
        try {
            if (jwtProvider == null) {
                return null;
            }
            Cookie cookie= WebUtils.getCookie(request,cookieName);
            if(cookie != null && cookie.getValue() != null && !cookie.getValue().isEmpty()){
                return jwtProvider.validate(cookie.getValue());
            }
        } catch (Exception e) {
            // Return null on error - don't throw exception
        }
        return null;
    }
    
    /**
     * Extracts JWT token from Authorization header (Bearer token)
     * Supports both "Bearer <token>" and just "<token>" formats
     */
    public Claims extractJwtClaimFromHeader(HttpServletRequest request) {
        try {
            if (jwtProvider == null) {
                org.slf4j.LoggerFactory.getLogger(RequestUtils.class)
                    .error("[RequestUtils] ❌ jwtProvider is NULL!");
                return null;
            }
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && !authHeader.isEmpty()) {
                String token = authHeader.trim();
                // Remove "Bearer " prefix (case-insensitive) if present
                if (token.toLowerCase().startsWith("bearer ")) {
                    token = token.substring(7).trim();
                }
                if (!token.isEmpty()) {
                    org.slf4j.LoggerFactory.getLogger(RequestUtils.class)
                        .debug("[RequestUtils] Attempting to validate token from Authorization header");
                    Claims claims = jwtProvider.validate(token);
                    if (claims == null) {
                        org.slf4j.LoggerFactory.getLogger(RequestUtils.class)
                            .warn("[RequestUtils] ⚠ Token validation returned NULL");
                    }
                    return claims;
                }
            }
        } catch (Exception e) {
            // Log error for debugging
            org.slf4j.LoggerFactory.getLogger(RequestUtils.class)
                .error("[RequestUtils] ❌ Error extracting JWT from header: {}", e.getMessage(), e);
        }
        return null;
    }
    
    /**
     * Extracts JWT claims from either cookie or Authorization header
     * Priority: Cookie first, then Authorization header
     */
    public Claims extractJwtClaim(HttpServletRequest request, String cookieName) {
        try {
            if (jwtProvider == null) {
                return null;
            }
            // Try cookie first
            Claims claims = extractJwtClaimFromCookie(request, cookieName);
            if (claims != null) {
                return claims;
            }
            // Fall back to Authorization header
            return extractJwtClaimFromHeader(request);
        } catch (Exception e) {
            // Return null on any error - don't block the request
            return null;
        }
    }
    
    public Cookie getExpiredCookie(String cookie){
        Cookie expiredCookie=new Cookie(cookie,"");
        expiredCookie.setMaxAge(0);
        return expiredCookie;
    }
    public static Optional<Cookie> getCookie(HttpServletRequest request, String cookieName){
        return Optional.ofNullable(WebUtils.getCookie(request, cookieName));
    }
}

package com.nhs.individual.security.Filter;

import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.AccountService;
import com.nhs.individual.utils.RequestUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static com.nhs.individual.utils.Constant.AUTH_TOKEN;
@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired(required = false)
    private AccountService service;
    @Autowired(required = false)
    private RequestUtils requestUtils;
    private static final Logger log=LoggerFactory.getLogger(JwtFilter.class);
    
    // List of paths that should skip JWT processing (permitAll endpoints)
    private static final String[] PERMIT_ALL_PATHS = {
        "/test/", "/login/", "/register", "/refresh", "/logout", 
        "/swagger-ui/", "/v3/api-docs/"
    };
    
    private boolean shouldSkipJwtProcessing(String requestPath) {
        if (requestPath == null) {
            return false;
        }
        for (String path : PERMIT_ALL_PATHS) {
            if (requestPath.startsWith(path)) {
                return true;
            }
        }
        return false;
    }
    
    @Override
    protected void doFilterInternal(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response,@NotNull FilterChain filterChain) throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        
        // Skip JWT processing for permitAll endpoints - just pass through
        if (shouldSkipJwtProcessing(requestPath)) {
            log.debug("[JwtFilter] Skipping JWT processing for permitAll endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        log.info("[JwtFilter] ===== Processing authenticated request =====");
        log.info("[JwtFilter] Request path: {}", requestPath);
        log.info("[JwtFilter] Request method: {}", request.getMethod());
        
        // Check if dependencies are available
        if (requestUtils == null) {
            log.error("[JwtFilter] ❌ requestUtils is NULL! JWT processing cannot proceed.");
            filterChain.doFilter(request, response);
            return;
        }
        
        if (service == null) {
            log.error("[JwtFilter] ❌ service is NULL! JWT processing cannot proceed.");
            filterChain.doFilter(request, response);
            return;
        }
        
        log.info("[JwtFilter] ✓ Dependencies available: requestUtils={}, service={}", 
                 requestUtils != null, service != null);
        
        try {
            // Check Authorization header
            String authHeader = request.getHeader("Authorization");
            log.info("[JwtFilter] Authorization header: {}", authHeader != null ? "EXISTS" : "MISSING");
            if (authHeader != null) {
                log.info("[JwtFilter] Authorization header value (first 30 chars): {}", 
                         authHeader.length() > 30 ? authHeader.substring(0, 30) + "..." : authHeader);
            }
            
            // Check for cookie
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            boolean hasAuthCookie = false;
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if (AUTH_TOKEN.equals(cookie.getName())) {
                        hasAuthCookie = true;
                        log.info("[JwtFilter] Found AUTH_TOKEN cookie");
                        break;
                    }
                }
            }
            log.info("[JwtFilter] Has AUTH_TOKEN cookie: {}", hasAuthCookie);
            
            // Try to extract JWT from cookie or Authorization header
            log.info("[JwtFilter] Attempting to extract JWT claim...");
            Claims token = requestUtils.extractJwtClaim(request, AUTH_TOKEN);
            
            if (token == null) {
                log.warn("[JwtFilter] ⚠ Token extraction returned NULL");
                log.warn("[JwtFilter] Possible causes:");
                log.warn("[JwtFilter] 1. No Authorization header or cookie");
                log.warn("[JwtFilter] 2. Token format is invalid");
                log.warn("[JwtFilter] 3. Token validation failed (expired, malformed, etc.)");
                log.warn("[JwtFilter] 4. JwtProvider.validate() returned null");
            } else {
                log.info("[JwtFilter] ✓ Token extracted successfully");
                log.info("[JwtFilter] Token subject (username): {}", token.getSubject());
                
                if (token.getSubject() != null && !token.getSubject().isEmpty()) {
                    try {
                        log.info("[JwtFilter] Looking up user by username: {}", token.getSubject());
                        service.findByUsername(token.getSubject())
                                .map(IUserDetail::new)
                                .ifPresentOrElse(
                                    user -> {
                                        log.info("[JwtFilter] ✓ User found: {}", user.getUsername());
                                        log.info("[JwtFilter] User ID: {}", user.getId());
                                        log.info("[JwtFilter] User authorities: {}", user.getAuthorities());
                                        
                                        UsernamePasswordAuthenticationToken authenticationToken = 
                                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                                        
                                        log.info("[JwtFilter] ✓✓✓ SecurityContext set successfully!");
                                        log.info("[JwtFilter] Authentication principal: {}", 
                                                 SecurityContextHolder.getContext().getAuthentication().getPrincipal().getClass().getSimpleName());
                                    },
                                    () -> {
                                        log.error("[JwtFilter] ❌ User not found in database: {}", token.getSubject());
                                    }
                                );
                    } catch (Exception e) {
                        log.error("[JwtFilter] ❌ Could not set Authentication for user: {}", token.getSubject(), e);
                        log.error("[JwtFilter] Exception details:", e);
                        // Clear any partial authentication
                        SecurityContextHolder.clearContext();
                    }
                } else {
                    log.warn("[JwtFilter] ⚠ Token subject is null or empty");
                }
            }
        } catch (Exception e) {
            // Log but don't block the request - allow Spring Security to handle authorization
            log.error("[JwtFilter] ❌ Error processing JWT filter for request: {}", requestPath, e);
            log.error("[JwtFilter] Exception stack trace:", e);
            SecurityContextHolder.clearContext();
        }
        
        // Check final SecurityContext state
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            log.info("[JwtFilter] ✓ Final SecurityContext has authentication");
            log.info("[JwtFilter] Authenticated user: {}", auth.getName());
            log.info("[JwtFilter] Authorities: {}", auth.getAuthorities());
        } else {
            log.warn("[JwtFilter] ⚠ Final SecurityContext has NO authentication");
            log.warn("[JwtFilter] Request will likely be rejected with 403");
        }
        
        log.info("[JwtFilter] ===== JWT filter processing complete =====");
        
        // Always continue the filter chain - let Spring Security decide if request is authorized
        filterChain.doFilter(request, response);
    }
}

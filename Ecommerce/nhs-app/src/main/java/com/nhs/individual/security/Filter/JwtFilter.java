package com.nhs.individual.security.Filter;

import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.AccountService;
import com.nhs.individual.secure.JwtProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired(required = false)
    private AccountService service;
    @Autowired(required = false)
    private JwtProvider jwtProvider;

    // List of paths that should skip JWT processing (permitAll endpoints)
    private static final String[] PERMIT_ALL_PATHS = {
            "/test/", "/login", "/api/auth/login", "/register", "/refresh", "/logout",
            "/api/v1/auth/logout", "/swagger-ui/", "/v3/api-docs/", "/oauth2/", "/auth/", "/error"
    };

    private boolean shouldSkipJwtProcessing(String requestPath) {
        if (requestPath == null) {
            return false;
        }
        return Arrays.stream(PERMIT_ALL_PATHS).anyMatch(requestPath::startsWith);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String requestPath = request.getRequestURI();

        if (shouldSkipJwtProcessing(requestPath)) {
            log.debug("[JwtFilter] Skipping JWT processing for permitAll endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        log.info("[JwtFilter] ===== Processing authenticated request =====");
        log.info("[JwtFilter] Request path: {}", requestPath);
        log.info("[JwtFilter] Request method: {}", request.getMethod());
        if (service == null) {
            log.error("[JwtFilter] ❌ service is NULL! JWT processing cannot proceed.");
            filterChain.doFilter(request, response);
            return;
        }
        if (jwtProvider == null) {
            log.error("[JwtFilter] ❌ jwtProvider is NULL! JWT processing cannot proceed.");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 1) Extract Authorization header
            String authHeader = request.getHeader("Authorization");
            log.info("[JwtFilter] Authorization header present: {}", authHeader != null ? "YES" : "NO");

            // 2) Strip Bearer prefix manually
            String rawToken = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                rawToken = authHeader.substring(7).trim();
            }

            if (rawToken == null || rawToken.isEmpty()) {
                log.warn("[JwtFilter] ⚠ No Bearer token found. Skipping authentication.");
                filterChain.doFilter(request, response);
                return;
            }

            // 3) Validate using JwtProvider (centralized key handling)
            Claims claims = jwtProvider.validate(rawToken);

            if (claims == null) {
                log.warn("[JwtFilter] ⚠ Token validation failed. No authentication will be set.");
                filterChain.doFilter(request, response);
                return;
            }

            // 4) Load user
            final String username = claims.getSubject();
            if (username == null || username.isEmpty()) {
                log.error("ERROR: Token subject (username) is null or empty");
                filterChain.doFilter(request, response);
                return;
            }

            log.info("[JwtFilter] Looking up user by username: {}", username);
            service.findByUsername(username)
                    .map(IUserDetail::new)
                    .ifPresentOrElse(user -> {
                        log.info("[JwtFilter] ✓ User found: {}", user.getUsername());
                        log.info("[JwtFilter] 🟢 User: {}, Roles/Authorities: {}", user.getUsername(), user.getAuthorities());
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("[JwtFilter] ✓ SecurityContext set with user {}", user.getUsername());
                    }, () -> {
                        log.error("ERROR: Username from token not found in DB: {}", username);
                    });

        } catch (Exception e) {
            log.error("[JwtFilter] ❌ Error processing JWT filter for request: {}", requestPath, e);
            log.error("[JwtFilter] Exception stack trace:", e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

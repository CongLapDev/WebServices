package com.nhs.individual.controller;

import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.User;
import com.nhs.individual.dto.LoginRequest;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.secure.CurrentUser;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.secure.JwtProvider;
import com.nhs.individual.service.AccountService;
import com.nhs.individual.service.AuthService;
import com.nhs.individual.service.RefreshTokenService;
import com.nhs.individual.service.UserService;
import com.nhs.individual.utils.RequestUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

import java.util.HashMap;
import java.util.Map;

import static com.nhs.individual.utils.Constant.AUTH_TOKEN;
import static com.nhs.individual.utils.Constant.REFRESH_AUTH_TOKEN;

/**
 * Authentication Controller
 * Handles user authentication endpoints including login and registration
 */
@RestController
@AllArgsConstructor
public class AuthenticationAPI {
    private static final Logger log = LoggerFactory.getLogger(AuthenticationAPI.class);
    AuthService authService;
    UserService userService;
    RefreshTokenService refreshTokenService;
    JwtProvider jwtProvider;
    AccountService accountService;
    RequestUtils requestUtils;

    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public Account register(@RequestBody Account account){
        return authService.register(account);
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public ResponseEntity<ResponseMessage> login(@RequestBody Account account){
        return authService.signIn(account);
    }

    /**
     * REST-style login endpoint that returns user details with roles
     * POST /api/auth/login
     * 
     * Request Body:
     * {
     *   "username": "testuser",
     *   "password": "password123"
     * }
     * 
     * Response: UserLoginDto object with account and roles (prevents unnecessary DB queries)
     */
    @PostMapping("/api/auth/login")
    public ResponseEntity<?> loginWithUserDetails(@Valid @RequestBody LoginRequest loginRequest){
        return authService.signInWithUserDetails(loginRequest.getUsername(), loginRequest.getPassword());
    }

    @RequestMapping(value = "/refresh", method = RequestMethod.GET)
    public ResponseEntity<ResponseMessage> refreshToken(HttpServletRequest request){
        return authService.refresh(request);
    }
    
    @RequestMapping(value = "/api/v1/auth/account",method = RequestMethod.GET)
    public IUserDetail getcurrentAccount(){
        return authService.getCurrentAccount();
    }
    
    @RequestMapping(value = "/api/v1/auth/user",method = RequestMethod.GET)
    public User getcurrentUser(@CurrentUser IUserDetail userDetail){
        log.info("[AuthenticationAPI] ===== getcurrentUser() called =====");
        log.info("[AuthenticationAPI] SecurityContext authentication: {}", 
                SecurityContextHolder.getContext().getAuthentication() != null ? "EXISTS" : "NULL");
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            log.info("[AuthenticationAPI] Authenticated user: {}", 
                    SecurityContextHolder.getContext().getAuthentication().getName());
            log.info("[AuthenticationAPI] Authorities: {}", 
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        }
        log.info("[AuthenticationAPI] @CurrentUser parameter: {}", 
                userDetail != null ? userDetail.getUsername() : "NULL");
        if (userDetail == null) {
            log.error("[AuthenticationAPI] ❌ @CurrentUser is NULL! This should not happen if SecurityContext is set correctly.");
            throw new RuntimeException("User not authenticated");
        }
        log.info("[AuthenticationAPI] ✓ User ID from @CurrentUser: {}", userDetail.getUserId());
        return userService.findById(userDetail.getUserId()).get();
    }

    /**
     * REST-style logout endpoint that works stateless with JWT
     * POST /api/v1/auth/logout
     * 
     * Headers:
     *   Authorization: Bearer <access_token>
     * 
     * Response: { "message": "Logged out" }
     * 
     * This endpoint:
     * - Extracts JWT from Authorization header
     * - Invalidates refresh token in DB (if exists)
     * - Clears cookies
     * - Returns 200 OK with JSON (no redirect)
     */
    @PostMapping("/api/v1/auth/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        log.debug("[AuthenticationAPI] ===== logout() called =====");
        
        try {
            // Method 1: Invalidate refresh token from cookie (if present)
            Cookie refreshCookie = WebUtils.getCookie(request, REFRESH_AUTH_TOKEN);
            if (refreshCookie != null && refreshCookie.getValue() != null) {
                log.debug("[AuthenticationAPI] Found refresh token cookie, invalidating...");
                refreshTokenService
                        .findByToken(refreshCookie.getValue())
                        .ifPresent(token -> {
                            refreshTokenService.deleteById(token.getId());
                            log.debug("[AuthenticationAPI] Refresh token invalidated from cookie");
                        });
            }
            
            // Method 2: Extract account ID from JWT token in Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7).trim();
                log.debug("[AuthenticationAPI] Found Authorization header, extracting account info...");
                
                try {
                    Claims claims = jwtProvider.validate(token);
                    if (claims != null) {
                        String username = claims.getSubject();
                        if (username != null && !username.isEmpty()) {
                            log.debug("[AuthenticationAPI] Extracted username from JWT: {}", username);
                            
                            // Find account by username and invalidate all refresh tokens
                            accountService.findByUsername(username).ifPresent(account -> {
                                Integer accountId = account.getId();
                                log.debug("[AuthenticationAPI] Found account ID {}, invalidating all refresh tokens", accountId);
                                refreshTokenService.deleteByAccountId(accountId);
                            });
                        }
                    }
                } catch (Exception e) {
                    log.warn("[AuthenticationAPI] Could not extract account from JWT token: {}", e.getMessage());
                    // Continue with logout even if JWT parsing fails
                }
            }
            
            // Clear cookies
            response.addCookie(requestUtils.getExpiredCookie(REFRESH_AUTH_TOKEN));
            response.addCookie(requestUtils.getExpiredCookie(AUTH_TOKEN));
            
            // Clear security context
            SecurityContextHolder.clearContext();
            
            // Return JSON response (no redirect)
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Logged out");
            
            log.debug("[AuthenticationAPI] Logout successful");
            return ResponseEntity.ok(responseBody);
            
        } catch (Exception e) {
            log.error("[AuthenticationAPI] Error during logout: {}", e.getMessage(), e);
            // Still return success to prevent frontend errors
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Logged out");
            return ResponseEntity.status(HttpStatus.OK).body(responseBody);
        }
    }

}

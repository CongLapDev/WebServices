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
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Only process if requestUtils is available
            if (requestUtils != null) {
                // Try to extract JWT from cookie or Authorization header
                Claims token = requestUtils.extractJwtClaim(request, AUTH_TOKEN);
                if(token != null && token.getSubject() != null && !token.getSubject().isEmpty()){
                    try {
                        if (service != null) {
                            service.findByUsername(token.getSubject())
                                    .map(IUserDetail::new)
                                    .ifPresent(user->{
                                        UsernamePasswordAuthenticationToken authenticationToken=new UsernamePasswordAuthenticationToken(user,null,user.getAuthorities());
                                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                                    });
                        }
                    } catch (Exception e) {
                        log.atError().log("Could not set Authentication for user: {}", token.getSubject(), e);
                        // Clear any partial authentication
                        SecurityContextHolder.clearContext();
                    }
                }
            }
        } catch (Exception e) {
            // Log but don't block the request - allow Spring Security to handle authorization
            log.atWarn().log("Error processing JWT filter for request: {}", requestPath, e);
            SecurityContextHolder.clearContext();
        }
        // Always continue the filter chain - let Spring Security decide if request is authorized
        filterChain.doFilter(request, response);
    }
}

package com.nhs.individual.security;

import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.RefreshTokenService;
import com.nhs.individual.utils.RequestUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import static com.nhs.individual.utils.Constant.AUTH_TOKEN;
import static com.nhs.individual.utils.Constant.REFRESH_AUTH_TOKEN;

@Component
public class LogoutHandlerCustomize implements LogoutHandler {
    private static final Logger log = LoggerFactory.getLogger(LogoutHandlerCustomize.class);
    
    @Autowired
    RefreshTokenService refreshTokenService;
    @Autowired
    RequestUtils requestUtils;
    
    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        log.debug("[LogoutHandler] Processing logout request");
        
        // Method 1: Invalidate refresh token from cookie (if present)
        Cookie cookie = WebUtils.getCookie(request, REFRESH_AUTH_TOKEN);
        if(cookie != null && cookie.getValue() != null){
            log.debug("[LogoutHandler] Found refresh token cookie, invalidating...");
            refreshTokenService
                    .findByToken(cookie.getValue())
                    .ifPresent(token -> {
                        refreshTokenService.deleteById(token.getId());
                        log.debug("[LogoutHandler] Refresh token invalidated from cookie");
                    });
        }
        
        // Method 2: Invalidate refresh token by account ID from JWT (if authentication is present)
        if (authentication != null && authentication.getPrincipal() instanceof IUserDetail) {
            IUserDetail userDetail = (IUserDetail) authentication.getPrincipal();
            Integer accountId = userDetail.getId();
            if (accountId != null) {
                log.debug("[LogoutHandler] Found account ID {} from authentication, invalidating all refresh tokens", accountId);
                refreshTokenService.deleteByAccountId(accountId);
            }
        }
        
        // Clear cookies
        response.addCookie(requestUtils.getExpiredCookie(REFRESH_AUTH_TOKEN));
        response.addCookie(requestUtils.getExpiredCookie(AUTH_TOKEN));
        
        // Clear security context
        SecurityContextHolder.clearContext();
        
        log.debug("[LogoutHandler] Logout processing complete");
    }
}

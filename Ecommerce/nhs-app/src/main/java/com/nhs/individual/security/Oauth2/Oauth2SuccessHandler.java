package com.nhs.individual.security.Oauth2;

import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.secure.JwtProvider;
import com.nhs.individual.service.AuthService;
import com.nhs.individual.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class Oauth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    @Autowired
    AuthService authService;
    
    @Autowired
    JwtProvider jwtProvider;
    
    @Autowired
    RefreshTokenService refreshTokenService;
    
    @Value("${frontend.url:https://hub.gadgetsource.click}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            IUserDetail account = (IUserDetail) authentication.getPrincipal();
            
            // Set cookies (for httpOnly cookie support)
            response.addHeader(HttpHeaders.SET_COOKIE, authService.accessTokenCookie(account.getUsername()).toString());
            response.addHeader(HttpHeaders.SET_COOKIE, authService.refreshTokenCookie(account.getId()).toString());
            
            // Generate tokens to append to URL
            String accessToken = jwtProvider.generateToken(account.getUsername());
            
            // Get refresh token from service
            com.nhs.individual.domain.Account accountEntity = new com.nhs.individual.domain.Account();
            accountEntity.setId(account.getId());
            com.nhs.individual.domain.RefreshToken refreshToken = refreshTokenService.generateRefreshToken(accountEntity);
            String refreshTokenString = refreshToken.getToken();
            
            // Build redirect URL with tokens as query parameters
            String redirectUrl = frontendUrl + "/auth/success" +
                    "?access=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8) +
                    "&refresh=" + URLEncoder.encode(refreshTokenString, StandardCharsets.UTF_8);
            
            // Redirect to frontend with tokens in URL
            response.sendRedirect(redirectUrl);
            super.onAuthenticationSuccess(request, response, authentication);
        } catch (Exception e) {
            // Log error and redirect to frontend error page
            System.err.println("[OAuth2SuccessHandler] Error processing OAuth2 success: " + e.getMessage());
            e.printStackTrace();
            // Redirect to frontend login page with error parameter
            String errorUrl = frontendUrl + "/login?error=oauth_failed";
            response.sendRedirect(errorUrl);
        }
    }
}


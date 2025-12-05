package com.nhs.individual.secure;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static com.nhs.individual.utils.Constant.REFRESH_TOKEN_AGE;

@Component
public class JwtProvider {
    @Value("${nhs.token.accessTokenms}")
    private long ACCESS_TOKEN_EXPIRED;
    
    @Value("${nhs.token.secret:}")
    private String jwtSecret;

    private final Logger log = LoggerFactory.getLogger(JwtProvider.class);
    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (jwtSecret != null && !jwtSecret.trim().isEmpty()) {
            // Use configured secret key
            log.info("[JwtProvider] Using configured JWT secret key from properties");
            // Convert string to SecretKey for HS256 (minimum 256 bits = 32 bytes)
            byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            // Ensure key is at least 32 bytes (256 bits) for HS256
            if (keyBytes.length < 32) {
                log.warn("[JwtProvider] JWT secret is less than 32 bytes, padding to 32 bytes");
                byte[] paddedKey = new byte[32];
                System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
                secretKey = Keys.hmacShaKeyFor(paddedKey);
            } else {
                secretKey = Keys.hmacShaKeyFor(keyBytes);
            }
            log.info("[JwtProvider] JWT secret key initialized successfully (length: {} bytes)", keyBytes.length);
        } else {
            // Generate a random key (for development only - NOT recommended for production)
            log.error("[JwtProvider] ⚠⚠⚠ WARNING: No JWT secret configured!");
            log.error("[JwtProvider] ⚠⚠⚠ Generating random key - tokens will be invalid after server restart!");
            log.error("[JwtProvider] ⚠⚠⚠ Set 'nhs.token.secret' in application.yml to fix this!");
            secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    private SecretKey getKey() {
        return secretKey;
    }
    public String generateToken(String subject){
        Date date=new Date(new Date().getTime()+ACCESS_TOKEN_EXPIRED*10L);
        Map<String,Object> headers = new HashMap<String,Object>();
        headers.put("alg", "HS256");
        return Jwts.builder()
                .setExpiration(date)
                .setIssuedAt(date)
                .setSubject(subject)
                .signWith(getKey())
                .compact();
    }
    public String generateRefreshToken(Map<String,?> extraClaims,String subject){
        Date date=new Date(new Date().getTime()+REFRESH_TOKEN_AGE);
        Map<String,Object> headers = new HashMap<>();
        headers.put("alg", "HS256");
        return Jwts.builder()
                .setClaims(extraClaims)
                .setExpiration(date)
                .setIssuedAt(new Date())
                .setSubject(subject)
                .signWith(getKey())
                .compact();
    }
    public Claims extractClaims(String token ) throws ExpiredJwtException, UnsupportedJwtException,MalformedJwtException,IllegalArgumentException {
       return Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(token).getBody();

    }
    public String getSubject(String token){
        return extractClaims(token).getSubject();
    }
    public Claims validate(String token) {
        Claims claims=null;
        try{
            claims=extractClaims(token);
            log.debug("Token validated successfully, subject: {}", claims.getSubject());
            return claims;
        }catch (UnsupportedJwtException e){
            log.warn("Token is unsupported: {}", e.getMessage());
        }catch (MalformedJwtException e){
            log.warn("Token is malformed: {}", e.getMessage());
        }catch (IllegalArgumentException e){
            log.warn("Token is invalid (illegal argument): {}", e.getMessage());
        }catch (ExpiredJwtException e){
            log.warn("Token is expired. Expired at: {}", e.getClaims().getExpiration());
        }catch (Exception e){
            log.warn("Unexpected error validating token: {}", e.getMessage());
        }
        return null;
    }
}

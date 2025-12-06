package com.nhs.individual.secure;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
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
        log.info("[JwtProvider] ===== Initializing JWT Provider =====");
        log.info("[JwtProvider] Checking JWT secret configuration...");
        log.info("[JwtProvider] jwtSecret value: {}", jwtSecret != null && !jwtSecret.trim().isEmpty() ? "CONFIGURED (length: " + jwtSecret.length() + ")" : "NULL or EMPTY");
        
        if (jwtSecret != null && !jwtSecret.trim().isEmpty()) {
            // Use configured secret key
            log.info("[JwtProvider] ✓ Using configured JWT secret key from properties");
            // Convert string to SecretKey for HS256 (minimum 256 bits = 32 bytes, maximum 64 bytes for HS256)
            // Keys.hmacShaKeyFor() automatically selects algorithm based on key size:
            // - 32-63 bytes: HS256
            // - 64+ bytes: HS512
            // To force HS256, we'll use exactly 32 bytes (256 bits)
            byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            log.info("[JwtProvider] Original secret key length: {} bytes", keyBytes.length);
            
            // Force HS256 by using exactly 32 bytes (256 bits)
            // This ensures consistent algorithm regardless of secret length
            byte[] hs256Key = new byte[32];
            if (keyBytes.length < 32) {
                log.warn("[JwtProvider] ⚠ JWT secret is less than 32 bytes, padding to 32 bytes");
                System.arraycopy(keyBytes, 0, hs256Key, 0, keyBytes.length);
                // Remaining bytes remain zero (padded)
            } else {
                // Use first 32 bytes to force HS256 (truncate if longer)
                System.arraycopy(keyBytes, 0, hs256Key, 0, 32);
                if (keyBytes.length > 32) {
                    log.info("[JwtProvider] JWT secret is {} bytes, using first 32 bytes to force HS256 algorithm", keyBytes.length);
                }
            }
            secretKey = Keys.hmacShaKeyFor(hs256Key);
            log.info("[JwtProvider] ✓✓✓ JWT secret key initialized successfully for HS256");
            log.info("[JwtProvider] ✓✓✓ Key length: {} bytes (original: {} bytes)", 32, keyBytes.length);
            log.info("[JwtProvider] ✓✓✓ Algorithm: HS256 (forced)");
        } else {
            // Generate a random key (for development only - NOT recommended for production)
            log.error("[JwtProvider] ⚠⚠⚠ WARNING: No JWT secret configured!");
            log.error("[JwtProvider] ⚠⚠⚠ Generating random key - tokens will be invalid after server restart!");
            log.error("[JwtProvider] ⚠⚠⚠ Set 'nhs.token.secret' in application.yml to fix this!");
            secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            log.error("[JwtProvider] ⚠⚠⚠ Random key generated - THIS WILL CAUSE AUTHENTICATION FAILURES!");
        }
        log.info("[JwtProvider] ===== JWT Provider initialization complete =====");
    }

    private SecretKey getKey() {
        return secretKey;
    }
    public String generateToken(String subject){
        Date date=new Date(new Date().getTime()+ACCESS_TOKEN_EXPIRED*10L);
        // Explicitly specify HS256 algorithm to ensure consistency
        return Jwts.builder()
                .setExpiration(date)
                .setIssuedAt(new Date())
                .setSubject(subject)
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String generateRefreshToken(Map<String,?> extraClaims,String subject){
        Date date=new Date(new Date().getTime()+REFRESH_TOKEN_AGE);
        // Explicitly specify HS256 algorithm to ensure consistency
        return Jwts.builder()
                .setClaims(extraClaims)
                .setExpiration(date)
                .setIssuedAt(new Date())
                .setSubject(subject)
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public Claims extractClaims(String token ) throws ExpiredJwtException, UnsupportedJwtException,MalformedJwtException,IllegalArgumentException {
       return Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(token).getBody();

    }
    public String getSubject(String token){
        return extractClaims(token).getSubject();
    }
    public Claims validate(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("[JwtProvider] Token is null or empty");
            return null;
        }
        
        Claims claims=null;
        try{
            claims=extractClaims(token);
            log.info("[JwtProvider] ✓ Token validated successfully, subject: {}", claims.getSubject());
            return claims;
        }catch (UnsupportedJwtException e){
            log.error("[JwtProvider] ❌ Token is unsupported: {}", e.getMessage());
        }catch (MalformedJwtException e){
            log.error("[JwtProvider] ❌ Token is malformed: {}", e.getMessage());
        }catch (IllegalArgumentException e){
            log.error("[JwtProvider] ❌ Token is invalid (illegal argument): {}", e.getMessage());
        }catch (ExpiredJwtException e){
            log.error("[JwtProvider] ❌ Token is expired. Expired at: {}", e.getClaims().getExpiration());
        }catch (SignatureException e){
            log.error("[JwtProvider] ❌ Token signature validation failed: {}", e.getMessage());
            log.error("[JwtProvider] ❌ This usually means the JWT secret key changed or token was signed with different key");
        }catch (Exception e){
            log.error("[JwtProvider] ❌ Unexpected error validating token: {}", e.getMessage(), e);
        }
        return null;
    }
}

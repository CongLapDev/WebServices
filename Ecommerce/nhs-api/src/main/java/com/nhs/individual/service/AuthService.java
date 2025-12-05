package com.nhs.individual.service;

import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.RefreshToken;
import com.nhs.individual.domain.User;
import com.nhs.individual.dto.UserLoginDto;
import com.nhs.individual.exception.InvalidTokenException;
import com.nhs.individual.exception.RegisterUserException;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.secure.JwtProvider;
import com.nhs.individual.utils.RequestUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import static com.nhs.individual.utils.Constant.AUTH_TOKEN;
import static com.nhs.individual.utils.Constant.REFRESH_AUTH_TOKEN;

@Service
public class AuthService {
    @Value("${nhs.token.refreshTokenms}")
    private long REFRESH_TOKEN_EXPIRED;
    @Value("${nhs.token.accessTokenms}")
    private long ACCESS_TOKEN_EXPIRED;
    @Autowired
    AccountService accountService;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    RefreshTokenService refreshTokenService;
    @Autowired
    RequestUtils requestUtils;
    @Autowired
    UserService userService;
    Logger log= LoggerFactory.getLogger(AuthService.class);

    public ResponseEntity<ResponseMessage> signIn(Account account){
//        System.out.println(account);
        Authentication authentication=new UsernamePasswordAuthenticationToken(account.getUsername(),account.getPassword());
        Authentication auth = authenticationManager.authenticate(authentication);
        SecurityContextHolder.getContext().setAuthentication(auth);
        IUserDetail userDetail= (IUserDetail) auth.getPrincipal();
        HttpHeaders headers=new HttpHeaders();
//        headers.add(HttpHeaders.ORIGIN,"127.0.0.1");
        headers.add(HttpHeaders.SET_COOKIE,accessTokenCookie(account.getUsername()).toString());
        headers.add(HttpHeaders.SET_COOKIE,refreshTokenCookie(userDetail.getId()).toString());
        headers.add("Withcredentials","true");
        return ResponseEntity.ok()
                .headers(headers)
                .body(ResponseMessage.builder().message("Login success")
                        .ok());
    }
    public Account register(Account account){
         userService.findAllByEmailOrPhoneNumber(account.getUser().getEmail(),account.getUser().getPhoneNumber())
                 .ifPresent(value->{
                     throw new RegisterUserException("Either Email or phone number is registered by other user");
                 });
         return accountService.create(account);
    }
    public ResponseEntity<ResponseMessage> refresh(HttpServletRequest request){
        Cookie cookie= WebUtils.getCookie(request,REFRESH_AUTH_TOKEN);
        if(cookie!=null){
            return refreshTokenService.findByToken(cookie.getValue())
                    .map(token-> {
                        if(!refreshTokenService.verify(token)) return null;
                        return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE,accessTokenCookie(token.getAccount().getUsername()).toString(),refreshTokenCookie(token.getAccount().getId()).toString())
                            .body(ResponseMessage.builder().message("Refresh token")
                                    .ok());
                    })
                    .orElseThrow(()->new InvalidTokenException("Refresh token is invalid"));
        }
        return ResponseEntity.noContent().build();
    }
    public Account getAuthenticatedAccount(){
        int id=((IUserDetail)SecurityContextHolder.getContext().getAuthentication()).getId();
        return accountService
                .findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Account not found"));
    }
    public ResponseCookie accessTokenCookie(String subject){
        return ResponseCookie.from(AUTH_TOKEN,jwtProvider.generateToken(subject))
                .secure(true)
                .path("/")
                .sameSite("None")
                .httpOnly(true)
                .maxAge((int) ACCESS_TOKEN_EXPIRED)
                .build();
    }
    public ResponseCookie refreshTokenCookie(Integer accountId){
        Account account=new Account();
        account.setId(accountId);
        RefreshToken refreshToken= refreshTokenService.generateRefreshToken(account);
        return ResponseCookie.from(REFRESH_AUTH_TOKEN,refreshToken.getToken())
                .secure(true)
                .sameSite("None")
                .path("/")
                .httpOnly(true)
                .maxAge(REFRESH_TOKEN_EXPIRED)
                .build();
    }

    public IUserDetail getCurrentAccount(){
        return (IUserDetail) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
    public User getCurrentUser(){
        return userService.findByAccountId(getCurrentAccount().getId());
    }

    /**
     * Authenticates user and returns User DTO with account and roles
     * This method is used by the /api/auth/login endpoint
     * 
     * Uses UserLoginDto to prevent triggering unnecessary database queries
     * (e.g., comment table) that aren't needed for authentication
     */
    public ResponseEntity<UserLoginDto> signInWithUserDetails(String username, String password){
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, password);
        Authentication auth = authenticationManager.authenticate(authentication);
        SecurityContextHolder.getContext().setAuthentication(auth);
        IUserDetail userDetail = (IUserDetail) auth.getPrincipal();
        
        // Get the full User object with account and roles
        // Use DTO to prevent triggering lazy loading of relationships (like comments)
        User user = userService.findByAccountId(userDetail.getId());
        UserLoginDto userDto = new UserLoginDto(user);
        
        // Generate the access token
        String accessToken = jwtProvider.generateToken(username);
        
        // Set cookies in response headers (for httpOnly cookie support)
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessTokenCookie(username).toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshTokenCookie(userDetail.getId()).toString());
        headers.add("Withcredentials", "true");
        
        // ALSO add token to response headers so frontend can extract it
        // Frontend needs this to store in localStorage for Authorization header
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
        headers.add("X-Auth-Token", accessToken);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(userDto);
    }
}

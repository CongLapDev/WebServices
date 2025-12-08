package com.nhs.individual.security.Oauth2;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.Role;
import com.nhs.individual.domain.User;
import com.nhs.individual.exception.RegisterUserException;
import com.nhs.individual.repository.AccountRepository;
import com.nhs.individual.repository.RoleRepository;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.AccountService;
import com.nhs.individual.service.UserService;
import org.hibernate.NonUniqueObjectException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class Oauth2Service extends DefaultOAuth2UserService {
    private static final Logger log = LoggerFactory.getLogger(Oauth2Service.class);
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.debug("[OAuth2Service] Loading user from Google OAuth2");
        
        // Load user info from Google
        OAuth2User oauth2User = super.loadUser(userRequest);
        IUserDetail oAuth2UserDetail = new IUserDetail(oauth2User);
        
        String email = oauth2User.getAttributes().get("email").toString();
        String username = oAuth2UserDetail.getName();
        
        log.debug("[OAuth2Service] Google user email: {}, username: {}", email, username);
        
        // Try to find existing account by username first
        Account account = accountService.findByUsername(username)
                .orElseGet(() -> {
                    log.debug("[OAuth2Service] Account not found by username, trying email");
                    // If not found by username, try to find by email
                    return userService.findAllByEmailOrPhoneNumber(email, null)
                            .map(User::getAccount)
                            .orElseGet(() -> {
                                log.debug("[OAuth2Service] Account not found by email, creating new account");
                                // Create new account for Google OAuth user
                                return createGoogleAccount(username, oauth2User);
                            });
                });
        
        // Ensure account has valid roles
        ensureAccountHasValidRoles(account);
        
        log.debug("[OAuth2Service] Account loaded: id={}, username={}, roles count={}", 
                account.getId(), account.getUsername(), 
                account.getRoles() != null ? account.getRoles().size() : 0);
        
        // Clear refresh token (will be regenerated in success handler)
        account.setRefreshToken(null);
        return new IUserDetail(account);
    }
    
    /**
     * Ensures account has at least one valid role with non-null name
     */
    private void ensureAccountHasValidRoles(Account account) {
        if (account.getRoles() == null || account.getRoles().isEmpty()) {
            log.warn("[OAuth2Service] Account ID {} has no roles. Adding default USER role.", account.getId());
            Role defaultRole = getOrCreateDefaultRole();
            account.setRoles(List.of(defaultRole));
        } else {
            // Validate and fix existing roles
            boolean hasValidRole = false;
            for (Role role : account.getRoles()) {
                if (role != null) {
                    // Load role from DB if only ID is set
                    if (role.getName() == null && role.getId() > 0) {
                        Role loadedRole = roleRepository.findById(role.getId())
                                .orElse(role);
                        if (loadedRole.getName() != null) {
                            role.setName(loadedRole.getName());
                            hasValidRole = true;
                        }
                    } else if (role.getName() != null && !role.getName().trim().isEmpty()) {
                        hasValidRole = true;
                    }
                }
            }
            
            // If no valid roles found, add default role
            if (!hasValidRole) {
                log.warn("[OAuth2Service] Account ID {} has no valid roles. Adding default USER role.", account.getId());
                Role defaultRole = getOrCreateDefaultRole();
                account.getRoles().add(defaultRole);
            }
        }
    }
    
    /**
     * Gets or creates default USER role with name set
     */
    private Role getOrCreateDefaultRole() {
        return roleRepository.findById(AccountRole.USER.id)
                .map(role -> {
                    // Ensure name is set
                    if (role.getName() == null || role.getName().trim().isEmpty()) {
                        log.warn("[OAuth2Service] Role ID {} has null name. Setting to 'USER'.", role.getId());
                        role.setName("USER");
                    }
                    return role;
                })
                .orElseGet(() -> {
                    log.warn("[OAuth2Service] Role with ID {} not found. Creating default USER role.", AccountRole.USER.id);
                    Role defaultRole = new Role();
                    defaultRole.setId(AccountRole.USER.id);
                    defaultRole.setName("USER");
                    return defaultRole;
                });
    }
    
    private Account createGoogleAccount(String username, OAuth2User oauth2User) {
        String email = oauth2User.getAttributes().get("email").toString();
        
        // Check if username already exists
        accountService.findByUsername(username).ifPresent((account1) -> {
            throw new NonUniqueObjectException("Account's username already exists", username);
        });
        
        // Check if email already exists (duplicate check)
        userService.findAllByEmailOrPhoneNumber(email, null)
                .ifPresent(value -> {
                    throw new RegisterUserException("Email is already registered by another user");
                });
        
        // Create new account
        Account account = new Account();
        account.setUsername(username);
        account.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        account.setProvider(AccountProvider.GOOGLE);
        account.setStatus(AccountStatus.ACTIVE.id);
        
        // Set role - load from database to ensure name is set
        Role role = roleRepository.findById(AccountRole.USER.id)
                .orElseGet(() -> {
                    log.warn("[OAuth2Service] Role with ID {} not found in database. Creating default USER role.", AccountRole.USER.id);
                    Role defaultRole = new Role();
                    defaultRole.setId(AccountRole.USER.id);
                    defaultRole.setName("USER");
                    return defaultRole;
                });
        
        // Ensure role name is not null
        if (role.getName() == null || role.getName().trim().isEmpty()) {
            log.warn("[OAuth2Service] Role ID {} has null or empty name. Setting to 'USER'.", role.getId());
            role.setName("USER");
        }
        
        log.debug("[OAuth2Service] Creating Google account with role: id={}, name={}", role.getId(), role.getName());
        account.setRoles(List.of(role));
        
        // Create user
        User user = new User();
        user.setEmail(email);
        user.setFirstname((String) oauth2User.getAttributes().get("given_name"));
        user.setLastname((String) oauth2User.getAttributes().get("family_name"));
        user.setPicture((String) oauth2User.getAttributes().get("picture"));
        
        // Link account and user
        account.setUser(user);
        user.setAccount(account);
        
        // Save account directly (cascade will save user)
        return accountRepository.save(account);
    }
}

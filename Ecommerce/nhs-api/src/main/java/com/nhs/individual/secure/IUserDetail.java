package com.nhs.individual.secure;

import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.domain.Account;
import lombok.Data;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Data
public class IUserDetail implements UserDetails,OAuth2User {
    private static final Logger log = LoggerFactory.getLogger(IUserDetail.class);
    
    private Integer id;
    private Integer userId;
    private String username;
    private String password;
    @Setter
    private Collection<SimpleGrantedAuthority> authorities;
    private OAuth2User oAuth2User;
    private Integer status;

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    public IUserDetail(OAuth2User oAuth2User){
        this.oAuth2User=oAuth2User;
        this.username=oAuth2User.getName();
        this.authorities=oAuth2User.getAuthorities().stream().map(d->new SimpleGrantedAuthority(d.getAuthority())).toList();
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    public IUserDetail(){

    }


    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !Objects.equals(status, AccountStatus.LOCKED.id);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }



    @Override
    public boolean isEnabled() {
        return Objects.equals(status, AccountStatus.ACTIVE.id);
    }
    public IUserDetail(Account account){
        this.username=account.getUsername();
        this.id=account.getId();
        this.password=account.getPassword();
        this.userId=account.getUser().getId();
        
        // Null-safe role mapping with fallback to "USER"
        // CRITICAL: Handle null roles, null role names, and ensure at least one authority
        log.debug("[IUserDetail] Processing roles for account ID: {}", account.getId());
        
        Collection<SimpleGrantedAuthority> roleAuthorities = new ArrayList<>();
        
        if (account.getRoles() != null && !account.getRoles().isEmpty()) {
            log.debug("[IUserDetail] Account has {} roles", account.getRoles().size());
            
            roleAuthorities = account.getRoles().stream()
                    .filter(role -> role != null) // Skip null roles
                    .map(role -> {
                        // Null-safe name extraction with fallback
                        String roleName = Optional.ofNullable(role.getName())
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .orElse("USER"); // Default fallback
                        
                        log.debug("[IUserDetail] Processing role: id={}, name={}", role.getId(), roleName);
                        
                        // Normalize role name: remove ROLE_ prefix if present, convert to uppercase
                        String normalizedRole = roleName.toUpperCase().replaceFirst("^ROLE_", "");
                        return new SimpleGrantedAuthority(normalizedRole);
                    })
                    .collect(Collectors.toList());
            
            log.debug("[IUserDetail] Mapped {} valid roles to authorities", roleAuthorities.size());
        } else {
            log.warn("[IUserDetail] Account ID {} has no roles or roles collection is null/empty. Using default 'USER' role.", account.getId());
        }
        
        // CRITICAL: Ensure at least one authority exists (fallback to "USER")
        if (roleAuthorities.isEmpty()) {
            log.warn("[IUserDetail] No valid roles found for account ID {}. Adding default 'USER' authority.", account.getId());
            roleAuthorities.add(new SimpleGrantedAuthority("USER"));
        }
        
        this.authorities = roleAuthorities;
        this.status=account.getStatus();
        
        log.debug("[IUserDetail] Final authorities for account ID {}: {}", account.getId(), 
                roleAuthorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
    }
    @Override
    public String getName() {
        return oAuth2User.getName();
    }
}

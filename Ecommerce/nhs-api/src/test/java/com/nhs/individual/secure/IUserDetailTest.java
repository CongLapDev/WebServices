package com.nhs.individual.secure;

import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.Role;
import com.nhs.individual.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for IUserDetail class
 * Tests null-safe role handling to prevent NullPointerException
 */
class IUserDetailTest {

    private Account account;
    private User user;

    @BeforeEach
    void setUp() {
        account = new Account();
        account.setId(1);
        account.setUsername("testuser");
        account.setPassword("password");
        account.setStatus(AccountStatus.ACTIVE.id);
        
        user = new User();
        user.setId(1);
        account.setUser(user);
        user.setAccount(account);
    }

    @Test
    void testIUserDetailWithNullRoles() {
        // Test: Account with null roles collection
        account.setRoles(null);
        
        // Should not throw NullPointerException
        assertDoesNotThrow(() -> {
            IUserDetail userDetail = new IUserDetail(account);
            assertNotNull(userDetail.getAuthorities());
            assertFalse(userDetail.getAuthorities().isEmpty());
            // Should have default "USER" authority
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("USER")));
        });
    }

    @Test
    void testIUserDetailWithEmptyRoles() {
        // Test: Account with empty roles collection
        account.setRoles(Collections.emptyList());
        
        // Should not throw NullPointerException
        assertDoesNotThrow(() -> {
            IUserDetail userDetail = new IUserDetail(account);
            assertNotNull(userDetail.getAuthorities());
            assertFalse(userDetail.getAuthorities().isEmpty());
            // Should have default "USER" authority
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("USER")));
        });
    }

    @Test
    void testIUserDetailWithRoleWithNullName() {
        // Test: Account with role that has null name
        Role role = new Role();
        role.setId(1);
        role.setName(null); // Null name
        
        account.setRoles(List.of(role));
        
        // Should not throw NullPointerException
        assertDoesNotThrow(() -> {
            IUserDetail userDetail = new IUserDetail(account);
            assertNotNull(userDetail.getAuthorities());
            assertFalse(userDetail.getAuthorities().isEmpty());
            // Should have default "USER" authority
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("USER")));
        });
    }

    @Test
    void testIUserDetailWithRoleWithEmptyName() {
        // Test: Account with role that has empty string name
        Role role = new Role();
        role.setId(1);
        role.setName("   "); // Empty/whitespace name
        
        account.setRoles(List.of(role));
        
        // Should not throw NullPointerException
        assertDoesNotThrow(() -> {
            IUserDetail userDetail = new IUserDetail(account);
            assertNotNull(userDetail.getAuthorities());
            assertFalse(userDetail.getAuthorities().isEmpty());
            // Should have default "USER" authority
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("USER")));
        });
    }

    @Test
    void testIUserDetailWithNullRoleInCollection() {
        // Test: Account with collection containing null role
        List<Role> roles = new ArrayList<>();
        roles.add(null); // Null role in collection
        
        account.setRoles(roles);
        
        // Should not throw NullPointerException
        assertDoesNotThrow(() -> {
            IUserDetail userDetail = new IUserDetail(account);
            assertNotNull(userDetail.getAuthorities());
            assertFalse(userDetail.getAuthorities().isEmpty());
            // Should have default "USER" authority
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("USER")));
        });
    }

    @Test
    void testIUserDetailWithValidRole() {
        // Test: Account with valid role
        Role role = new Role();
        role.setId(1);
        role.setName("ADMIN");
        
        account.setRoles(List.of(role));
        
        IUserDetail userDetail = new IUserDetail(account);
        
        assertNotNull(userDetail.getAuthorities());
        assertFalse(userDetail.getAuthorities().isEmpty());
        assertTrue(userDetail.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN")));
    }

    @Test
    void testIUserDetailWithMultipleRoles() {
        // Test: Account with multiple roles, one with null name
        Role validRole = new Role();
        validRole.setId(1);
        validRole.setName("ADMIN");
        
        Role nullNameRole = new Role();
        nullNameRole.setId(2);
        nullNameRole.setName(null);
        
        account.setRoles(List.of(validRole, nullNameRole));
        
        // Should not throw NullPointerException
        assertDoesNotThrow(() -> {
            IUserDetail userDetail = new IUserDetail(account);
            assertNotNull(userDetail.getAuthorities());
            assertFalse(userDetail.getAuthorities().isEmpty());
            // Should have ADMIN authority
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ADMIN")));
            // Should also have USER authority from null role fallback
            assertTrue(userDetail.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("USER")));
        });
    }

    @Test
    void testIUserDetailRoleNameNormalization() {
        // Test: Role name normalization (ROLE_ prefix removal, uppercase)
        Role role = new Role();
        role.setId(1);
        role.setName("role_user"); // lowercase with prefix
        
        account.setRoles(List.of(role));
        
        IUserDetail userDetail = new IUserDetail(account);
        
        Collection<? extends GrantedAuthority> authorities = userDetail.getAuthorities();
        assertNotNull(authorities);
        assertFalse(authorities.isEmpty());
        
        // Should normalize to uppercase without ROLE_ prefix
        assertTrue(authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("USER")));
    }
}


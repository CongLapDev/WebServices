package com.nhs.individual.service;

import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.exception.OrderAccessDeniedException;
import com.nhs.individual.exception.OrderNotFoundException;
import com.nhs.individual.repository.ShopOrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

/**
 * Service to handle order authorization checks
 * Separates security logic from business logic
 */
@Service("orderSecurityService")
@AllArgsConstructor
public class OrderSecurityService {
    
    private final ShopOrderRepository orderRepository;
    
    /**
     * Check if user can view an order
     * - Order owner can view their own orders
     * - Admin can view all orders
     */
    public boolean canView(Integer orderId, Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        
        // Admin can view all orders
        if (hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ADMIN")) {
            return true;
        }
        
        // Check if user owns this order
        ShopOrder order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false;
        }
        
        Integer userId = getUserId(authentication);
        return order.getUserId() != null && order.getUserId().equals(userId);
    }
    
    /**
     * Check if user can cancel an order
     * - Order owner can cancel their own orders (if cancellable)
     * - Admin can cancel any order (if cancellable)
     */
    public boolean canCancel(Integer orderId, Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        
        ShopOrder order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false;
        }
        
        // Check if order is in cancellable state
        // This is a preliminary check; actual status check is done in service layer
        
        // Admin can cancel
        if (hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ADMIN")) {
            return true;
        }
        
        // User can cancel their own order
        Integer userId = getUserId(authentication);
        return order.getUserId() != null && order.getUserId().equals(userId);
    }
    
    /**
     * Check if user can update order status (for system transitions)
     * - Only ADMIN can update order status
     * - Users cannot directly change status (except cancel)
     */
    public boolean canUpdateStatus(Integer orderId, Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        
        return hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ADMIN");
    }
    
    /**
     * Verify user owns the order or throw exception
     */
    public void verifyOwnership(Integer orderId, Authentication authentication) {
        ShopOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        Integer userId = getUserId(authentication);
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ADMIN");
        
        if (!isAdmin && (order.getUserId() == null || !order.getUserId().equals(userId))) {
            throw new OrderAccessDeniedException(orderId, userId);
        }
    }
    
    /**
     * Get user ID from authentication principal
     */
    private Integer getUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        
        // Try to get userId from IUserDetail interface
        try {
            if (principal instanceof com.nhs.individual.secure.IUserDetail) {
                return ((com.nhs.individual.secure.IUserDetail) principal).getUserId();
            }
        } catch (Exception e) {
            // Fallback
        }
        
        // Add other principal types if needed
        return null;
    }
    
    /**
     * Check if authentication has specific role
     */
    private boolean hasRole(Authentication authentication, String role) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals(role));
    }
}


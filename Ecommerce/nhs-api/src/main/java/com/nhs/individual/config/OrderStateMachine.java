package com.nhs.individual.config;

import com.nhs.individual.constant.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Order State Machine - Defines valid state transitions
 * 
 * Ensures business rules for order status changes
 */
@Component
public class OrderStateMachine {
    
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS;
    
    static {
        Map<OrderStatus, Set<OrderStatus>> transitions = new EnumMap<>(OrderStatus.class);
        
        // PENDING_PAYMENT can go to:
        transitions.put(OrderStatus.PENDING_PAYMENT, EnumSet.of(
            OrderStatus.PAID,           // Online payment completed
            OrderStatus.CONFIRMED,      // COD - admin confirms directly
            OrderStatus.CANCELLED       // User/System cancels
        ));
        
        // PAID can go to:
        transitions.put(OrderStatus.PAID, EnumSet.of(
            OrderStatus.CONFIRMED,      // Admin confirms order
            OrderStatus.CANCELLED       // Refund & cancel
        ));
        
        // CONFIRMED can go to:
        transitions.put(OrderStatus.CONFIRMED, EnumSet.of(
            OrderStatus.PREPARING,      // Warehouse starts preparing
            OrderStatus.CANCELLED       // Admin cancels
        ));
        
        // PREPARING can go to:
        transitions.put(OrderStatus.PREPARING, EnumSet.of(
            OrderStatus.SHIPPING,       // Order shipped
            OrderStatus.CANCELLED       // Last chance to cancel
        ));
        
        // SHIPPING can go to:
        transitions.put(OrderStatus.SHIPPING, EnumSet.of(
            OrderStatus.DELIVERED       // Successfully delivered
            // Note: Cannot cancel once shipped
        ));
        
        // DELIVERED can go to:
        transitions.put(OrderStatus.DELIVERED, EnumSet.of(
            OrderStatus.COMPLETED,      // Customer confirms receipt
            OrderStatus.RETURNED        // Customer returns product
        ));
        
        // COMPLETED can go to:
        transitions.put(OrderStatus.COMPLETED, EnumSet.of(
            OrderStatus.RETURNED        // Return after completion (within return window)
        ));
        
        // Final states - no transitions
        transitions.put(OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));
        transitions.put(OrderStatus.RETURNED, EnumSet.noneOf(OrderStatus.class));
        
        ALLOWED_TRANSITIONS = Collections.unmodifiableMap(transitions);
    }
    
    /**
     * Check if transition from currentStatus to newStatus is allowed
     */
    public boolean isTransitionAllowed(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == null || newStatus == null) {
            return false;
        }
        
        if (currentStatus == newStatus) {
            return false; // No-op transition not allowed
        }
        
        Set<OrderStatus> allowedNext = ALLOWED_TRANSITIONS.get(currentStatus);
        return allowedNext != null && allowedNext.contains(newStatus);
    }
    
    /**
     * Get all possible next statuses from current status
     */
    public Set<OrderStatus> getAllowedNextStatuses(OrderStatus currentStatus) {
        if (currentStatus == null) {
            return EnumSet.noneOf(OrderStatus.class);
        }
        
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.get(currentStatus);
        return allowed != null ? EnumSet.copyOf(allowed) : EnumSet.noneOf(OrderStatus.class);
    }
    
    /**
     * Get human-readable error message for invalid transition
     */
    public String getTransitionErrorMessage(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == null || newStatus == null) {
            return "Invalid status: current or new status is null";
        }
        
        if (currentStatus == newStatus) {
            return String.format("Order is already in %s status", currentStatus.description);
        }
        
        if (currentStatus.isFinalState()) {
            return String.format("Cannot change status. Order is in final state: %s", 
                currentStatus.description);
        }
        
        Set<OrderStatus> allowed = getAllowedNextStatuses(currentStatus);
        if (allowed.isEmpty()) {
            return String.format("No valid transitions from %s status", currentStatus.description);
        }
        
        StringBuilder allowedStr = new StringBuilder();
        for (OrderStatus status : allowed) {
            if (allowedStr.length() > 0) allowedStr.append(", ");
            allowedStr.append(status.description);
        }
        
        return String.format(
            "Cannot transition from %s to %s. Allowed transitions: %s",
            currentStatus.description,
            newStatus.description,
            allowedStr.toString()
        );
    }
}


package com.nhs.individual.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when user tries to access/modify an order they don't own
 * HTTP 403 FORBIDDEN
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class OrderAccessDeniedException extends RuntimeException {
    
    private final Integer orderId;
    private final Integer userId;
    
    public OrderAccessDeniedException(Integer orderId, Integer userId) {
        super(String.format("User %d is not authorized to access order %d", userId, orderId));
        this.orderId = orderId;
        this.userId = userId;
    }
    
    public OrderAccessDeniedException(String message) {
        super(message);
        this.orderId = null;
        this.userId = null;
    }
    
    public Integer getOrderId() {
        return orderId;
    }
    
    public Integer getUserId() {
        return userId;
    }
}


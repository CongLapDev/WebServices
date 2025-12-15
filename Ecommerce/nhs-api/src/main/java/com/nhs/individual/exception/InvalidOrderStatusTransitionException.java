package com.nhs.individual.exception;

import com.nhs.individual.constant.OrderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when attempting an invalid order status transition
 * HTTP 409 CONFLICT - Business rule violation
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidOrderStatusTransitionException extends RuntimeException {
    
    private final OrderStatus currentStatus;
    private final OrderStatus attemptedStatus;
    
    public InvalidOrderStatusTransitionException(OrderStatus currentStatus, OrderStatus attemptedStatus, String message) {
        super(message);
        this.currentStatus = currentStatus;
        this.attemptedStatus = attemptedStatus;
    }
    
    public InvalidOrderStatusTransitionException(String message) {
        super(message);
        this.currentStatus = null;
        this.attemptedStatus = null;
    }
    
    public OrderStatus getCurrentStatus() {
        return currentStatus;
    }
    
    public OrderStatus getAttemptedStatus() {
        return attemptedStatus;
    }
}


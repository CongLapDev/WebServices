package com.nhs.individual.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when order is not found
 * HTTP 404 NOT FOUND
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class OrderNotFoundException extends RuntimeException {
    
    private final Integer orderId;
    
    public OrderNotFoundException(Integer orderId) {
        super("Order not found with ID: " + orderId);
        this.orderId = orderId;
    }
    
    public OrderNotFoundException(Integer orderId, String message) {
        super(message);
        this.orderId = orderId;
    }
    
    public Integer getOrderId() {
        return orderId;
    }
}


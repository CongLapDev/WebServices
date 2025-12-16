package com.nhs.individual.exception;

import lombok.Getter;

/**
 * Base exception for all payment-related errors
 */
@Getter
public class PaymentException extends RuntimeException {
    private final String errorCode;
    private final Object details;
    
    public PaymentException(String message) {
        super(message);
        this.errorCode = "PAYMENT_ERROR";
        this.details = null;
    }
    
    public PaymentException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.details = null;
    }
    
    public PaymentException(String message, String errorCode, Object details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }
    
    public PaymentException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "PAYMENT_ERROR";
        this.details = null;
    }
}


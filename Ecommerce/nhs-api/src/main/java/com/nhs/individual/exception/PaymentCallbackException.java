package com.nhs.individual.exception;

/**
 * Thrown when payment callback verification fails
 */
public class PaymentCallbackException extends PaymentException {
    
    public PaymentCallbackException(String message) {
        super(message, "CALLBACK_VERIFICATION_FAILED");
    }
    
    public PaymentCallbackException(String message, Object details) {
        super(message, "CALLBACK_VERIFICATION_FAILED", details);
    }
}


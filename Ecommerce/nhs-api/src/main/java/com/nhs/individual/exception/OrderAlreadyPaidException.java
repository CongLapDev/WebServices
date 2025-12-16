package com.nhs.individual.exception;

/**
 * Thrown when attempting to process payment for an order that has already been paid
 */
public class OrderAlreadyPaidException extends PaymentException {
    
    public OrderAlreadyPaidException(Integer orderId) {
        super(
            String.format("Order #%d has already been paid", orderId),
            "ORDER_ALREADY_PAID",
            orderId
        );
    }
}


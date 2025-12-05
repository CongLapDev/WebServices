package com.nhs.individual.constant;

public enum PaymentStatus {
    PAID(1),
    CANCEL(2),
    PENDING(3);
    public final int value;
    private PaymentStatus(int value) {
        this.value = value;
    }
}

package com.nhs.individual.constant;

public enum OrderPaymentStatus {
    PENDING("PENDING"),
    COMPLETED("PAID"),
    FAIL("FAILURE");
    public final String value;
    OrderPaymentStatus(String value){
        this.value=value;
    }
}

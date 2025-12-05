package com.nhs.individual.constant;

public enum OrderStatus {
    PAID(0,"PAID"),
    PENDING(1,"PENDING"),
    PREPARING(2,"PREPARING"),
    DELIVERING(3,"DELIVERING"),
    DELIVERED(4,"DELIVERED"),
    COMPLETED(5,"COMPLETED"),
    CANCEL(6,"CANCEL"),
    RETURN(7,"RETURN");

    public final int id;
    public final String value;
    OrderStatus(Integer id, String value) {
        this.id=id;
        this.value=value;
    }
}

package com.nhs.individual.constant;

public enum AccountStatus {
    ACTIVE(1,"ACTIVE"),
    INACTIVE(2,"INACTIVE"),
    LOCKED(3,"LOCKED"),
    VERIFYING(4,"VERIFYING");
    public final String value;
    public final Integer id;
    AccountStatus(Integer id,String value){
        this.value=value;
        this.id=id;
    }
}

package com.nhs.individual.constant;

public enum AccountRole {
    USER(1,"USER"),
    ADMIN(2,"ADMIN"),
    SUPER_ADMIN(3,"SUPER_ADMIN");
    public final Integer id;
    public final String role;
    AccountRole(Integer id,String role){
        this.id=id;
        this.role=role;
    }
}

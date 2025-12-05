package com.nhs.individual.constant;

public enum AccountProvider {
    SYSTEM("SYSTEM"),
    GOOGLE("GOOGLE");
    public final String value;
    AccountProvider(String value){
        this.value=value;
    }
}

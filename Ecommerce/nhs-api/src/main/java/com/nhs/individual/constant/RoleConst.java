package com.nhs.individual.constant;

public enum RoleConst {
    USER(1, "USER"),
    ADMIN(2, "ADMIN");
    public final Integer id;
    public final String name;

    RoleConst(Integer id, String name) {
        this.id = id;
        this.name = name;
    }
}

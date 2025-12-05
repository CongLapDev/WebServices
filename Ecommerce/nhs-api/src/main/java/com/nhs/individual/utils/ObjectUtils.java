package com.nhs.individual.utils;

import java.lang.reflect.Field;

public class ObjectUtils<T> {

    public static <T> T merge(T oldObject,T mergeObject,Class<T> clazz) {
        Field[] fields=clazz.getDeclaredFields();
        try {
            for(Field field:fields){
                field.setAccessible(true);
                if(field.get(mergeObject)==null) continue;
                field.set(oldObject,field.get(mergeObject));
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
        return oldObject;
    }

}

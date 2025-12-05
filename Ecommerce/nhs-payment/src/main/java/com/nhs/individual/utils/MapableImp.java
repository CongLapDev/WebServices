package com.nhs.individual.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class MapableImp {
    private static final ObjectMapper objectMapper=new ObjectMapper();
    public Map<String,Object> toMap(Object object){
        return objectMapper.convertValue(object, new TypeReference<Map<String, Object>>() {});
    }
}

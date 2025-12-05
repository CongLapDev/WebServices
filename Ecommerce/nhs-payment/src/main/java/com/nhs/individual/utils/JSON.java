package com.nhs.individual.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;


public class JSON {
    private static final ObjectWriter writter;
    private static final ObjectMapper mapper;
    static {
        writter=new ObjectMapper().writer();
        mapper=new ObjectMapper();
    }
    public static String stringify(Object object) throws JsonProcessingException {
        return writter.writeValueAsString(object);
    }
    public static <T> T parse(String json,Class<T> cls) throws JsonProcessingException {
        return mapper.readValue(json,cls);
    }
}

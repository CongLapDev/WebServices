package com.nhs.individual.utils;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface Jsonable {
    JsonableImp jsonableImp=new JsonableImp();
    default String toJSON() throws JsonProcessingException {
        return jsonableImp.toJSON();
    }
}

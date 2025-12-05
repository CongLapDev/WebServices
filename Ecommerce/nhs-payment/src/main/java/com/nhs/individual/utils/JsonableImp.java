package com.nhs.individual.utils;

import com.fasterxml.jackson.core.JsonProcessingException;

public class JsonableImp implements Jsonable{
    public String toJSON()  throws JsonProcessingException{
        return JSON.stringify(this);
    }
}

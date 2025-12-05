package com.nhs.individual.exception;

public class ResponseException extends RuntimeException{
    protected String message;
    protected Integer errorCode;
    public  ResponseException(String message){
        super(message);
    }
    public  ResponseException(String message,Throwable throwable){
        super(message,throwable);
    }
    public  ResponseException(String message,Integer errorCode){
        super(message);
        this.errorCode=errorCode;
    }
    public  ResponseException(String message,Throwable throwable,Integer errorCode){
        super(message,throwable);
        this.errorCode=errorCode;
    }
}

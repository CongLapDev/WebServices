package com.nhs.individual.exception;

import org.springframework.http.HttpStatus;

public class InvalidTokenException extends ResponseException{
    protected HttpStatus httpStatus= HttpStatus.UNAUTHORIZED;
    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Integer errorCode) {
        super(message, errorCode);
    }

    public InvalidTokenException(String message, Throwable throwable, Integer errorCode) {
        super(message, throwable, errorCode);
    }
}

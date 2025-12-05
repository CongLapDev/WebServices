package com.nhs.individual.exception;

import org.springframework.http.HttpStatus;

public class IllegalInputException extends ResponseException {
    protected HttpStatus httpStatus = HttpStatus.BAD_REQUEST;
    public IllegalInputException(String message) {
        super(message);
    }

    public IllegalInputException(String message, Throwable throwable) {
        super(message, throwable);
    }
}

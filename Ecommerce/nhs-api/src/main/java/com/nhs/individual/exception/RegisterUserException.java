package com.nhs.individual.exception;

public class RegisterUserException extends RuntimeException{
    public RegisterUserException() {
    }

    public RegisterUserException(String message) {
        super(message);
    }

    public RegisterUserException(String message, Throwable cause) {
        super(message, cause);
    }

    public RegisterUserException(Throwable cause) {
        super(cause);
    }

    public RegisterUserException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

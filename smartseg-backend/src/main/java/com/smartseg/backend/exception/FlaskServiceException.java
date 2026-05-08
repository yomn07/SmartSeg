package com.smartseg.backend.exception;

public class FlaskServiceException extends RuntimeException {
    public FlaskServiceException(String message) {
        super(message);
    }
}
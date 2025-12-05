package com.nhs.individual.responsemessage;

import lombok.Getter;
import lombok.Setter;

public class ResponseMessage {
    @Getter
    @Setter
    private String message;
    @Getter
    @Setter
    private int statusCode;
    @Getter
    @Setter
    private String exceptionType;
    @Getter
    @Setter
    private Boolean isError=false;
    @Getter
    @Setter
    private String details;
    public static ResponseMessageBuilder builder(){
        return new ResponseMessageBuilder();
    }
    public static class ResponseMessageBuilder{

        private ResponseMessage responseMessage;
        public ResponseMessageBuilder(){
            responseMessage=new ResponseMessage();
        }
        public ResponseMessageBuilder message(String message){
            responseMessage.setMessage(message);
            return this;
        }
        public ResponseMessageBuilder statusCode(int statusCode){
            responseMessage.setStatusCode(statusCode);
            return this;
        }
        public ResponseMessageBuilder exceptionType(String exceptionType){
            responseMessage.setExceptionType(exceptionType);
            return this;
        }
        public ResponseMessageBuilder error(){
            responseMessage.setIsError(true);
            return this;
        }

        public ResponseMessageBuilder details(String details){
            responseMessage.setDetails(details);
            return this;
        }
        public ResponseMessage ok(){
            return responseMessage;
        }
        public ResponseMessage ok(String message){
            responseMessage.setMessage(message);
            responseMessage.setIsError(false);
            return responseMessage;
        }
    }




}

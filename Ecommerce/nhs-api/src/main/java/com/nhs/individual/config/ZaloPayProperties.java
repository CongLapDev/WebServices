package com.nhs.individual.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * ZaloPay Sandbox Configuration Properties
 * Maps to payment.zalo.* in application.yml
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "payment.zalo")
public class ZaloPayProperties {
    
    /**
     * ZaloPay App ID (Sandbox: 2554)
     */
    private Integer appId;
    
    /**
     * ZaloPay Key1 - used for creating orders (MAC generation)
     */
    private String key1;
    
    /**
     * ZaloPay Key2 - used for verifying callbacks
     */
    private String key2;
    
    /**
     * ZaloPay API endpoints
     */
    private Endpoints endpoints = new Endpoints();
    
    /**
     * Callback and redirect URLs
     */
    private String callbackUrl;
    private String redirectUrl;
    
    /**
     * Payment timeout settings
     */
    private Long paymentTimeoutMinutes = 15L;
    private Long pollingIntervalSeconds = 120L; // 2 minutes
    private Integer maxPollingAttempts = 8; // 16 minutes total
    
    @Data
    public static class Endpoints {
        /**
         * Create order endpoint (Sandbox: https://sandbox.zalopay.com.vn/v001/tpe/createorder)
         */
        private String create;
        
        /**
         * Query order status endpoint (Sandbox: https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid)
         */
        private String query;
        
        /**
         * Refund endpoint (Sandbox: https://sandbox.zalopay.com.vn/v001/tpe/partialrefund)
         */
        private String refund;
        
        /**
         * Get refund status endpoint (Sandbox: https://sandbox.zalopay.com.vn/v001/tpe/getpartialrefundstatus)
         */
        private String refundStatus;
    }
}


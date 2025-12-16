package com.nhs.individual.zalopay.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ZaloPayResponse {
    private boolean success;
    private Integer return_code;
    private String return_message;
    private String order_url;
    private String zp_trans_token;
    // Note: ZaloPay v2 does NOT return qr_code - removed field
    private String app_trans_id;
    
    // Additional fields from OrderPurchaseInfo
    private Integer sub_return_code;
    private String sub_return_message;
    private String order_token;
    
    public static ZaloPayResponse success(OrderPurchaseInfo info) {
        ZaloPayResponse response = new ZaloPayResponse();
        response.setSuccess(true);
        response.setReturn_code(info.getReturn_code());
        response.setReturn_message(info.getReturn_message());
        response.setOrder_url(info.getOrder_url());
        response.setZp_trans_token(info.getZp_trans_token());
        // Note: ZaloPay v2 does NOT return qr_code - frontend should redirect to order_url
        response.setApp_trans_id(info.getApp_trans_id());
        response.setSub_return_code(info.getSub_return_code());
        response.setSub_return_message(info.getSub_return_message());
        response.setOrder_token(info.getOrder_token());
        return response;
    }
    
    public static ZaloPayResponse error(Integer returnCode, String returnMessage) {
        ZaloPayResponse response = new ZaloPayResponse();
        response.setSuccess(false);
        response.setReturn_code(returnCode);
        response.setReturn_message(returnMessage != null && !returnMessage.trim().isEmpty() 
            ? returnMessage 
            : "ZaloPay payment failed");
        return response;
    }
}


package com.nhs.individual.zalopay.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * ZaloPay v2 API response model
 * Maps snake_case JSON fields from ZaloPay v2 API response
 * Note: ZaloPay v2 does NOT return qr_code field
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderPurchaseInfo{
    // ZaloPay v2 returns snake_case fields: return_code, return_message, etc.
    @JsonProperty("return_code")
    private Integer return_code;
    
    @JsonProperty("return_message")
    private String return_message;
    
    @JsonProperty("sub_return_code")
    private Integer sub_return_code;
    
    @JsonProperty("sub_return_message")
    private String sub_return_message;
    
    @JsonProperty("zp_trans_token")
    private String zp_trans_token;
    
    @JsonProperty("order_url")
    private String order_url;
    
    @JsonProperty("order_token")
    private String order_token;
    
    // Note: ZaloPay v2 does NOT return qr_code - removed field
    // Frontend should redirect to order_url instead
    
    @JsonProperty("app_trans_id")
    private String app_trans_id;


    public String getApp_trans_id() {
        return app_trans_id;
    }

    public void setApp_trans_id(String app_trans_id) {
        this.app_trans_id = app_trans_id;
    }

    public Integer getReturn_code() {
        return return_code;
    }

    public void setReturn_code(Integer return_code) {
        this.return_code = return_code;
    }

    public String getReturn_message() {
        return return_message;
    }

    public void setReturn_message(String return_message) {
        this.return_message = return_message;
    }

    public Integer getSub_return_code() {
        return sub_return_code;
    }

    public void setSub_return_code(Integer sub_return_code) {
        this.sub_return_code = sub_return_code;
    }

    public String getSub_return_message() {
        return sub_return_message;
    }

    public void setSub_return_message(String sub_return_message) {
        this.sub_return_message = sub_return_message;
    }

    public String getZp_trans_token() {
        return zp_trans_token;
    }

    public void setZp_trans_token(String zp_trans_token) {
        this.zp_trans_token = zp_trans_token;
    }

    public String getOrder_url() {
        return order_url;
    }

    public void setOrder_url(String order_url) {
        this.order_url = order_url;
    }

    public String getOrder_token() {
        return order_token;
    }

    public void setOrder_token(String order_token) {
        this.order_token = order_token;
    }
}

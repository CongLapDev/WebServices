package com.nhs.individual.zalopay.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderPurchaseInfo{
    private Integer return_code;
    private String return_message;
    private Integer sub_return_code;
    private String sub_return_message;
    private String zp_trans_token;
    private String order_url;
    private String order_token;
    private String qr_code;
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

    public String getQr_code() {
        return qr_code;
    }

    public void setQr_code(String qr_code) {
        this.qr_code = qr_code;
    }
}

package com.nhs.individual.zalopay.model;

public class OrderCallbackData {
    private Integer app_id;
    private String app_trans_id;
    private Long app_time;
    private String app_user;
    private Long amount;
    private String embed_data;
    private String item;
    private Long zp_trans_id;
    private Long server_time;
    private Integer channel;
    private String merchant_user_id;
    private Long user_fee_amount;
    private Long discount_amount;

    public Integer getApp_id() {
        return app_id;
    }

    public void setApp_id(Integer app_id) {
        this.app_id = app_id;
    }

    public String getApp_trans_id() {
        return app_trans_id;
    }

    public void setApp_trans_id(String app_trans_id) {
        this.app_trans_id = app_trans_id;
    }

    public Long getApp_time() {
        return app_time;
    }

    public void setApp_time(Long app_time) {
        this.app_time = app_time;
    }

    public String getApp_user() {
        return app_user;
    }

    public void setApp_user(String app_user) {
        this.app_user = app_user;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getEmbed_data() {
        return embed_data;
    }

    public void setEmbed_data(String embed_data) {
        this.embed_data = embed_data;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public Long getZp_trans_id() {
        return zp_trans_id;
    }

    public void setZp_trans_id(Long zp_trans_id) {
        this.zp_trans_id = zp_trans_id;
    }

    public Long getServer_time() {
        return server_time;
    }

    public void setServer_time(Long server_time) {
        this.server_time = server_time;
    }

    public Integer getChannel() {
        return channel;
    }

    public void setChannel(Integer channel) {
        this.channel = channel;
    }

    public String getMerchant_user_id() {
        return merchant_user_id;
    }

    public void setMerchant_user_id(String merchant_user_id) {
        this.merchant_user_id = merchant_user_id;
    }

    public Long getUser_fee_amount() {
        return user_fee_amount;
    }

    public void setUser_fee_amount(Long user_fee_amount) {
        this.user_fee_amount = user_fee_amount;
    }

    public Long getDiscount_amount() {
        return discount_amount;
    }

    public void setDiscount_amount(Long discount_amount) {
        this.discount_amount = discount_amount;
    }
}

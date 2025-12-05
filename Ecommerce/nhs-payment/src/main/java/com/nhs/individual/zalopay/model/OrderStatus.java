package com.nhs.individual.zalopay.model;

public class OrderStatus {
    private Integer return_code;
    private String return_message;
    private Integer sub_return_code;
    private String sub_return_message;
    private Boolean is_processing;
    private Integer amount;
    private Long discount_amount;
    private Long zp_trans_id;

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

    public Boolean getIs_processing() {
        return is_processing;
    }

    public void setIs_processing(Boolean is_processing) {
        this.is_processing = is_processing;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public Long getDiscount_amount() {
        return discount_amount;
    }

    public void setDiscount_amount(Long discount_amount) {
        this.discount_amount = discount_amount;
    }

    public Long getZp_trans_id() {
        return zp_trans_id;
    }

    public void setZp_trans_id(Long zp_trans_id) {
        this.zp_trans_id = zp_trans_id;
    }
}

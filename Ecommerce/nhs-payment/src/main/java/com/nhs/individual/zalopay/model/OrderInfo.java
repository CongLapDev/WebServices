package com.nhs.individual.zalopay.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nhs.individual.utils.Mapable;
import com.nhs.individual.zalopay.crypto.HMACUtil;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@ToString
public class OrderInfo implements Mapable {
    //(REQUIRED) Định danh cho ứng dụng đã được cấp khi đăng ký ứng dụng với ZaloPay
    private int app_id;
    //(REQUIRED) Định danh user (Tên , id,..., có thể dùng thông tin mặc định, chằng hạn như tên ứng dụng )
    private String app_user;
    //(REQUIRED) Mã giao dịch phải bắt đầu theo format yymmdd của ngày hiện tại (Timezone VN) và nên theo format yymmddMã đơn hàng thanh toán
    private String app_trans_id;
    //(REQUIRED) Thời gian tạo đơn hàng (milisecond) không quá 15P so với thời điểm thanh toán
    private Long app_time;
    //Thời gian hết hạn của đơn hàng. Thời gian tính bằng giây (giá trị nhỏ nhất: 300, giá trị lớn nhất: 2592000)
    private Long expire_duration_seconds;

    //(REQUIRED)
    private Long amount;

    //(REQUIRED)Item  hàng (tự định nghĩa )
    private String item;

    // (REQUIRED)(Description)
    private String description;

    //Json string Dữ liệu riêng của đơn hàng. Dữ liệu này sẽ được callback lại cho AppServer khi thanh toán thành công (Nếu không có thì để chuỗi rỗng)
    private String embed_data;

    //(REQUIRED) * Mã ngân hàng
    private String bank_code;

    //(REQUIRED)mac Thông tin chứng thực của đơn hàng
    private String mac;

    private String callback_url;

    private String device_info;

    //Ch app dụng với đôối tác dđặc biêệt
    private String sub_app_id;

    private String title;
    private String currency;
    private String phone;
    private String email;
    private String address;

    public OrderInfo(int app_id, String app_user, String app_trans_id,Long amount, String description, String bank_code, String item, String embed_data, String key1, String callback_url, String title) {
        this.expire_duration_seconds= 900L;
        this.app_id = app_id;
        this.app_user = app_user;
        // app_trans_id must be passed fully formatted from service layer (yyMMdd_orderId_timestamp)
        this.app_trans_id = app_trans_id;
        // app_time set only once
        this.app_time = System.currentTimeMillis();
        this.amount = amount;
        this.description = description;
        this.bank_code=bank_code;
        this.item = item;
        this.embed_data = embed_data;
        this.callback_url = callback_url;
        this.title = title;
        
        // Generate MAC according to ZaloPay spec: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        String hmacInput=this.app_id+"|"+this.app_trans_id+"|"+this.app_user+"|"+this.amount+"|"+this.app_time+"|"+this.embed_data+"|"+this.item;
        log.debug("========== ZaloPay MAC Generation ==========");
        log.debug("  HMAC Input: {}", hmacInput);
        
        if (key1 == null || key1.trim().isEmpty()) {
            log.error("❌ CRITICAL: key1 is null or empty! Cannot generate MAC.");
            throw new IllegalArgumentException("ZaloPay key1 cannot be null or empty");
        }
        
        log.debug("  Key1 (first 10 chars): {}...", key1.substring(0, Math.min(10, key1.length())));
        
        this.mac = HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA256, key1.trim(), hmacInput);
        
        log.debug("  Generated MAC (first 20 chars): {}...", this.mac != null && this.mac.length() > 20 ? this.mac.substring(0, 20) : this.mac);
        log.debug("===========================================");
    }

}

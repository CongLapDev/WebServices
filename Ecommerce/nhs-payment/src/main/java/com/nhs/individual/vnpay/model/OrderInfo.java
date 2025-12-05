package com.nhs.individual.vnpay.model;

import com.nhs.individual.utils.Mapable;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
public class OrderInfo implements Mapable{
    @NotNull
    private String vnp_Version;
    @NotNull
    private String vnp_Command;
    @NotNull
    private String vnp_TmnCode;
    @NotNull
    private Integer vnp_Amount;

    private String vnp_BankCode;
    @NotNull
    private String vnp_CreateDate;
    @NotNull
    private String vnp_CurrCode;
    @NotNull
    private String vnp_IpAddr;
    @NotNull
    private String vnp_Locale;
    @NotNull
    private String vnp_OrderInfo;
    @NotNull
    private String vnp_OrderType;
    @NotNull
    private String vnp_ReturnUrl;
    @NotNull
    private String vnp_ExpireDate;
    @NotNull
    private String vnp_TxnRef;
//    @NotNull
//    private String vnp_SecureHash;

    public static Builder builder(){
        return new Builder();
    }
    public static class Builder{
        public static final DateTimeFormatter formatter2=DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        public static final ZonedDateTime zonedDateTime=ZonedDateTime.now(ZoneId.of("Etc/GMT-7"));
//        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
//        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        private final OrderInfo orderInfo;
        public Builder(){
            orderInfo=new OrderInfo();
            orderInfo.setVnp_CreateDate(zonedDateTime.format(formatter2));
            orderInfo.setVnp_ExpireDate(zonedDateTime.plusMinutes(15).format(formatter2));
        }
        public Builder vnp_Version(String vnp_Version){
            orderInfo.setVnp_Version(vnp_Version);
            return this;
        }
        public Builder vnp_Command(String vnp_Command){
            orderInfo.setVnp_Command(vnp_Command);
            return this;
        }
        public Builder vnp_TmnCode(String vnp_TmnCode){
            orderInfo.setVnp_TmnCode(vnp_TmnCode);
            return this;
        }
        public Builder vnp_Amount(Integer vnp_Amount){
            orderInfo.setVnp_Amount(vnp_Amount);
            return this;
        }
        public Builder vnp_BankCode(String vnp_BankCode){
            orderInfo.setVnp_BankCode(vnp_BankCode);
            return this;
        }
        public Builder vnp_CurrCode(String vnp_CurrCode){
            orderInfo.setVnp_CurrCode(vnp_CurrCode);
            return this;
        }
        public Builder vnp_IpAddr(String vnp_IpAddr){
            orderInfo.setVnp_IpAddr(vnp_IpAddr);
            return this;
        }
        public Builder vnp_Locale(String vnp_Locale){
            if(vnp_Locale==null) orderInfo.setVnp_Locale("vn");
            else orderInfo.setVnp_Locale(vnp_Locale);
            return this;
        }

        public Builder vnp_OrderInfo(String vnp_OrderInfo){
            orderInfo.setVnp_OrderInfo(vnp_OrderInfo);
            return this;
        }
        public Builder vnp_ReturnUrl(String vnp_ReturnUrl){
            orderInfo.setVnp_ReturnUrl(vnp_ReturnUrl);
            return this;
        }
        public  Builder vnp_OrderType(String vnp_OrderType){
            orderInfo.setVnp_OrderType(vnp_OrderType);
            return this;
        }
        public Builder vnp_TxnRef(String vnp_TxnRef){
            orderInfo.setVnp_TxnRef(vnp_TxnRef);
            return this;
        }
//        public Builder vnp_SecureHash(String vnp_SecureHash){
//            orderInfo.setVnp_SecureHash(vnp_SecureHash);
//            return this;
//        }
        public OrderInfo ok(){
            return this.orderInfo;
        }

    }

}

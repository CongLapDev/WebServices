package com.nhs.individual.zalopay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;

@Configuration
public class ZaloConfig {

    @Value("${payment.zalo.enabled:true}") // Mặc định bật
    public boolean enabled;

    @Value("${payment.zalo.key1:}")        // Mặc định rỗng
    public String key1;

    @Value("${payment.zalo.key2:}")
    public String key2;

    @Value("${payment.zalo.endpoint.create:}")
    public String createOrderEndpoint;

    @Value("${payment.zalo.endpoint.query:}")
    public String queryOrderEndpoint;

    @Value("${payment.zalo.appid:0}")
    public Integer appId;

    public static String getCurrentTimeString(String format) {
        Calendar cal = new GregorianCalendar(TimeZone.getTimeZone("GMT+7"));
        SimpleDateFormat fmt = new SimpleDateFormat(format);
        fmt.setCalendar(cal);
        return fmt.format(cal.getTimeInMillis());
    }
}

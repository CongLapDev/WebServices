package com.nhs.individual.utils;

import jakarta.servlet.http.Cookie;
import org.springframework.http.ResponseCookie;

public class CookieParse {
    public static Cookie parseFrom(ResponseCookie cookie){
        Cookie cookie1=new Cookie(cookie.getName(), cookie.getValue());
        cookie1.setMaxAge((int) cookie.getMaxAge().toMillis());
        cookie1.setSecure(cookie.isSecure());
        cookie1.setHttpOnly(cookie.isHttpOnly());
        cookie1.setPath(cookie.getPath());
        cookie1.setDomain(cookie.getDomain());
        return cookie1;
    }
}

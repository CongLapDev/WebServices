package com.nhs.individual.utils;

import org.apache.http.client.methods.CloseableHttpResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class ResponseUtils {
    public static <T> T parseObject(CloseableHttpResponse res,Class<T> class_) throws IOException {
        String jsonData=parseToJSON(res);
        return JSON.parse(jsonData,class_);
    }
    public static String parseToJSON(CloseableHttpResponse res) throws IOException {
        BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
        StringBuilder resultJsonStr = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            resultJsonStr.append(line);
        }
        rd.close();
        return  resultJsonStr.toString();
    }

}

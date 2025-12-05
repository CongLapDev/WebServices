//package com.nhs.individual.vnpay;
//
//import com.nhs.individual.vnpay.config.VNPayConfig;
//import com.nhs.individual.vnpay.model.OrderInfo;
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.AllArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.io.UnsupportedEncodingException;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.util.*;
//
//@Service
//@AllArgsConstructor
//public class VNPayService {
//    private VNPayConfig config;
//
//    public String createOrder(Integer amount, String orderInfor, String urlReturn,String ip,String bankcode,String orderType){
//        ip = "127.0.0.1";
//        OrderInfo order = OrderInfo.builder()
//                .vnp_Version(config.vnpay_version)
//                .vnp_Command("pay")
//                .vnp_BankCode(bankcode)
//                .vnp_TxnRef(VNPayConfig.getRandomNumber(8))
//                .vnp_IpAddr(ip)
//                .vnp_TmnCode(config.vnp_TmnCode)
//                .vnp_OrderType(orderType)
//                .vnp_Amount(amount*100)
//                .vnp_CurrCode("VND")
//                .vnp_OrderInfo(orderInfor)
//                .vnp_Locale("vn")
//                .vnp_ReturnUrl(urlReturn+config.vnp_Returnurl)
//                .ok();
//        Map<String, Object> vnp_Params =order.toMap();
//
//        List fieldNames = new ArrayList(vnp_Params.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder hashData = new StringBuilder();
//        StringBuilder query = new StringBuilder();
//        Iterator itr = fieldNames.iterator();
//        while (itr.hasNext()) {
//            String fieldName = (String) itr.next();
//            if(vnp_Params.get(fieldName)==null) continue;
//            String fieldValue =  vnp_Params.get(fieldName).toString();
//            System.out.println(query);
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                //Build hash data
//                hashData.append(fieldName);
//                hashData.append('=');
//                try {
//                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                    //Build query
//                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
//                    query.append('=');
//                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                } catch (UnsupportedEncodingException e) {
//                    e.printStackTrace();
//                }
//                if (itr.hasNext()) {
//                    query.append('&');
//                    hashData.append('&');
//                }
//            }
//        }
//        String queryUrl = query.toString();
//        String vnp_SecureHash = VNPayConfig.hmacSHA512(config.vnp_HashSecret, hashData.toString());
//        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
//        String paymentUrl = config.vnp_PayUrl + "?" + queryUrl;
//        return paymentUrl;
//    }
//
//    public int orderReturn(HttpServletRequest request){
//        Map fields = new HashMap();
//        for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
//            String fieldName = null;
//            String fieldValue = null;
//            try {
//                fieldName = URLEncoder.encode((String) params.nextElement(), StandardCharsets.US_ASCII.toString());
//                fieldValue = URLEncoder.encode(request.getParameter(fieldName), StandardCharsets.US_ASCII.toString());
//            } catch (UnsupportedEncodingException e) {
//                e.printStackTrace();
//            }
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                fields.put(fieldName, fieldValue);
//            }
//        }
//
//        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
//        if (fields.containsKey("vnp_SecureHashType")) {
//            fields.remove("vnp_SecureHashType");
//        }
//        if (fields.containsKey("vnp_SecureHash")) {
//            fields.remove("vnp_SecureHash");
//        }
//        String signValue = config.hashAllFields(fields);
//        if (signValue.equals(vnp_SecureHash)) {
//            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
//                return 1;
//            } else {
//                return 0;
//            }
//        } else {
//            return -1;
//        }
//    }
//
//}

// VnPay service completely commented out - not needed for sandbox
// package com.nhs.individual.vnpay;
//
// import com.nhs.individual.vnpay.config.VNPayConfig;
// import com.nhs.individual.vnpay.model.OrderInfo;
// import lombok.AllArgsConstructor;
// import org.springframework.stereotype.Service;
//
// import java.io.UnsupportedEncodingException;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.util.*;
//
// @Service
// @AllArgsConstructor
// public class VNPayService {
//
//     private VNPayConfig config;
//
//     public String createOrder(Integer amount, String orderInfor, String urlReturn, String ip, String bankcode, String orderType){
//         ip = "127.0.0.1"; // IP tạm thời
//
//         OrderInfo order = OrderInfo.builder()
//                 .vnp_Version(config.vnpay_version)
//                 .vnp_Command("pay")
//                 .vnp_BankCode(bankcode)
//                 .vnp_TxnRef(VNPayConfig.getRandomNumber(8))
//                 .vnp_IpAddr(ip)
//                 .vnp_TmnCode(config.vnp_TmnCode)
//                 .vnp_OrderType(orderType)
//                 .vnp_Amount(amount*100)
//                 .vnp_CurrCode("VND")
//                 .vnp_OrderInfo(orderInfor)
//                 .vnp_Locale("vn")
//                 .vnp_ReturnUrl(urlReturn + config.vnp_Returnurl)
//                 .ok();
//
//         Map<String, Object> vnp_Params = order.toMap();
//
//         List fieldNames = new ArrayList(vnp_Params.keySet());
//         Collections.sort(fieldNames);
//         StringBuilder hashData = new StringBuilder();
//         StringBuilder query = new StringBuilder();
//         Iterator itr = fieldNames.iterator();
//         while (itr.hasNext()) {
//             String fieldName = (String) itr.next();
//             if(vnp_Params.get(fieldName)==null) continue;
//             String fieldValue = vnp_Params.get(fieldName).toString();
//             try {
//                 hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                 query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
//                         .append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//             } catch (UnsupportedEncodingException e) {
//                 e.printStackTrace();
//             }
//             if (itr.hasNext()) {
//                 hashData.append('&');
//                 query.append('&');
//             }
//         }
//
//         String vnp_SecureHash = VNPayConfig.hmacSHA512(config.vnp_HashSecret, hashData.toString());
//         String paymentUrl = config.vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
//         return paymentUrl;
//     }
// }

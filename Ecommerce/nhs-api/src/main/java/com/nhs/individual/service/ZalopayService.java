package com.nhs.individual.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.constant.PaymentStatus;
import com.nhs.individual.domain.Payment;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderPayment;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.utils.JSON;
import com.nhs.individual.utils.ResponseUtils;
// ZaloConfig import removed - using hardcoded sandbox credentials
// import com.nhs.individual.zalopay.config.ZaloConfig;
import com.nhs.individual.zalopay.crypto.HMACUtil;
import com.nhs.individual.zalopay.model.OrderCallback;
import com.nhs.individual.zalopay.model.OrderCallbackData;
import com.nhs.individual.zalopay.model.OrderInfo;
import com.nhs.individual.zalopay.model.OrderPurchaseInfo;
import jakarta.xml.bind.DatatypeConverter;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import static com.nhs.individual.zalopay.config.ZaloConfig.getCurrentTimeString;

@Slf4j
@Service
@AllArgsConstructor
public class ZalopayService {
    // ZaloPay Sandbox credentials - hardcoded
    private static final Integer ZALOPAY_APP_ID = 554;
    private static final String ZALOPAY_KEY1 = "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn";
    private static final String ZALOPAY_KEY2 = "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny";
    private static final String ZALOPAY_CREATE_ENDPOINT = "https://sb-openapi.zalopay.vn/v2/create";
    private static final String ZALOPAY_QUERY_ENDPOINT = "https://sb-openapi.zalopay.vn/v2/query";
    
    private final Payment payment=new Payment(2);
    private ShopOrderService orderService;
    private ShopOrderStatusService shopOrderStatusService;
    private ShopOrderPaymentService shopOrderPaymentService;
    // ZaloConfig removed - using hardcoded sandbox credentials instead

    private final Logger logger= LoggerFactory.getLogger(this.getClass());
    private TaskScheduler taskScheduler;
    private final ScheduledExecutorService scheduler=Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());;



    public OrderPurchaseInfo purchaseZalo(Integer orderId){

        int rand = new Random().nextInt(100000);
        return orderService.findById(orderId).map(shopOrder_ -> {
            shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.PAID)
                    .ifPresent(order_ -> {throw new IllegalArgumentException("This order has been paid");});
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                OrderInfo orderInfom = new OrderInfo(
                        ZALOPAY_APP_ID,
                        "user" + shopOrder_.getUser().getId(),
                        String.valueOf(shopOrder_.getId()) + "_" + rand,
                        shopOrder_.getTotal().longValue(),
                        "Lazada - Payment for the order #" + shopOrder_.getId() + "_" + rand,
                        "zalopayapp",
                        "[]",
                        "{\"redirecturl\": \"https://hub.gadgetsource.click/zalopay/result\"}",
                        ZALOPAY_KEY1,
                        "https://gadgetsource.click/api/v1/purchase/zalopay/callback",
                        null
                );
                Map<String, Object> mapParams = orderInfom.toMap();
                HttpPost post = new HttpPost(ZALOPAY_CREATE_ENDPOINT);
                List<NameValuePair> params = new ArrayList<>();
                for (Map.Entry<String, Object> e : mapParams.entrySet()) {
                    if (e.getValue() == null) continue;
                    params.add(new BasicNameValuePair(e.getKey(), e.getValue().toString()));
                }
                post.setEntity(new UrlEncodedFormEntity(params));
                CloseableHttpResponse res = client.execute(post);
                updateOrderStatus(orderInfom.getApp_trans_id(), 2);
                OrderPurchaseInfo orderPurchaseInfo = ResponseUtils.parseObject(res, OrderPurchaseInfo.class);
                orderPurchaseInfo.setApp_trans_id(orderInfom.getApp_trans_id());
                return orderPurchaseInfo;
            } catch (IOException | URISyntaxException e) {
                throw new RuntimeException(e);
            }
        }).orElseThrow(() -> new RuntimeException("Error occurred while creating charging information"));
    }

    public String zalopayHandlerCallBack(OrderCallback callBack) throws JsonProcessingException, NoSuchAlgorithmException, InvalidKeyException {
        Mac HmacSHA256=Mac.getInstance("HmacSHA256");
        HmacSHA256.init(new SecretKeySpec(ZALOPAY_KEY2.getBytes(),"HmacSHA256"));
        JSONObject result = new JSONObject();
        byte[] hashBytes=HmacSHA256.doFinal(callBack.getData().getBytes());
        if(callBack.getMac().equals(DatatypeConverter.printHexBinary(hashBytes).toLowerCase())){
            OrderCallbackData orderCallbackData=JSON.parse(callBack.getData(), OrderCallbackData.class);
            logger.info("update order's status = success where app_trans_id = {}", orderCallbackData.getApp_trans_id());
            result.put("return_code", 1);
            result.put("return_message", "success");
            ShopOrderStatus shopOrderStatus=new ShopOrderStatus();
            shopOrderStatus.setDetail(orderCallbackData.getZp_trans_id().toString());
            shopOrderStatus.setStatus(OrderStatus.PAID.id);
            OrderCallbackData data=JSON.parse(callBack.getData(),OrderCallbackData.class);
            String orderId=data.getApp_trans_id().split("_")[1];
            ShopOrder shopOrder=new ShopOrder();
            shopOrder.setId(Integer.parseInt(orderId));
            shopOrderStatus.setOrder(shopOrder);
            shopOrderStatusService.save(shopOrderStatus);

            ShopOrderPayment shopOrderPayment= shopOrderPaymentService.findByOrderId(Integer.parseInt(orderId)).orElseThrow(()->new ResourceNotFoundException("Cant find Order with id"));
            shopOrderPayment.setOrderNumber(String.valueOf(orderCallbackData.getZp_trans_id()));
            shopOrderPayment.setUpdateAt(Instant.now());
            shopOrderPayment.setStatus(PaymentStatus.PAID.value);
            shopOrderPaymentService.save(shopOrderPayment);

        }else{
            result.put("return_code", -1);
            result.put("return_message", "mac not equal");
        }
        return result.toString();
    }
    @Async
    public void updateOrderStatus(String app_trans_Id,long delay) throws URISyntaxException {
        taskScheduler.schedule(()->{
            JSONObject object= null;
            try {
                String s=getOrderStatus(app_trans_Id);
                object = new JSONObject(s);
                int orderId=Integer.parseInt(app_trans_Id.split("_")[1]);
                int returncode=-1;
                try{
                    returncode=object.getInt("return_code");
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                if(returncode==1){
                    ShopOrderPayment shopOrderPayment= shopOrderPaymentService.findByOrderId(orderId).orElseThrow(()->new ResourceNotFoundException("Cant find Order with id"));
                    shopOrderPayment.setOrderNumber(object.getNumber("zp_trans_id").toString());
                    shopOrderPayment.setUpdateAt(Instant.now());
                    shopOrderPayment.setStatus(PaymentStatus.PAID.value);
                    ShopOrderStatus shopOrderStatus=new ShopOrderStatus();
                    shopOrderStatus.setStatus(OrderStatus.PAID.id);
                    shopOrderStatus.setNote("Payment for order "+orderId);
                    shopOrderPaymentService.save(shopOrderPayment);
                    shopOrderStatusService.updateOrderStatus(orderId,shopOrderStatus);
                }
                else if(returncode==3){
                    updateOrderStatus(app_trans_Id,120);
                }else if(returncode==2){
                    ShopOrderPayment shopOrderPayment= shopOrderPaymentService.findByOrderId(orderId).orElseThrow(()->new ResourceNotFoundException("Cant find Order with id"));

                    shopOrderPayment.setUpdateAt(Instant.now());
                    shopOrderPayment.setStatus(PaymentStatus.CANCEL.value);

                    ShopOrderStatus shopOrderStatus=new ShopOrderStatus();
                    shopOrderStatus.setStatus(OrderStatus.CANCEL.id);
                    shopOrderStatus.setNote("Your order is cancelled due to error occurring in payment process. Payment code: "+app_trans_Id);
                    shopOrderStatus.setDetail("Your order is cancelled due to error occurring in payment process. Payment code: "+app_trans_Id);
                    shopOrderStatusService.updateOrderStatus(orderId,shopOrderStatus);
                    shopOrderPaymentService.save(shopOrderPayment);
                }
                System.out.println("Order: "+orderId);
            } catch (URISyntaxException|JSONException e) {
                throw new RuntimeException(e);
            }
        }, Instant.now().plusSeconds(60*delay));

    }
    public String getOrderStatus(String app_trans_id) throws URISyntaxException {
        String data=ZALOPAY_APP_ID+"|"+app_trans_id+"|"+ZALOPAY_KEY1;
        String mac=HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA256,ZALOPAY_KEY1,data);
        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("app_id", String.valueOf(ZALOPAY_APP_ID)));
        params.add(new BasicNameValuePair("app_trans_id", app_trans_id));
        params.add(new BasicNameValuePair("mac", mac));
        URIBuilder uri = new URIBuilder(ZALOPAY_QUERY_ENDPOINT);
        uri.addParameters(params);

        try(CloseableHttpClient client = HttpClients.createDefault()){
            HttpPost post = new HttpPost(uri.build());
            post.setEntity(new UrlEncodedFormEntity(params));
            CloseableHttpResponse res = client.execute(post);
            BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
            StringBuilder resultJsonStr = new StringBuilder();
            String line;

            while ((line = rd.readLine()) != null) {
                resultJsonStr.append(line);
            }
            return resultJsonStr.toString();
        }catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    public ResponseMessage refund(int orderID, IUserDetail userDetail){
        return orderService.findById(orderID).map(order_->{
            //Check whether order has been paid
            ShopOrderStatus orderStatus=shopOrderStatusService.findByOrderIdAndStatus(orderID,OrderStatus.PAID).orElseThrow(()-> new IllegalArgumentException("This order has yet been paid"));
            ShopOrderPayment shopOrderPayment=shopOrderPaymentService.findByOrderId(orderID).orElseThrow(()->new ResourceNotFoundException("Cant find Order with id"));
            //Check if request from valid user
            if(order_.getUser().getId().intValue()!=userDetail.getUserId().intValue()){
                if(userDetail.getAuthorities().stream().noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))){
                    throw new InsufficientAuthenticationException("Illegal Access");
                }
            }

            Random rand = new Random();
            long timestamp = System.currentTimeMillis(); // miliseconds
            String uid = timestamp + "" + (111 + rand.nextInt(888)); // unique id



            Map<String, Object> order = new HashMap<String, Object>(){{
                put("app_id", ZALOPAY_APP_ID);
                put("zp_trans_id", shopOrderPayment.getOrderNumber());
                put("m_refund_id", getCurrentTimeString("yyMMdd") +"_"+  ZALOPAY_APP_ID +"_"+uid);
                put("timestamp", timestamp);
                put("amount", order_.getTotal());
                put("description", "ZaloPay Intergration Demo");
            }};

            // appid|zptransid|amount|description|timestamp
            String data = order.get("app_id") +"|"+ order.get("zp_trans_id") +"|"+ order.get("amount")
                    +"|"+ order.get("description") +"|"+ order.get("timestamp");
            order.put("mac", HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA256, ZALOPAY_KEY1, data));



            List<NameValuePair> params = new ArrayList<>();
            for (Map.Entry<String, Object> e : order.entrySet()) {
                params.add(new BasicNameValuePair(e.getKey(), e.getValue().toString()));
            }
            try (CloseableHttpClient client = HttpClients.createDefault()){
                HttpPost post = new HttpPost(ZALOPAY_CREATE_ENDPOINT);
                post.setEntity(new UrlEncodedFormEntity(params));
                CloseableHttpResponse res = client.execute(post);
                BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
                StringBuilder resultJsonStr = new StringBuilder();
                String line;

                while ((line = rd.readLine()) != null) {
                    resultJsonStr.append(line);
                }

                JSONObject result = new JSONObject(resultJsonStr.toString());
                return new ResponseMessage.ResponseMessageBuilder()
                        .statusCode(result.getInt("returncode"))
                        .message(result.getString("returnmessage"))
                        .ok();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).orElseThrow(()->new ResourceNotFoundException("Order with id "+orderID+" not found"));

    }
}

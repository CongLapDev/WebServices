package com.nhs.individual.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.OrderNotFoundException;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.ShopOrderService;
import com.nhs.individual.service.ShopOrderStatusService;
import com.nhs.individual.service.ZalopayService;
// VnPay imports commented out - not needed for sandbox
// import com.nhs.individual.vnpay.VNPayService;
// import com.nhs.individual.vnpay.config.VNPayConfig;
import com.nhs.individual.zalopay.model.OrderCallback;
import com.nhs.individual.zalopay.model.ZaloPayResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping(value = "/api/v1/purchase")
@AllArgsConstructor
public class PurchaseController {
    private final ZalopayService zalopayService;
    // VnPay service commented out - not needed for sandbox
    // private final VNPayService vnPayService;
    private final ShopOrderService shopOrderService;
    private final ShopOrderStatusService shopOrderStatusService;
    
    /**
     * Create ZaloPay order and get payment URL
     * Always returns HTTP 200 with JSON response (success or error)
     */
    @RequestMapping(value="/{orderId}/zalopay",method= RequestMethod.GET)
    public ZaloPayResponse purchase(@PathVariable(name = "orderId") Integer orderId){
        return zalopayService.purchaseZalo(orderId);
    }
    
    /**
     * ZaloPay callback handler (server-to-server)
     */
    @RequestMapping(value = "/zalopay/callback",method = RequestMethod.POST)
    public String zalopayCallBank(@RequestBody OrderCallback callback) throws JsonProcessingException, NoSuchAlgorithmException, InvalidKeyException {
        return zalopayService.zalopayHandlerCallBack(callback);
    }

    /**
     * Query ZaloPay payment status
     */
    @RequestMapping(value = "/zalopay/status",method = RequestMethod.GET)
    public String getzaloOrderStatus(@RequestParam String app_trans_id) throws URISyntaxException {
        return zalopayService.getOrderStatus(app_trans_id);
    }
    
    /**
     * Request ZaloPay refund
     */
    @RequestMapping(value = "/zalopay/refund",method = RequestMethod.GET)
    public ResponseMessage zalopayRefund(@RequestParam(name = "orderId") Integer orderId){
        IUserDetail userDetail= (IUserDetail) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return zalopayService.refund(orderId,userDetail);
    }
    
    /**
     * Get ZaloPay refund status
     */
    @RequestMapping(value = "/zalopay/refund/status",method = RequestMethod.GET)
    public String getRefundStatus(@RequestParam(name = "mRefundId") String mRefundId) throws IOException {
        return zalopayService.getRefundStatus(mRefundId);
    }
    
    /**
     * Get order payment status by ZaloPay app_trans_id
     * Used by frontend after ZaloPay redirect to verify payment status
     * 
     * @param appTransId ZaloPay transaction ID (format: yyMMdd_orderId_timestamp)
     * @return Order payment status information
     */
    @RequestMapping(value = "/zalopay/result", method = RequestMethod.GET)
    public java.util.Map<String, Object> getOrderByZaloPayAppTransId(@RequestParam(name = "apptransid") String appTransId) {
        // Parse app_trans_id to extract orderId
        // Format: yyMMdd_orderId_timestamp (e.g., 251217_28_1765957661610)
        if (appTransId == null || appTransId.trim().isEmpty()) {
            throw new IllegalArgumentException("apptransid is required");
        }
        
        String[] parts = appTransId.split("_");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid apptransid format: " + appTransId);
        }
        
        // Extract orderId from parts[1] (format: yyMMdd_orderId_timestamp)
        Integer orderId;
        try {
            orderId = Integer.parseInt(parts[1]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid orderId in apptransid: " + appTransId);
        }
        
        // Find order
        ShopOrder order = shopOrderService.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // Get current payment status
        java.util.Optional<ShopOrderStatus> currentStatus = shopOrderStatusService.getCurrentStatus(orderId);
        String paymentStatus = "PROCESSING"; // Default
        
        if (currentStatus.isPresent()) {
            Integer statusId = currentStatus.get().getStatus();
            // Convert status ID to OrderStatus enum
            OrderStatus status = null;
            for (OrderStatus s : OrderStatus.values()) {
                if (s.id == statusId) {
                    status = s;
                    break;
                }
            }
            
            if (status == OrderStatus.PAID) {
                paymentStatus = "PAID";
            } else if (status == OrderStatus.CANCELLED) {
                paymentStatus = "CANCELLED";
            }
        }
        
        // Return response
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("orderId", orderId);
        response.put("paymentStatus", paymentStatus);
        response.put("total", order.getTotal());
        
        return response;
    }
//    @RequestMapping(value="/{orderId}/vnpay",method= RequestMethod.GET)
//    public String purchaseByVNPay(@PathVariable(name = "orderId") Integer orderId,
//                                  @RequestParam(name="bankcode",defaultValue = "QRONLY") String bankcode,
//                                  @RequestParam(name = "order-type",defaultValue = "topup") String orderType,
//                                  HttpServletRequest request){
//        return shopOrderService.findById(orderId).map(shopOrder_->{
//            return vnPayService.createOrder(shopOrder_.getTotal().intValue(),orderId.toString(),"http://localhost:8085",VNPayConfig.getIpAddress(request),bankcode,orderType);
//        }).orElseThrow(()->new IllegalArgumentException("Illegal"));
//    }
// VnPay endpoint commented out - not needed for sandbox
// @RequestMapping(value="/{orderId}/vnpay",method= RequestMethod.GET)
// public String purchaseByVNPay(@PathVariable(name = "orderId") Integer orderId,
//                               @RequestParam(name="bankcode",defaultValue = "QRONLY") String bankcode,
//                               @RequestParam(name = "order-type",defaultValue = "topup") String orderType,
//                               HttpServletRequest request){
//     return shopOrderService.findById(orderId).map(shopOrder_->{
//         String ip = "127.0.0.1"; // tạm thời
//         return vnPayService.createOrder(
//                 shopOrder_.getTotal().intValue(),
//                 orderId.toString(),
//                 "http://localhost:8085",
//                 ip,
//                 bankcode,
//                 orderType
//         );
//     }).orElseThrow(()->new IllegalArgumentException("Illegal"));
// }

}


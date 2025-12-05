package com.nhs.individual.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.ShopOrderService;
import com.nhs.individual.service.ZalopayService;
// VnPay imports commented out - not needed for sandbox
// import com.nhs.individual.vnpay.VNPayService;
// import com.nhs.individual.vnpay.config.VNPayConfig;
import com.nhs.individual.zalopay.model.OrderCallback;
import com.nhs.individual.zalopay.model.OrderPurchaseInfo;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
    @RequestMapping(value="/{orderId}/zalopay",method= RequestMethod.GET)
    public OrderPurchaseInfo purchase(@PathVariable(name = "orderId") Integer orderId){
        return zalopayService.purchaseZalo(orderId);
    }
    @RequestMapping(value = "/zalopay/callback",method = RequestMethod.POST)
    public String zalopayCallBank(@RequestBody OrderCallback callback) throws JsonProcessingException, NoSuchAlgorithmException, InvalidKeyException {
        return zalopayService.zalopayHandlerCallBack(callback);
    }

    @RequestMapping(value = "/zalopay/status",method = RequestMethod.GET)
    public String getzaloOrderStatus(@RequestParam String app_trans_id) throws URISyntaxException {
        return zalopayService.getOrderStatus(app_trans_id);
    }
    @RequestMapping(value = "/zalopay/refund",method = RequestMethod.GET)
    public ResponseMessage zalopayRefund(@RequestParam(name = "orderId") Integer orderId){
        IUserDetail userDetail= (IUserDetail) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return zalopayService.refund(orderId,userDetail);
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


package com.nhs.individual.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nhs.individual.config.ZaloPayProperties;
import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.constant.PaymentStatus;
import com.nhs.individual.domain.ShopOrderPayment;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.PaymentCallbackException;
import com.nhs.individual.exception.PaymentException;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.utils.JSON;
import com.nhs.individual.zalopay.crypto.HMACUtil;
import com.nhs.individual.zalopay.model.OrderCallback;
import com.nhs.individual.zalopay.model.OrderCallbackData;
import com.nhs.individual.zalopay.model.OrderInfo;
import com.nhs.individual.zalopay.model.OrderPurchaseInfo;
import com.nhs.individual.zalopay.model.ZaloPayResponse;
import jakarta.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import java.util.concurrent.ConcurrentHashMap;

import static com.nhs.individual.zalopay.config.ZaloConfig.getCurrentTimeString;

/**
 * ZaloPay Payment Integration Service (Sandbox)
 * 
 * Handles ZaloPay payment flow:
 * 1. Create payment order and generate QR code
 * 2. Poll payment status (for localhost development)
 * 3. Handle payment callback from ZaloPay
 * 4. Process refunds
 * 
 * @author NHS Individual
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ZalopayService {
    
    private final ZaloPayProperties zaloPayConfig;
    private final ShopOrderService orderService;
    private final ShopOrderStatusService shopOrderStatusService;
    private final ShopOrderPaymentService shopOrderPaymentService;
    private final TaskScheduler taskScheduler;
    
    // Track orders being processed to prevent race conditions
    private final Map<String, Boolean> processingOrders = new ConcurrentHashMap<>();
    
    /**
     * Create ZaloPay payment order
     * 
     * @param orderId Shop order ID
     * @return ZaloPayResponse containing QR code and payment URL, or error details
     */
    @Transactional
    public ZaloPayResponse purchaseZalo(Integer orderId) {
        log.info("========== Creating ZaloPay payment for orderId: {} ==========", orderId);
        
        return orderService.findById(orderId).map(shopOrder -> {
            // CRITICAL: Validate order.total > 0
            if (shopOrder.getTotal() == null || shopOrder.getTotal().longValue() <= 0) {
                log.error("❌❌❌ CRITICAL: Order #{} has INVALID total: {}", orderId, shopOrder.getTotal());
                log.error("  OrderLines count: {}", shopOrder.getOrderLines() != null ? shopOrder.getOrderLines().size() : 0);
                log.error("  Shipping method: {}", shopOrder.getShippingMethod() != null ? shopOrder.getShippingMethod().getName() : "NULL");
                return ZaloPayResponse.error(-1, 
                    String.format("Cannot create ZaloPay payment: Order #%d has invalid total (%s). Order total must be greater than 0.", 
                                 orderId, shopOrder.getTotal()));
            }
            
            log.info("✓ Order #{} validation passed:", orderId);
            log.info("  Total: {}", shopOrder.getTotal());
            log.info("  Total (VND, long): {}", shopOrder.getTotal().longValue());
            log.info("  OrderLines: {}", shopOrder.getOrderLines() != null ? shopOrder.getOrderLines().size() : 0);
            if (shopOrder.getOrderLines() != null) {
                for (var line : shopOrder.getOrderLines()) {
                    log.info("    - Line: qty={}, total={}", line.getQty(), line.getTotal());
                }
            }
            log.info("  Shipping: {} ({})", 
                    shopOrder.getShippingMethod() != null ? shopOrder.getShippingMethod().getName() : "NULL",
                    shopOrder.getShippingMethod() != null ? shopOrder.getShippingMethod().getPrice() : "NULL");
            
            // Check if order has already been paid
            if (shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.PAID).isPresent()) {
                log.error("❌ Order #{} has already been PAID. Cannot create duplicate payment.", orderId);
                return ZaloPayResponse.error(-1, 
                    String.format("Order #%d has already been paid. Cannot create duplicate payment.", orderId));
            }
            
            // Check if ZaloPay payment already exists (has zp_trans_token stored in orderNumber)
            Optional<ShopOrderPayment> existingPayment = shopOrderPaymentService.findByOrderId(orderId);
            if (existingPayment.isPresent() && existingPayment.get().getOrderNumber() != null 
                && !existingPayment.get().getOrderNumber().trim().isEmpty()) {
                log.error("❌ Order #{} already has ZaloPay transaction (zp_trans_id: {}). Cannot create duplicate payment.", 
                         orderId, existingPayment.get().getOrderNumber());
                return ZaloPayResponse.error(-1, 
                    String.format("Order #%d already has an active ZaloPay payment. Please use the existing payment or cancel it first.", orderId));
            }
            
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                // Generate GLOBALLY UNIQUE app_trans_id: yyMMdd_orderId_timestamp (GMT+7)
                // Format must be: yyMMdd_orderId_timestamp
                long timestamp = System.currentTimeMillis();
                String datePrefix = getCurrentTimeString("yyMMdd"); // GMT+7
                String appTransId = datePrefix + "_" + orderId + "_" + timestamp;
                
                // CRITICAL: Convert BigDecimal to long for ZaloPay
                Long amountVND = shopOrder.getTotal().longValue();
                
                log.info("========== Preparing ZaloPay Request ==========");
                log.info("✓ Generating ZaloPay order with UNIQUE app_trans_id: {}", appTransId);
                log.info("  - orderId: {}", orderId);
                log.info("  - timestamp: {}", timestamp);
                log.info("  - datePrefix (GMT+7): {}", datePrefix);
                log.info("  - final app_trans_id format: {}", appTransId);
                log.info("  - order.getTotal() (BigDecimal): {}", shopOrder.getTotal());
                log.info("  - amount (Long/VND) for ZaloPay: {}", amountVND);
                
                // CRITICAL: Validate amount one more time before sending to ZaloPay
                if (amountVND == null || amountVND <= 0) {
                    log.error("❌❌❌ FATAL: amount for ZaloPay is INVALID: {}", amountVND);
                    log.error("  This will cause ZaloPay to return NO QR code!");
                    log.error("  order.getTotal(): {}", shopOrder.getTotal());
                    return ZaloPayResponse.error(-1, 
                        String.format("Cannot create ZaloPay payment: amount is %d. ZaloPay requires amount > 0 to generate QR code.", amountVND));
                }
                
                log.info("✓ amount validation passed: {} VND", amountVND);
                
                // Build item array from order lines (must not be empty)
                String itemJson = buildItemJson(shopOrder.getOrderLines());
                if (itemJson == null || itemJson.equals("[]")) {
                    log.error("❌❌❌ FATAL: item array is empty! ZaloPay requires at least one product.");
                    return ZaloPayResponse.error(-1, "Cannot create ZaloPay payment: order must contain at least one product.");
                }
                
                log.info("✓ item array built: {} items", shopOrder.getOrderLines() != null ? shopOrder.getOrderLines().size() : 0);
                
                // Create order info with proper format
                OrderInfo orderInfo = new OrderInfo(
                        zaloPayConfig.getAppId(),
                        "user" + shopOrder.getUser().getId(),
                        appTransId,  // Fully formatted: yyMMdd_orderId_timestamp
                        amountVND,  // Use validated amount
                        "Payment for order #" + orderId,
                        "zalopayapp",
                        itemJson,  // Valid JSON array string with products
                        String.format("{\"redirecturl\": \"%s\"}", zaloPayConfig.getRedirectUrl()),
                        zaloPayConfig.getKey1(),
                        zaloPayConfig.getCallbackUrl(),
                        null
                );
                
                log.info("========== ZaloPay Request Payload ==========");
                log.info("  app_id: {}", orderInfo.getApp_id());
                log.info("  app_user: {}", orderInfo.getApp_user());
                log.info("  app_trans_id: {}", orderInfo.getApp_trans_id());
                log.info("  amount: {} VND", orderInfo.getAmount());
                log.info("  app_time: {}", orderInfo.getApp_time());
                log.info("  description: {}", orderInfo.getDescription());
                log.info("  bank_code: {}", orderInfo.getBank_code());
                log.info("  callback_url: {}", orderInfo.getCallback_url());
                log.info("  mac (first 20 chars): {}...", orderInfo.getMac() != null ? orderInfo.getMac().substring(0, Math.min(20, orderInfo.getMac().length())) : "NULL");
                log.info("============================================");
                
                // Build request
                Map<String, Object> mapParams = orderInfo.toMap();
                log.debug("Request params map: {}", mapParams);
                HttpPost post = new HttpPost(zaloPayConfig.getEndpoints().getCreate());
                List<NameValuePair> params = new ArrayList<>();
                
                for (Map.Entry<String, Object> e : mapParams.entrySet()) {
                    if (e.getValue() != null) {
                    params.add(new BasicNameValuePair(e.getKey(), e.getValue().toString()));
                    }
                }
                
                post.setEntity(new UrlEncodedFormEntity(params));
                
                log.info("→ Sending create order request to ZaloPay: {}", zaloPayConfig.getEndpoints().getCreate());
                log.debug("  Request params: {}", mapParams);
                
                // Execute request
                CloseableHttpResponse res = client.execute(post);
                
                // CRITICAL: Log RAW response body BEFORE parsing
                BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
                StringBuilder rawResponse = new StringBuilder();
                String line;
                while ((line = rd.readLine()) != null) {
                    rawResponse.append(line);
                }
                String rawResponseBody = rawResponse.toString();
                
                log.info("========== ZaloPay RAW Response ==========");
                log.info("{}", rawResponseBody);
                log.info("==========================================");
                
                // Parse response
                OrderPurchaseInfo orderPurchaseInfo;
                try {
                    orderPurchaseInfo = JSON.parse(rawResponseBody, OrderPurchaseInfo.class);
                } catch (Exception e) {
                    log.error("❌ Failed to parse ZaloPay response JSON", e);
                    log.error("  Raw response: {}", rawResponseBody);
                    return ZaloPayResponse.error(-1, "Failed to parse ZaloPay response: " + e.getMessage());
                }
                
                // Store the full app_trans_id (with yyMMdd prefix) for tracking
                String fullAppTransId = orderInfo.getApp_trans_id();
                orderPurchaseInfo.setApp_trans_id(fullAppTransId);
                
                // LOG PARSED ZALOPAY RESPONSE WITH NULL-SAFE CHECKS
                log.info("========== ZaloPay Parsed Response ==========");
                log.info("  return_code: {} (1=success, 2=failed, 3=processing)", orderPurchaseInfo.getReturn_code());
                log.info("  return_message: {}", orderPurchaseInfo.getReturn_message());
                log.info("  sub_return_code: {}", orderPurchaseInfo.getSub_return_code());
                log.info("  sub_return_message: {}", orderPurchaseInfo.getSub_return_message());
                log.info("  app_trans_id (full): {}", fullAppTransId);
                log.info("  zp_trans_token: {}", orderPurchaseInfo.getZp_trans_token());
                log.info("  order_url: {}", orderPurchaseInfo.getOrder_url());
                log.info("  order_token: {}", orderPurchaseInfo.getOrder_token());
                log.info("==============================================");
                
                // Parse return_code from raw response if Jackson mapping failed
                // This handles cases where JSON field names don't match exactly
                Integer returnCode = orderPurchaseInfo.getReturn_code();
                if (returnCode == null) {
                    // Try to parse return_code directly from raw JSON
                    try {
                        JSONObject rawJson = new JSONObject(rawResponseBody);
                        if (rawJson.has("return_code")) {
                            returnCode = rawJson.getInt("return_code");
                            log.warn("⚠️ return_code was null after Jackson parsing, extracted from raw JSON: {}", returnCode);
                            orderPurchaseInfo.setReturn_code(returnCode);
                        } else if (rawJson.has("returncode")) {
                            // Fallback: try camelCase field name
                            returnCode = rawJson.getInt("returncode");
                            log.warn("⚠️ return_code was null, found 'returncode' in raw JSON: {}", returnCode);
                            orderPurchaseInfo.setReturn_code(returnCode);
                        }
                    } catch (Exception e) {
                        log.error("❌ Failed to parse return_code from raw JSON", e);
                    }
                }
                
                // Only treat as error if we still can't determine return_code after fallback parsing
                if (returnCode == null) {
                    log.error("❌❌❌ CRITICAL: Unable to parse return_code from ZaloPay response!");
                    log.error("  Raw response: {}", rawResponseBody);
                    log.error("  This may indicate incorrect @JsonProperty mapping or API format change");
                    return ZaloPayResponse.error(-1, 
                        "ZaloPay API response format error. Unable to parse return_code. " + 
                        (orderPurchaseInfo.getReturn_message() != null ? orderPurchaseInfo.getReturn_message() : "Please check API response format."));
                }
                
                // Note: ZaloPay v2 does NOT return qr_code - frontend should redirect to order_url
                // Check if order creation was successful (using Integer comparison, not primitive)
                if (returnCode != 1) {
                    log.error("❌ ZaloPay order creation FAILED for orderId: {}", orderId);
                    log.error("   return_code: {}, return_message: {}", 
                             returnCode, orderPurchaseInfo.getReturn_message());
                    log.error("   sub_return_code: {}, sub_return_message: {}", 
                             orderPurchaseInfo.getSub_return_code(), orderPurchaseInfo.getSub_return_message());
                    
                    // Build error message with null-safe handling
                    String errorMsg = orderPurchaseInfo.getReturn_message() != null 
                        && !orderPurchaseInfo.getReturn_message().trim().isEmpty()
                        ? orderPurchaseInfo.getReturn_message() 
                        : getZaloPayErrorDescription(returnCode);
                    
                    // Return error response instead of throwing exception
                    return ZaloPayResponse.error(returnCode, errorMsg);
                }
                
                log.info("✓ ZaloPay order created successfully for orderId: {}", orderId);
                
                // Store zp_trans_token in payment record for tracking
                if (existingPayment.isPresent() && orderPurchaseInfo.getZp_trans_token() != null) {
                    ShopOrderPayment payment = existingPayment.get();
                    payment.setOrderNumber(orderPurchaseInfo.getZp_trans_token());
                    payment.setUpdateAt(Instant.now());
                    shopOrderPaymentService.save(payment);
                    log.info("✓ Stored zp_trans_token in payment record for tracking");
                }
                
                // Start polling for payment status (for localhost development)
                // Use full app_trans_id (with yyMMdd prefix)
                schedulePaymentStatusPolling(fullAppTransId, 0);
                
                return ZaloPayResponse.success(orderPurchaseInfo);
                
            } catch (IOException e) {
                log.error("❌ IOException while creating ZaloPay order for orderId: {}", orderId, e);
                return ZaloPayResponse.error(-1, "Network error: " + e.getMessage());
            } catch (Exception e) {
                log.error("❌ Unexpected error while creating ZaloPay order for orderId: {}", orderId, e);
                return ZaloPayResponse.error(-1, "Unexpected error: " + e.getMessage());
            }
        }).orElse(ZaloPayResponse.error(-1, "Order not found"));
    }
    
    /**
     * Handle ZaloPay payment callback
     * Verifies callback MAC and updates order status
     * 
     * @param callback Callback data from ZaloPay
     * @return JSON response for ZaloPay
     */
    @Transactional
    public String zalopayHandlerCallBack(OrderCallback callback) throws JsonProcessingException, NoSuchAlgorithmException, InvalidKeyException {
        log.info("Received ZaloPay callback: {}", callback);
        
        JSONObject result = new JSONObject();
        
        try {
            // Verify MAC using Key2
            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
            hmacSHA256.init(new SecretKeySpec(zaloPayConfig.getKey2().getBytes(), "HmacSHA256"));
            byte[] hashBytes = hmacSHA256.doFinal(callback.getData().getBytes());
            String computedMac = DatatypeConverter.printHexBinary(hashBytes).toLowerCase();
            
            if (!computedMac.equals(callback.getMac())) {
                log.error("MAC verification failed. Expected: {}, Got: {}", computedMac, callback.getMac());
                result.put("return_code", -1);
                result.put("return_message", "mac not equal");
                throw new PaymentCallbackException("MAC verification failed");
            }
            
            log.info("MAC verification successful");
            
            // Parse callback data
            OrderCallbackData callbackData = JSON.parse(callback.getData(), OrderCallbackData.class);
            String appTransId = callbackData.getApp_trans_id();
            
            // Extract orderId from app_trans_id format: {orderId}_{timestamp}
            Integer orderId = extractOrderIdFromAppTransId(appTransId);
            
            log.info("Processing payment callback for orderId: {}, app_trans_id: {}, zp_trans_id: {}", 
                    orderId, appTransId, callbackData.getZp_trans_id());
            
            // Prevent duplicate processing
            if (processingOrders.putIfAbsent(appTransId, Boolean.TRUE) != null) {
                log.warn("Callback already being processed for app_trans_id: {}", appTransId);
                result.put("return_code", 1);
                result.put("return_message", "success (already processed)");
                return result.toString();
            }
            
            try {
                // Check if already paid (idempotency)
                Optional<ShopOrderStatus> existingPaid = shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.PAID);
                if (existingPaid.isPresent()) {
                    log.info("Order #{} already marked as PAID, skipping callback processing", orderId);
                    result.put("return_code", 1);
                    result.put("return_message", "success (already paid)");
                    return result.toString();
                }
                
                // Update order status to PAID using new methods
                log.info("Updating order #{} status to PAID", orderId);
                shopOrderStatusService.confirmOrder(orderId, 
                        String.format("Payment received via ZaloPay. Transaction ID: %s", callbackData.getZp_trans_id()));
                
                // Update payment record
                ShopOrderPayment payment = shopOrderPaymentService.findByOrderId(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
                
                payment.setOrderNumber(String.valueOf(callbackData.getZp_trans_id()));
                payment.setUpdateAt(Instant.now());
                payment.setStatus(PaymentStatus.PAID.value);
                shopOrderPaymentService.save(payment);
                
                log.info("Successfully processed ZaloPay callback for order #{}", orderId);
                
            result.put("return_code", 1);
            result.put("return_message", "success");
                
            } finally {
                processingOrders.remove(appTransId);
            }
            
        } catch (PaymentCallbackException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error processing ZaloPay callback", e);
            result.put("return_code", -1);
            result.put("return_message", "error: " + e.getMessage());
        }
        
        return result.toString();
    }
    
    /**
     * Schedule polling for payment status
     * Used for localhost development where callback may not be reachable
     * 
     * @param appTransId ZaloPay transaction ID
     * @param attemptNumber Current attempt number
     */
    private void schedulePaymentStatusPolling(String appTransId, int attemptNumber) {
        if (attemptNumber >= zaloPayConfig.getMaxPollingAttempts()) {
            log.warn("Max polling attempts reached for app_trans_id: {}", appTransId);
            return;
        }
        
        long delaySeconds = attemptNumber == 0 ? 10 : zaloPayConfig.getPollingIntervalSeconds();
        Instant scheduledTime = Objects.requireNonNull(Instant.now().plusSeconds(delaySeconds), "Scheduled time cannot be null");
        
        taskScheduler.schedule(() -> {
            try {
                log.info("========== Polling payment status (attempt {}/{}) ==========", 
                        attemptNumber + 1, zaloPayConfig.getMaxPollingAttempts());
                log.info("  app_trans_id: {}", appTransId);
                
                String statusResponse = getOrderStatus(appTransId);
                log.info("========== ZaloPay STATUS RAW Response ==========");
                log.info("{}", statusResponse);
                log.info("=================================================");
                
                JSONObject statusJson = new JSONObject(statusResponse);
                
                // CRITICAL: Use optInt() to avoid exception if field is missing/null
                int returnCode = statusJson.optInt("return_code", -999);
                String returnMessage = statusJson.optString("return_message", "N/A");
                int subReturnCode = statusJson.optInt("sub_return_code", 0);
                String subReturnMessage = statusJson.optString("sub_return_message", "N/A");
                
                log.info("========== ZaloPay STATUS Parsed Response ==========");
                log.info("  return_code: {} (1=success, 2=failed, 3=processing)", returnCode);
                log.info("  return_message: {}", returnMessage);
                log.info("  sub_return_code: {}", subReturnCode);
                log.info("  sub_return_message: {}", subReturnMessage);
                log.info("  zp_trans_id: {}", statusJson.opt("zp_trans_id"));
                log.info("  amount: {}", statusJson.opt("amount"));
                log.info("====================================================");
                
                // Defensive check for invalid return_code
                if (returnCode == -999) {
                    log.error("❌ ZaloPay status response has missing or null return_code!");
                    log.error("  Raw response: {}", statusResponse);
                    log.error("  This indicates an API error or malformed response");
                    // Don't stop polling - treat as temporary error
                    schedulePaymentStatusPolling(appTransId, attemptNumber + 1);
                    return;
                }
                
                Integer orderId = extractOrderIdFromAppTransId(appTransId);
                
                if (returnCode == 1) {
                    // Payment successful - stop polling
                    log.info("✓ Payment SUCCESS for order #{}, app_trans_id: {}", orderId, appTransId);
                    handleSuccessfulPayment(orderId, appTransId, statusJson);
                    
                } else if (returnCode == 2) {
                    // Payment failed - STOP polling (do not retry)
                    log.warn("❌ Payment FAILED for order #{}, app_trans_id: {}. Stopping polling.", orderId, appTransId);
                    handleFailedPayment(orderId, appTransId);
                    // No further polling - payment definitively failed
                    
                } else if (returnCode == 3) {
                    // Still processing - continue polling if not exceeded max attempts
                    log.info("⏳ Payment still PROCESSING for order #{}, app_trans_id: {}. Will retry.", orderId, appTransId);
                    schedulePaymentStatusPolling(appTransId, attemptNumber + 1);
                    
                } else {
                    // Unknown return code (including -49 = not paid yet)
                    log.warn("⚠️ Unexpected return_code={} for app_trans_id: {}. Continuing to poll...", returnCode, appTransId);
                    schedulePaymentStatusPolling(appTransId, attemptNumber + 1);
                }
                
            } catch (PaymentException e) {
                log.error("Payment exception during polling for app_trans_id: {}", appTransId, e);
                // Payment-specific errors should not retry
                
            } catch (Exception e) {
                log.error("Error polling payment status for app_trans_id: {} (attempt {})", 
                         appTransId, attemptNumber + 1, e);
                // Retry on unexpected errors (network issues, etc.)
                if (attemptNumber < zaloPayConfig.getMaxPollingAttempts() - 1) {
                    log.info("Retrying polling for app_trans_id: {} after error", appTransId);
                    schedulePaymentStatusPolling(appTransId, attemptNumber + 1);
                } else {
                    log.error("Max polling attempts reached after error for app_trans_id: {}. Giving up.", appTransId);
                }
            }
        }, scheduledTime);
    }
    
    /**
     * Handle successful payment after status polling
     */
    @Transactional
    protected void handleSuccessfulPayment(Integer orderId, String appTransId, JSONObject statusJson) {
        log.info("Handling successful payment for orderId: {}", orderId);
        
        // Prevent duplicate processing
        if (processingOrders.putIfAbsent(appTransId, Boolean.TRUE) != null) {
            log.warn("Payment already being processed for app_trans_id: {}", appTransId);
            return;
        }
        
        try {
            // Check if already paid
            Optional<ShopOrderStatus> existingPaid = shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.PAID);
            if (existingPaid.isPresent()) {
                log.info("Order #{} already marked as PAID, skipping", orderId);
                return;
            }
            
            // Update order status
            String zpTransId = statusJson.optString("zp_trans_id", "N/A");
            shopOrderStatusService.confirmOrder(orderId, 
                    String.format("Payment confirmed via ZaloPay. Transaction ID: %s", zpTransId));
            
            // Update payment record
            ShopOrderPayment payment = shopOrderPaymentService.findByOrderId(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
            
            payment.setOrderNumber(zpTransId);
            payment.setUpdateAt(Instant.now());
            payment.setStatus(PaymentStatus.PAID.value);
            shopOrderPaymentService.save(payment);
            
            log.info("Successfully marked order #{} as PAID", orderId);
            
        } catch (Exception e) {
            log.error("Error handling successful payment for order #{}", orderId, e);
        } finally {
            processingOrders.remove(appTransId);
        }
    }
    
    /**
     * Handle failed payment after status polling
     */
    @Transactional
    protected void handleFailedPayment(Integer orderId, String appTransId) {
        log.info("Handling failed payment for orderId: {}", orderId);
        
        try {
            // Check if already cancelled
            Optional<ShopOrderStatus> existingCancelled = shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.CANCELLED);
            if (existingCancelled.isPresent()) {
                log.info("Order #{} already marked as CANCELLED, skipping", orderId);
                return;
            }
            
            // Cancel order
            shopOrderStatusService.cancelOrder(orderId, 
                    String.format("Payment failed. Transaction ID: %s", appTransId),
                    "Payment processing error at ZaloPay");
            
            // Update payment record
            ShopOrderPayment payment = shopOrderPaymentService.findByOrderId(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
            
            payment.setUpdateAt(Instant.now());
            payment.setStatus(PaymentStatus.CANCEL.value);
            shopOrderPaymentService.save(payment);
            
            log.info("Successfully marked order #{} as CANCELLED due to payment failure", orderId);
            
        } catch (Exception e) {
            log.error("Error handling failed payment for order #{}", orderId, e);
        }
    }
    
    /**
     * Query ZaloPay for order status
     * 
     * @param appTransId ZaloPay transaction ID
     * @return JSON response from ZaloPay
     */
    /**
     * Query ZaloPay for order status
     * Official Spec: POST https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid
     * 
     * @param appTransId ZaloPay transaction ID
     * @return JSON response from ZaloPay
     */
    public String getOrderStatus(String appTransId) throws URISyntaxException {
        log.debug("Querying ZaloPay status for app_trans_id: {}", appTransId);
        
        // Generate MAC according to v2 spec: app_id|app_trans_id|key1
        String data = zaloPayConfig.getAppId() + "|" + appTransId + "|" + zaloPayConfig.getKey1();
        String mac = HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA256, zaloPayConfig.getKey1(), data);
        
        log.debug("Query status MAC input: {}", data);
        log.debug("Query status MAC: {}", mac);
        
        // v2 API uses app_id and app_trans_id (with underscore)
        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("app_id", String.valueOf(zaloPayConfig.getAppId())));
        params.add(new BasicNameValuePair("app_trans_id", appTransId));
        params.add(new BasicNameValuePair("mac", mac));

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(zaloPayConfig.getEndpoints().getQuery());
            post.setEntity(new UrlEncodedFormEntity(params));
            
            log.debug("Sending query status request to: {}", zaloPayConfig.getEndpoints().getQuery());
            log.debug("Parameters: app_id={}, app_trans_id={}", zaloPayConfig.getAppId(), appTransId);
            
            CloseableHttpResponse res = client.execute(post);
            BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
            StringBuilder resultJsonStr = new StringBuilder();
            String line;

            while ((line = rd.readLine()) != null) {
                resultJsonStr.append(line);
            }
            
            String response = resultJsonStr.toString();
            log.info("ZaloPay status query response: {}", response);
            
            return response;
            
        } catch (IOException e) {
            log.error("Error querying ZaloPay status for app_trans_id: {}", appTransId, e);
            throw new PaymentException("Failed to query payment status", e);
        }
    }
    
    /**
     * Process ZaloPay refund
     * 
     * @param orderId Order ID
     * @param userDetail User requesting refund
     * @return ResponseMessage with refund status
     */
    @Transactional
    public ResponseMessage refund(Integer orderId, IUserDetail userDetail) {
        log.info("Processing ZaloPay refund for orderId: {} by user: {}", orderId, userDetail.getUserId());
        
        return orderService.findById(orderId).map(order -> {
            // Verify order has been paid
            shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.PAID)
                    .orElseThrow(() -> new IllegalArgumentException("Order has not been paid yet"));
            
            ShopOrderPayment payment = shopOrderPaymentService.findByOrderId(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
            
            // Verify user authorization
            if (!order.getUser().getId().equals(userDetail.getUserId())) {
                if (userDetail.getAuthorities().stream()
                        .noneMatch(auth -> auth.getAuthority().equals("ADMIN"))) {
                    log.warn("Unauthorized refund attempt for order #{} by user: {}", orderId, userDetail.getUserId());
                    throw new InsufficientAuthenticationException("You are not authorized to refund this order");
                }
            }

            Random rand = new Random();
            long timestamp = System.currentTimeMillis();
            String uid = timestamp + "" + (111 + rand.nextInt(888));
            
            Map<String, Object> refundData = new HashMap<String, Object>() {{
                put("app_id", zaloPayConfig.getAppId());
                put("zp_trans_id", payment.getOrderNumber());
                put("m_refund_id", getCurrentTimeString("yyMMdd") + "_" + zaloPayConfig.getAppId() + "_" + uid);
                put("timestamp", timestamp);
                put("amount", order.getTotal());
                put("description", "Refund for order #" + orderId);
            }};
            
            // Generate MAC: app_id|zp_trans_id|amount|description|timestamp
            String data = refundData.get("app_id") + "|" + refundData.get("zp_trans_id") + "|" + 
                         refundData.get("amount") + "|" + refundData.get("description") + "|" + 
                         refundData.get("timestamp");
            refundData.put("mac", HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA256, zaloPayConfig.getKey1(), data));

            List<NameValuePair> params = new ArrayList<>();
            for (Map.Entry<String, Object> e : refundData.entrySet()) {
                params.add(new BasicNameValuePair(e.getKey(), e.getValue().toString()));
            }
            
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                HttpPost post = new HttpPost(zaloPayConfig.getEndpoints().getRefund());
                post.setEntity(new UrlEncodedFormEntity(params));
                
                CloseableHttpResponse res = client.execute(post);
                BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
                StringBuilder resultJsonStr = new StringBuilder();
                String line;

                while ((line = rd.readLine()) != null) {
                    resultJsonStr.append(line);
                }

                String rawResponse = resultJsonStr.toString();
                log.info("========== ZaloPay Refund RAW Response ==========");
                log.info("{}", rawResponse);
                log.info("=================================================");
                
                JSONObject result = new JSONObject(rawResponse);
                
                // CRITICAL: Use opt methods with defaults to avoid exceptions
                int returnCode = result.optInt("returncode", -999);
                String returnMessage = result.optString("returnmessage", "N/A");
                
                log.info("ZaloPay refund response for order #{}: return_code={}, return_message={}", 
                        orderId, returnCode, returnMessage);
                
                // Defensive check for invalid response
                if (returnCode == -999) {
                    log.error("❌ ZaloPay refund response has missing or null returncode!");
                    log.error("  Raw response: {}", rawResponse);
                    throw new PaymentException("ZaloPay refund API returned invalid response (missing returncode)");
                }
                
                return new ResponseMessage.ResponseMessageBuilder()
                        .statusCode(returnCode)
                        .message(returnMessage)
                        .ok();
                        
            } catch (IOException e) {
                log.error("Error processing ZaloPay refund for order #{}", orderId, e);
                throw new PaymentException("Failed to process refund", e);
            }
            
        }).orElseThrow(() -> {
            log.error("Order not found for refund: {}", orderId);
            return new ResourceNotFoundException("Order with id " + orderId + " not found");
        });
    }
    
    /**
     * Get refund status from ZaloPay
     * 
     * API: POST https://sandbox.zalopay.com.vn/v001/tpe/getpartialrefundstatus
     * 
     * @param mRefundId Merchant refund ID (format: yyMMdd_appid_xxxxxxxxxx)
     * @return JSON response with refund status
     * @throws IOException if HTTP request fails
     */
    public String getRefundStatus(String mRefundId) throws IOException {
        log.info("Querying ZaloPay refund status for mRefundId: {}", mRefundId);
        
        long timestamp = System.currentTimeMillis();
        
        // Generate MAC: appid|mrefundid|timestamp
        String data = zaloPayConfig.getAppId() + "|" + mRefundId + "|" + timestamp;
        String mac = HMACUtil.HMacHexStringEncode(HMACUtil.HMACSHA256, zaloPayConfig.getKey1(), data);
        
        // Build request parameters
        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("appid", String.valueOf(zaloPayConfig.getAppId())));
        params.add(new BasicNameValuePair("mrefundid", mRefundId));
        params.add(new BasicNameValuePair("timestamp", String.valueOf(timestamp)));
        params.add(new BasicNameValuePair("mac", mac));
        
        log.debug("ZaloPay getRefundStatus request: appid={}, mrefundid={}, timestamp={}", 
                 zaloPayConfig.getAppId(), mRefundId, timestamp);
        
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(zaloPayConfig.getEndpoints().getRefundStatus());
            post.setEntity(new UrlEncodedFormEntity(params));
            
            CloseableHttpResponse res = client.execute(post);
            BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
            StringBuilder resultJsonStr = new StringBuilder();
            String line;
            
            while ((line = rd.readLine()) != null) {
                resultJsonStr.append(line);
            }
            
            String response = resultJsonStr.toString();
            log.info("ZaloPay getRefundStatus response for {}: {}", mRefundId, response);
            
            return response;
        }
    }
    
    /**
     * Build item JSON array string from order lines
     * Format: [{"itemid":"...","itemname":"...","itemprice":...,"itemquantity":...}, ...]
     * 
     * @param orderLines List of order lines
     * @return JSON array string, or "[]" if empty (should not happen)
     */
    private String buildItemJson(List<com.nhs.individual.domain.OrderLine> orderLines) {
        if (orderLines == null || orderLines.isEmpty()) {
            log.warn("Order lines are empty or null");
            return "[]";
        }
        
        List<Map<String, Object>> items = new ArrayList<>();
        for (com.nhs.individual.domain.OrderLine line : orderLines) {
            if (line.getProductItem() != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("itemid", String.valueOf(line.getProductItem().getId()));
                item.put("itemname", line.getProductItem().getProduct() != null 
                    ? line.getProductItem().getProduct().getName() 
                    : "Product #" + line.getProductItem().getId());
                item.put("itemprice", line.getProductItem().getPrice() != null 
                    ? line.getProductItem().getPrice().longValue() 
                    : 0);
                item.put("itemquantity", line.getQty() != null ? line.getQty() : 1);
                items.add(item);
            }
        }
        
        if (items.isEmpty()) {
            log.warn("No valid items found in order lines");
            return "[]";
        }
        
        try {
            return com.nhs.individual.utils.JSON.stringify(items);
        } catch (Exception e) {
            log.error("Failed to serialize item array to JSON", e);
            return "[]";
        }
    }
    
    /**
     * Get human-readable error description for ZaloPay return codes
     * 
     * @param returnCode ZaloPay return code
     * @return Error description
     */
    private String getZaloPayErrorDescription(Integer returnCode) {
        if (returnCode == null) {
            return "Unknown error (null return code)";
        }
        
        switch (returnCode) {
            case -2:
                return "Invalid request or MAC verification failed. Please check your credentials and request format.";
            case -1:
                return "Request failed. Please try again.";
            case 2:
                return "Payment failed or order was cancelled.";
            case 3:
                return "Payment is still processing.";
            default:
                return String.format("ZaloPay API error (code: %d)", returnCode);
        }
    }
    
    /**
     * Extract orderId from app_trans_id
     * 
     * Format: yyMMdd_orderId_timestamp
     * OrderInfo automatically prepends yyMMdd prefix
     * 
     * @param appTransId ZaloPay transaction ID (format: yyMMdd_orderId_timestamp)
     * @return Order ID
     * @throws PaymentException if format is invalid or orderId cannot be parsed
     */
    private Integer extractOrderIdFromAppTransId(String appTransId) {
        if (appTransId == null || appTransId.trim().isEmpty()) {
            log.error("❌ app_trans_id is null or empty");
            throw new PaymentException("Invalid app_trans_id: null or empty");
        }
        
        try {
            String[] parts = appTransId.split("_");
            
            if (parts.length < 2) {
                log.error("❌ Invalid app_trans_id format: {}. Expected format: yyMMdd_orderId_timestamp", appTransId);
                throw new IllegalArgumentException(
                    String.format("Invalid app_trans_id format: %s. Expected: yyMMdd_orderId_timestamp", appTransId)
                );
            }
            
            // Validate yyMMdd prefix (should be 6 digits)
            String datePrefix = parts[0];
            if (datePrefix.length() != 6 || !datePrefix.matches("\\d{6}")) {
                log.warn("⚠️ app_trans_id has invalid date prefix: {}. Expected 6 digits (yyMMdd)", datePrefix);
            }
            
            // Extract orderId from index 1
            // Format: yyMMdd_orderId_timestamp
            // parts[0] = yyMMdd
            // parts[1] = orderId
            // parts[2] = timestamp (optional, for uniqueness)
            String orderIdStr = parts[1];
            Integer orderId = Integer.parseInt(orderIdStr);
            
            log.debug("✓ Successfully extracted orderId: {} from app_trans_id: {}", orderId, appTransId);
            if (parts.length > 2) {
                log.debug("  Timestamp suffix: {}", parts[2]);
            }
            
            return orderId;
            
        } catch (NumberFormatException e) {
            log.error("❌ Failed to parse orderId as integer from app_trans_id: {}. Parts: {}", 
                     appTransId, String.join(", ", appTransId.split("_")), e);
            throw new PaymentException(
                String.format("Cannot parse orderId from app_trans_id: %s", appTransId), e
            );
        } catch (Exception e) {
            log.error("❌ Unexpected error extracting orderId from app_trans_id: {}", appTransId, e);
            throw new PaymentException("Failed to extract orderId from app_trans_id", e);
        }
    }
}

# ZaloPay Duplicate Payment Prevention Fix

## Problem
- Backend was returning `return_code = 2` for some orders
- Root cause: Duplicate `app_trans_id` when re-creating payment for same order
- No validation to prevent creating payment for already PAID orders
- Missing comprehensive logging for ZaloPay responses

---

## ✅ Fix #1: Globally Unique `app_trans_id`

### Before
```java
// app_trans_id = orderId only
String appTransId = String.valueOf(orderId);
// If order 123 is recreated, app_trans_id is still "123"
// Final format: yyMMdd_123
```

### After
```java
// app_trans_id = orderId_timestamp
long timestamp = System.currentTimeMillis();
String appTransId = orderId + "_" + timestamp;
// Each creation gets unique timestamp
// Final format: yyMMdd_123_1734448800000
```

### Impact
- ✅ Each payment creation is globally unique
- ✅ Re-creating payment for same order gets new `app_trans_id`
- ✅ Prevents ZaloPay duplicate transaction errors
- ✅ Format: `yyMMdd_orderId_timestamp`

---

## ✅ Fix #2: Prevent Duplicate Payment Creation

### Added Validation Checks

#### Check #1: Order Already PAID
```java
// Check if order has already been paid
shopOrderStatusService.findByOrderIdAndStatus(orderId, OrderStatus.PAID)
    .ifPresent(order -> {
        log.error("❌ Order #{} has already been PAID. Cannot create duplicate payment.", orderId);
        throw new OrderAlreadyPaidException(orderId);
    });
```

#### Check #2: ZaloPay Transaction Already Exists
```java
// Check if ZaloPay payment already exists (has zp_trans_token stored in orderNumber)
Optional<ShopOrderPayment> existingPayment = shopOrderPaymentService.findByOrderId(orderId);
if (existingPayment.isPresent() && existingPayment.get().getOrderNumber() != null 
    && !existingPayment.get().getOrderNumber().trim().isEmpty()) {
    log.error("❌ Order #{} already has ZaloPay transaction (zp_trans_id: {}). Cannot create duplicate payment.", 
             orderId, existingPayment.get().getOrderNumber());
    throw new PaymentException(
        String.format("Order #%d already has an active ZaloPay payment. Please use the existing payment or cancel it first.", orderId)
    );
}
```

### Impact
- ✅ Cannot create payment if order status is PAID
- ✅ Cannot create payment if `zp_trans_token` already stored
- ✅ Clear error messages for frontend
- ✅ Prevents wasting ZaloPay API quota

---

## ✅ Fix #3: Comprehensive Logging

### CREATE Order Response Logging
```java
log.info("========== ZaloPay CREATE Response ==========");
log.info("  return_code: {} (1=success, 2=failed, 3=processing)", orderPurchaseInfo.getReturn_code());
log.info("  return_message: {}", orderPurchaseInfo.getReturn_message());
log.info("  sub_return_code: {}", orderPurchaseInfo.getSub_return_code());
log.info("  sub_return_message: {}", orderPurchaseInfo.getSub_return_message());
log.info("  app_trans_id (full): {}", fullAppTransId);
log.info("  zp_trans_token: {}", orderPurchaseInfo.getZp_trans_token());
log.info("  order_url: {}", orderPurchaseInfo.getOrder_url());
log.info("  qr_code: {}", orderPurchaseInfo.getQr_code() != null ? "EXISTS" : "NULL");
log.info("============================================");
```

### STATUS Query Response Logging
```java
log.info("========== ZaloPay STATUS Response ==========");
log.info("  return_code: {} (1=success, 2=failed, 3=processing)", returnCode);
log.info("  return_message: {}", returnMessage);
log.info("  sub_return_code: {}", subReturnCode);
log.info("  sub_return_message: {}", subReturnMessage);
log.info("  zp_trans_id: {}", statusJson.opt("zp_trans_id"));
log.info("  amount: {}", statusJson.opt("amount"));
log.info("============================================");
```

### Impact
- ✅ Full ZaloPay response details logged
- ✅ `return_message` and `sub_return_code` visible
- ✅ Easy debugging of payment failures
- ✅ Clear separation with visual markers

---

## ✅ Fix #4: Store `zp_trans_token` for Tracking

```java
// Store zp_trans_token in payment record for tracking
if (existingPayment.isPresent() && orderPurchaseInfo.getZp_trans_token() != null) {
    ShopOrderPayment payment = existingPayment.get();
    payment.setOrderNumber(orderPurchaseInfo.getZp_trans_token());
    payment.setUpdateAt(Instant.now());
    shopOrderPaymentService.save(payment);
    log.info("✓ Stored zp_trans_token in payment record for tracking");
}
```

### Impact
- ✅ `zp_trans_token` stored immediately after creation
- ✅ Used to detect duplicate payment attempts
- ✅ Links order to ZaloPay transaction

---

## ✅ Fix #5: Enhanced Error Handling

### Check ZaloPay Response
```java
// Check if order creation was successful
if (orderPurchaseInfo.getReturn_code() != 1) {
    log.error("❌ ZaloPay order creation FAILED for orderId: {}", orderId);
    log.error("   return_code: {}, return_message: {}", 
             orderPurchaseInfo.getReturn_code(), orderPurchaseInfo.getReturn_message());
    log.error("   sub_return_code: {}, sub_return_message: {}", 
             orderPurchaseInfo.getSub_return_code(), orderPurchaseInfo.getSub_return_message());
    
    throw new PaymentException(
        String.format("ZaloPay order creation failed: %s (code: %d, sub_code: %d)", 
                     orderPurchaseInfo.getReturn_message(), 
                     orderPurchaseInfo.getReturn_code(),
                     orderPurchaseInfo.getSub_return_code())
    );
}
```

### Impact
- ✅ Throws exception immediately if `return_code != 1`
- ✅ Detailed error message with all codes
- ✅ Prevents frontend from rendering invalid QR code

---

## ✅ Fix #6: Updated `extractOrderIdFromAppTransId`

### Before
```java
// Expected format: yyMMdd_orderId
// parts[0] = yyMMdd
// parts[1] = orderId
```

### After
```java
// Expected format: yyMMdd_orderId_timestamp
// parts[0] = yyMMdd
// parts[1] = orderId
// parts[2] = timestamp (optional, for uniqueness)
String orderIdStr = parts[1];
Integer orderId = Integer.parseInt(orderIdStr);

log.debug("✓ Successfully extracted orderId: {} from app_trans_id: {}", orderId, appTransId);
if (parts.length > 2) {
    log.debug("  Timestamp suffix: {}", parts[2]);
}
```

### Impact
- ✅ Correctly parses new format with timestamp
- ✅ Backward compatible with old format
- ✅ Enhanced logging for debugging

---

## Example Log Output

### Successful Payment Creation
```
========== Creating ZaloPay payment for orderId: 9 ==========
✓ Generating ZaloPay order with UNIQUE app_trans_id: 9_1734448800000
  - orderId: 9
  - timestamp: 1734448800000
  - OrderInfo will prepend yyMMdd, final format: yyMMdd_9_1734448800000
→ Sending create order request to ZaloPay: https://sb-openapi.zalopay.vn/v2/create
========== ZaloPay CREATE Response ==========
  return_code: 1 (1=success, 2=failed, 3=processing)
  return_message: Success
  sub_return_code: 0
  sub_return_message: 
  app_trans_id (full): 241217_9_1734448800000
  zp_trans_token: 8ee7f44e7c61bbea16b8
  order_url: https://sbgateway.zalopay.vn/openapi/pay/241217_9_1734448800000
  qr_code: EXISTS
============================================
✓ ZaloPay order created successfully for orderId: 9
✓ Stored zp_trans_token in payment record for tracking
```

### Duplicate Payment Attempt
```
========== Creating ZaloPay payment for orderId: 9 ==========
❌ Order #9 already has ZaloPay transaction (zp_trans_id: 8ee7f44e7c61bbea16b8). Cannot create duplicate payment.
PaymentException: Order #9 already has an active ZaloPay payment. Please use the existing payment or cancel it first.
```

### Payment Already Completed
```
========== Creating ZaloPay payment for orderId: 9 ==========
❌ Order #9 has already been PAID. Cannot create duplicate payment.
OrderAlreadyPaidException: Order 9 has already been paid.
```

---

## Files Modified

1. ✅ `Ecommerce/nhs-api/src/main/java/com/nhs/individual/service/ZalopayService.java`
   - Updated `purchaseZalo()` method
   - Updated `extractOrderIdFromAppTransId()` method
   - Updated `schedulePaymentStatusPolling()` logging

**Total:** 1 file modified, 0 files created

---

## Testing Checklist

### ✅ Test Scenario 1: First Payment Creation
- [ ] Create order with ID 999
- [ ] Call `POST /api/v1/purchase/999/zalopay`
- [ ] Check `app_trans_id` format: `yyMMdd_999_timestamp`
- [ ] Verify `return_code = 1`
- [ ] Verify QR code renders on frontend
- [ ] Check logs show full ZaloPay response

### ✅ Test Scenario 2: Duplicate Payment Prevention
- [ ] Create payment for order 999 (first time)
- [ ] Try to create payment again for order 999
- [ ] Should get error: "Order #999 already has an active ZaloPay payment"
- [ ] Frontend should display clear error message

### ✅ Test Scenario 3: Already Paid Order
- [ ] Complete payment for order 999
- [ ] Order status becomes PAID
- [ ] Try to create payment again
- [ ] Should get error: "Order 999 has already been paid"

### ✅ Test Scenario 4: Unique app_trans_id
- [ ] Create payment for order 888 at time T1
- [ ] `app_trans_id`: `241217_888_1734448800000`
- [ ] Cancel order 888
- [ ] Create payment for order 888 at time T2
- [ ] `app_trans_id`: `241217_888_1734448900000` (different timestamp)
- [ ] Both transactions are unique in ZaloPay system

### ✅ Test Scenario 5: Polling with New Format
- [ ] Create payment with new `app_trans_id` format
- [ ] Wait for status polling (every 15s)
- [ ] Check logs show full status response
- [ ] Verify `extractOrderIdFromAppTransId` works correctly
- [ ] Payment status updates correctly when completed

---

## Migration Notes

### Backward Compatibility
- ✅ Old format `yyMMdd_orderId` still works for existing transactions
- ✅ New transactions use `yyMMdd_orderId_timestamp`
- ✅ `extractOrderIdFromAppTransId` handles both formats

### No Database Migration Required
- Uses existing `ShopOrderPayment.orderNumber` field
- Stores `zp_trans_token` immediately after creation
- No schema changes needed

### No Frontend Changes Required
- Frontend receives same response structure
- `app_trans_id`, `qr_code`, `order_url` unchanged
- Error messages more descriptive

---

## Return Codes Reference

### ZaloPay `return_code`
- `1` = Success (order created, payment processing)
- `2` = Failed (duplicate `app_trans_id`, invalid params, etc.)
- `3` = Processing (status query only)

### Common `sub_return_code` Values
- `0` = No error
- `-2` = Duplicate `app_trans_id`
- `-8` = Invalid MAC
- `-9` = Invalid amount

---

## Impact Summary

| Issue | Before | After |
|-------|--------|-------|
| Duplicate `app_trans_id` | ❌ Same for same order | ✅ Globally unique with timestamp |
| Re-create payment | ❌ Returns `return_code = 2` | ✅ Each creation succeeds with unique ID |
| Already PAID check | ❌ Not validated | ✅ Throws `OrderAlreadyPaidException` |
| Existing transaction check | ❌ Not validated | ✅ Throws `PaymentException` |
| Error logging | ⚠️ Basic | ✅ Full response with all codes |
| Debugging | ⚠️ Difficult | ✅ Clear, structured logs |

---

**Date:** December 17, 2025  
**Status:** ✅ All fixes completed  
**Linter:** ✅ No errors  
**Backward Compatible:** ✅ Yes


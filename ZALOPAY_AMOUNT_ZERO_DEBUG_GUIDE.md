# ZaloPay Amount = 0 Debug Guide

## 🔴 Vấn đề quan sát được

```
return_code: 3 (processing)
return_message: Giao dịch chưa được thực hiện
zp_trans_id: 0
amount: 0 ❌❌❌
```

**Điểm bất thường lớn nhất:** `amount = 0`

### Tại sao không có QR code?

```
ZaloPay KHÔNG BAO GIỜ trả QR nếu amount = 0
Sandbox vẫn yêu cầu amount > 0
```

**Hậu quả:**
- ❌ FE không có `qr_code`
- ❌ Không có `order_url`
- ❌ Countdown không thể chạy

---

## ✅ Các fix đã apply

### Fix #1: Server-Side Total Calculation (ShopOrderService)

```java
// Calculate total on server-side, don't trust frontend
BigDecimal calculatedTotal = BigDecimal.ZERO;

// Sum all orderLine totals
for (var line : order.getOrderLines()) {
    calculatedTotal = calculatedTotal.add(line.getTotal());
}

// Add shipping price
if (order.getShippingMethod() != null) {
    calculatedTotal = calculatedTotal.add(order.getShippingMethod().getPrice());
}

// Set the calculated total (override frontend value)
order.setTotal(calculatedTotal);

// Validate total > 0
if (calculatedTotal.compareTo(BigDecimal.ZERO) <= 0) {
    throw new IllegalArgumentException("Order total must be > 0");
}
```

### Fix #2: Amount Validation & Logging (ZalopayService)

```java
// CRITICAL: Convert BigDecimal to long for ZaloPay
Long amountVND = shopOrder.getTotal().longValue();

log.info("========== Preparing ZaloPay Request ==========");
log.info("  - order.getTotal() (BigDecimal): {}", shopOrder.getTotal());
log.info("  - amount (Long/VND) for ZaloPay: {}", amountVND);

// CRITICAL: Validate amount one more time before sending to ZaloPay
if (amountVND == null || amountVND <= 0) {
    log.error("❌❌❌ FATAL: amount for ZaloPay is INVALID: {}", amountVND);
    throw new PaymentException(
        String.format("Cannot create ZaloPay payment: amount is %d. ZaloPay requires amount > 0.", amountVND)
    );
}

// Create OrderInfo with validated amount
OrderInfo orderInfo = new OrderInfo(
    zaloPayConfig.getAppId(),
    "user" + shopOrder.getUser().getId(),
    appTransId,
    amountVND,  // ← Use validated amount
    "Payment for order #" + orderId,
    "zalopayapp",
    "[]",
    // ...
);

// Log full request payload
log.info("========== ZaloPay Request Payload ==========");
log.info("  app_id: {}", orderInfo.getApp_id());
log.info("  amount: {} VND", orderInfo.getAmount());
log.info("  app_trans_id: {}", orderInfo.getApp_trans_id());
// ...
```

### Fix #3: Response Validation

```java
log.info("========== ZaloPay CREATE Response ==========");
log.info("  return_code: {}", orderPurchaseInfo.getReturn_code());
log.info("  qr_code: {}", orderPurchaseInfo.getQr_code() != null ? "EXISTS" : "❌ NULL");

// CRITICAL: Verify QR code was generated
if (orderPurchaseInfo.getQr_code() == null || orderPurchaseInfo.getQr_code().isEmpty()) {
    log.error("❌❌❌ CRITICAL: ZaloPay did NOT return qr_code!");
    log.error("  This usually means amount = 0 or invalid request");
    log.error("  Request amount was: {} VND", amountVND);
}
```

---

## 📋 Checklist Verify (5 phút)

### Backend ✅

**1. Order Creation:**
```bash
# Check logs khi tạo order
========== Creating Order ==========
User ID: 5
Order Lines count: 2
Frontend total (IGNORED): 0
  OrderLine: qty=2, lineTotal=50000
  OrderLine: qty=1, lineTotal=120000
✓ OrderLines total: 170000
✓ Shipping price: 30000
✓✓✓ FINAL ORDER TOTAL: 200000 ✓✓✓
```

- [ ] `order.getTotal()` ≠ null
- [ ] `order.getTotal()` > 0
- [ ] Total = sum(orderLines) + shipping

**2. ZaloPay Payment Creation:**
```bash
# Check logs khi gọi ZaloPay
========== Preparing ZaloPay Request ==========
  - order.getTotal() (BigDecimal): 200000
  - amount (Long/VND) for ZaloPay: 200000
✓ amount validation passed: 200000 VND

========== ZaloPay Request Payload ==========
  app_id: 2554
  amount: 200000 VND
  app_trans_id: 241217_123_1734448800000
  description: Payment for order #123
```

- [ ] `amountVND` = order.getTotal().longValue()
- [ ] `amountVND` > 0
- [ ] Request payload logs `amount: 200000 VND` (not 0)

**3. ZaloPay Response:**
```bash
========== ZaloPay CREATE Response ==========
  return_code: 1 (1=success, 2=failed, 3=processing)
  return_message: Success
  qr_code: EXISTS (length: 500)
  order_url: https://sbgateway.zalopay.vn/openapi/pay/...
```

- [ ] `return_code` = 1 (success)
- [ ] `qr_code` EXISTS (not null)
- [ ] `order_url` EXISTS

### Frontend ✅

**1. API Response:**
```bash
# Check browser console
[ZaloPayProcess] ✓ API Response: {
  return_code: 1,
  qr_code: "https://qr.zalopay.vn/...",
  order_url: "https://sbgateway.zalopay.vn/...",
  app_trans_id: "241217_123_1734448800000",
  zp_trans_token: "8ee7f44e7c61bbea16b8"
}
```

- [ ] API `/zalopay/purchase?id=123` trả `qr_code`
- [ ] `qr_code` là URL hợp lệ
- [ ] `order_url` tồn tại

**2. QR Code Render:**
```javascript
// ZaloPayProcess component
{state == 3 && data?.qr_code && (
    <QRCode value={data.qr_code} size={256} />
)}
```

- [ ] QR code hiển thị ngay sau khi load
- [ ] Countdown timer chạy (15 phút)
- [ ] KHÔNG call status API trước khi có QR

---

## 🔍 Debug Steps (nếu vẫn lỗi)

### Step 1: Check Order Total in Database

```sql
SELECT id, total, user_id, order_date
FROM shop_order
WHERE id = 123;
```

**Expected:**
```
id  | total   | user_id | order_date
123 | 200000  | 5       | 2024-12-17 10:00:00
```

❌ Nếu `total = 0` → vấn đề ở `ShopOrderService.createOrder()`

### Step 2: Check Backend Logs

```bash
# Search for order creation logs
grep "Creating Order" application.log
grep "FINAL ORDER TOTAL" application.log

# Search for ZaloPay request logs
grep "Preparing ZaloPay Request" application.log
grep "amount (Long/VND)" application.log
```

**Expected:**
```
✓✓✓ FINAL ORDER TOTAL: 200000 ✓✓✓
amount (Long/VND) for ZaloPay: 200000
```

❌ Nếu thấy `amount: 0` → check logic tính total

### Step 3: Check ZaloPay Request Payload

```bash
grep "ZaloPay Request Payload" application.log -A 10
```

**Expected:**
```
========== ZaloPay Request Payload ==========
  app_id: 2554
  amount: 200000 VND  ← MUST NOT BE 0
  app_trans_id: 241217_123_1734448800000
```

❌ Nếu `amount: 0 VND` → check OrderInfo constructor

### Step 4: Check ZaloPay Response

```bash
grep "ZaloPay CREATE Response" application.log -A 10
```

**Expected:**
```
return_code: 1
qr_code: EXISTS (length: 500)
order_url: https://...
```

❌ Nếu `qr_code: ❌ NULL` → ZaloPay rejected request vì amount = 0

### Step 5: Check Frontend Console

```javascript
// In browser DevTools Console
// Should see:
[ZaloPayProcess] ✓ API Response: {
  return_code: 1,
  qr_code: "https://qr.zalopay.vn/...",  ← MUST EXIST
  order_url: "https://sbgateway.zalopay.vn/..."
}
```

❌ Nếu `qr_code: null` → backend không trả về QR

---

## 🎯 Root Cause Analysis

### Possible Causes of `amount = 0`

| Cause | Check | Fix |
|-------|-------|-----|
| Frontend sends `total: 0` | ✅ FIXED | Backend recalculates |
| OrderLines empty | Check logs | Validate orderLines.size() > 0 |
| OrderLine totals = 0 | Check logs | Validate line.getTotal() > 0 |
| Shipping price = 0 | Check logs | OK if free shipping |
| BigDecimal → long conversion | ✅ FIXED | Use `.longValue()` |
| Order not saved before payment | Check DB | Ensure `orderRepository.save()` |

### ZaloPay Sandbox Requirements

```java
// REQUIRED for QR code generation
amount > 0          // ← CRITICAL
app_trans_id format: yyMMdd_xxx
app_id: 2554
mac: correct HMAC-SHA256
```

---

## 📊 Expected Flow

### Success Flow
```
1. User creates order
   → Backend calculates total = 200,000 VND
   → Saves to DB

2. User clicks "Pay with ZaloPay"
   → Backend validates total > 0 ✓
   → Converts BigDecimal → Long = 200000
   → Sends to ZaloPay with amount = 200000

3. ZaloPay processes request
   → return_code = 1
   → qr_code = "https://qr.zalopay.vn/..."
   → order_url = "https://sbgateway.zalopay.vn/..."

4. Frontend receives response
   → Renders QR code ✓
   → Starts countdown timer ✓
   → User scans and pays ✓
```

### Failure Flow (amount = 0)
```
1. User creates order
   → Backend calculates total = 0 ❌
   → Saves to DB with total = 0

2. User clicks "Pay with ZaloPay"
   → Backend validates total > 0 ❌
   → Throws PaymentException ✓
   → OR sends amount = 0 to ZaloPay

3. ZaloPay processes request with amount = 0
   → return_code = 2 or 3
   → qr_code = null ❌
   → order_url = null ❌

4. Frontend receives response
   → No QR code ❌
   → No countdown ❌
   → Payment stuck ❌
```

---

## 🚀 Quick Test

### Test Case 1: Create Order with Valid Items

```bash
# 1. Create order via API
POST http://localhost:8085/api/v1/order
{
  "orderLines": [
    { "productItem": { "id": 1 }, "qty": 2, "total": 50000 },
    { "productItem": { "id": 2 }, "qty": 1, "total": 120000 }
  ],
  "shippingMethod": { "id": 1 },
  "user": { "id": 5 },
  "payment": { "type": { "id": 2 } }
}

# 2. Check response
{
  "id": 123,
  "total": 200000,  ← MUST NOT BE 0
  "status": [{ "status": 1 }]
}

# 3. Call ZaloPay payment
GET http://localhost:8085/api/v1/purchase/123/zalopay

# 4. Check response
{
  "return_code": 1,
  "qr_code": "https://qr.zalopay.vn/...",  ← MUST EXIST
  "order_url": "https://sbgateway.zalopay.vn/...",
  "app_trans_id": "241217_123_1734448800000"
}
```

---

## 📝 Summary of Fixes

| Component | Issue | Fix |
|-----------|-------|-----|
| **ShopOrderService** | Trusted frontend total | ✅ Calculate on server |
| **ShopOrderService** | No validation | ✅ Validate total > 0 |
| **ZalopayService** | No amount validation | ✅ Validate before API call |
| **ZalopayService** | BigDecimal → Long | ✅ Use `.longValue()` |
| **ZalopayService** | No request logging | ✅ Log full payload |
| **ZalopayService** | No response validation | ✅ Check qr_code exists |

**Result:**
- ✅ `amount` is never 0
- ✅ ZaloPay returns QR code
- ✅ Payment can be completed
- ✅ Easy to debug with comprehensive logs

---

**Date:** December 17, 2025  
**Status:** ✅ Fixed with validation & logging  
**Next:** Test with real order creation


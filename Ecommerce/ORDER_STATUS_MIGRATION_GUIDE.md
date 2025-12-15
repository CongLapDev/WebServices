# 🔧 ORDER STATUS REFACTORING - MIGRATION GUIDE

## ⚠️ BREAKING CHANGES

### Enum OrderStatus Changes

**OLD:**
```java
PAID(0,"PAID"),           // ❌ Wrong order
PENDING(1,"PENDING"),     
PREPARING(2,"PREPARING"),
DELIVERING(3,"DELIVERING"),
DELIVERED(4,"DELIVERED"),
COMPLETED(5,"COMPLETED"),
CANCEL(6,"CANCEL"),       // ❌ Wrong name
RETURN(7,"RETURN");
```

**NEW:**
```java
PENDING_PAYMENT(1, "PENDING_PAYMENT", "Chờ thanh toán"),
PAID(2, "PAID", "Đã thanh toán"),
CONFIRMED(3, "CONFIRMED", "Đã xác nhận"),
PREPARING(4, "PREPARING", "Đang chuẩn bị"),
SHIPPING(5, "SHIPPING", "Đang giao hàng"),
DELIVERED(6, "DELIVERED", "Đã giao hàng"),
COMPLETED(7, "COMPLETED", "Hoàn thành"),
CANCELLED(8, "CANCELLED", "Đã hủy"),
RETURNED(9, "RETURNED", "Đã trả hàng");
```

---

## 📝 DATABASE MIGRATION

### Step 1: Update existing order statuses

```sql
-- Backup current data
CREATE TABLE shop_order_status_backup AS SELECT * FROM shop_order_status;

-- Update status IDs to new enum
UPDATE shop_order_status SET status = 1 WHERE status = 1;  -- PENDING → PENDING_PAYMENT (same ID)
UPDATE shop_order_status SET status = 2 WHERE status = 0;  -- PAID 0 → PAID 2 (NEW!)
UPDATE shop_order_status SET status = 4 WHERE status = 2;  -- PREPARING 2 → 4
UPDATE shop_order_status SET status = 5 WHERE status = 3;  -- DELIVERING 3 → SHIPPING 5
UPDATE shop_order_status SET status = 6 WHERE status = 4;  -- DELIVERED 4 → 6
UPDATE shop_order_status SET status = 7 WHERE status = 5;  -- COMPLETED 5 → 7
UPDATE shop_order_status SET status = 8 WHERE status = 6;  -- CANCEL 6 → CANCELLED 8
UPDATE shop_order_status SET status = 9 WHERE status = 7;  -- RETURN 7 → RETURNED 9
```

**⚠️ IMPORTANT:** Run this during maintenance window!

---

## 🔀 MIGRATION STRATEGY

### Option A: Zero Downtime (Recommended)

1. **Deploy new code WITHOUT database migration**
2. **Keep old enum values in database**
3. **Add compatibility layer in code:**

```java
// In ShopOrderStatusService
private OrderStatus mapLegacyStatus(Integer oldStatusId) {
    switch(oldStatusId) {
        case 0: return OrderStatus.PAID;           // OLD PAID
        case 1: return OrderStatus.PENDING_PAYMENT; // OLD PENDING
        case 2: return OrderStatus.PREPARING;       // Same
        case 3: return OrderStatus.SHIPPING;        // OLD DELIVERING
        // ... etc
        default: return null;
    }
}
```

4. **Gradually migrate data**
5. **Remove compatibility layer after all data migrated**

### Option B: Maintenance Window

1. **Put system in maintenance mode**
2. **Run SQL migration**
3. **Deploy new code**
4. **Test**
5. **Resume service**

---

## 🔧 CODE UPDATES NEEDED

### 1. ✅ DONE - New Files Created

- ✅ `OrderStatus.java` - New enum with proper IDs
- ✅ `OrderStateMachine.java` - State transition rules
- ✅ `InvalidOrderStatusTransitionException.java`
- ✅ `OrderNotFoundException.java`
- ✅ `OrderAccessDeniedException.java`
- ✅ `OrderSecurityService.java` - Authorization logic
- ✅ `ShopOrderStatusService.java` - Refactored with validation
- ✅ `ShopOrderController.java` - New RESTful endpoints

### 2. ⏳ TODO - Update Payment Services

**ZalopayService.java** needs updates:

```java
// OLD (line 131, 171)
shopOrderStatus.setStatus(OrderStatus.PAID.id);
shopOrderStatusService.save(shopOrderStatus);

// NEW
shopOrderStatusService.markAsPaid(orderId, transactionId);
```

```java
// OLD (line 185)
shopOrderStatus.setStatus(OrderStatus.CANCEL.id);
shopOrderStatusService.updateOrderStatus(orderId,shopOrderStatus);

// NEW
shopOrderStatusService.cancelOrder(orderId, note, detail);
```

### 3. ⏳ TODO - Update UI/Frontend

Update status display mapping:
```javascript
const statusMap = {
  1: { label: "Chờ thanh toán", color: "yellow" },
  2: { label: "Đã thanh toán", color: "green" },
  3: { label: "Đã xác nhận", color: "blue" },
  4: { label: "Đang chuẩn bị", color: "orange" },
  5: { label: "Đang giao hàng", color: "purple" },
  6: { label: "Đã giao hàng", color: "cyan" },
  7: { label: "Hoàn thành", color: "success" },
  8: { label: "Đã hủy", color: "error" },
  9: { label: "Đã trả hàng", color: "warning" }
};
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests
- [ ] Test State Machine transitions
- [ ] Test invalid transitions throw exception
- [ ] Test final states cannot transition
- [ ] Test authorization checks

### Integration Tests
- [ ] COD order flow end-to-end
- [ ] Online payment order flow end-to-end
- [ ] Cancel order at different stages
- [ ] Admin operations (confirm, prepare, ship, deliver)
- [ ] User operations (view, complete, cancel)

### Manual Tests
- [ ] Create COD order → Admin confirm → Complete
- [ ] Create Online order → Pay → Admin confirm → Complete
- [ ] Try to cancel order after shipping (should fail)
- [ ] Try to update status as non-admin (should get 403)
- [ ] Try to view other user's order (should get 403)

---

## 🚀 DEPLOYMENT SEQUENCE

1. **Phase 1: Deploy New Code (Backward Compatible)**
   - Deploy new code with compatibility layer
   - Old status IDs still work
   - New endpoints available but not used yet

2. **Phase 2: Migrate Data**
   - Run SQL migration script
   - Verify all orders have new status IDs

3. **Phase 3: Update Frontend**
   - Update UI to use new status IDs
   - Update API calls to new endpoints

4. **Phase 4: Update Payment Services**
   - Update ZalopayService to use new methods
   - Test payment flow thoroughly

5. **Phase 5: Remove Compatibility Layer**
   - Remove legacy endpoints (@Deprecated)
   - Remove status ID mapping code

---

## 📞 SUPPORT

If you encounter issues:
1. Check logs for `InvalidOrderStatusTransitionException`
2. Verify user has correct roles (ROLE_ADMIN vs ADMIN)
3. Check order current status in database
4. Review allowed transitions in `OrderStateMachine.java`


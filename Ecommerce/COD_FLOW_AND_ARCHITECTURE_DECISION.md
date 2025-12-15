# 💰 COD FLOW & ARCHITECTURE DECISIONS

## 📦 COD (Cash on Delivery) FLOW

### Business Flow

```
Customer                Admin               System
   │                      │                    │
   │  1. Create Order     │                    │
   │  (payment_type=1)    │                    │
   ├──────────────────────┼───────────────────>│
   │                      │                    │ Create order
   │                      │                    │ Status: PENDING_PAYMENT
   │<─────────────────────┼────────────────────┤
   │  Order ID: 123       │                    │
   │                      │                    │
   │                      │  2. Review Order   │
   │                      │<───────────────────┤
   │                      │                    │
   │                      │  3. Confirm Order  │
   │                      │  (COD approved)    │
   │                      ├───────────────────>│
   │                      │                    │ Status: CONFIRMED
   │                      │                    │
   │                      │  4. Prepare Order  │
   │                      ├───────────────────>│
   │                      │                    │ Status: PREPARING
   │                      │                    │
   │                      │  5. Ship Order     │
   │                      ├───────────────────>│
   │                      │                    │ Status: SHIPPING
   │                      │                    │
   │  6. Receive Package  │                    │
   │  + Pay Cash          │                    │
   │<─────────────────────┼────────────────────┤
   │                      │                    │
   │                      │  7. Mark Delivered │
   │                      ├───────────────────>│
   │                      │                    │ Status: DELIVERED
   │                      │                    │
   │  8. Confirm Receipt  │                    │
   ├──────────────────────┼───────────────────>│
   │                      │                    │ Status: COMPLETED
   │                      │                    │
```

---

## 🔄 COD vs Online Payment Comparison

| Step | COD Flow | Online Payment Flow |
|------|----------|---------------------|
| 1. Create Order | PENDING_PAYMENT | PENDING_PAYMENT |
| 2. Payment | **SKIP** (pay later) | User pays → PAID |
| 3. Confirm | Admin confirms → CONFIRMED | Admin confirms → CONFIRMED |
| 4. Prepare | PREPARING | PREPARING |
| 5. Ship | SHIPPING | SHIPPING |
| 6. Deliver | Customer pays cash → DELIVERED | DELIVERED |
| 7. Complete | COMPLETED | COMPLETED |

**Key Difference:** COD skips PAID status!

---

## 🎯 STATE TRANSITIONS FOR COD

### Valid COD Transitions

```java
// State Machine Configuration
PENDING_PAYMENT → CONFIRMED    // ✅ Admin approves COD order directly
PENDING_PAYMENT → PAID         // ❌ Not for COD
PENDING_PAYMENT → CANCELLED    // ✅ User/Admin cancels

CONFIRMED → PREPARING          // ✅ Warehouse starts preparing
PREPARING → SHIPPING           // ✅ Shipped to customer
SHIPPING → DELIVERED           // ✅ Customer received & paid
DELIVERED → COMPLETED          // ✅ Transaction complete
```

### Controller Endpoints for COD

```java
// 1. Create COD order
POST /api/v1/order
Body: { payment: { type: { id: 1 } } }  // payment_type = 1 (COD)
→ Status: PENDING_PAYMENT

// 2. Admin confirms COD order
POST /api/v1/order/{id}/status/confirm
→ Status: CONFIRMED

// 3. Admin starts preparing
POST /api/v1/order/{id}/status/prepare
→ Status: PREPARING

// 4. Admin ships order
POST /api/v1/order/{id}/status/ship
→ Status: SHIPPING

// 5. Admin marks as delivered (after customer pays cash)
POST /api/v1/order/{id}/status/deliver
→ Status: DELIVERED

// 6. Customer/Admin marks as completed
POST /api/v1/order/{id}/status/complete
→ Status: COMPLETED
```

---

## 🏗️ ARCHITECTURE DECISION: Why Fix Order Status FIRST?

### ❌ PROBLEM: Old Design Was Tightly Coupled

```
┌─────────────────────────────────────────────────┐
│             Old Architecture                    │
├─────────────────────────────────────────────────┤
│                                                 │
│   OrderService ←─┬─→ PaymentService           │
│         │         │          │                  │
│         └─────────┴──────────┘                  │
│              Circular dependency                │
│                                                 │
│   - Order status logic mixed with payment      │
│   - COD and Online payment not separated       │
│   - PAID(0) < PENDING(1) caused logic errors   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Problems:**
1. **OrderStatusService** had special case for `PAID(0)`
2. **ZalopayService** directly manipulated order status
3. **COD flow** broke because logic assumed payment required
4. **State transitions** not validated → data corruption
5. **Hard to test** - had to mock payment to test orders

---

### ✅ SOLUTION: Clean Architecture with Proper Separation

```
┌─────────────────────────────────────────────────┐
│           New Architecture                      │
├─────────────────────────────────────────────────┤
│                                                 │
│         OrderStateMachine (Domain Logic)       │
│                     ▲                           │
│                     │                           │
│         ┌───────────┴───────────┐              │
│         │                       │              │
│  OrderStatusService      OrderSecurityService  │
│         ▲                       ▲              │
│         │                       │              │
│  ┌──────┴────────┐       ┌─────┴──────┐      │
│  │               │       │            │      │
│  Order          Payment  │     Security      │
│  Controller     Service  │     Layer         │
│                          │                   │
│  - Order status is independent              │
│  - Payment service calls order service      │
│  - COD and Online payment use same flow     │
│  - State machine enforces business rules    │
│                                             │
└─────────────────────────────────────────────┘
```

**Benefits:**
1. ✅ **Order Status is independent** - can create/test orders without payment
2. ✅ **Payment calls Order** - one-way dependency (Payment → Order)
3. ✅ **State Machine** enforces business rules
4. ✅ **COD works** - PENDING_PAYMENT → CONFIRMED (skip PAID)
5. ✅ **Easy to test** - mock state machine, not payment gateway

---

### 🎯 Why Order Status MUST be Fixed First

#### Reason 1: Foundation Layer

```
Layer 4: Presentation (Controller)
   ↓
Layer 3: Application (Security, Validation)
   ↓
Layer 2: Business Logic (Order Status ← YOU ARE HERE)
   ↓
Layer 1: Persistence (Database)
```

**Order Status is Layer 2** - if broken, everything above it breaks too!

---

#### Reason 2: Dependency Direction

```
┌──────────┐         ┌──────────┐
│ Payment  │────────>│  Order   │
│ Service  │ depends │  Status  │
└──────────┘    on   └──────────┘
```

Payment Service **depends on** Order Status Service:
- After payment succeeds → call `orderStatusService.markAsPaid()`
- If payment fails → call `orderStatusService.cancelOrder()`

**If Order Status is broken, Payment Service cannot work!**

---

#### Reason 3: COD is Blocking Business

```
Current Situation:
- COD orders cannot be processed ← BLOCKING REVENUE!
- Online payment may or may not work
- Need to unblock COD ASAP

If we fix Payment first:
- COD still broken (doesn't use payment anyway)
- Online payment might work
- Still BLOCKING REVENUE!

If we fix Order Status first:
- COD works immediately ← UNBLOCK REVENUE! ✅
- Online payment may have issues but can fallback to COD
- Can fix Payment Service without time pressure
```

**Business Impact:** 
- COD orders = 60-70% of e-commerce in Vietnam
- Fixing Order Status unblocks majority of revenue!

---

#### Reason 4: Blast Radius

```
Fixing Order Status:
- Changes: OrderStatus enum, OrderStatusService, Controller
- Risk: Medium
- Rollback: Easy (just redeploy old code)
- Testing: Can test without payment gateway

Fixing Payment Service:
- Changes: Payment code + Order Status + Integration tests
- Risk: High (affects real money transactions)
- Rollback: Hard (may have pending payments)
- Testing: Need sandbox/mock payment gateway
```

**Smaller blast radius = safer deployment**

---

## 📊 TESTING STRATEGY FOR COD

### Unit Tests

```java
@Test
void codOrder_skipsPaidStatus() {
    // Create COD order
    ShopOrder order = createOrder(paymentType = COD);
    assertThat(order.getCurrentStatus()).isEqualTo(PENDING_PAYMENT);
    
    // Admin confirms (skip PAID)
    statusService.confirmOrder(order.getId(), "COD approved");
    assertThat(order.getCurrentStatus()).isEqualTo(CONFIRMED);
    
    // Verify PAID was never set
    List<ShopOrderStatus> history = getStatusHistory(order.getId());
    assertThat(history).noneMatch(s -> s.getStatus() == PAID.id);
}
```

### Integration Tests

```java
@Test
@Sql("/test-data/cod-orders.sql")
void codOrderFullFlow() {
    // 1. Create order
    ShopOrder order = createCODOrder();
    
    // 2. Admin confirms
    mockMvc.perform(post("/api/v1/order/{id}/status/confirm", order.getId())
        .with(adminAuth()))
        .andExpect(status().isOk());
    
    // 3. Prepare
    mockMvc.perform(post("/api/v1/order/{id}/status/prepare", order.getId())
        .with(adminAuth()))
        .andExpect(status().isOk());
    
    // 4. Ship
    mockMvc.perform(post("/api/v1/order/{id}/status/ship", order.getId())
        .with(adminAuth()))
        .andExpect(status().isOk());
    
    // 5. Deliver
    mockMvc.perform(post("/api/v1/order/{id}/status/deliver", order.getId())
        .with(adminAuth()))
        .andExpect(status().isOk());
    
    // 6. Complete
    mockMvc.perform(post("/api/v1/order/{id}/status/complete", order.getId())
        .with(userAuth(order.getUserId())))
        .andExpect(status().isOk());
    
    // Verify final status
    ShopOrder finalOrder = orderRepository.findById(order.getId()).get();
    assertThat(finalOrder.getCurrentStatus()).isEqualTo(COMPLETED);
}
```

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Fix Order Status (NOW) ✅

**Changes:**
- New OrderStatus enum
- OrderStateMachine
- OrderStatusService refactored
- OrderSecurityService added
- Controller endpoints updated

**Testing:**
- Unit tests for state machine
- Integration tests for COD flow
- Manual testing with Postman

**Deploy:**
- Deploy to staging
- Run COD order end-to-end
- Monitor logs for errors
- Deploy to production

**Success Criteria:**
- ✅ COD orders can be created
- ✅ Admin can confirm COD orders
- ✅ Orders can progress through full lifecycle
- ✅ Invalid transitions are blocked

---

### Phase 2: Update Payment Service (NEXT)

**Changes:**
- Update ZalopayService to use new methods
- Replace direct status manipulation
- Add idempotency for callbacks
- Add better error handling

**Testing:**
- Sandbox payment testing
- Mock callback testing
- Integration with Order Status

**Deploy:**
- Deploy to staging
- Test online payment flow
- Verify callback handling
- Deploy to production

---

### Phase 3: Add Advanced Features (FUTURE)

- Inventory management
- Order analytics
- Automated status updates
- Webhook for order events
- Return/refund flow

---

## 📝 SUMMARY

| Aspect | Why Order Status First? |
|--------|------------------------|
| **Business** | COD = 60-70% revenue, currently blocked |
| **Architecture** | Order Status is foundation layer |
| **Dependencies** | Payment depends on Order, not reverse |
| **Risk** | Lower blast radius, easier rollback |
| **Testing** | Can test without payment gateway |
| **Time** | Unblocks business immediately |

**Conclusion:** Fix Order Status first is the ONLY correct approach!

---

## 🔗 RELATED DOCUMENTS

- `ORDER_STATUS_MIGRATION_GUIDE.md` - How to migrate
- `FIXING_403_FORBIDDEN_ERROR.md` - Authorization troubleshooting
- `OrderStateMachine.java` - State transition rules
- `ShopOrderController.java` - API endpoints


# 🔒 FIXING 403 FORBIDDEN ERROR - TROUBLESHOOTING GUIDE

## ❓ Vì sao có Token hợp lệ nhưng vẫn bị 403?

**HTTP 403 Forbidden** khác với **401 Unauthorized**:
- **401**: Token không có, sai, hoặc hết hạn → "Bạn chưa đăng nhập"
- **403**: Token hợp lệ nhưng không đủ quyền → "Bạn không được phép làm việc này"

---

## 🔍 NGUYÊN NHÂN THƯỜNG GẶP

### 1. **Role/Authority Mismatch**

**Vấn đề:**
```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")  // Expect "ROLE_ADMIN"
```

Nhưng token chứa:
```json
{
  "authorities": ["ADMIN"]  // Missing "ROLE_" prefix!
}
```

**Nguyên nhân:**
- Spring Security mặc định thêm prefix "ROLE_" cho roles
- JWT có thể store "ADMIN" hoặc "ROLE_ADMIN"
- Nếu không match → 403

**Cách fix:**
```java
// Option 1: Check both variants
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")

// Option 2: Use hasRole (auto adds ROLE_ prefix)
@PreAuthorize("hasRole('ADMIN')")  // Will check for "ROLE_ADMIN"
```

---

### 2. **SpEL Expression Evaluation Failure**

**Vấn đề:**
```java
@PreAuthorize("@orderSecurityService.canCancel(#orderId, authentication)")
```

Nhưng:
- `orderSecurityService` bean không tồn tại
- Method `canCancel` throw exception
- `authentication` object null hoặc sai type

**Debug:**
```java
@Service("orderSecurityService")  // ← Must match @PreAuthorize bean name!
public class OrderSecurityService {
    public boolean canCancel(Integer orderId, Authentication authentication) {
        try {
            // Your logic
            return true;
        } catch (Exception e) {
            log.error("Authorization check failed", e);
            return false;  // Don't throw! Return false instead
        }
    }
}
```

---

### 3. **Authentication Principal Type Mismatch**

**Vấn đề:**
```java
@PreAuthorize("#order.user.id == authentication.principal.userId")
```

Nhưng `authentication.principal` không có field `userId`

**Debug:**
```java
// Check what principal actually is
Object principal = SecurityContextHolder.getContext()
    .getAuthentication()
    .getPrincipal();
    
System.out.println("Principal type: " + principal.getClass().getName());
System.out.println("Principal content: " + principal);
```

**Fix:**
```java
// Ensure your IUserDetail interface has getUserId()
public interface IUserDetail {
    Integer getUserId();
    String getUsername();
    // ...
}
```

---

### 4. **Order Ownership Check Failing**

**Vấn đề:**
User cannot access their own order

**Nguyên nhân:**
```java
// In OrderSecurityService
Integer userId = getUserId(authentication);  // Returns null!
return order.getUserId().equals(userId);     // NPE or always false
```

**Fix:**
```java
private Integer getUserId(Authentication authentication) {
    if (authentication == null) return null;
    
    Object principal = authentication.getPrincipal();
    
    // Method 1: Cast to IUserDetail
    if (principal instanceof IUserDetail) {
        return ((IUserDetail) principal).getUserId();
    }
    
    // Method 2: Use reflection as fallback
    try {
        Method method = principal.getClass().getMethod("getUserId");
        return (Integer) method.invoke(principal);
    } catch (Exception e) {
        log.error("Cannot extract userId from principal", e);
        return null;
    }
}
```

---

## 🔧 STEP-BY-STEP DEBUGGING

### Step 1: Verify Token is Valid

```bash
# Get token from login
TOKEN="your_jwt_token_here"

# Decode token (use jwt.io or command line)
echo $TOKEN | cut -d. -f2 | base64 -d | jq
```

Check:
- ✅ Token not expired (`exp` claim)
- ✅ Has `sub` (username)
- ✅ Has `authorities` array

---

### Step 2: Check What Authorities User Has

Add logging in your code:

```java
@GetMapping("/debug/auth")
public Map<String, Object> debugAuth() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    
    return Map.of(
        "authenticated", auth != null && auth.isAuthenticated(),
        "principal", auth != null ? auth.getPrincipal().toString() : "null",
        "authorities", auth != null ? 
            auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()) 
            : List.of()
    );
}
```

Call:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8085/api/v1/debug/auth
```

Expected output:
```json
{
  "authenticated": true,
  "principal": "user@example.com",
  "authorities": ["ROLE_USER", "ROLE_ADMIN"]
}
```

---

### Step 3: Check @PreAuthorize Expression

**Enable debug logging:**

```yaml
# application.yml
logging:
  level:
    org.springframework.security: DEBUG
```

Look for logs like:
```
Voting on...PreInvocationAuthorizationAdviceVoter
Expression: @orderSecurityService.canCancel(#orderId, authentication)
Result: DENIED
```

---

### Step 4: Test Authorization Service Directly

```java
@Autowired
private OrderSecurityService orderSecurityService;

@GetMapping("/debug/can-cancel/{orderId}")
public Map<String, Object> debugCanCancel(@PathVariable Integer orderId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    
    boolean canCancel = orderSecurityService.canCancel(orderId, auth);
    
    return Map.of(
        "orderId", orderId,
        "canCancel", canCancel,
        "userId", getUserId(auth),
        "authorities", getAuthorities(auth)
    );
}
```

---

## 🎯 COMMON FIXES FOR ORDER MANAGEMENT

### Fix 1: Update @PreAuthorize to handle both role formats

```java
// OLD (can fail)
@PreAuthorize("hasAuthority('ROLE_ADMIN')")

// NEW (works with both)
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
```

---

### Fix 2: Ensure OrderSecurityService is properly registered

```java
@Service("orderSecurityService")  // ← Name must match SpEL reference!
@AllArgsConstructor
public class OrderSecurityService {
    // ...
}
```

---

### Fix 3: Handle null/missing userId gracefully

```java
public boolean canView(Integer orderId, Authentication authentication) {
    if (authentication == null) {
        log.warn("Authentication is null for order {}", orderId);
        return false;
    }
    
    Integer userId = getUserId(authentication);
    if (userId == null) {
        log.warn("Cannot extract userId from authentication for order {}", orderId);
        return false;  // Fail closed (deny access)
    }
    
    // Continue with authorization check...
}
```

---

### Fix 4: Add Global Exception Handler

```java
@RestControllerAdvice
public class SecurityExceptionHandler {
    
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, Object> handleAccessDenied(AccessDeniedException ex) {
        log.error("Access denied: {}", ex.getMessage());
        
        return Map.of(
            "error", "FORBIDDEN",
            "message", "You don't have permission to access this resource",
            "detail", ex.getMessage(),
            "timestamp", System.currentTimeMillis()
        );
    }
}
```

---

## 📋 CHECKLIST: Before Deploying

- [ ] All endpoints have proper @PreAuthorize
- [ ] Bean names match SpEL references
- [ ] getUserId() method works correctly
- [ ] Both "ROLE_ADMIN" and "ADMIN" handled
- [ ] Null checks for authentication/principal
- [ ] Logging added for debugging
- [ ] Exception handling for authorization failures
- [ ] Integration tests for authorization

---

## 🧪 TEST CASES

### Test 1: User can view own order
```bash
USER_TOKEN="..."
ORDER_ID="123"  # User's order

curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:8085/api/v1/order/$ORDER_ID

# Expected: 200 OK
```

### Test 2: User cannot view other's order
```bash
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:8085/api/v1/order/999  # Someone else's order

# Expected: 403 FORBIDDEN
```

### Test 3: User can cancel own order
```bash
curl -X POST \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Changed mind"}' \
  http://localhost:8085/api/v1/order/$ORDER_ID/cancel

# Expected: 200 OK
```

### Test 4: User cannot confirm order (admin only)
```bash
curl -X POST \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:8085/api/v1/order/$ORDER_ID/status/confirm

# Expected: 403 FORBIDDEN
```

### Test 5: Admin can confirm any order
```bash
ADMIN_TOKEN="..."

curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8085/api/v1/order/$ORDER_ID/status/confirm

# Expected: 200 OK
```

---

## 💡 PRO TIPS

1. **Always check token in jwt.io** first - saves hours of debugging
2. **Use `hasAnyAuthority`** instead of `hasAuthority` for flexibility
3. **Log everything** during development, remove sensitive logs in production
4. **Fail closed** - when in doubt, deny access (return `false`)
5. **Test with different users** - don't just test with admin
6. **Use @WithMockUser** in tests to simulate different roles

---

## 🔗 RELATED FILES

- `OrderSecurityService.java` - Authorization logic
- `ShopOrderController.java` - @PreAuthorize annotations
- `SecurityConfig.java` - Spring Security configuration
- `JwtProvider.java` - JWT token generation/validation


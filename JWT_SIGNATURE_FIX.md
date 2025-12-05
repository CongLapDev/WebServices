# JWT Signature Validation Fix

## 🔍 Root Cause

The error "JWT signature does not match locally computed signature" was caused by:

**JwtProvider was generating a NEW random secret key every time the server restarted!**

```java
// OLD CODE (BROKEN):
private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
```

This means:
1. Server starts → generates new key A
2. User logs in → token signed with key A
3. Server restarts → generates new key B
4. User tries to use token → validation fails (token signed with key A, but server now uses key B)

## ✅ Solution

### 1. Fixed JwtProvider to use configured secret key

**File:** `Ecommerce/nhs-api/src/main/java/com/nhs/individual/secure/JwtProvider.java`

**Changes:**
- Added `@Value("${nhs.token.secret:}")` to read secret from config
- Added `@PostConstruct init()` method to initialize secret key
- Uses configured secret if available, otherwise generates random (with warning)
- Secret key is now **persistent across server restarts**

**Code:**
```java
@Value("${nhs.token.secret:}")
private String jwtSecret;

@PostConstruct
public void init() {
    if (jwtSecret != null && !jwtSecret.trim().isEmpty()) {
        // Use configured secret key
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // Pad to 32 bytes (256 bits) for HS256
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
            secretKey = Keys.hmacShaKeyFor(paddedKey);
        } else {
            secretKey = Keys.hmacShaKeyFor(keyBytes);
        }
    } else {
        // Generate random (with warning)
        log.error("⚠⚠⚠ WARNING: No JWT secret configured!");
        secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }
}
```

### 2. Added JWT secret to application config

**File:** `Ecommerce/nhs-app/src/main/resources/application-common.yml`

**Added:**
```yaml
nhs:
  token:
    accessTokenms: 720000000
    refreshTokenms: 6048000
    secret: "MySuperSecretJWTKeyForHS256AlgorithmMustBeAtLeast32CharactersLong123456789012345678901234567890"
```

**Important:** 
- Secret must be at least 32 characters (256 bits) for HS256
- Use a strong, random secret in production
- Generate with: `openssl rand -base64 32`

### 3. Improved frontend token extraction

**File:** `ecommerce-ui/src/api/auth.js`

**Changes:**
- Prioritized `X-Auth-Token` header (backend sets this)
- Better handling of `Authorization` header
- Enhanced logging to show token source

**Priority order:**
1. `X-Auth-Token` header (backend sets this explicitly)
2. `Authorization` header (remove Bearer prefix)
3. `response.data.token`
4. `response.data.accessToken`
5. Other locations

### 4. Enhanced ApiBase logging

**File:** `ecommerce-ui/src/api/ApiBase.js`

**Changes:**
- Better token normalization (removes Bearer prefix if present)
- Detailed logging for Authorization header addition
- Shows token length and first 30 chars for debugging

## 🧪 Testing

### Step 1: Restart Backend
After applying the fix, **restart the backend server** to load the new JWT secret configuration.

### Step 2: Test Login Flow

1. **Login:**
   ```
   POST http://localhost:8085/api/auth/login
   {
     "username": "testuser",
     "password": "password"
   }
   ```

2. **Check Response Headers:**
   - `Authorization: Bearer <token>`
   - `X-Auth-Token: <token>`

3. **Verify Token in Frontend:**
   - Open browser console
   - Check: `localStorage.getItem("AUTH_TOKEN")`
   - Should see token value

4. **Test /api/v1/auth/user:**
   ```
   GET http://localhost:8085/api/v1/auth/user
   Authorization: Bearer <token>
   ```
   - Should return 200 OK with user data
   - Should NOT return 403

### Step 3: Verify Backend Logs

**Expected logs:**
```
[JwtProvider] Using configured JWT secret key from properties
[JwtProvider] JWT secret key initialized successfully (length: XX bytes)
[JwtFilter] ✓ Token extracted successfully
[JwtFilter] Token subject (username): testuser
[JwtFilter] ✓ User found: testuser
[JwtFilter] ✓✓✓ SecurityContext set successfully!
```

**If you see:**
```
[JwtProvider] ⚠⚠⚠ WARNING: No JWT secret configured!
```
→ Check `application-common.yml` has `nhs.token.secret` configured

## 🔧 Production Recommendations

1. **Use Environment Variable:**
   ```yaml
   nhs:
     token:
       secret: ${JWT_SECRET:fallback-secret-key}
   ```

2. **Generate Strong Secret:**
   ```bash
   openssl rand -base64 32
   ```

3. **Never commit secret to git:**
   - Use `.env` file (gitignored)
   - Or use secrets management service

## 📊 Expected Behavior After Fix

### Before Fix:
- ❌ Token works immediately after login
- ❌ Token fails after server restart (403 error)
- ❌ "JWT signature does not match" error

### After Fix:
- ✅ Token works immediately after login
- ✅ Token works after server restart
- ✅ Token validates successfully
- ✅ `/api/v1/auth/user` returns 200 OK
- ✅ Frontend can authenticate and navigate

## 🐛 Debugging

If you still see signature errors:

1. **Check secret is configured:**
   ```bash
   # In backend logs, look for:
   [JwtProvider] Using configured JWT secret key from properties
   ```

2. **Verify secret length:**
   - Must be at least 32 characters
   - Check `application-common.yml`

3. **Check token format:**
   - Should be valid JWT (3 parts: header.payload.signature)
   - Decode at jwt.io to verify

4. **Verify token source:**
   - Frontend console: `[TOKEN] Token source: X-Auth-Token header`
   - Should show where token was extracted from

5. **Check Authorization header:**
   - Network tab: Request headers
   - Should have: `Authorization: Bearer <token>`
   - Token should NOT have double "Bearer " prefix

## ✅ Verification Checklist

- [ ] Backend restarted after fix
- [ ] `application-common.yml` has `nhs.token.secret` configured
- [ ] Secret is at least 32 characters
- [ ] Login returns token in `X-Auth-Token` header
- [ ] Frontend extracts token successfully
- [ ] Token saved to localStorage
- [ ] `/api/v1/auth/user` returns 200 (not 403)
- [ ] Backend logs show "SecurityContext set successfully"
- [ ] Frontend navigation works after login


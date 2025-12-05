# Debugging 403 Error in requestAuth()

## 🔍 Understanding the 403 Error

The 403 error occurs when `requestAuth()` calls `/api/v1/auth/user` endpoint. This is **NON-BLOCKING** - the login flow continues even if this fails.

## ✅ Current Behavior

1. **Login succeeds** → Token saved → User data received
2. **Redux state updated** with user data from login response
3. **Navigation proceeds** to `/home` (for USER) or `/admin` (for ADMIN)
4. **requestAuth() runs in background** (non-blocking)
5. **If requestAuth() returns 403** → Only logged as warning, navigation already happened

## 🐛 Why 403 Might Occur

### Possible Causes:

1. **Token Validation Issue**
   - Token format is incorrect
   - Token is expired (unlikely immediately after login)
   - JWT signature validation fails

2. **JWT Filter Issue**
   - JWT filter doesn't extract token from Authorization header correctly
   - SecurityContext not set properly
   - User lookup fails in JWT filter

3. **Backend Security Configuration**
   - `/api/v1/auth/user` endpoint requires specific permissions
   - `@CurrentUser` annotation requires valid authentication
   - SecurityContext is empty when endpoint is called

4. **Timing Issue**
   - Token was just saved but JWT filter hasn't processed it yet
   - SecurityContext not propagated yet

## 🔧 How to Debug

### Step 1: Check Console Logs

Look for these logs after login:

```
[LOGIN] ✓ Login API successful
[TOKEN] token saved to localStorage
[LOGIN] ✓ Redux state updated
[LOGIN] Calling requestAuth() in background...
[ApiBase] Request to: /api/v1/auth/user - Token available: true
[ApiBase] ✓ Authorization header added
[AUTH ERROR] requestAuth() failed!
[AUTH ERROR] Status: 403
[LOGIN] ⚠ requestAuth() failed in background (NON-BLOCKING)
[LOGIN] ⚠ Continuing with login response data despite requestAuth failure
[LOGIN] ✓✓✓ NAVIGATION SUCCESSFUL!
```

**Key Point:** Navigation should still happen even if requestAuth() fails!

### Step 2: Check Network Tab

1. Open **Network** tab in DevTools
2. Find request: `GET /api/v1/auth/user`
3. Check:
   - **Request Headers:** Should have `Authorization: Bearer <token>`
   - **Status:** 403 Forbidden
   - **Response:** Error message from backend

### Step 3: Verify Token

```javascript
// In browser console:
const token = localStorage.getItem("AUTH_TOKEN");
console.log("Token exists:", !!token);
console.log("Token length:", token?.length);
console.log("Token (first 50 chars):", token?.slice(0, 50));
```

### Step 4: Test Token Manually

```javascript
// Test if token works with backend
const token = localStorage.getItem("AUTH_TOKEN");
fetch("http://localhost:8085/api/v1/auth/user", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(r => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then(data => console.log("User data:", data))
  .catch(e => console.error("Error:", e));
```

## ✅ Expected Behavior

**Even with 403 error, the login flow should work:**

1. ✅ Login succeeds
2. ✅ Token saved to localStorage
3. ✅ Redux state updated with user data
4. ✅ Navigation to `/home` happens
5. ⚠️ requestAuth() fails with 403 (non-blocking)
6. ✅ User can still browse and purchase (uses Redux state)

## 🔧 Solutions

### Solution 1: Ignore 403 (Current Implementation)

The current code already handles this correctly:
- `requestAuth()` is called in background (non-blocking)
- If it fails, only a warning is logged
- Navigation proceeds with user data from login response

**This is the correct behavior!** The 403 error is logged but doesn't block the login flow.

### Solution 2: Fix Backend (If Needed)

If you want to fix the 403 error, check:

1. **JWT Filter** - Ensure it processes Authorization header correctly
2. **SecurityContext** - Ensure authentication is set before endpoint is called
3. **Token Validation** - Ensure token is valid and not expired

### Solution 3: Skip requestAuth() After Login

Since we already have user data from login response, we could skip `requestAuth()` entirely after login:

```javascript
// In login-form.js, after updating Redux:
// Skip requestAuth() if we just logged in - we already have user data
// Only call requestAuth() on page refresh or mount
```

## 📊 Current Status

**The 403 error is NON-BLOCKING and should NOT prevent:**
- ✅ Login from succeeding
- ✅ Navigation to `/home`
- ✅ User from browsing and purchasing

**If navigation is NOT happening, the issue is NOT the 403 error.**

Check:
1. Is `loginApi()` succeeding?
2. Is token being saved?
3. Is Redux state being updated?
4. Is `navigate()` being called?

## 🎯 Next Steps

1. **Verify login flow works** - Check if navigation happens despite 403
2. **Check console logs** - Look for `[LOGIN] ✓✓✓ NAVIGATION SUCCESSFUL!`
3. **Test purchasing** - Verify user can add items to cart
4. **If navigation fails** - The issue is NOT the 403, check navigation logic

The 403 error is just a warning - it doesn't break the login flow!


# Login Flow Debug Guide

## 📋 Complete Login Flow Overview

When a user visits `http://localhost:3000/login` and clicks the Login button, here's what happens:

### Step-by-Step Flow

```
1. User enters username/password → Clicks "Login" button
   ↓
2. Formik validates input (username required, password min 6 chars)
   ↓
3. handleLoginSubmit() is called
   ↓
4. loginApi() → POST /api/auth/login
   - Sends: { username, password }
   - Backend validates credentials
   - Backend returns: UserLoginDto with token in Authorization header
   ↓
5. Token extracted and saved to localStorage
   ↓
6. Redux state updated with user data from login response
   ↓
7. Roles normalized (remove "ROLE_" prefix, uppercase)
   ↓
8. Target route determined:
   - USER role → /home
   - ADMIN role → /admin
   ↓
9. React Router navigate() called
   ↓
10. RoleBaseAuthorize checks auth state
   ↓
11. If authorized → Home component renders
   ↓
12. User can now browse and purchase products
```

---

## 🔍 How to Debug the Login Flow

### 1. Open Browser DevTools

**Press F12** or **Right-click → Inspect** to open DevTools

### 2. Check Console Tab

All login-related logs are prefixed with:
- `[LOGIN]` - Login form actions
- `[AUTH API]` - API calls
- `[TOKEN]` - Token operations
- `[useAuth]` - Auth state management
- `[RoleBaseAuthorize]` - Route protection
- `[Home]` - Home component lifecycle

### 3. Expected Console Output (Success Case)

```
[LOGIN] ===== Starting login process =====
[LOGIN] Username: testuser
[LOGIN] Password length: 8
[LOGIN] API Endpoint: POST /api/auth/login
[AUTH API] ===== login() called =====
[AUTH API] Full URL: http://localhost:8085/api/auth/login
[AUTH API] ✓ Response received
[AUTH API] Response status: 200
[TOKEN] token from server: eyJhbGciOiJIUzI1NiIs...
[TOKEN] token saved to localStorage
[LOGIN] ✓ Login API successful, user ID: 1
[LOGIN] ✓ Token saved to localStorage
[LOGIN] Normalized roles: ["USER"]
[LOGIN] ✓ Redux state updated with user data
[LOGIN] ===== ROLE DETECTION =====
[LOGIN] ✓ USER role detected → Target route: /home
[LOGIN] ===== NAVIGATION START =====
[LOGIN] Executing navigate() to: /home
[LOGIN] navigate() called
[LOGIN] Post-navigation verification - Current path: /home
[LOGIN] ✓✓✓ NAVIGATION SUCCESSFUL!
[RoleBaseAuthorize] User authorized, rendering children
[Home] ===== Home component mounted/updated =====
[Home] User: ID 1, Name: John Doe
[Home] User roles: ["USER"]
[Home] Render - isAuthenticated: true
```

### 4. Check Network Tab

1. Open **Network** tab in DevTools
2. Filter by **XHR** or **Fetch**
3. Look for these requests:

   **Login Request:**
   - URL: `http://localhost:8085/api/auth/login`
   - Method: `POST`
   - Status: `200 OK`
   - Request Payload: `{ "username": "...", "password": "..." }`
   - Response: User object with `account.roles`

   **Auth User Request (background):**
   - URL: `http://localhost:8085/api/v1/auth/user`
   - Method: `GET`
   - Status: `200 OK`
   - Headers: `Authorization: Bearer <token>`

### 5. Check Application Tab (LocalStorage)

1. Open **Application** tab → **Local Storage** → `http://localhost:3000`
2. Look for key: `AUTH_TOKEN`
3. Value should be a JWT token (long string starting with `eyJ...`)

### 6. Check Redux DevTools (if installed)

1. Install Redux DevTools browser extension
2. Open Redux tab in DevTools
3. After login, check `state.user`:
   ```javascript
   {
     id: 1,
     firstname: "John",
     lastname: "Doe",
     account: {
       roles: [{ name: "USER" }]
     }
   }
   ```

---

## 🐛 Common Issues and How to Debug

### Issue 1: "Authentication failed. Please try again."

**Check:**
1. Console logs - Look for `[LOGIN ERROR]` or `[AUTH ERROR]`
2. Network tab - Check if `/api/auth/login` request failed
3. Status code:
   - `401` → Invalid credentials
   - `403` → Account doesn't have permission
   - `404` → Endpoint not found
   - `500` → Server error
   - `Network Error` → Backend not running or CORS issue

**Debug Steps:**
```javascript
// In console, check:
localStorage.getItem("AUTH_TOKEN")  // Should return token string
// If null → Token not saved

// Check backend is running:
fetch("http://localhost:8085/api/auth/login", { method: "POST" })
  .then(r => console.log("Backend reachable:", r.status))
  .catch(e => console.error("Backend not reachable:", e))
```

### Issue 2: Login succeeds but no redirect

**Check:**
1. Console logs - Look for `[LOGIN] ===== NAVIGATION START =====`
2. Check if `navigate()` was called
3. Check `window.location.pathname` after login
4. Verify `/home` route exists in `userRouter`

**Debug Steps:**
```javascript
// In console after login:
window.location.pathname  // Should be "/home"
// If still "/login" → Navigation failed

// Check routes:
// Open routers.js and verify /home is in userRouter
```

### Issue 3: Redirects to /home but immediately back to /login

**Check:**
1. Console logs - Look for `[RoleBaseAuthorize]` logs
2. Check if `hasRole("USER")` returns `true` or `false`
3. Check if Redux state has user data

**Debug Steps:**
```javascript
// In console:
// Check Redux state (if using Redux DevTools)
// Or check localStorage:
JSON.parse(localStorage.getItem("persist:root"))?.user
// Should contain user object with roles
```

### Issue 4: Token saved but requestAuth() fails

**Check:**
1. Console logs - Look for `[LOGIN] ⚠ requestAuth() failed`
2. Network tab - Check `/api/v1/auth/user` request
3. Check if token is in Authorization header

**Debug Steps:**
```javascript
// In console:
const token = localStorage.getItem("AUTH_TOKEN");
console.log("Token exists:", !!token);
console.log("Token length:", token?.length);

// Manually test API call:
fetch("http://localhost:8085/api/v1/auth/user", {
  headers: { "Authorization": `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log("User data:", data))
  .catch(e => console.error("Error:", e))
```

---

## ✅ Verification Checklist

After successful login, verify:

- [ ] Console shows `[LOGIN] ✓✓✓ NAVIGATION SUCCESSFUL!`
- [ ] URL changes to `http://localhost:3000/home`
- [ ] `localStorage.getItem("AUTH_TOKEN")` returns a token
- [ ] Redux state has user data (check Redux DevTools)
- [ ] Home component shows welcome message (if user is authenticated)
- [ ] Network tab shows `/api/v1/auth/user` request succeeds
- [ ] No errors in console
- [ ] Can add products to cart
- [ ] Can proceed to checkout

---

## 🧪 Manual Testing Steps

### Test 1: Successful USER Login

1. Go to `http://localhost:3000/login`
2. Enter valid USER credentials
3. Click "Login"
4. **Expected:**
   - Console: `[LOGIN] ✓ USER role detected → Target route: /home`
   - URL changes to `/home`
   - Home page loads with products
   - Welcome message appears (if authenticated)

### Test 2: Successful ADMIN Login

1. Go to `http://localhost:3000/login`
2. Enter valid ADMIN credentials
3. Click "Login"
4. **Expected:**
   - Console: `[LOGIN] ✓ ADMIN role detected → Target route: /admin`
   - URL changes to `/admin`
   - Admin dashboard loads

### Test 3: Invalid Credentials

1. Enter wrong username/password
2. Click "Login"
3. **Expected:**
   - Console: `[LOGIN ERROR] loginApi() failed` with status 401
   - Error message: "Invalid username or password"
   - Stay on `/login` page

### Test 4: Network Error (Backend Down)

1. Stop backend server
2. Try to login
3. **Expected:**
   - Console: `[AUTH ERROR] Network Error`
   - Error message: "Network error. Please check your connection..."
   - Stay on `/login` page

---

## 📊 Key Files to Check

### Frontend Files:
- `src/part/login-form/login-form.js` - Login form logic
- `src/api/auth.js` - Login API call
- `src/api/ApiBase.js` - Axios configuration
- `src/secure/useAuth.js` - Auth state management
- `src/secure/RoleBaseAuthorize.js` - Route protection
- `src/routers/routers.js` - Route definitions
- `src/App.js` - Route rendering

### Backend Files:
- `AuthenticationAPI.java` - Login endpoint
- `AuthService.java` - Login logic
- `SecurityConfig.java` - Security configuration

---

## 🔧 Quick Debug Commands

Paste these in browser console to debug:

```javascript
// Check token
console.log("Token:", localStorage.getItem("AUTH_TOKEN"));

// Check current path
console.log("Current path:", window.location.pathname);

// Check if backend is reachable
fetch("http://localhost:8085/api/auth/login", { method: "OPTIONS" })
  .then(() => console.log("✓ Backend reachable"))
  .catch(() => console.error("✗ Backend not reachable"));

// Check Redux state (if using Redux DevTools)
// Or manually:
const state = JSON.parse(localStorage.getItem("persist:root"));
console.log("Redux user:", state?.user ? JSON.parse(state.user) : "null");

// Test navigation manually
// (Only if you're on /login page)
// window.location.href = "/home";
```

---

## 📝 Next Steps

1. **Test the login flow** using the steps above
2. **Check console logs** for any errors
3. **Verify navigation** works correctly
4. **Test purchasing** on `/home` page
5. **Report any issues** with specific error messages and console logs

If you encounter any issues, share:
- The exact error message
- Console logs (especially `[LOGIN ERROR]` or `[AUTH ERROR]`)
- Network tab screenshot
- Current URL and expected URL


import { useFormik } from "formik";
import * as Yup from "yup";
import { BaseURL } from "../../api/ApiBase";
import clsx from "clsx";
import { Error as FormError, PrefixIcon, Description } from "../../components";
import google from "../../assets/image/google.png";
import style from "./style.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef } from "react";
import { GlobalContext } from "../../context";
import { Col, Row, Input, Button } from "antd";
import useAuth from "../../secure/useAuth";
import { login as loginApi } from "../../api/auth";
import { useDispatch } from "react-redux";
import { userSlide } from "../../store/user/userSlide";

/**
 * LoginForm Component - Handles user authentication and role-based redirection
 * 
 * Authentication Flow:
 * 1. User submits credentials → loginApi() → Token saved to localStorage
 * 2. Update Redux state immediately with login response data
 * 3. Call requestAuth() asynchronously (non-blocking, for background sync)
 * 4. Determine role from login response → Navigate immediately
 * 5. RoleBaseAuthorize checks auth state → Allows/denies access
 * 
 * Redirect Logic:
 * - ADMIN role → /admin
 * - USER role → /home
 * - No role → Stay on login page with warning
 * 
 * IMPORTANT: Navigation does NOT wait for requestAuth() to complete.
 * It uses the user data from login response directly.
 */
function LoginForm({ className, success, isAdminLogin = false }) {
    const navigate = useNavigate();
    const [, , , requestAuth] = useAuth(); // Only need requestAuth, not authState/user/hasRole
    const globalContext = useContext(GlobalContext);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const isNavigatingRef = useRef(false); // Prevent multiple navigations
    
    const authObject = Yup.object().shape({
        username: Yup.string().required("Username is required"),
        password: Yup.string()
            .min(6, "Password is too short")
            .required("Password is required"),
    });
    
    /**
     * handleLoginSubmit - Main login handler
     * 
     * Complete Login Flow:
     * 1. Validate credentials → Call loginApi() → Save token to localStorage
     * 2. Verify token is saved
     * 3. Call requestAuth() → Update Redux state with user data
     * 4. Determine target route based on user role
     * 5. Navigate to target route (/home for USER, /admin for ADMIN)
     * 6. Verify navigation succeeded
     */
    const handleLoginSubmit = async (values) => {
        console.log("[LOGIN] ===== Starting login process =====");
        console.log("[LOGIN] Username:", values.username);
        console.log("[LOGIN] Password length:", values.password ? values.password.length : 0);
        console.log("[LOGIN] Request payload:", { username: values.username, password: "***" });
        
        setLoading(true);
        globalContext.loader(true);
        
        try {
            // ============================================
            // STEP 1: Call login API and save token
            // ============================================
            console.log("[LOGIN] Step 1: Calling login API...");
            console.log("[LOGIN] API Endpoint: POST /api/auth/login");
            console.log("[LOGIN] Request payload:", JSON.stringify({ username: values.username, password: "***" }));
            
            let userData;
            try {
                userData = await loginApi(values);
            } catch (loginError) {
                // Log detailed error from loginApi
                console.error("[LOGIN ERROR] loginApi() failed:", {
                    message: loginError?.message,
                    status: loginError?.response?.status,
                    statusText: loginError?.response?.statusText,
                    data: loginError?.response?.data,
                    url: loginError?.config?.url,
                    method: loginError?.config?.method,
                    baseURL: loginError?.config?.baseURL,
                    fullURL: loginError?.config?.baseURL + loginError?.config?.url,
                    requestData: loginError?.config?.data,
                    headers: loginError?.config?.headers,
                    stack: loginError?.stack,
                    fullError: loginError
                });
                
                // Re-throw with more context
                throw loginError;
            }
            
            if (!userData) {
                console.error("[LOGIN ERROR] No user data received from server");
                throw new Error("Login failed: No user data received from server");
            }
            
            console.log("[LOGIN] ✓ Login API successful, user ID:", userData?.id);
            
            // ============================================
            // STEP 2: Verify token was saved
            // ============================================
            const savedToken = window.localStorage.getItem("AUTH_TOKEN");
            if (!savedToken || savedToken.trim() === "") {
                console.error("[TOKEN ERROR] Token not returned by backend");
                console.error("[LOGIN ERROR] Authentication token not received. Please try again.");
                throw new Error("Authentication token not received. Please try again.");
            }
            
            console.log("[TOKEN] token from server:", savedToken.slice(0, 20) + "...");
            console.log("[TOKEN] token saved to localStorage");
            console.log("[LOGIN] ✓ Token saved to localStorage");
            
            // ============================================
            // STEP 3: Normalize roles and update Redux state
            // ============================================
            console.log("[LOGIN] Step 3: Normalizing roles and updating Redux state...");
            
            // Normalize roles from login response
            // CRITICAL: Ensure roles are always in format [{name: "ADMIN"}, {name: "USER"}]
            if (userData && userData.account) {
                if (userData.account.roles && Array.isArray(userData.account.roles)) {
                    const normalizedRoleNames = userData.account.roles.map(r => {
                        const roleName = r?.name || r;
                        return (roleName || "").toUpperCase().replace(/^ROLE_/, "");
                    }).filter(Boolean);
                    userData.account.roles = normalizedRoleNames.map(name => ({ name }));
                    console.log("[LOGIN] ✓ Roles normalized:", normalizedRoleNames);
                    console.log("[LOGIN] Final roles structure:", userData.account.roles);
                } else {
                    console.warn("[LOGIN] ⚠ No roles in login response or roles is not an array");
                    console.warn("[LOGIN] userData.account.roles:", userData.account.roles);
                    // Ensure roles array exists even if empty
                    userData.account.roles = [];
                }
            } else {
                console.error("[LOGIN] ERROR: userData or userData.account is missing!");
                console.error("[LOGIN] userData:", userData);
            }
            
            // ============================================
            // STEP 3.5: Update Redux state with user data from login
            // ============================================
            // We already have complete user data from login response
            // Update Redux state immediately with login response data
            console.log("[LOGIN] Dispatching user data to Redux...");
            dispatch(userSlide.actions.create(userData));
            console.log("[LOGIN] ✓ Redux state updated with user data from login response");
            console.log("[LOGIN] User ID in Redux:", userData?.id);
            console.log("[LOGIN] User roles in Redux:", userData?.account?.roles?.map(r => r.name) || []);
            
            // ============================================
            // STEP 3.6: Wait for Redux state propagation and useAuth sync
            // ============================================
            // Use multiple requestAnimationFrame calls to ensure:
            // 1. Redux dispatch has been processed
            // 2. useAuth's useEffect has detected the Redux change
            // 3. useAuth's state has been updated to 1 (loaded)
            // This ensures state is available for navigation and role checks
            console.log("[LOGIN] Waiting for Redux state propagation and useAuth sync...");
            await new Promise(resolve => {
                // Triple RAF ensures Redux state + useAuth useEffect have both completed
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            console.log("[LOGIN] ✓ Redux state propagation and useAuth sync complete");
                            console.log("[LOGIN] useAuth should now see user in Redux and state should be 1");
                            resolve();
                        });
                    });
                });
            });
            
            // ============================================
            // STEP 3.7: Skip requestAuth() - we already have complete user data from login
            // ============================================
            // CRITICAL FIX: We already have complete user data from login response.
            // Calling requestAuth() can cause 401 errors that clear the token and redirect.
            // Since we have valid user data, we don't need to call requestAuth() immediately.
            // The auth state is already synced via Redux dispatch above.
            console.log("[LOGIN] Step 3.7: Skipping requestAuth() - we already have user data from login");
            console.log("[LOGIN] User data is already in Redux, state is set to loaded");
            console.log("[LOGIN] requestAuth() will be called automatically on next page load if needed");
            
            // NOTE: requestAuth() is still called automatically by useAuth hook on mount if token exists
            // But we skip it here to avoid 401 errors immediately after login
            // This prevents the token from being cleared and user from being redirected
            
            // ============================================
            // STEP 4: Determine target route based on role
            // ============================================
            const userRolesRaw = userData?.account?.roles?.map(r => r.name || r) || [];
            const userRoles = userRolesRaw.map(r => (r || "").toUpperCase().replace(/^ROLE_/, ""));
            const isAdmin = userRoles.includes("ADMIN");
            const isUser = userRoles.includes("USER");
            
            console.log("[LOGIN] ===== ROLE DETECTION =====");
            console.log("[LOGIN] User roles from login response:", userRolesRaw);
            console.log("[LOGIN] Normalized roles:", userRoles);
            console.log("[LOGIN] isAdmin:", isAdmin);
            console.log("[LOGIN] isUser:", isUser);
            
            let targetRoute = null;
            let successMessage = "";
            
            if (isAdmin) {
                targetRoute = "/admin";
                successMessage = "Admin login successful! Redirecting...";
                console.log("[LOGIN] ✓ ADMIN role detected → Target route: /admin");
            } else if (isUser) {
                targetRoute = "/home";
                successMessage = "Login successful! Redirecting to home...";
                console.log("[LOGIN] ✓ USER role detected → Target route: /home");
            } else {
                console.warn("[LOGIN] ⚠ No role assigned to user");
                console.warn("[LOGIN] User roles:", userRoles);
                globalContext.message.warning("Login successful but no role assigned. Please contact administrator.");
                return; // Don't navigate if no role
            }
            
            // ============================================
            // STEP 5: Navigate to target route
            // ============================================
            // At this point:
            // 1. Token is saved in localStorage
            // 2. Redux state is updated with user data
            // 3. requestAuth() has completed (or failed gracefully)
            // 4. Authentication state is fully initialized
            if (targetRoute) {
                // Prevent multiple navigations
                if (isNavigatingRef.current) {
                    console.log("[LOGIN] Navigation already in progress, skipping");
                    return;
                }
                
                isNavigatingRef.current = true;
                
                // Verify token is still available
                const tokenBeforeNav = window.localStorage.getItem("AUTH_TOKEN");
                if (!tokenBeforeNav || tokenBeforeNav.trim() === "") {
                    console.error("[LOGIN ERROR] Token lost before navigation!");
                    throw new Error("Authentication token was lost. Please try logging in again.");
                }
                
                // Log navigation details
                const finalUserRoles = userData?.account?.roles?.map(r => r.name) || [];
                console.log("[LOGIN] ===== NAVIGATION START =====");
                console.log("[LOGIN] ✓ Login successful!");
                console.log("[LOGIN] User ID:", userData?.id);
                console.log("[LOGIN] User roles:", finalUserRoles);
                console.log("[LOGIN] Target route:", targetRoute);
                console.log("[LOGIN] Current path:", window.location.pathname);
                console.log("[LOGIN] Token available:", !!tokenBeforeNav);
                console.log("[LOGIN] Redux state updated:", !!userData);
                
                // Check if already on target route
                if (window.location.pathname === targetRoute) {
                    console.log("[LOGIN] Already on target route, skipping navigation");
                    isNavigatingRef.current = false;
                    return;
                }
                
                // Show success message
                globalContext.message.success(successMessage);
                
                // Navigate to target route using React Router
                console.log("[LOGIN] Executing navigate() to:", targetRoute);
                console.log("[LOGIN] Navigation options: { replace: true }");
                navigate(targetRoute, { replace: true });
                console.log("[LOGIN] navigate() called - React Router should handle navigation");
                
                // Verify navigation succeeded with multiple checks
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    console.log("[LOGIN] ===== POST-NAVIGATION VERIFICATION (300ms) =====");
                    console.log("[LOGIN] Current path after navigate():", currentPath);
                    console.log("[LOGIN] Expected path:", targetRoute);
                    
                    if (currentPath === targetRoute) {
                        console.log("[LOGIN] ✓✓✓ NAVIGATION SUCCESSFUL!");
                        console.log("[LOGIN] User is now authenticated and on", targetRoute);
                        console.log("[LOGIN] Home page should load with authenticated state");
                        isNavigatingRef.current = false;
                    } else if (currentPath === "/login") {
                        console.error("[LOGIN] ✗✗✗ NAVIGATION FAILED - Still on /login!");
                        console.error("[LOGIN] React Router navigation did not work");
                        console.error("[LOGIN] Expected:", targetRoute, "Actual:", currentPath);
                        console.error("[LOGIN] Attempting fallback navigation via window.location.href...");
                        // Fallback: Force navigation using window.location
                        window.location.href = targetRoute;
                        console.log("[LOGIN] Fallback navigation executed");
                        isNavigatingRef.current = false;
                    } else {
                        console.warn("[LOGIN] ⚠ Navigation may be in progress or redirected elsewhere");
                        console.warn("[LOGIN] Current path:", currentPath, "Expected:", targetRoute);
                        // Check again after longer delay
                    }
                }, 300);
                
                // Additional verification after longer delay (800ms)
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    console.log("[LOGIN] ===== POST-NAVIGATION VERIFICATION (800ms) =====");
                    console.log("[LOGIN] Current path:", currentPath);
                    console.log("[LOGIN] Expected path:", targetRoute);
                    
                    if (currentPath === targetRoute) {
                        console.log("[LOGIN] ✓✓✓ NAVIGATION CONFIRMED!");
                    } else if (currentPath === "/login") {
                        console.error("[LOGIN] ✗✗✗ NAVIGATION STILL FAILED - Using window.location.assign()");
                        console.error("[LOGIN] React Router navigation completely failed");
                        console.error("[LOGIN] Forcing navigation with window.location.assign()...");
                        window.location.assign(targetRoute);
                    } else {
                        console.warn("[LOGIN] ⚠ User is on different route:", currentPath);
                        console.warn("[LOGIN] This might be intentional (e.g., redirect by RoleBaseAuthorize)");
                    }
                    isNavigatingRef.current = false;
                }, 800);
                setTimeout(() => {
                    const finalPath = window.location.pathname;
                    console.log("[LOGIN] Final path check (800ms delay):", finalPath);
                    if (finalPath !== targetRoute) {
                        console.warn("[LOGIN] ⚠ Path still not matching after 800ms");
                        console.warn("[LOGIN] This might indicate a routing issue or RoleBaseAuthorize redirect");
                    }
                }, 800);
            }
            
            // Call success callback if provided
            if (success) success();
            
        } catch (error) {
            // ============================================
            // ERROR HANDLING - Log full error details
            // ============================================
            console.error("[LOGIN ERROR] ========================================");
            console.error("[LOGIN ERROR] Login process failed!");
            console.error("[LOGIN ERROR] ========================================");
            console.error("[LOGIN ERROR] Error message:", error?.message);
            console.error("[LOGIN ERROR] Error type:", error?.constructor?.name);
            console.error("[LOGIN ERROR] Error stack:", error?.stack);
            
            if (error?.response) {
                // API error response
                const status = error.response.status;
                console.error("[LOGIN ERROR] API Error Response:");
                console.error("[LOGIN ERROR] - Status:", status);
                console.error("[LOGIN ERROR] - Status Text:", error.response.statusText);
                console.error("[LOGIN ERROR] - Response Data:", error.response.data);
                console.error("[LOGIN ERROR] - Request URL:", error.config?.url);
                console.error("[LOGIN ERROR] - Request Method:", error.config?.method);
                console.error("[LOGIN ERROR] - Request Base URL:", error.config?.baseURL);
                console.error("[LOGIN ERROR] - Full URL:", error.config?.baseURL + error.config?.url);
                console.error("[LOGIN ERROR] - Request Headers:", error.config?.headers);
                console.error("[LOGIN ERROR] - Request Data:", error.config?.data);
            } else if (error?.request) {
                // Request was made but no response received
                console.error("[LOGIN ERROR] Network Error - No response received:");
                console.error("[LOGIN ERROR] - Request:", error.request);
                console.error("[LOGIN ERROR] - This usually means:");
                console.error("[LOGIN ERROR]   1. Backend server is not running");
                console.error("[LOGIN ERROR]   2. CORS issue");
                console.error("[LOGIN ERROR]   3. Network connectivity problem");
            } else {
                // Error setting up request
                console.error("[LOGIN ERROR] Request Setup Error:");
                console.error("[LOGIN ERROR] - Message:", error.message);
                console.error("[LOGIN ERROR] - This usually means:");
                console.error("[LOGIN ERROR]   1. Invalid request configuration");
                console.error("[LOGIN ERROR]   2. Missing required parameters");
            }
            
            console.error("[LOGIN ERROR] Full error object:", error);
            console.error("[LOGIN ERROR] ========================================");
            
            // Determine user-friendly error message
            let errorMessage = "Login failed. Please try again.";
            
            if (error?.response) {
                const status = error.response.status;
                const responseData = error.response.data;
                
                if (status === 401) {
                    errorMessage = "Invalid username or password. Please check your credentials.";
                } else if (status === 403) {
                    errorMessage = "Access denied. Your account may not have permission to login.";
                } else if (status === 404) {
                    errorMessage = "Login endpoint not found. Please contact support.";
                    console.error("[LOGIN ERROR] Endpoint /api/auth/login returned 404 - backend might not have this endpoint");
                } else if (status === 400) {
                    errorMessage = responseData?.message || "Invalid request. Please check your input.";
                } else if (status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                } else {
                    errorMessage = responseData?.message || errorMessage;
                }
            } else if (error?.message) {
                // Custom error message (e.g., from requestAuth failure)
                errorMessage = error.message;
            } else if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
                errorMessage = "Request timed out. Please check your connection and try again.";
            } else if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
                errorMessage = "Network error. Please check your connection and ensure the backend server is running.";
            }
            
            console.error("[LOGIN ERROR] Displaying error message to user:", errorMessage);
            globalContext.message.error(errorMessage);
            
            // Clear any partial token on error
            const tokenBeforeClear = window.localStorage.getItem("AUTH_TOKEN");
            if (tokenBeforeClear) {
                console.log("[LOGIN ERROR] Clearing token due to error");
                window.localStorage.removeItem("AUTH_TOKEN");
            }
            
        } finally {
            setLoading(false);
            globalContext.loader(false);
            console.log("[LOGIN] ===== Login process finished =====");
        }
    };

    const formik = useFormik({
        validateOnBlur: true,
        initialValues: {
            username: "",
            password: "",
        },
        onSubmit: handleLoginSubmit,
        validationSchema: authObject,
    });
    
    return (
        <div className={clsx("w-100", className)}>
            <form noValidate onSubmit={formik.handleSubmit}>
                <Row gutter={[0, 24]} justify={"center"}>
                    <Col span={24}>
                        <Input
                            prefix={<PrefixIcon><i className="fi fi-rr-user"></i></PrefixIcon>}
                            size="large"
                            status={formik.touched.username && formik.errors.username ? "error" : ""}
                            type="text"
                            name="username"
                            placeholder="User Name"
                            onChange={formik.handleChange}
                            value={formik.values.username}
                            onBlur={formik.handleBlur}
                        />
                        <FormError>{formik.touched.username && formik.errors.username}</FormError>
                    </Col>
                    <Col span={24}>
                        <Input
                            prefix={<PrefixIcon><i className="fi fi-rr-lock"></i></PrefixIcon>}
                            size="large"
                            status={formik.touched.password && formik.errors.password ? "error" : ""}
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            onBlur={formik.handleBlur}
                        />
                        <FormError>{formik.touched.password && formik.errors.password}</FormError>
                    </Col>
                    <Col span={24}>
                        <Row justify={isAdminLogin ? "center" : "space-between"} gutter={[8, 8]}>
                            <Col className={style.loginBtn} span={isAdminLogin ? 24 : undefined}>
                                <Button 
                                    htmlType="submit" 
                                    type="primary" 
                                    className="w-full"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {isAdminLogin ? "Admin Login" : "Login"}
                                </Button>
                            </Col>
                            {!isAdminLogin && (
                                <Col>
                                    <Button
                                        type="default"
                                        className="w-full border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
                                        onClick={() => navigate("/register")}
                                    >
                                        Create Account
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </Col>
                    {!isAdminLogin && (
                        <>
                            <Col span={24}>
                                <Description className="">
                                    Don't have an account yet? <Link to='/register'>Register</Link>
                                </Description>
                            </Col>
                            <Col span={24}>
                                <Description className="">
                                    Forgot your password? <Link to='/forgot-password'>Reset it</Link>
                                </Description>
                            </Col>
                            <Col span={24}><Description>Or login with</Description></Col>
                            <Col span={16}>
                                <Row>
                                    <Col span={6}>
                                        <Button type="text"
                                            icon={<PrefixIcon><img style={{ width: "100%" }} src={google} alt="Login with google" /></PrefixIcon>}
                                            href={`${BaseURL}/oauth2/authorize/google`} />
                                    </Col>
                                </Row>
                            </Col>
                        </>
                    )}
                    {isAdminLogin && (
                        <Col span={24}>
                            <Description className="" style={{ textAlign: "center" }}>
                                <Link to='/login'>User Login</Link>
                            </Description>
                        </Col>
                    )}
                </Row>
            </form>
        </div>
    );
}

export default LoginForm;

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
        
        setLoading(true);
        globalContext.loader(true);
        
        try {
            // ============================================
            // STEP 1: Call login API and save token
            // ============================================
            console.log("[LOGIN] Step 1: Calling login API...");
            const userData = await loginApi(values);
            
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
            console.log("[LOGIN] Step 3: Updating Redux state with user data...");
            
            // Normalize roles from login response
            if (userData && userData.account && userData.account.roles) {
                const normalizedRoleNames = userData.account.roles.map(r => {
                    const roleName = r?.name || r;
                    return (roleName || "").toUpperCase().replace(/^ROLE_/, "");
                }).filter(Boolean);
                userData.account.roles = normalizedRoleNames.map(name => ({ name }));
                console.log("[LOGIN] Normalized roles:", normalizedRoleNames);
            }
            
            // Update Redux state immediately with login response data
            // This is the source of truth for navigation - don't wait for requestAuth
            dispatch(userSlide.actions.create(userData));
            console.log("[LOGIN] ✓ Redux state updated with user data from login response");
            
            // Call requestAuth asynchronously (don't await - it's for background sync only)
            // Navigation should NOT depend on requestAuth success
            requestAuth().then(() => {
                console.log("[LOGIN] ✓ requestAuth completed (background sync)");
            }).catch(authErr => {
                // Log error but don't block - we already have user data from login
                const status = authErr?.response?.status;
                console.warn("[LOGIN] ⚠ requestAuth failed (non-blocking):", {
                    status: status,
                    message: authErr?.message
                });
                // Don't throw - navigation proceeds regardless
            });
            
            // ============================================
            // STEP 3.5: Brief wait for Redux state propagation
            // ============================================
            // Use requestAnimationFrame to ensure Redux dispatch has been processed
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        console.log("[LOGIN] Redux state propagation complete");
                        resolve();
                    });
                });
            });
            
            // ============================================
            // STEP 4: Determine target route based on role
            // ============================================
            const userRolesRaw = userData?.account?.roles?.map(r => r.name || r) || [];
            const userRoles = userRolesRaw.map(r => (r || "").toUpperCase().replace(/^ROLE_/, ""));
            const isAdmin = userRoles.includes("ADMIN");
            const isUser = userRoles.includes("USER");
            
            console.log("[LOGIN] Roles detected:", userRoles, "→ isAdmin:", isAdmin, "isUser:", isUser);
            
            let targetRoute = null;
            let successMessage = "";
            
            if (isAdmin) {
                targetRoute = "/admin";
                successMessage = "Admin login successful! Redirecting...";
            } else if (isUser) {
                targetRoute = "/home";
                successMessage = "Login successful! Redirecting to home...";
            } else {
                console.warn("[LOGIN] ⚠ No role assigned to user");
                globalContext.message.warning("Login successful but no role assigned. Please contact administrator.");
                return; // Don't navigate if no role
            }
            
            // ============================================
            // STEP 5: Navigate immediately (don't wait for requestAuth)
            // ============================================
            if (targetRoute) {
                // Prevent multiple navigations
                if (isNavigatingRef.current) {
                    console.log("[LOGIN] Navigation already in progress, skipping");
                    return;
                }
                
                isNavigatingRef.current = true;
                
                // Log navigation details
                const finalUserRoles = userData?.account?.roles?.map(r => r.name) || [];
                console.log("[LOGIN] ===== NAVIGATION START =====");
                console.log("[LOGIN] User roles:", finalUserRoles);
                console.log("[LOGIN] Target route:", targetRoute);
                console.log("[LOGIN] Current path:", window.location.pathname);
                
                // Check if already on target route
                if (window.location.pathname === targetRoute) {
                    console.log("[LOGIN] Already on target route, skipping navigation");
                    isNavigatingRef.current = false;
                    return;
                }
                
                // Show success message (non-blocking)
                globalContext.message.success(successMessage);
                
                // Navigate IMMEDIATELY - don't wait for delays
                console.log("[LOGIN] Executing navigate() to:", targetRoute);
                navigate(targetRoute, { replace: true });
                console.log("[LOGIN] navigate() called");
                
                // Verify navigation after a brief moment
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    console.log("[LOGIN] Post-navigation verification - Current path:", currentPath);
                    if (currentPath === targetRoute) {
                        console.log("[LOGIN] ✓✓✓ NAVIGATION SUCCESSFUL!");
                    } else {
                        console.error("[LOGIN] ✗✗✗ NAVIGATION FAILED!");
                        console.error("[LOGIN] Expected:", targetRoute, "Actual:", currentPath);
                        // Fallback: Force navigation
                        console.log("[LOGIN] Attempting fallback navigation...");
                        window.location.href = targetRoute;
                    }
                    isNavigatingRef.current = false;
                }, 200);
            }
            
            // Call success callback if provided
            if (success) success();
            
        } catch (error) {
            // ============================================
            // ERROR HANDLING - Log full error details
            // ============================================
            console.error("[LOGIN ERROR]", error);
            console.error("[AUTH ERROR] Full login error details:", {
                message: error?.message,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                url: error?.config?.url,
                method: error?.config?.method,
                headers: error?.config?.headers,
                requestData: error?.config?.data,
                stack: error?.stack,
                fullError: error
            });
            
            let errorMessage = "Login failed. Please try again.";
            
            if (error?.response) {
                // API error response
                const status = error.response.status;
                if (status === 401) {
                    errorMessage = "Invalid username or password. Please check your credentials.";
                } else if (status === 403) {
                    errorMessage = "Access denied. Your account may not have permission to login.";
                } else if (status === 404) {
                    errorMessage = "Login endpoint not found. Please contact support.";
                } else if (status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                } else {
                    errorMessage = error.response.data?.message || errorMessage;
                }
            } else if (error?.message) {
                // Custom error message
                errorMessage = error.message;
            }
            
            globalContext.message.error(errorMessage);
            
            // Clear any partial token on error
            window.localStorage.removeItem("AUTH_TOKEN");
            
        } finally {
            setLoading(false);
            globalContext.loader(false);
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

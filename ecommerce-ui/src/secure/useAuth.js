import { useDispatch, useSelector } from "react-redux";
import APIBase from "../api/ApiBase";
import { userSlide } from "../store/user/userSlide";
import { useEffect, useState, useCallback, useRef } from "react";

/**
 * useAuth Hook - Manages authentication state and user data
 * 
 * Architecture:
 * - State 2: Loading (initial state, fetching user)
 * - State 1: Loaded (auth check complete, user may or may not exist)
 * - User: Redux state containing user object with account.roles (normalized)
 * 
 * Flow:
 * 1. On mount: Check for token, if exists → call requestAuth()
 * 2. requestAuth(): Fetches user from API, normalizes roles, updates Redux state
 * 3. role(): Returns user roles or ["GUEST"] if no user
 * 4. hasRole(): Checks if user has specific role(s) using normalized roles
 * 
 * CRITICAL FIXES:
 * - Removed user/state from requestAuth dependencies to prevent infinite loops
 * - Added useEffect to sync local state when Redux user changes
 * - Fixed role() to correctly read from Redux state
 * - Ensured state updates properly after login
 */

/**
 * normalizeRoles - Chuẩn hóa roles từ backend (remove "ROLE_" prefix, uppercase)
 * @param {Array} roles - Array of role objects with .name property
 * @returns {Array} - Array of normalized role strings (e.g., ["ADMIN", "USER"])
 */
function normalizeRoles(roles) {
    if (!roles) return [];
    return roles.map(r => {
        if (!r?.name) return null;
        return r.name.toUpperCase().replace(/^ROLE_/, "");
    }).filter(Boolean);
}

function useAuth() {
    const user = useSelector(state => state.user);
    const [state, setState] = useState(2); // 2 = loading, 1 = loaded
    const dispatch = useDispatch();
    const hasRequestedRef = useRef(false);
    const requestAuthInProgressRef = useRef(false);
    
    /**
     * Sync local state when Redux user changes
     * This ensures that when login dispatches user data, useAuth immediately sees it
     * CRITICAL: This useEffect is essential for login flow - when login dispatches user to Redux,
     * this effect detects it and sets state to 1 (loaded), allowing RoleBaseAuthorize to work
     */
    useEffect(() => {
        if (user && state !== 1) {
            // User exists in Redux but state is not loaded - set to loaded
            console.log("[useAuth] ✓ Redux user detected, setting state to loaded");
            console.log("[useAuth] User ID:", user.id);
            console.log("[useAuth] User roles:", user?.account?.roles?.map(r => r?.name || r) || []);
            setState(1);
        } else if (!user && state === 1) {
            // User was removed from Redux - keep state as loaded (guest state)
            console.log("[useAuth] Redux user removed, keeping loaded state (guest)");
        }
    }, [user, state]);
    
    /**
     * requestAuth - Fetches current user from API and updates Redux state
     * Only runs if token exists in localStorage
     * Returns Promise that resolves with user data or null
     * 
     * IMPORTANT: This function ensures Redux state is updated BEFORE resolving,
     * so components can rely on Redux state being available after await.
     * 
     * CRITICAL: Only dispatch is in dependencies to prevent infinite loops.
     * We read user from Redux selector, not from closure.
     */
    const requestAuth = useCallback(() => {
        // Prevent concurrent requests
        if (requestAuthInProgressRef.current) {
            console.log("[useAuth] requestAuth() already in progress, skipping");
            return Promise.resolve(user);
        }
        
        console.log("[useAuth] ===== requestAuth() called =====");
        console.log("[useAuth] Current Redux user:", user ? `ID ${user.id}` : "null");
        console.log("[useAuth] Current auth state:", state, "(2=loading, 1=loaded)");
        
        // If user already exists in Redux and state is loaded, return immediately
        if (user && state === 1) {
            console.log("[useAuth] ✓ User already in Redux, state is loaded, returning immediately");
            return Promise.resolve(user);
        }
        
        // Guard: Only make request if token exists
        const token = window.localStorage.getItem("AUTH_TOKEN");
        if (!token || token.trim() === "") {
            console.log("[useAuth] No token found, setting state to loaded (guest)");
            setState(1); // Set state to loaded (guest state)
            return Promise.resolve(null);
        }
        
        console.log("[useAuth] Token found, fetching user data...");
        console.log("[useAuth] Token value (first 30 chars):", token.slice(0, 30) + "...");
        console.log("[useAuth] Token length:", token.length);
        console.log("[useAuth] Token format check:", token.startsWith("Bearer ") ? "Has Bearer prefix" : "No Bearer prefix");
        
        setState(2); // Set loading state
        requestAuthInProgressRef.current = true;
        
        // Verify token is still in localStorage before making request
        const tokenBeforeRequest = window.localStorage.getItem("AUTH_TOKEN");
        if (!tokenBeforeRequest || tokenBeforeRequest.trim() === "") {
            console.error("[useAuth] ERROR: Token disappeared from localStorage before request!");
            setState(1);
            requestAuthInProgressRef.current = false;
            return Promise.reject(new Error("Token not found in localStorage"));
        }
        
        // Try /api/v1/auth/user endpoint (primary endpoint for getting full user data)
        console.log("[useAuth] ===== Making GET request to /api/v1/auth/user =====");
        console.log("[useAuth] APIBase.defaults.baseURL:", APIBase.defaults?.baseURL);
        console.log("[useAuth] Full URL will be:", `${APIBase.defaults?.baseURL || ""}/api/v1/auth/user`);
        console.log("[useAuth] Token will be added by ApiBase interceptor");
        console.log("[useAuth] Token in localStorage:", tokenBeforeRequest ? "EXISTS" : "MISSING");
        if (tokenBeforeRequest) {
            console.log("[useAuth] Token (first 30 chars):", tokenBeforeRequest.slice(0, 30) + "...");
            console.log("[useAuth] Token length:", tokenBeforeRequest.length);
            console.log("[useAuth] Token format:", tokenBeforeRequest.startsWith("Bearer ") ? "Has Bearer prefix (will be cleaned)" : "No Bearer prefix (OK)");
        }
        
        // CRITICAL: Verify token one more time right before request
        const finalTokenCheck = window.localStorage.getItem("AUTH_TOKEN");
        if (!finalTokenCheck || finalTokenCheck.trim() === "") {
            console.error("[useAuth] ❌❌❌ CRITICAL: Token disappeared right before request!");
            setState(1);
            requestAuthInProgressRef.current = false;
            return Promise.reject(new Error("Token not found in localStorage"));
        }
        console.log("[useAuth] ✓ Final token verification passed");
        console.log("[useAuth] ========================================");
        
        // Try /api/v1/auth/user endpoint directly
        // CRITICAL: ApiBase interceptor will add Authorization: Bearer <token> header
        return APIBase.get("/api/v1/auth/user")
            .then(payload => {
                console.log("[useAuth] ✓ API response received, status:", payload.status);
                return payload.data;
            })
            .then(data => {
                requestAuthInProgressRef.current = false;
                
                if (data) {
                    console.log("[useAuth] ✓ User data fetched, ID:", data?.id);
                    const rawRoles = data?.account?.roles?.map(r => r.name) || [];
                    console.log("[useAuth] Raw roles from backend:", rawRoles);
                    
                    // CHUẨN HÓA ROLES: Normalize roles (remove "ROLE_" prefix, uppercase)
                    // CRITICAL: Ensure roles are always in format [{name: "ADMIN"}, {name: "USER"}]
                    if (data.account && data.account.roles && Array.isArray(data.account.roles)) {
                        const normalizedRoleNames = normalizeRoles(data.account.roles);
                        // Replace roles array with normalized role objects in consistent format
                        data.account.roles = normalizedRoleNames.map(name => ({ name }));
                        console.log("[useAuth] ✓ Roles normalized and stored as objects:", normalizedRoleNames);
                        console.log("[useAuth] Final roles structure:", data.account.roles);
                    } else {
                        console.warn("[useAuth] ⚠ No roles in user data or roles is not an array");
                        console.warn("[useAuth] data.account:", data.account);
                        console.warn("[useAuth] data.account?.roles:", data.account?.roles);
                        // Ensure roles array exists even if empty
                        if (data.account) {
                            data.account.roles = [];
                        }
                    }
                    
                    // Update Redux state FIRST - this is synchronous
                    console.log("[useAuth] Dispatching user to Redux...");
                    dispatch(userSlide.actions.create(data));
                    
                    // Use requestAnimationFrame to ensure Redux state has propagated
                    // This is more reliable than setTimeout
                    return new Promise(resolve => {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                // Double RAF ensures Redux state has propagated
                                setState(1); // Set loaded state
                                console.log("[useAuth] ✓ State set to loaded (1), Redux should have user");
                                resolve(data);
                            });
                        });
                    });
                } else {
                    console.log("[useAuth] No user data in response");
                    setState(1);
                    return null;
                }
            })
            .catch(e => {
                requestAuthInProgressRef.current = false;
                
                const status = e?.response?.status;
                const errorData = e?.response?.data;
                
                console.error("[AUTH ERROR] ========================================");
                console.error("[AUTH ERROR] requestAuth() failed!");
                console.error("[AUTH ERROR] ========================================");
                console.error("[AUTH ERROR] Status:", status);
                console.error("[AUTH ERROR] Status Text:", e?.response?.statusText);
                console.error("[AUTH ERROR] Error Message:", e?.message);
                console.error("[AUTH ERROR] Response Data:", errorData);
                console.error("[AUTH ERROR] Request URL:", e?.config?.url);
                console.error("[AUTH ERROR] Request Method:", e?.config?.method);
                console.error("[AUTH ERROR] Request Base URL:", e?.config?.baseURL);
                console.error("[AUTH ERROR] Full URL:", e?.config?.baseURL + e?.config?.url);
                console.error("[AUTH ERROR] Request Headers:", e?.config?.headers);
                console.error("[AUTH ERROR] Has Authorization Header:", !!e?.config?.headers?.Authorization);
                console.error("[AUTH ERROR] Authorization Header Value:", e?.config?.headers?.Authorization ? e.config.headers.Authorization.slice(0, 30) + "..." : "MISSING");
                console.error("[AUTH ERROR] Token in localStorage:", window.localStorage.getItem("AUTH_TOKEN") ? "EXISTS" : "MISSING");
                console.error("[AUTH ERROR] ========================================");
                
                // For 403 errors, provide specific guidance
                if (status === 403) {
                    console.error("[AUTH ERROR] 403 Forbidden - Possible causes:");
                    console.error("[AUTH ERROR] 1. Token is invalid or expired");
                    console.error("[AUTH ERROR] 2. User doesn't have permission to access /api/v1/auth/user");
                    console.error("[AUTH ERROR] 3. JWT filter didn't set authentication correctly");
                    console.error("[AUTH ERROR] 4. Token format is incorrect (missing Bearer prefix?)");
                    console.error("[AUTH ERROR] 5. Backend security configuration issue");
                    console.error("[AUTH ERROR] ========================================");
                    console.error("[AUTH ERROR] NOTE: This error is non-blocking if called after login.");
                    console.error("[AUTH ERROR] Login flow will continue with user data from login response.");
                    console.error("[AUTH ERROR] ========================================");
                } else if (status === 401) {
                    console.error("[AUTH ERROR] 401 Unauthorized - Token is invalid or missing");
                }
                
                setState(1); // Set loaded state even on error
                throw e; // Re-throw to allow caller to handle
            });
    }, [dispatch]); // CRITICAL: Only dispatch in dependencies, not user or state
    
    /**
     * Auto-fetch user on mount if token exists
     * Only runs once per component mount
     */
    useEffect(() => {
        if (hasRequestedRef.current) {
            return;
        }
        
        const token = window.localStorage.getItem("AUTH_TOKEN");
        if (token && token.trim() !== "") {
            // If user already exists in Redux (e.g., from login), set state to loaded
            if (user) {
                console.log("[useAuth] User already in Redux on mount, setting state to loaded");
                setState(1);
                hasRequestedRef.current = true;
                return;
            }
            
            // Otherwise, fetch user from API
            hasRequestedRef.current = true;
            requestAuth().catch((error) => {
                // Log errors on mount (but don't show UI - user might not be logged in)
                console.error("[AUTH ERROR] requestAuth failed on mount:", {
                    message: error?.message,
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
                    data: error?.response?.data,
                    url: error?.config?.url,
                    method: error?.config?.method,
                    fullError: error
                });
            });
        } else {
            // No token, set state to loaded (guest state)
            setState(1);
            hasRequestedRef.current = true;
        }
    }, [requestAuth, user]); // Include user to detect when login updates Redux
    
    /**
     * role() - Returns array of normalized user roles
     * Returns ["GUEST"] if no user, null if still loading
     * 
     * IMPORTANT: Returns null when state !== 1 (loading) to prevent premature redirects
     * 
     * CRITICAL FIX: Now correctly reads from Redux state via selector
     * Handles both normalized format [{name: "ADMIN"}] and raw format from backend
     */
    function role() {
        // CRITICAL: Return null if still loading - this prevents RoleBaseAuthorize from redirecting
        if (state !== 1) {
            console.log("[useAuth] role() called but state is", state, "(loading) - returning null");
            return null; // Still loading
        }
        
        // Read user from Redux (via selector, always current)
        if (!user) {
            console.log("[useAuth] role() - no user, returning ['GUEST']");
            return ["GUEST"];
        }
        
        // Safely access roles with null checks
        if (!user.account || !user.account.roles || !Array.isArray(user.account.roles)) {
            console.log("[useAuth] role() - user has no roles or roles is not an array, returning ['GUEST']");
            console.log("[useAuth] user.account:", user.account);
            console.log("[useAuth] user.account?.roles:", user.account?.roles);
            return ["GUEST"];
        }
        
        // Extract role names - handle both normalized format [{name: "ADMIN"}] and raw format
        const roles = user.account.roles.map(roleObj => {
            // Handle normalized format: {name: "ADMIN"}
            if (typeof roleObj === 'object' && roleObj !== null && roleObj.name) {
                return roleObj.name;
            }
            // Handle string format: "ADMIN" or "ROLE_ADMIN"
            if (typeof roleObj === 'string') {
                return roleObj.toUpperCase().replace(/^ROLE_/, "");
            }
            return null;
        }).filter(Boolean); // Remove null/undefined values
        
        console.log("[useAuth] role() - returning roles:", roles);
        return roles.length > 0 ? roles : ["GUEST"];
    }
    
    /**
     * hasRole(required) - Checks if user has specific role(s) using normalized roles
     * @param {string|string[]} required - Role name(s) to check (will be normalized)
     * @returns {boolean|null} - true if has role, false if doesn't, null if still loading
     * 
     * IMPORTANT: Returns null when loading to prevent RoleBaseAuthorize from redirecting prematurely
     */
    function hasRole(required) {
        // Get normalized roles using role() function
        const roles = role();
        
        // Still loading → return null (CRITICAL: prevents redirect loops)
        if (roles === null) {
            console.log("[useAuth] hasRole() - still loading, returning null");
            return null;
        }
        
        // No role required → allow access
        if (!required) {
            console.log("[useAuth] hasRole() - no role required, returning true");
            return true;
        }
        
        // Normalize required role(s) and check
        if (Array.isArray(required)) {
            const result = required.some(r => {
                const normalized = (r || "").toUpperCase().replace(/^ROLE_/, "");
                return roles.includes(normalized);
            });
            console.log("[useAuth] hasRole() - checking array", required, "→", result);
            return result;
        } else {
            const normalized = (required || "").toUpperCase().replace(/^ROLE_/, "");
            const result = roles.includes(normalized);
            console.log("[useAuth] hasRole() - checking", required, "(normalized:", normalized, ") →", result);
            return result;
        }
    }
    
    return [state, user, hasRole, requestAuth];
}

export default useAuth;

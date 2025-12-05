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
    
    /**
     * requestAuth - Fetches current user from API and updates Redux state
     * Only runs if token exists in localStorage
     * Returns Promise that resolves with user data or null
     * 
     * IMPORTANT: This function ensures Redux state is updated BEFORE resolving,
     * so components can rely on Redux state being available after await.
     */
    const requestAuth = useCallback(() => {
        console.log("[useAuth] requestAuth called");
        console.log("[useAuth] Current Redux user:", user ? `ID ${user.id}` : "null");
        
        // If user already exists in Redux and state is loaded, return immediately
        if (user && state === 1) {
            console.log("[useAuth] User already in Redux, state is loaded, returning immediately");
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
        setState(2); // Set loading state
        
        return APIBase.get("/api/v1/auth/user")
            .then(payload => {
                console.log("[useAuth] API response received, status:", payload.status);
                return payload.data;
            })
            .then(data => {
                if (data) {
                    console.log("[useAuth] User data fetched, ID:", data?.id);
                    const rawRoles = data?.account?.roles?.map(r => r.name) || [];
                    console.log("[useAuth] Raw roles from backend:", rawRoles);
                    
                    // CHUẨN HÓA ROLES: Normalize roles (remove "ROLE_" prefix, uppercase)
                    if (data.account && data.account.roles) {
                        const normalizedRoleNames = normalizeRoles(data.account.roles);
                        // Replace roles array with normalized role objects
                        data.account.roles = normalizedRoleNames.map(name => ({ name }));
                        console.log("[useAuth] Normalized roles:", normalizedRoleNames);
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
                                console.log("[useAuth] State set to loaded (1), Redux should have user");
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
                console.error("[AUTH ERROR] requestAuth failed:", {
                    message: e?.message,
                    status: e?.response?.status,
                    statusText: e?.response?.statusText,
                    data: e?.response?.data,
                    url: e?.config?.url,
                    method: e?.config?.method,
                    headers: e?.config?.headers,
                    fullError: e
                });
                setState(1); // Set loaded state even on error
                throw e;
            });
    }, [user, dispatch, state]);
    
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
    }, [requestAuth]);

    /**
     * role() - Returns array of normalized user roles
     * Returns ["GUEST"] if no user, null if still loading
     * 
     * IMPORTANT: Returns null when state !== 1 (loading) to prevent premature redirects
     */
    function role() {
        // CRITICAL: Return null if still loading - this prevents RoleBaseAuthorize from redirecting
        if (state !== 1) {
            console.log("[useAuth] role() called but state is", state, "(loading) - returning null");
            return null; // Still loading
        }
        
        if (!user) {
            console.log("[useAuth] role() - no user, returning ['GUEST']");
            return ["GUEST"];
        }
        
        // Safely access roles with null checks (roles are already normalized)
        if (!user.account || !user.account.roles) {
            console.log("[useAuth] role() - user has no roles, returning ['GUEST']");
            return ["GUEST"];
        }
        
        // Roles are already normalized, just extract names
        const roles = user.account.roles.map(role_ => role_.name);
        console.log("[useAuth] role() - returning roles:", roles);
        return roles;
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
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import { useEffect, useRef, useMemo } from "react";

/**
 * RoleBaseAuthorize - Route guard component that checks user roles before rendering
 * 
 * Architecture:
 * - Waits for auth state to be loaded (state === 1)
 * - Checks if user has required role(s) using hasRole()
 * - Renders children if authorized
 * - Redirects to /login if not authorized (only after state is loaded AND hasRole explicitly returns false)
 * 
 * Props:
 * - role: string | string[] - Required role(s) to access route (e.g., "ADMIN" or ["USER", "ADMIN"])
 * - onSuccess: function (optional) - Custom render function when authorized
 * - onFail: function (optional) - Custom render function when not authorized
 * - children: ReactNode - Content to render if authorized
 * 
 * Behavior:
 * - Returns null while loading (state !== 1) - prevents flash of content
 * - Returns children if user has required role
 * - Redirects to /login if user doesn't have role (only after loading complete AND hasRole === false)
 * 
 * CRITICAL: This component must NOT redirect when:
 * - state !== 1 (still loading)
 * - hasRole() returns null (still loading)
 * - Only redirects when state === 1 AND hasRole() === false (explicitly unauthorized)
 */
function RoleBaseAuthorize({ path, role, onFail, onSuccess, fail, children }) {
    const navigate = useNavigate();
    // CRITICAL FIX: useAuth() returns [state, user, hasRole, requestAuth] - we need all 4 items
    const [state, user, hasRole, requestAuth] = useAuth();
    const redirectExecutedRef = useRef(false); // Prevent multiple redirects
    
    // CRITICAL: Memoize authorization check to prevent calling hasRole during render when loading
    // Only compute when state is loaded (state === 1)
    const isValid = useMemo(() => {
        // Don't check if still loading
        if (state !== 1) {
            return null;
        }
        return hasRole(role);
    }, [state, hasRole, role]);
    
    // DEBUG: Log component render with current state (only when loaded)
    useEffect(() => {
        if (state === 1) {
            console.log("[RoleBaseAuthorize] Component rendered", {
                path: path || "unknown",
                state: state,
                hasUser: !!user,
                userRoles: user?.account?.roles?.map(r => r.name) || [],
                requiredRole: role,
                isValid: isValid
            });
        }
    }, [state, user, role, path, isValid]);
    
    /**
     * Handle redirect when user is not authorized
     * CRITICAL: Only redirect when:
     * 1. state === 1 (loaded)
     * 2. isValid === false (explicitly false, not null)
     * 3. Not already on login page
     * 4. Redirect not already executed
     */
    useEffect(() => {
        // CRITICAL: Don't do anything if still loading
        if (state !== 1 || isValid === null) {
            return;
        }
        
        // Only redirect when explicitly unauthorized (isValid === false)
        if (isValid === false) {
            // Prevent multiple redirects
            if (redirectExecutedRef.current) {
                return;
            }
            
            const currentPath = window.location.pathname;
            
            // Don't redirect if already on login page
            if (currentPath === "/login" || currentPath === "/admin/login") {
                return;
            }
            
            // Execute redirect
            console.log("[RoleBaseAuthorize] User not authorized, redirecting to /login");
            redirectExecutedRef.current = true;
            
            if (!onFail) {
                navigate("/login", { replace: true });
            }
        } else if (isValid === true) {
            // User is authorized - reset redirect flag
            redirectExecutedRef.current = false;
        }
    }, [state, isValid, navigate, onFail]);
    
    // Still loading - don't render anything yet (prevents flash of unauthorized content)
    if (state !== 1 || isValid === null) {
        return null;
    }
    
    // User has required role - allow access
    if (isValid === true) {
        if (onSuccess) return onSuccess();
        return <>{children}</>;
    }
    
    // User doesn't have required role (isValid === false)
    // Redirect is handled by useEffect above
    if (onFail) return onFail();
    
    // Return null while redirect is happening
    return null;
}

export default RoleBaseAuthorize;

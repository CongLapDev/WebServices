import axios from "axios";

// Local backend URL (Spring Boot runs on port 8085)
export const LOCAL_URL = "http://localhost:8085";
// Public base URL used for OAuth redirects (Google, etc.)
export const BaseURL = "https://gadgetsource.click";

const APIBase = axios.create({
  baseURL: LOCAL_URL,
  // Removed withCredentials: true - backend uses JWT in Authorization headers, not cookies
});

// Request interceptor: Attach Authorization header if token exists in localStorage
// CRITICAL: This interceptor MUST run for ALL requests to ensure Authorization header is attached
APIBase.interceptors.request.use(
  (config) => {
    try {
      // CRITICAL: Ensure headers object exists
      if (!config.headers) {
        config.headers = {};
      }
      
      // CRITICAL: Check for token in localStorage
      const token = window.localStorage.getItem("AUTH_TOKEN");
      const fullUrl = config.url ? `${config.baseURL || ""}${config.url}` : (config.baseURL || "");
      const isAuthEndpoint = fullUrl.includes("/auth/") || fullUrl.includes("/api/v1/");
      
      // Log token status for auth endpoints
      if (isAuthEndpoint) {
        console.log("[ApiBase] ===== REQUEST INTERCEPTOR =====");
        console.log("[ApiBase] Request URL:", fullUrl);
        console.log("[ApiBase] Token in localStorage:", token ? "EXISTS" : "MISSING");
        if (token) {
          console.log("[ApiBase] Token length:", token.length);
          console.log("[ApiBase] Token (first 30 chars):", token.slice(0, 30) + "...");
        }
      }
      
      // CRITICAL: Check if Authorization header already exists (case-insensitive check)
      const hasAuthHeader = !!(
        config.headers.Authorization || 
        config.headers.authorization ||
        config.headers.AUTHORIZATION
      );
      
      if (hasAuthHeader && isAuthEndpoint) {
        const existingHeader = config.headers.Authorization || config.headers.authorization || config.headers.AUTHORIZATION;
        console.log("[ApiBase] Authorization header already present:", existingHeader.slice(0, 30) + "...");
      }
      
      // CRITICAL: Add Authorization header if token exists and header not already present
      if (token && token.trim() !== "" && !hasAuthHeader) {
        // Ensure token doesn't already have "Bearer " prefix
        const cleanToken = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
        
        if (cleanToken && cleanToken.length > 0) {
          const bearerToken = `Bearer ${cleanToken}`;
          
          // CRITICAL: Set header using proper case (axios will handle HTTP case-insensitivity)
          config.headers.Authorization = bearerToken;
          
          // CRITICAL: Also set lowercase version to ensure compatibility
          config.headers.authorization = bearerToken;
          
          if (isAuthEndpoint) {
            console.log("[ApiBase] ===== AUTHORIZATION HEADER ADDED =====");
            console.log("[ApiBase] ✓ Token extracted from localStorage");
            console.log("[ApiBase] ✓ Clean token length:", cleanToken.length);
            console.log("[ApiBase] ✓ Bearer token created");
            console.log("[ApiBase] ✓ Authorization header set:", bearerToken.slice(0, 50) + "...");
            console.log("[ApiBase] ✓ Config headers after setting:", {
              Authorization: config.headers.Authorization ? "SET" : "MISSING",
              authorization: config.headers.authorization ? "SET" : "MISSING"
            });
            console.log("[ApiBase] ========================================");
          }
        } else {
          if (isAuthEndpoint) {
            console.error("[ApiBase] ❌ Token is empty after cleaning!");
          }
        }
      } else if (!token || token.trim() === "") {
        // No token - log for auth endpoints
        if (isAuthEndpoint) {
          console.error("[ApiBase] ❌❌❌ NO TOKEN IN LOCALSTORAGE!");
          console.error("[ApiBase] Request URL:", fullUrl);
          console.error("[ApiBase] This request will FAIL with 401/403");
          console.error("[ApiBase] localStorage.getItem('AUTH_TOKEN'):", window.localStorage.getItem("AUTH_TOKEN"));
        }
      }
      
      // CRITICAL: Final verification - log headers for auth endpoints
      if (isAuthEndpoint) {
        const finalAuthHeader = config.headers.Authorization || config.headers.authorization || config.headers.AUTHORIZATION;
        if (finalAuthHeader) {
          console.log("[ApiBase] ✓✓✓ FINAL VERIFICATION: Authorization header will be sent");
          console.log("[ApiBase] Header value (first 50 chars):", finalAuthHeader.slice(0, 50) + "...");
        } else {
          console.error("[ApiBase] ❌❌❌ FINAL VERIFICATION FAILED: No Authorization header!");
          console.error("[ApiBase] Config headers:", Object.keys(config.headers));
        }
      }
      
    } catch (error) {
      console.error("[ApiBase] ❌ CRITICAL ERROR in request interceptor:", error);
      console.error("[ApiBase] Error stack:", error.stack);
    }
    
    return config;
  },
  (error) => {
    console.error("[ApiBase] Request interceptor error handler:", error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401/403 errors and auto-logout if needed
APIBase.interceptors.response.use(
  (response) => {
    // Check if response contains a new token (some endpoints might refresh it)
    const token = response.headers?.authorization || response.headers?.Authorization;
    if (token) {
      const normalized = token.startsWith("Bearer ") ? token.substring(7) : token;
      window.localStorage.setItem("AUTH_TOKEN", normalized);
      console.log("[ApiBase] Token refreshed from response");
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const token = window.localStorage.getItem("AUTH_TOKEN");
    
    // Log full error details for all auth-related status codes
    if (status === 401 || status === 403 || status === 404 || status >= 500) {
      console.error("[AUTH ERROR] API response error:", {
        message: error?.message,
        status: status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
        headers: error?.config?.headers,
        hasToken: !!token,
        hasAuthHeader: !!error?.config?.headers?.Authorization,
        fullError: error
      });
    }
    
    if (status === 403) {
      console.error("[ApiBase] 403 Forbidden:", {
        url: error.config?.url,
        method: error.config?.method,
        hasToken: !!token,
        hasAuthHeader: !!error.config?.headers?.Authorization,
        message: error.response?.data?.message || "Access denied"
      });
      // 403 means token is invalid or user lacks permission
      // Don't auto-logout, let the component handle it
    } else if (status === 401) {
      console.error("[ApiBase] 401 Unauthorized - token invalid or expired");
      // Clear invalid token
      window.localStorage.removeItem("AUTH_TOKEN");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login" && window.location.pathname !== "/admin/login") {
        console.log("[ApiBase] Redirecting to login due to 401");
        window.location.href = "/login";
      }
    } else if (status === 404) {
      console.error("[ApiBase] 404 Not Found - endpoint does not exist");
    } else if (status >= 500) {
      console.error("[ApiBase] Server Error (5xx) - backend issue");
    }
    
    return Promise.reject(error);
  }
);

export default APIBase;
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
APIBase.interceptors.request.use(
  (config) => {
    try {
      const token = window.localStorage.getItem("AUTH_TOKEN");
      const url = config.url || config.baseURL + (config.url || "");
      
      // Log token status for auth endpoints
      if (url.includes("/auth/") || url.includes("/api/v1/")) {
        console.log("[ApiBase] Request to:", url, "- Token available:", !!token);
        if (token) {
          console.log("[ApiBase] Token length:", token.length, "- First 20 chars:", token.slice(0, 20) + "...");
        }
      }
      
      if (token && token.trim() !== "") {
        config.headers = config.headers || {};
        // Only add Authorization header if not already present
        if (!config.headers.Authorization) {
          // Ensure token doesn't already have "Bearer " prefix
          const bearerToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
          config.headers.Authorization = bearerToken;
          
          // Log for auth endpoints
          if (url.includes("/auth/") || url.includes("/api/v1/")) {
            console.log("[ApiBase] ✓ Authorization header added:", bearerToken.slice(0, 30) + "...");
          }
        } else {
          if (url.includes("/auth/") || url.includes("/api/v1/")) {
            console.log("[ApiBase] Authorization header already present");
          }
        }
      } else {
        // No token - log for auth endpoints
        if (url.includes("/auth/") || url.includes("/api/v1/")) {
          console.warn("[ApiBase] ⚠ No token in localStorage for authenticated endpoint:", url);
        }
      }
      // If no token, request will proceed without Authorization header
      // Public endpoints will work, authenticated endpoints will return 401/403
    } catch (error) {
      console.error("[ApiBase] Error reading token from localStorage:", error);
    }
    return config;
  },
  (error) => {
    console.error("[ApiBase] Request interceptor error:", error);
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
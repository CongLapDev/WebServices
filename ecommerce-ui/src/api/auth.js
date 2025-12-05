import APIBase from "./ApiBase";

// Helper to persist any access token the backend might return
// Note: Backend uses cookies (httpOnly), but we also try to extract from response for Authorization header
const persistTokenFromResponse = (response) => {
  if (!response) {
    console.warn("[auth] persistTokenFromResponse: No response provided");
    return;
  }
  
  // Debug: Log entire response structure to see where token might be
  console.log("[TOKEN DEBUG] Response structure:", {
    hasData: !!response.data,
    dataKeys: response.data ? Object.keys(response.data) : [],
    hasHeaders: !!response.headers,
    headerKeys: response.headers ? Object.keys(response.headers) : [],
    fullResponse: response
  });
  
  // Backend sets token in cookies (httpOnly), but we need it in localStorage for Authorization header
  // Try multiple locations for the token in response
  const token =
    response.data?.token ||
    response.data?.accessToken ||
    response.data?.access_token ||
    response.data?.jwt ||
    response.headers?.authorization ||
    response.headers?.Authorization ||
    response.headers?.["authorization"] ||
    response.headers?.["Authorization"] ||
    response.headers?.["x-auth-token"] ||
    response.headers?.["X-Auth-Token"] ||
    response.headers?.["set-cookie"]?.[0]?.split("=")[1]?.split(";")[0]; // Try to extract from Set-Cookie header
  
  if (token) {
    // Strip Bearer prefix if present
    const normalized = token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
    window.localStorage.setItem("AUTH_TOKEN", normalized);
    console.log("[auth] Token saved to localStorage:", normalized.slice(0, 15) + "...");
    return true; // Indicate success
  } else {
    // Backend uses cookies, so token might not be in response body/headers
    // Log all possible locations for debugging
    console.warn("[TOKEN DEBUG] Token not found in any expected location:");
    console.warn("[TOKEN DEBUG] - response.data?.token:", response.data?.token);
    console.warn("[TOKEN DEBUG] - response.data?.accessToken:", response.data?.accessToken);
    console.warn("[TOKEN DEBUG] - response.headers?.authorization:", response.headers?.authorization);
    console.warn("[TOKEN DEBUG] - response.headers?.Authorization:", response.headers?.Authorization);
    console.warn("[TOKEN DEBUG] - response.headers?.set-cookie:", response.headers?.["set-cookie"]);
    console.warn("[TOKEN DEBUG] Backend uses httpOnly cookies - token cannot be read by JavaScript");
    console.warn("[TOKEN DEBUG] If backend only uses cookies, we need backend to also return token in response body/header");
    return false; // Indicate failure
  }
};

// Authentication API services

/**
 * Login API - Authenticates user and returns User object with account and roles
 * @param {Object} credentials - { username: string, password: string }
 * @returns {Promise<User>} User object with account.roles
 */
export const login = async (credentials) => {
  try {
    // Use REST-style /api/auth/login endpoint
    const response = await APIBase.post("/api/auth/login", credentials, {
      headers: { "Content-Type": "application/json" },
    });
    
    // Log token information
    const tokenBefore = response.data?.token ||
      response.data?.accessToken ||
      response.headers?.authorization ||
      response.headers?.Authorization ||
      response.headers?.["authorization"] ||
      response.headers?.["Authorization"];
    
    if (tokenBefore) {
      const normalized = tokenBefore.startsWith("Bearer ") ? tokenBefore.substring(7) : tokenBefore;
      console.log("[TOKEN] token from server:", normalized.slice(0, 20) + "...");
    } else {
      console.warn("[TOKEN] No token found in response body/headers");
    }
    
    // Save token from response
    persistTokenFromResponse(response);
    
    // Verify token was saved
    const savedToken = window.localStorage.getItem("AUTH_TOKEN");
    
    if (savedToken) {
      console.log("[TOKEN] token saved to localStorage");
    } else {
      // Token not found - provide detailed error information
      console.error("[TOKEN ERROR] ========================================");
      console.error("[TOKEN ERROR] Token not returned by backend");
      console.error("[TOKEN ERROR] ========================================");
      console.error("[TOKEN ERROR] Response status:", response.status);
      console.error("[TOKEN ERROR] Response data:", response.data);
      console.error("[TOKEN ERROR] Response data keys:", response.data ? Object.keys(response.data) : []);
      console.error("[TOKEN ERROR] Response headers:", response.headers);
      console.error("[TOKEN ERROR] Response header keys:", response.headers ? Object.keys(response.headers) : []);
      console.error("[TOKEN ERROR] ========================================");
      console.error("[TOKEN ERROR] Backend must return token in one of these locations:");
      console.error("[TOKEN ERROR] 1. response.data.token");
      console.error("[TOKEN ERROR] 2. response.data.accessToken");
      console.error("[TOKEN ERROR] 3. response.headers.authorization");
      console.error("[TOKEN ERROR] 4. response.headers.Authorization");
      console.error("[TOKEN ERROR] 5. response.headers['x-auth-token']");
      console.error("[TOKEN ERROR] ========================================");
      console.error("[TOKEN ERROR] Current backend only sends token in httpOnly cookies");
      console.error("[TOKEN ERROR] httpOnly cookies cannot be read by JavaScript");
      console.error("[TOKEN ERROR] Solution: Backend must ALSO return token in response body or header");
      console.error("[TOKEN ERROR] ========================================");
      
      throw new Error("Token not found in response. Backend must return token in response body or header (not just httpOnly cookies).");
    }
    
    // Return user data with account and roles
    return response.data;
  } catch (error) {
    // Log full error details
    console.error("[AUTH ERROR] login API failed:", {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url,
      method: error?.config?.method,
      headers: error?.config?.headers,
      requestData: error?.config?.data,
      fullError: error
    });
    
    // If 404, try fallback to /login (legacy endpoint)
    if (error?.response?.status === 404) {
      console.log("[AUTH] Trying fallback endpoint /login");
      try {
        const response = await APIBase.post("/login", credentials, {
          headers: { "Content-Type": "application/json" },
        });
        
        // Log token from fallback
        const tokenBefore = response.data?.token || response.headers?.authorization || response.headers?.Authorization;
        if (tokenBefore) {
          const normalized = tokenBefore.startsWith("Bearer ") ? tokenBefore.substring(7) : tokenBefore;
          console.log("[TOKEN] token from server (fallback):", normalized.slice(0, 20) + "...");
        }
        
        persistTokenFromResponse(response);
        
        const savedToken = window.localStorage.getItem("AUTH_TOKEN");
        if (savedToken) {
          console.log("[TOKEN] token saved to localStorage (fallback)");
        } else {
          console.error("[TOKEN ERROR] Token not returned by backend (fallback)");
        }
        
        // Legacy endpoint doesn't return user data, so fetch it
        const userData = await getCurrentUser();
        return userData;
      } catch (fallbackError) {
        console.error("[AUTH ERROR] Fallback login endpoint also failed:", {
          message: fallbackError?.message,
          status: fallbackError?.response?.status,
          statusText: fallbackError?.response?.statusText,
          data: fallbackError?.response?.data,
          url: fallbackError?.config?.url,
          method: fallbackError?.config?.method,
          fullError: fallbackError
        });
        throw fallbackError;
      }
    }
    throw error;
  }
};

export const register = async (account) => {
  // Backend exposes registration at POST /register (AuthenticationAPI.register)
  // /api/v1/account is reserved for secured status updates and will return 403 for anonymous users.
  const response = await APIBase.post("/register", account, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const getCurrentAccount = async () => {
  const response = await APIBase.get("/api/v1/auth/account");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await APIBase.get("/api/v1/auth/user");
  return response.data;
};

export const refresh = async () => {
  const response = await APIBase.get("/refresh");
  persistTokenFromResponse(response);
  return response.data;
};

export const logout = async () => {
  const response = await APIBase.get("/logout");
  window.localStorage.removeItem("AUTH_TOKEN");
  return response.data;
};

// Forgot password – prefers /api/auth/forgot-password, falls back gracefully
export const forgotPassword = async (payload) => {
  try {
    const response = await APIBase.post(
      "/api/auth/forgot-password",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    // If legacy path exists, optionally support it; otherwise surface clear message
    if (error?.response?.status === 404) {
      const message =
        "Forgot password API is not implemented on the backend yet. Please contact support.";
      const err = new Error(message);
      err.original = error;
      throw err;
    }
    const message =
      error?.response?.data?.message ||
      "An error occurred while sending reset instructions.";
    const err = new Error(message);
    err.original = error;
    throw err;
  }
};

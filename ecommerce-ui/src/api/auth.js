import APIBase from "./ApiBase";

// Helper to persist any access token the backend might return
const persistTokenFromResponse = (response) => {
  if (!response) return;
  const token =
    response.data?.token ||
    response.headers?.authorization ||
    response.headers?.Authorization;
  if (token) {
    // Strip Bearer prefix if present
    const normalized = token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
    window.localStorage.setItem("AUTH_TOKEN", normalized);
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
    persistTokenFromResponse(response);
    // Return user data with account and roles
    return response.data;
  } catch (error) {
    // If 404, try fallback to /login (legacy endpoint)
    if (error?.response?.status === 404) {
      try {
        const response = await APIBase.post("/login", credentials, {
          headers: { "Content-Type": "application/json" },
        });
        persistTokenFromResponse(response);
        // Legacy endpoint doesn't return user data, so fetch it
        const userData = await getCurrentUser();
        return userData;
      } catch (fallbackError) {
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

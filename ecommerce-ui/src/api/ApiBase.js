import axios from "axios";

// Local backend URL (Spring Boot runs on port 8085)
export const LOCAL_URL = "http://localhost:8085";
// Public base URL used for OAuth redirects (Google, etc.)
export const BaseURL = "https://gadgetsource.click";

const APIBase = axios.create({
  baseURL: LOCAL_URL,
  withCredentials: true,
});

// Attach Authorization header if a JWT is stored in localStorage
APIBase.interceptors.request.use(
  (config) => {
    try {
      const token = window.localStorage.getItem("AUTH_TOKEN");
      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default APIBase;
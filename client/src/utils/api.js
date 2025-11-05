import axios from "axios";
import { urls } from "../config/constants.js";

const api = axios.create({
  baseURL: urls.api.base,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login/register page or if it's an auth endpoint
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath === "/login" ||
        currentPath === "/register" ||
        currentPath === "/guest";
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register") ||
        error.config?.url?.includes("/auth/guest");

      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on auth page and not an auth endpoint
      if (!isAuthPage && !isAuthEndpoint) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

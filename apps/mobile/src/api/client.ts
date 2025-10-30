import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Production Railway URL
const PRODUCTION_API_URL = "https://act-production-8080.up.railway.app";

// Local development URL for emulator
const LOCAL_API_URL = "http://10.0.2.2:8000";

// For physical devices via USB, use your computer's local IP
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
// Example: "http://192.168.1.100:8000"
const getBaseURL = () => {
  // Check environment variable first
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // For production builds, always use production API
  // Only use local URLs during development with emulators
  if (!__DEV__) {
    return PRODUCTION_API_URL;
  }
  
  // Development mode - use local URLs for emulators
  if (Platform.OS === 'android') {
    // For Android emulator - use local development
    return LOCAL_API_URL;
  } else if (Platform.OS === 'ios') {
    // For iOS simulator - use local development
    return LOCAL_API_URL;
  }
  
  // For web or fallback - use production
  return PRODUCTION_API_URL;
};

export const BASE_URL = getBaseURL();

// Debug logging only in development
if (__DEV__) {
  console.log("🌐 API Base URL:", BASE_URL);
  console.log("📱 Platform:", Platform.OS);
  console.log("💡 For physical devices, set EXPO_PUBLIC_API_BASE_URL to your computer's IP");
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout for slower connections
  headers: {
    "Content-Type": "application/json",
    // bypass ngrok warning page for programmatic requests
    "ngrok-skip-browser-warning": "any",
  },
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add Authorization header to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for login/register/password-reset endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/password-reset")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh");
        if (!refreshToken) {
          // Clear access token as well since we can't refresh
          await SecureStore.deleteItemAsync("access");
          console.log("⚠️ No refresh token found - session expired");
          const error = new Error("No refresh token available - user session expired");
          error.name = "SessionExpiredError";
          throw error;
        }

        // Call refresh endpoint
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Save new tokens
        await SecureStore.setItemAsync("access", access_token);
        await SecureStore.setItemAsync("refresh", refresh_token);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens and force logout
        await SecureStore.deleteItemAsync("access");
        await SecureStore.deleteItemAsync("refresh");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export as both 'api' and 'API' for compatibility
export const API = api;

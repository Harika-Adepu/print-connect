// src/services/api.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ENV from "../config/env";

const api = axios.create({
  baseURL: ENV.BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // SecureStore unavailable — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: normalize errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

const DEFAULT_BACKEND_URL = "https://api.synccode.dev:8080";

const normalizeBaseUrl = (rawUrl: string) => {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
  return withProtocol.replace(/\/$/, "");
};

// Determine API base URL from env first, then fallback to the configured backend IP.
const getAPIBaseURL = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.API_URL;
  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  return DEFAULT_BACKEND_URL;
};

const API_BASE_URL = getAPIBaseURL();

console.log("[API Client] Backend URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: JWT via cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds timeout for slow backend email sending
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

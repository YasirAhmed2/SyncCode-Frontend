/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

// Determine API base URL: use env var, fallback to localhost in dev, production URL in production
const getAPIBaseURL = () => {
  // 1. If VITE_API_BASE_URL is explicitly set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. In development mode, use localhost:8080
  if (import.meta.env.DEV) {
    return "http://localhost:8080";
  }

  // 3. In production, use the deployed backend
  return "https://synccode-backend-production.up.railway.app";
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

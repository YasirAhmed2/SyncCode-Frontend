/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

// Production Backend URL
const API_BASE_URL = "https://synccode-backend-production.up.railway.app";

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

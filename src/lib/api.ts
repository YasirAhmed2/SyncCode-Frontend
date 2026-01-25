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
});

export default api;

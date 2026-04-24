import { io } from 'socket.io-client';

// Determine Socket.IO URL: use env var, fallback to localhost in dev, production URL in production
const getSocketURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }

  return 'https://synccode-backend-production.up.railway.app';
};

const SOCKET_URL = getSocketURL();

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

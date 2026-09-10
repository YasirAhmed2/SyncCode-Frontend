import { io } from 'socket.io-client';

const DEFAULT_SOCKET_URL = 'https://api.synccode.dev';

const normalizeBaseUrl = (rawUrl: string) => {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
  return withProtocol.replace(/\/$/, '');
};

// Determine Socket.IO URL from env first, then fallback to the configured backend IP.
const getSocketURL = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.API_URL;
  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  return DEFAULT_SOCKET_URL;
};

const SOCKET_URL = getSocketURL();

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

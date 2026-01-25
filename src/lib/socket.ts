import { io } from 'socket.io-client';

// Use environment variable or default to localhost:5000
const URL = 'https://synccode-backend-production.up.railway.app';

export const socket = io(URL, {
    autoConnect: false,
    withCredentials: true,
});

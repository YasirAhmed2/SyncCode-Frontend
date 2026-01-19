import { io } from 'socket.io-client';

// Use environment variable or default to localhost:5000
const URL = 'http://localhost:5000';

export const socket = io(URL, {
    autoConnect: false,
    withCredentials: true,
});

// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // import axios from 'axios';

// // const API_BASE_URL = 'http://localhost:5000/';

// // export const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Request interceptor to add token
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor to handle errors
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       localStorage.removeItem('token');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );



// import axios from 'axios';

// // In a real environment, this would point to the backend URL
// const API_BASE_URL = 'http://localhost:5000/';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true, // Required for JWT in cookies
// });

// // Since we don't have a real backend, we'll implement some local mock state
// // but keep the function signatures aligned with the document requirements.

// export const authService = {
//   register: async (data: any) => {
//     // POST /auth/register
//     console.log('Registering...', data);
//     return { success: true, message: 'OTP sent to email' };
//   },
//   verifyOtp: async (email: string, otp: string) => {
//     // POST /auth/verify-otp
//     return { success: true };
//   },
//   login: async (credentials: any) => {
//     // POST /auth/login
//     return { 
//       success: true, 
//       user: { id: 'u1', name: credentials.email.split('@')[0], email: credentials.email } 
//     };
//   },
//   getMe: async () => {
//     // GET /user/me
//     return { success: true, user: { id: 'u1', name: 'Yasir', email: 'yasir@email.com' } };
//   }
// };

// export const roomService = {
//   create: async (language: 'javascript' | 'python' = 'javascript') => {
//     // POST /rooms/create
//     const roomId = Math.random().toString(36).substring(7).toUpperCase();
//     // Simulate saving the initial language preference
//     localStorage.setItem(`room_lang_${roomId}`, language);
//     return { success: true, roomId, language };
//   },
//   join: async (roomId: string) => {
//     // POST /rooms/join/:roomId
//     return { success: true, roomId };
//   },
//   getParticipants: async (roomId: string) => {
//     // GET /rooms/:roomId/participants
//     return [
//       { id: 'u1', name: 'Yasir', email: 'yasir@email.com' },
//       { id: 'u2', name: 'Devin', email: 'devin@ai.com' }
//     ];
//   },
//   saveCode: async (roomId: string, code: string, language: string) => {
//     // POST /rooms/:roomId/code/save
//     localStorage.setItem(`room_lang_${roomId}`, language);
//     return { success: true };
//   },
//   loadCode: async (roomId: string) => {
//     // GET /rooms/:roomId/code
//     const savedLang = localStorage.getItem(`room_lang_${roomId}`) || 'javascript';
//     const defaultCode = savedLang === 'javascript' 
//       ? "// Start coding in JavaScript...\nconsole.log('Hello SyncCode');"
//       : "# Start coding in Python...\nprint('Hello SyncCode')";
    
//     return { code: defaultCode, language: savedLang as 'javascript' | 'python' };
//   }
// };

// export const executionService = {
//   execute: async (code: string, language: string, input: string = '') => {
//     // POST /execute
//     // Simulating remote execution delay
//     await new Promise(r => setTimeout(r, 1000));
//     if (language === 'javascript') {
//         return { output: 'Hello SyncCode Output\n[Done in 12ms]', error: null };
//     }
//     return { output: 'python: hello world', error: null };
//   }
// };

// export default api;



/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: JWT via cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

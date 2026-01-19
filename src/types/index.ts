export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Room {
  roomId: string;
  createdBy: string;
  participants: User[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: User;
  message: string;
  timestamp: string;
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  ROOM = 'ROOM'
}

export interface CodeState {
  code: string;
  language: 'javascript' | 'python';
}

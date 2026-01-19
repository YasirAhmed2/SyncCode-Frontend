/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatarColor?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const avatarColors = [
  '#00D9FF', '#00E5A0', '#FF6B6B', '#FFE66D', '#C44DFF', '#4ECDC4', '#FF8C42'
];

function getRandomColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('synccode_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (user: User) => {
    // Simulate API call
    setUser(user);
    localStorage.setItem('synccode_user', JSON.stringify(user));
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call - would send OTP in real app
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('pending_verification_email', email);
    localStorage.setItem('pending_user_name', name);
  };

  const verifyOtp = async (email: string, otp: string) => {
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    const name = localStorage.getItem('pending_user_name') || email.split('@')[0];
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatarColor: getRandomColor(),
    };

    setUser(mockUser);
    localStorage.setItem('synccode_user', JSON.stringify(mockUser));
    localStorage.removeItem('pending_verification_email');
    localStorage.removeItem('pending_user_name');
  };

  const requestPasswordReset = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('reset_email', email);
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.removeItem('reset_email');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('synccode_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

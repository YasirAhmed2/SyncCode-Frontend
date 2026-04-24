/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../lib/authService';

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
  login: (user: User, token?: string) => Promise<void>;
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
    const checkAuth = async () => {
      // 1. Load local data first (Optimistic UI)
      const storedUser = localStorage.getItem('synccode_user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }

      try {
        // 2. Verify with backend
        const response = await authService.getMe();

        // Handle various response structures: response.data (direct user) or response.data.user
        const data = response;
        const userData = data.user || data;

        // Normalize ID: support _id, id, or userId
        const userId = userData._id || userData.id || userData.userId;

        if (userId) {
          const validatedUser: User = {
            id: userId,
            name: userData.name,
            email: userData.email,
            avatarColor: userData.avatarColor
          };

          setUser(validatedUser);
          localStorage.setItem('synccode_user', JSON.stringify(validatedUser));
        }

      } catch (error: any) {
        console.error("Session verification warning:", error);

        // Only force logout if explicitly unauthorized (401) or forbidden (403)
        // If it's a 404 (endpoint not found) or 500 (server error), we keep the local session,
        // prioritizing user access over strict validation in case of network glitches.
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('synccode_user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (user: User, token?: string) => {
    setUser(user);
    localStorage.setItem('synccode_user', JSON.stringify(user));
    if (token) { // It might be in user object if backend sends it weirdly, but usually separate
      localStorage.setItem('token', token);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await authService.register({ name, email, password });
      localStorage.setItem('pending_verification_email', email);
      localStorage.setItem('pending_user_name', name);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await authService.verifyEmailOtp(email, otp);

      // Backend returns: { message, user: { userId, name, email }, token }
      const { user: backendUser, token } = response;

      const mappedUser: User = {
        id: backendUser.userId,
        name: backendUser.name,
        email: backendUser.email,
        avatarColor: getRandomColor(), // Backend doesn't persist this yet
      };

      await login(mappedUser, token);

      localStorage.removeItem('pending_verification_email');
      localStorage.removeItem('pending_user_name');
    } catch (error) {
      console.error("Verification failed:", error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    await authService.forgotPassword(email);
    localStorage.setItem('reset_email', email);
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const verifyResponse = await authService.verifyResetOtp(email, otp);
    await authService.resetPassword({
      newPassword,
      token: verifyResponse?.resetToken,
    });
    localStorage.removeItem('reset_email');
  };

  const logout = () => {
    authService.logout().catch(() => {
      // Client cleanup below is the critical path.
    });
    setUser(null);
    localStorage.removeItem('synccode_user');
    localStorage.removeItem('token');
    // Optional: Call API to logout server-side if needed, but client-side cleanup is critical
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

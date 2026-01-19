import api  from "../lib/api";

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  verifyEmailOtp: (email: string, otp: string) =>
    api.post("/auth/verify-email", { email, otp }),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  verifyResetOtp: (email: string, otp: string) =>
    api.post("/auth/verify-otp", { email, otp }),

  resetPassword: (email: string, password: string, token: string) =>
    api.post("/auth/reset-password", { email, password, token }),

  me: () => api.get("/user/me")
  
};

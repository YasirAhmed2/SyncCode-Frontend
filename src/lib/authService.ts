import api from "./api";

/* =======================
   AUTHENTICATION SERVICE
======================= */

export const authService = {
  // 1️⃣ Register user → send OTP
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  // 2️⃣ Verify email OTP
  verifyEmailOtp: async (email: string, otp: string) => {
    const res = await api.post("/auth/verify-email", { email, otp });
    return res.data;
  },

  // 3️⃣ Login
  login: async (data: {
    email: string;
    password: string;
  }) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  // 4️⃣ Get logged-in user
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  // 5️⃣ Logout
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  // 6️⃣ Forgot password → send OTP
  forgotPassword: async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  // 7️⃣ Verify reset OTP → receive reset token
  verifyResetOtp: async (email: string, otp: string) => {
    const res = await api.post("/auth/verify-reset-otp", { email, otp });
    return res.data; // contains resetToken
  },

  // 8️⃣ Reset password using token
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }) => {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
  },
};

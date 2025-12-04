import { apiRequest } from "./baseApi";

export const authAPI = {
  login: async (email, password) => {
    return await apiRequest("auth/login", "POST", { email, password });
  },

  register: async (email, password) => {
    return await apiRequest("auth/register", "POST", { email, password });
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("auth/logout", "POST", {}, token);
  },

  getAll: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("auth", "GET", {}, token);
  },

  updateRole: async (userId, role) => {
    const token = localStorage.getItem("token");
    return await apiRequest(
      `auth/${userId}/role`,
      "PUT",
      { role },
      token
    );
  },

  deleteUserById: async (userId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`auth/${userId}`, "DELETE", {}, token);
  },
  changePasswordWithOld: async (oldPassword, newPassword) => {
    const token = localStorage.getItem("token");
    return await apiRequest(
      "auth/me/change-password",
      "PATCH",
      { oldPassword, newPassword },
      token
    );
  },

  forgotPassword: async (email) => {
    return await apiRequest("auth/forgot-password", "POST", { email });
  },

  verifyOTP: async (email, otp) => {
    return await apiRequest("auth/verify-otp", "POST", { email, otp });
  },
  resetPassword: async (email, otp, newPassword) => {
    return await apiRequest("auth/reset-password", "POST", { 
      email, 
      otp, 
      newPassword 
    });
  },
};
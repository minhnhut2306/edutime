// src/api/authAPI.js
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
};
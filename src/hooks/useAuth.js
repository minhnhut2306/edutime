import { useState } from "react";
import { authAPI } from "../api/authAPI";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);

      if (response.code === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setLoading(false);
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      } else {
        throw new Error(response.msg || "Đăng nhập thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(email, password);

      if (response.code === 201 || response.code === 200) {
        setLoading(false);
        return {
          success: true,
          user: response.data,
        };
      } else {
        throw new Error(response.msg || "Đăng ký thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, clearing localStorage anyway");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        return { success: true, message: "Đã đăng xuất (không có token)" };
      }

      const response = await authAPI.logout();

      if (response.code === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setLoading(false);
        return { success: true, message: response.msg };
      } else {
        throw new Error(response.msg || "Đăng xuất thất bại");
      }
    } catch (err) {
      console.error("Logout error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const errorMessage =
        err.response?.data?.msg || err.message || "Có lỗi khi đăng xuất";
      setError(errorMessage);
      setLoading(false);

      return { success: true, message: "Đã đăng xuất (offline)" };
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.getAll();

      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          users: response.data.users,
          total: response.data.total,
        };
      } else {
        throw new Error(response.msg || "Lấy danh sách người dùng thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const updateUserRole = async (userId, role) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.updateRole(userId, role);

      if (response.code === 200) {
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(response.msg || "Cập nhật quyền thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.deleteUserById(userId);

      if (response.code === 200) {
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(response.msg || "Xóa người dùng thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  return {
    login,
    register,
    logout,
    fetchAllUsers,
    updateUserRole,
    deleteUser,
    loading,
    error,
  };
};

import { useState } from "react";
import { teacherAPI } from "../api/teacherAPI";

export const useTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.teachers();
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          teachers: response.data.teachers,
        };
      } else {
        throw new Error(response.msg || "Lấy danh sách giáo viên thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        teachers: [], // đảm bảo là array khi lỗi
      };
    }
  };
  const addTeacher = async (teacherData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.addTeacher(teacherData);
      if (response.code === 201 || response.code === 200) {
        setLoading(false);
        return {
          success: true,
          teacher: response.data,
        };
      } else {
        throw new Error(response.msg || "Thêm giáo viên thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };
  const deleteTeacher = async (teacherId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.deleteTeacher(teacherId);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          message: response.msg,
        };
      } else {
        throw new Error(response.msg || "Xóa giáo viên thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };
  const updateTeacher = async (teacherId, teacherData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.updateTeacher(teacherId, teacherData);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          teacher: response.data,
        };
      } else {
        throw new Error(response.msg || "Cập nhật giáo viên thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };
  const importTeachers = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.importTeachers(file);
      console.log("Full API response:", response); // Log để debug
      setLoading(false);

      // Response có thể là response.data trực tiếp hoặc response
      const data = response.data || response;

      if (response.code === 200 || response.code === 201) {
        return {
          success: true,
          data: data,
        };
      } else {
        throw new Error(response.msg || "Import giáo viên thất bại");
      }
    } catch (error) {
      console.log("Import error:", error);
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return {
    fetchTeachers,
    addTeacher,
    deleteTeacher,
    updateTeacher,
    importTeachers,
    loading,
    error,
  };
};

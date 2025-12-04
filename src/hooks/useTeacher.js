import { useState } from "react";
import { teacherAPI } from "../api/teacherAPI";

export const useTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeachers = async (schoolYear = null, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.teachers(schoolYear, page, limit);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          teachers: response.data.teachers,
          pagination: response.data.pagination,
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
        teachers: [],
        pagination: null,
      };
    }
  };

  const addTeacher = async (teacherData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.addTeacher(teacherData);
      if (response.code === 201) {
        setLoading(false);
        return {
          success: true,
          teacher: response.data.teacher,
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

  const updateTeacher = async (teacherId, teacherData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.updateTeacher(teacherId, teacherData);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          teacher: response.data.teacher,
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

  const deleteTeacher = async (teacherId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.deleteTeacher(teacherId);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
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

  const importTeachers = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherAPI.importTeachers(file);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.msg || "Import giáo viên thất bại");
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

  return {
    loading,
    error,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    importTeachers,
  };
};
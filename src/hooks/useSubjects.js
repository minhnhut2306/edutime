import { useState } from "react";
import { subjectsAPI } from "../api/subjectsAPI";

export const useSubjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = async (schoolYear = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subjectsAPI.subjects(schoolYear);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          subjects: response.data.subjects,
        };
      } else {
        throw new Error(response.msg || "Lấy danh sách môn học thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        subjects: [],
      };
    }
  };

  const addSubject = async (subjectData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subjectsAPI.addSubject(subjectData);
      if (response.code === 201 || response.code === 200) {
        setLoading(false);
        return {
          success: true,
          subject: response.data,
        };
      } else {
        throw new Error(response.msg || "Thêm môn học thất bại");
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

  const updateSubject = async (subjectId, subjectData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subjectsAPI.updateSubject(subjectId, subjectData);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          subject: response.data,
        };
      } else {
        throw new Error(response.msg || "Cập nhật môn học thất bại");
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

  const deleteSubject = async (subjectId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await subjectsAPI.deleteSubject(subjectId);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          message: response.msg,
        };
      } else {
        throw new Error(response.msg || "Xóa môn học thất bại");
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
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    loading,
    error,
  };
};

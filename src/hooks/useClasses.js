import { useState } from "react";
import { classesAPI } from "../api/classesAPI";

export const useClasses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await classesAPI.classes();
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          classes: response.data.classes,
        };
      } else {
        throw new Error(response.msg || "Lấy danh sách lớp học thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        classes: [],
      };
    }
  };
  const addClass = async (classData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await classesAPI.addClass(classData);
      if (response.code === 201 || response.code === 200) {
        setLoading(false);
        return {
          success: true,
          class: response.data,
        };
      } else {
        throw new Error(response.msg || "Thêm lớp học thất bại");
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

  const deleteClass = async (classId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await classesAPI.deleteClass(classId);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          message: "Xóa lớp học thành công",
        };
      } else {
        throw new Error(response.msg || "Xóa lớp học thất bại");
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
    fetchClasses,
    addClass,
    deleteClass,
  };
};

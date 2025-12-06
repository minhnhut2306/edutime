import { useState } from "react";
import { weeksAPI } from "../api/weeksAPI";

export const useWeeks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeeks = async (schoolYear = null, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await weeksAPI.weeks(schoolYear, page, limit);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          weeks: response.data.weeks,
          pagination: response.data.pagination,
        };
      } else {
        throw new Error(response.msg || "Lấy danh sách tuần thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        weeks: [],
        pagination: null,
      };
    }
  };

  const updateWeek = async (weekId, weekData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await weeksAPI.updateWeek(weekId, weekData);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          week: response.data,
        };
      } else {
        throw new Error(response.msg || "Cập nhật tuần thất bại");
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

  const addWeek = async (weekData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await weeksAPI.addWeek(weekData);
      if (response.code === 201) {
        setLoading(false);
        return {
          success: true,
          week: response.data,
        };
      } else {
        throw new Error(response.msg || "Thêm tuần thất bại");
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

  const deleteWeek = async (weekId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await weeksAPI.deleteWeek(weekId);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
        };
      } else {
        throw new Error(response.msg || "Xóa tuần thất bại");
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

  return { loading, error, fetchWeeks, updateWeek, addWeek, deleteWeek };
};

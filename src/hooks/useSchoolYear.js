import { useState } from "react";
import { schoolYearAPI } from "../api/schoolYearAPI";

export const useSchoolYear = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchoolYears = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolYearAPI.getSchoolYears();
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          schoolYears: response.data.schoolYears || [],
        };
      } else {
        throw new Error(response.msg || "Lấy danh sách năm học thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        schoolYears: [],
      };
    }
  };

  const getActiveSchoolYear = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolYearAPI.getActiveSchoolYear();
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          schoolYear: response.data,
        };
      } else {
        throw new Error(response.msg || "Lấy năm học hiện tại thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        schoolYear: null,
      };
    }
  };

  const getSchoolYearData = async (year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolYearAPI.getSchoolYearData(year);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.msg || "Lấy dữ liệu năm học thất bại");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || error.message || "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  };

  const createSchoolYear = async (yearData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolYearAPI.createSchoolYear(yearData);
      if (response.code === 201 || response.code === 200) {
        setLoading(false);
        return {
          success: true,
          schoolYear: response.data,
        };
      } else {
        throw new Error(response.msg || "Tạo năm học thất bại");
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

  const finishSchoolYear = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolYearAPI.finishSchoolYear();
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          message: response.msg,
          data: response.data,
        };
      } else {
        throw new Error(response.msg || "Kết thúc năm học thất bại");
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

  const deleteSchoolYear = async (year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolYearAPI.deleteSchoolYear(year);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          message: response.msg,
        };
      } else {
        throw new Error(response.msg || "Xóa năm học thất bại");
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
    fetchSchoolYears,
    getActiveSchoolYear,
    getSchoolYearData,
    createSchoolYear,
    finishSchoolYear,
    deleteSchoolYear,
    loading,
    error,
  };
};
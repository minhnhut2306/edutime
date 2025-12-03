import { useState } from "react";
import { teachingrecordsAPI } from "../api/teachingrecordsAPI";

export const useTeachingRecord = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeachingRecords = async (teacherId, schoolYear = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teachingrecordsAPI.teachingRecords(
        teacherId,
        schoolYear
      );

      if (response.code === 200 || response.success) {
        setLoading(false);

        const teachingRecords =
          response.data || response.teachingRecords || response;
        return {
          success: true,
          teachingRecords:
            teachingRecords.teachingRecords || teachingRecords || [],
        };
      } else {
        throw new Error(
          response.msg ||
            response.message ||
            "Lấy danh sách hồ sơ giảng dạy thất bại"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
        teachingRecords: [],
      };
    }
  };

  const addTeachingRecord = async (recordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teachingrecordsAPI.addTeachingRecord(recordData);
      if (response.code === 201 || response.code === 200 || response.success) {
        setLoading(false);
        return {
          success: true,
          teachingRecord: response.data,
        };
      } else {
        throw new Error(
          response.msg || response.message || "Thêm hồ sơ giảng dạy thất bại"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const updateTeachingRecord = async (recordId, recordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teachingrecordsAPI.updateTeachingRecord(
        recordId,
        recordData
      );
      setLoading(false);
      if (response.code === 200 || response.success) {
        return { success: true, teachingRecord: response.data };
      }
      throw new Error(response.msg || response.message || "Cập nhật thất bại");
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const deleteTeachingRecord = async (recordId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teachingrecordsAPI.deleteTeachingRecord(recordId);
      if (response.code === 200 || response.success) {
        setLoading(false);
        return {
          success: true,
          message: "Xóa hồ sơ giảng dạy thành công",
        };
      } else {
        throw new Error(
          response.msg || response.message || "Xóa hồ sơ giảng dạy thất bại"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra";
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
    fetchTeachingRecords,
    updateTeachingRecord,
    addTeachingRecord,
    deleteTeachingRecord,
  };
};

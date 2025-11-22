import { useState } from "react";
import { reportsAPI } from "../api/reportsAPI";

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm helper để download file
  const downloadFile = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Lấy báo cáo giáo viên theo loại
   * @param {string} teacherId - ID giáo viên
   * @param {string} type - Loại báo cáo: month|bc|week|semester|year
   * @param {object} filters - Các filter: schoolYear, month, bcNumber, weekId, semester
   */
  const getTeacherReport = async (teacherId, type, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsAPI.getTeacherReport(teacherId, type, filters);
      if (response.code === 200) {
        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.msg || "Lấy báo cáo thất bại");
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

  /**
   * Xuất báo cáo theo tháng hoặc BC
   * @param {string} teacherId - ID giáo viên
   * @param {string} schoolYear - Năm học (VD: "2024-2025")
   * @param {number|null} month - Tháng (1-12), null nếu xuất theo BC
   * @param {number|null} bcNumber - Số BC (1-12), null nếu xuất theo tháng
   */
  const exportMonthReport = async (teacherId, schoolYear, month = null, bcNumber = null) => {
    setLoading(true);
    setError(null);
    
    // Validation: Phải có ít nhất 1 trong 2
    if (month === null && bcNumber === null) {
      setError("Phải cung cấp month hoặc bcNumber");
      setLoading(false);
      return {
        success: false,
        message: "Phải cung cấp month hoặc bcNumber",
      };
    }

    // Không cho phép cả 2 cùng lúc
    if (month !== null && bcNumber !== null) {
      setError("Chỉ được chọn month HOẶC bcNumber, không được cả hai");
      setLoading(false);
      return {
        success: false,
        message: "Chỉ được chọn month HOẶC bcNumber, không được cả hai",
      };
    }

    try {
      const response = await reportsAPI.exportMonthReport(teacherId, schoolYear, month, bcNumber);
      setLoading(false);

      const fileName = bcNumber !== null
        ? `BaoCao_BC${bcNumber}_${schoolYear}.xlsx`
        : `BaoCaoThang_${month}_${schoolYear}.xlsx`;

      downloadFile(response.data, fileName);
      return { success: true };
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

  /**
   * Xuất báo cáo theo tuần
   * @param {string} teacherId - ID giáo viên
   * @param {string|null} weekId - ID của 1 tuần đơn lẻ, null nếu xuất nhiều tuần
   * @param {array|null} weekIds - Mảng ID của nhiều tuần, null nếu xuất 1 tuần
   */
  const exportWeekReport = async (teacherId, weekId = null, weekIds = null) => {
    setLoading(true);
    setError(null);

    // Validation: Phải có ít nhất 1 trong 2
    if (!weekId && (!weekIds || weekIds.length === 0)) {
      setError("Phải cung cấp weekId hoặc weekIds");
      setLoading(false);
      return {
        success: false,
        message: "Phải cung cấp weekId hoặc weekIds",
      };
    }

    try {
      const response = await reportsAPI.exportWeekReport(teacherId, weekId, weekIds);
      setLoading(false);

      const fileName = weekIds && weekIds.length > 0
        ? `BaoCao_NhieuTuan.xlsx`
        : `BaoCaoTuan_${weekId}.xlsx`;

      downloadFile(response.data, fileName);
      return { success: true };
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

  /**
   * Xuất báo cáo theo học kỳ
   * @param {string} teacherId - ID giáo viên
   * @param {string} schoolYear - Năm học
   * @param {number} semester - Học kỳ (1 hoặc 2)
   */
  const exportSemesterReport = async (teacherId, schoolYear, semester) => {
    setLoading(true);
    setError(null);

    if (!semester || (semester !== 1 && semester !== 2)) {
      setError("Học kỳ phải là 1 hoặc 2");
      setLoading(false);
      return {
        success: false,
        message: "Học kỳ phải là 1 hoặc 2",
      };
    }

    try {
      const response = await reportsAPI.exportSemesterReport(teacherId, schoolYear, semester);
      setLoading(false);

      const fileName = `BaoCaoHocKy${semester}_${schoolYear}.xlsx`;
      downloadFile(response.data, fileName);
      return { success: true };
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

  /**
   * Xuất báo cáo theo năm
   * @param {string} teacherId - ID giáo viên
   * @param {string} schoolYear - Năm học
   * @param {boolean} allBC - true = xuất tất cả BC, false = xuất báo cáo năm thông thường
   */
  const exportYearReport = async (teacherId, schoolYear, allBC = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsAPI.exportYearReport(teacherId, schoolYear, allBC);
      setLoading(false);

      const fileName = allBC
        ? `BaoCaoTongHopBC_${schoolYear}.xlsx`
        : `BaoCaoNam_${schoolYear}.xlsx`;

      downloadFile(response.data, fileName);
      return { success: true };
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
    getTeacherReport,
    exportMonthReport,
    exportWeekReport,
    exportSemesterReport,
    exportYearReport,
    loading,
    error,
  };
};
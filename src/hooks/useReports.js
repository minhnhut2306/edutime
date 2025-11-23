// ==================== UPDATED: src/hooks/useReports.js ====================

import { useState } from "react";
import { reportsAPI } from "../api/reportsAPI";

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper download file
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
   * ✅ FIX: Xuất báo cáo - UNIFIED FUNCTION với schoolYear
   */
  const exportReport = async (options) => {
    setLoading(true);
    setError(null);

    try {
      console.log("📤 exportReport HOOK - Options:", options);

      // ✅ VALIDATION - schoolYear BẮT BUỘC
      if (!options.schoolYear) {
        throw new Error("Vui lòng chọn năm học");
      }
      if (!options.teacherIds && !options.teacherId) {
        throw new Error("Vui lòng chọn giáo viên");
      }

      const response = await reportsAPI.exportReport(options);
      setLoading(false);

      // Build filename
      const { type = 'bc', bcNumber, schoolYear, teacherIds, semester } = options;
      let fileName = `BaoCao_${schoolYear}`;
      if (type === 'bc' && bcNumber) fileName = `BC${bcNumber}_${schoolYear}`;
      else if (type === 'week') fileName = `BaoCaoTuan_${schoolYear}`;
      else if (type === 'semester') fileName = `HocKy${semester}_${schoolYear}`;
      else if (type === 'year') fileName = `CaNam_${schoolYear}`;
      
      const count = Array.isArray(teacherIds) ? teacherIds.length : 1;
      if (count > 1) fileName += `_${count}GV`;
      fileName += '.xlsx';

      console.log("📥 Downloading file:", fileName);
      downloadFile(response.data, fileName);
      
      return { success: true };
    } catch (err) {
      // ✅✅✅ XỬ LÝ LỖI THÂN THIỆN ✅✅✅
      let userFriendlyMessage = "Có lỗi xảy ra khi xuất báo cáo";
      
      // Lỗi 404 - Không có dữ liệu
      if (err.response?.status === 404) {
        // Đọc message từ backend (nếu có)
        try {
          const blob = err.response.data;
          const text = await blob.text();
          const json = JSON.parse(text);
          userFriendlyMessage = json.msg || json.message || "Không tìm thấy dữ liệu";
        } catch (parseError) {
          userFriendlyMessage = "Không tìm thấy dữ liệu giảng dạy";
        }
        
        // ✅ Thêm gợi ý cụ thể
        userFriendlyMessage += `\n\n📋 Vui lòng kiểm tra:\n`;
        userFriendlyMessage += `• Giáo viên đã nhập tiết dạy cho năm học ${options.schoolYear} chưa?\n`;
        userFriendlyMessage += `• Bản ghi có đúng tuần/tháng/học kỳ không?\n`;
        userFriendlyMessage += `• Thử chọn năm học khác xem có dữ liệu không?`;
      }
      // Lỗi 401 - Chưa đăng nhập
      else if (err.response?.status === 401) {
        userFriendlyMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
      }
      // Lỗi 403 - Không có quyền
      else if (err.response?.status === 403) {
        userFriendlyMessage = "Bạn không có quyền xuất báo cáo này!";
      }
      // Lỗi 500 - Lỗi server
      else if (err.response?.status === 500) {
        userFriendlyMessage = "Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên!";
      }
      // Lỗi mạng
      else if (err.message === "Network Error") {
        userFriendlyMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
      }
      // Lỗi khác
      else if (err.response?.data?.msg) {
        userFriendlyMessage = err.response.data.msg;
      } else if (err.message) {
        userFriendlyMessage = err.message;
      }
      
      console.error("❌ Export Error:", err);
      setError(userFriendlyMessage);
      setLoading(false);
      
      return { success: false, message: userFriendlyMessage };
    }
  };

  // ==================== LEGACY FUNCTIONS ====================

  const exportMonthReport = async (teacherIds, schoolYear, month = null, bcNumber = null) => {
    setLoading(true);
    setError(null);

    if (month === null && bcNumber === null) {
      setError("Phải cung cấp month hoặc bcNumber");
      setLoading(false);
      return { success: false, message: "Phải cung cấp month hoặc bcNumber" };
    }

    if (!schoolYear) {
      setError("schoolYear là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYear là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportMonthReport(teacherIds, schoolYear, month, bcNumber);
      setLoading(false);

      const bc = bcNumber || month;
      const count = Array.isArray(teacherIds) ? teacherIds.length : 1;
      const fileName = count > 1 ? `BC${bc}_${schoolYear}_${count}GV.xlsx` : `BC${bc}_${schoolYear}.xlsx`;

      downloadFile(response.data, fileName);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const exportWeekReport = async (teacherId, weekId = null, weekIds = null, schoolYear) => {
    setLoading(true);
    setError(null);

    if (!weekId && (!weekIds || weekIds.length === 0)) {
      setError("Phải cung cấp weekId hoặc weekIds");
      setLoading(false);
      return { success: false, message: "Phải cung cấp weekId hoặc weekIds" };
    }

    if (!schoolYear) {
      setError("schoolYear là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYear là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportWeekReport(teacherId, weekId, weekIds, schoolYear);
      setLoading(false);

      const fileName = weekIds && weekIds.length > 0 ? `BaoCao_NhieuTuan_${schoolYear}.xlsx` : `BaoCaoTuan_${schoolYear}.xlsx`;

      downloadFile(response.data, fileName);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const exportSemesterReport = async (teacherId, schoolYear, semester) => {
    setLoading(true);
    setError(null);

    if (!semester || (semester !== 1 && semester !== 2)) {
      setError("Học kỳ phải là 1 hoặc 2");
      setLoading(false);
      return { success: false, message: "Học kỳ phải là 1 hoặc 2" };
    }

    if (!schoolYear) {
      setError("schoolYear là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYear là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportSemesterReport(teacherId, schoolYear, semester);
      setLoading(false);

      downloadFile(response.data, `HocKy${semester}_${schoolYear}.xlsx`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const exportYearReport = async (teacherId, schoolYear, allBC = false) => {
    setLoading(true);
    setError(null);

    if (!schoolYear) {
      setError("schoolYear là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYear là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportYearReport(teacherId, schoolYear, allBC);
      setLoading(false);

      const fileName = allBC ? `TongHopBC_${schoolYear}.xlsx` : `BaoCaoNam_${schoolYear}.xlsx`;

      downloadFile(response.data, fileName);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const getTeacherReport = async (teacherId, type, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsAPI.getTeacherReport(teacherId, type, filters);
      setLoading(false);
      if (response.code === 200) {
        return { success: true, data: response.data };
      }
      throw new Error(response.msg || "Lấy báo cáo thất bại");
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  return {
    exportReport,
    getTeacherReport,
    exportMonthReport,
    exportWeekReport,
    exportSemesterReport,
    exportYearReport,
    loading,
    error,
  };
};
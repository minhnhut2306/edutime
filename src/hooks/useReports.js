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
   * ✅ FIX: Xuất báo cáo - UNIFIED FUNCTION
   * Tất cả loại báo cáo đều dùng chung 1 mẫu Excel
   */
  const exportReport = async (options) => {
    setLoading(true);
    setError(null);

    try {
      console.log("📤 exportReport HOOK - Options:", options);

      // ✅ VALIDATION
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
      const msg = err.response?.data?.msg 
        || err.response?.data?.message 
        || err.message 
        || "Có lỗi xảy ra";
      
      console.error("❌ Export Error:", msg);
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
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

  const exportWeekReport = async (teacherId, weekId = null, weekIds = null) => {
    setLoading(true);
    setError(null);

    if (!weekId && (!weekIds || weekIds.length === 0)) {
      setError("Phải cung cấp weekId hoặc weekIds");
      setLoading(false);
      return { success: false, message: "Phải cung cấp weekId hoặc weekIds" };
    }

    try {
      const response = await reportsAPI.exportWeekReport(teacherId, weekId, weekIds);
      setLoading(false);

      const fileName = weekIds && weekIds.length > 0 ? `BaoCao_NhieuTuan.xlsx` : `BaoCaoTuan.xlsx`;

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

// ==================== UPDATED: Key part of ReportView.jsx ====================

// Thay thế handleExport function trong ReportView.jsx:


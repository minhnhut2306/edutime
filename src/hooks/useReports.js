import { useState } from "react";
import { reportsAPI } from "../api/reportsAPI";

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadFile = (blob, response) => {
    // Lấy tên file từ Content-Disposition header (backend đã đặt sẵn)
    let fileName = 'BaoCao.xlsx'; // fallback
    
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''));
      }
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportReport = async (options) => {
    setLoading(true);
    setError(null);

    try {
      // Accept both schoolYearId and schoolYear (backward/forward compatibility)
      const schoolYearValue = options?.schoolYearId || options?.schoolYear || options?.schoolYearLabel;
      if (!schoolYearValue) {
        throw new Error("Vui lòng chọn năm học (schoolYearId hoặc schoolYear)");
      }

      // Accept teacherIds or teacherId (single)
      if (!options?.teacherIds && !options?.teacherId) {
        throw new Error("Vui lòng chọn giáo viên");
      }

      const response = await reportsAPI.exportReport(options);
      setLoading(false);

      // Không cần tự tạo tên file nữa - backend đã đặt sẵn trong header
      downloadFile(response.data, response);

      return { success: true };
    } catch (err) {
      let userFriendlyMessage = "Có lỗi xảy ra khi xuất báo cáo";

      if (err.response?.status === 404) {
        try {
          const blob = err.response.data;
          const text = await blob.text();
          const json = JSON.parse(text);
          userFriendlyMessage = json.msg || json.message || "Không tìm thấy dữ liệu";
        // eslint-disable-next-line no-unused-vars
        } catch (parseError) {
          userFriendlyMessage = "Không tìm thấy dữ liệu giảng dạy";
        }

        userFriendlyMessage += `\n\n Vui lòng kiểm tra:\n`;
        userFriendlyMessage += `• Giáo viên đã nhập tiết dạy cho năm học chưa?\n`;
        userFriendlyMessage += `• Bản ghi có đúng tuần/tháng/học kỳ không?\n`;
        userFriendlyMessage += `• Thử chọn năm học khác xem có dữ liệu không?`;
      }

      else if (err.response?.status === 401) {
        userFriendlyMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
      }

      else if (err.response?.status === 403) {
        userFriendlyMessage = "Bạn không có quyền xuất báo cáo này!";
      }

      else if (err.response?.status === 500) {
        userFriendlyMessage = "Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên!";
      }

      else if (err.message === "Network Error") {
        userFriendlyMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
      }

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

  const exportMonthReport = async (teacherIds, schoolYearId, month = null, bcNumber = null) => {
    setLoading(true);
    setError(null);

    if (month === null && bcNumber === null) {
      setError("Phải cung cấp month hoặc bcNumber");
      setLoading(false);
      return { success: false, message: "Phải cung cấp month hoặc bcNumber" };
    }

    if (!schoolYearId) {
      setError("schoolYearId là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYearId là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportMonthReport(teacherIds, schoolYearId, month, bcNumber);
      setLoading(false);

      downloadFile(response.data, response);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const exportWeekReport = async (teacherId, weekId = null, weekIds = null, schoolYearId) => {
    setLoading(true);
    setError(null);

    if (!weekId && (!weekIds || weekIds.length === 0)) {
      setError("Phải cung cấp weekId hoặc weekIds");
      setLoading(false);
      return { success: false, message: "Phải cung cấp weekId hoặc weekIds" };
    }

    if (!schoolYearId) {
      setError("schoolYearId là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYearId là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportWeekReport(teacherId, weekId, weekIds, schoolYearId);
      setLoading(false);

      downloadFile(response.data, response);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const exportSemesterReport = async (teacherId, schoolYearId, semester) => {
    setLoading(true);
    setError(null);

    if (!semester || (semester !== 1 && semester !== 2)) {
      setError("Học kỳ phải là 1 hoặc 2");
      setLoading(false);
      return { success: false, message: "Học kỳ phải là 1 hoặc 2" };
    }

    if (!schoolYearId) {
      setError("schoolYearId là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYearId là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportSemesterReport(teacherId, schoolYearId, semester);
      setLoading(false);

      downloadFile(response.data, response);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Có lỗi xảy ra";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const exportYearReport = async (teacherId, schoolYearId, allBC = false) => {
    setLoading(true);
    setError(null);

    if (!schoolYearId) {
      setError("schoolYearId là bắt buộc");
      setLoading(false);
      return { success: false, message: "schoolYearId là bắt buộc" };
    }

    try {
      const response = await reportsAPI.exportYearReport(teacherId, schoolYearId, allBC);
      setLoading(false);

      downloadFile(response.data, response);
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

    const exportMultipleReports = async (options) => {
    setLoading(true);
    setError(null);

    try {
      const schoolYearValue = options?.schoolYearId || options?.schoolYear || options?.schoolYearLabel;
      if (!schoolYearValue) {
        throw new Error("Vui lòng chọn năm học (schoolYearId hoặc schoolYear)");
      }

      if (!options?.teacherIds || options.teacherIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất 1 giáo viên");
      }

      const response = await reportsAPI.exportMultipleReports(options);
      setLoading(false);

      // Download file ZIP
      let fileName = `BaoCao_${options.teacherIds.length}GV.zip`;
      
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      let userFriendlyMessage = "Có lỗi xảy ra khi xuất báo cáo nhiều giáo viên";

      if (err.response?.status === 404) {
        userFriendlyMessage = "Không tìm thấy dữ liệu cho các giáo viên đã chọn";
      } else if (err.response?.status === 401) {
        userFriendlyMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
      } else if (err.response?.status === 403) {
        userFriendlyMessage = "Bạn không có quyền xuất báo cáo này!";
      } else if (err.response?.status === 500) {
        userFriendlyMessage = "Lỗi hệ thống. Vui lòng thử lại sau!";
      } else if (err.message) {
        userFriendlyMessage = err.message;
      }

      console.error("❌ Export Multiple Error:", err);
      setError(userFriendlyMessage);
      setLoading(false);

      return { success: false, message: userFriendlyMessage };
    }
  };

  return {
    exportReport,
    getTeacherReport,
    exportMonthReport,
    exportWeekReport,
    exportSemesterReport,
    exportYearReport,
    exportMultipleReports,
    loading,
    error,
  };
};
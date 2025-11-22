import { api, apiRequest } from "./baseApi";

export const reportsAPI = {
  /**
   * Lấy báo cáo giáo viên
   * @param {string} teacherId - ID giáo viên
   * @param {string} type - Loại báo cáo: month|bc|week|semester|year
   * @param {object} filters - Các filter tùy theo type
   */
  getTeacherReport: async (teacherId, type, filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ type, ...filters }).toString();
    return await apiRequest(`reports/teacher/${teacherId}?${params}`, "GET", {}, token);
  },

  /**
   * Xuất Excel theo tháng hoặc BC
   * @param {string} teacherId - ID giáo viên
   * @param {string} schoolYear - Năm học
   * @param {number|null} month - Tháng (1-12) hoặc null
   * @param {number|null} bcNumber - Số BC (1-12) hoặc null
   */
  exportMonthReport: async (teacherId, schoolYear, month = null, bcNumber = null) => {
    const token = localStorage.getItem("token");
    
    // Validation
    if (month === null && bcNumber === null) {
      throw new Error("Phải cung cấp month hoặc bcNumber");
    }

    if (month !== null && bcNumber !== null) {
      throw new Error("Chỉ được chọn month HOẶC bcNumber, không được cả hai");
    }

    // Build params
    let params = `teacherId=${teacherId}&schoolYear=${schoolYear}`;
    if (bcNumber !== null) {
      params += `&bcNumber=${bcNumber}`;
    } else {
      params += `&month=${month}`;
    }

    const response = await api.get(`reports/export/month?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Xuất Excel theo tuần
   * @param {string} teacherId - ID giáo viên
   * @param {string|null} weekId - ID tuần đơn lẻ hoặc null
   * @param {array|null} weekIds - Mảng ID nhiều tuần hoặc null
   */
  exportWeekReport: async (teacherId, weekId = null, weekIds = null) => {
    const token = localStorage.getItem("token");
    
    // Validation
    if (!weekId && (!weekIds || weekIds.length === 0)) {
      throw new Error("Phải cung cấp weekId hoặc weekIds");
    }

    // Build params
    let params = `teacherId=${teacherId}`;
    if (weekIds && weekIds.length > 0) {
      params += `&weekIds=${JSON.stringify(weekIds)}`;
    } else if (weekId) {
      params += `&weekId=${weekId}`;
    }

    const response = await api.get(`reports/export/week?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Xuất Excel theo học kỳ
   * @param {string} teacherId - ID giáo viên
   * @param {string} schoolYear - Năm học
   * @param {number} semester - Học kỳ (1 hoặc 2)
   */
  exportSemesterReport: async (teacherId, schoolYear, semester) => {
    const token = localStorage.getItem("token");
    
    // Validation
    if (!semester || (semester !== 1 && semester !== 2)) {
      throw new Error("Học kỳ phải là 1 hoặc 2");
    }

    const params = `teacherId=${teacherId}&schoolYear=${schoolYear}&semester=${semester}`;

    const response = await api.get(`reports/export/semester?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Xuất Excel theo năm
   * @param {string} teacherId - ID giáo viên
   * @param {string} schoolYear - Năm học
   * @param {boolean} allBC - true = xuất tất cả BC, false = báo cáo năm thông thường
   */
  exportYearReport: async (teacherId, schoolYear, allBC = false) => {
    const token = localStorage.getItem("token");
    let params = `teacherId=${teacherId}&schoolYear=${schoolYear}`;
    if (allBC) {
      params += `&allBC=true`;
    }

    const response = await api.get(`reports/export/year?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },
};
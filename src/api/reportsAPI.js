import { api, apiRequest } from "./baseApi";

export const reportsAPI = {
  /**
   * Lấy báo cáo giáo viên (JSON)
   */
  getTeacherReport: async (teacherId, type, filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ type, ...filters }).toString();
    return await apiRequest(`reports/teacher/${teacherId}?${params}`, "GET", {}, token);
  },

  /**
   * Xuất Excel - UNIFIED API
   * Tất cả loại báo cáo đều dùng chung 1 mẫu Excel
   * Tự động xác định BC từ dữ liệu
   * 
   * @param {object} options
   * - teacherIds: string hoặc array - ID giáo viên
   * - schoolYear: string - Năm học (bắt buộc)
   * - type: 'bc'|'week'|'semester'|'year' - Loại báo cáo
   * - bcNumber: number - Số BC (chỉ khi type='bc' và muốn chỉ định BC cụ thể)
   * - weekId: string - ID tuần (khi type='week')
   * - weekIds: array - Mảng ID tuần (khi type='week')
   * - semester: 1|2 - Học kỳ (khi type='semester')
   */
  exportReport: async (options) => {
    const token = localStorage.getItem("token");
    const { teacherIds, schoolYear, type = 'bc', bcNumber, weekId, weekIds, semester } = options;

    if (!schoolYear) throw new Error("schoolYear là bắt buộc");
    if (!teacherIds) throw new Error("teacherIds là bắt buộc");

    // Build params
    const params = new URLSearchParams();
    params.append('schoolYear', schoolYear);
    params.append('type', type);

    // Handle teacherIds
    if (Array.isArray(teacherIds)) {
      params.append('teacherIds', JSON.stringify(teacherIds));
    } else {
      params.append('teacherId', teacherIds);
    }

    if (bcNumber) params.append('bcNumber', bcNumber);
    if (weekId) params.append('weekId', weekId);
    if (weekIds && weekIds.length > 0) params.append('weekIds', JSON.stringify(weekIds));
    if (semester) params.append('semester', semester);

    const response = await api.get(`reports/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },

  // ==================== LEGACY APIs (backward compatible) ====================

  exportMonthReport: async (teacherIds, schoolYear, month = null, bcNumber = null) => {
    const token = localStorage.getItem("token");
    
    if (month === null && bcNumber === null) {
      throw new Error("Phải cung cấp month hoặc bcNumber");
    }

    let params = `schoolYear=${schoolYear}`;
    
    if (Array.isArray(teacherIds)) {
      params += `&teacherIds=${JSON.stringify(teacherIds)}`;
    } else {
      params += `&teacherId=${teacherIds}`;
    }
    
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

  exportWeekReport: async (teacherId, weekId = null, weekIds = null) => {
    const token = localStorage.getItem("token");
    
    if (!weekId && (!weekIds || weekIds.length === 0)) {
      throw new Error("Phải cung cấp weekId hoặc weekIds");
    }

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

  exportSemesterReport: async (teacherId, schoolYear, semester) => {
    const token = localStorage.getItem("token");
    
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

  exportYearReport: async (teacherId, schoolYear, allBC = false) => {
    const token = localStorage.getItem("token");
    let params = `teacherId=${teacherId}&schoolYear=${schoolYear}`;
    if (allBC) params += `&allBC=true`;

    const response = await api.get(`reports/export/year?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },
};
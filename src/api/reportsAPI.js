// ==================== UPDATED: src/api/reportsAPI.js ====================

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
   * ✅ FIX: Xuất Excel - UNIFIED API với schoolYear BẮT BUỘC
   * 
   * @param {object} options
   * - teacherIds: string hoặc array - ID giáo viên (BẮT BUỘC)
   * - schoolYear: string - Năm học (BẮT BUỘC - VD: "2024-2025")
   * - type: 'bc'|'week'|'semester'|'year' - Loại báo cáo
   * - bcNumber: number - Số BC (chỉ khi type='bc')
   * - weekId: string - ID tuần (khi type='week')
   * - weekIds: array - Mảng ID tuần (khi type='week')
   * - semester: 1|2 - Học kỳ (khi type='semester')
   */
  exportReport: async (options) => {
    const token = localStorage.getItem("token");
    const { teacherIds, schoolYear, type = 'bc', bcNumber, weekId, weekIds, semester } = options;

    // ✅ DEBUG TOKEN
    console.log("🔑 Token exists:", !!token);
    if (token) {
      console.log("🔑 Token preview:", token.substring(0, 20) + "...");
    }

    // ✅ VALIDATION
    if (!token) throw new Error("Chưa đăng nhập! Vui lòng đăng nhập lại.");
    if (!schoolYear) throw new Error("schoolYear là bắt buộc (VD: 2024-2025)");
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

    console.log("📤 Calling API:", `reports/export?${params.toString()}`);

    // ✅ FIX: Đảm bảo headers được gửi đúng
    const response = await api.get(`reports/export?${params.toString()}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
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

    // ✅ VALIDATION schoolYear
    if (!schoolYear) {
      throw new Error("schoolYear là bắt buộc");
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

  exportWeekReport: async (teacherId, weekId = null, weekIds = null, schoolYear) => {
    const token = localStorage.getItem("token");
    
    if (!weekId && (!weekIds || weekIds.length === 0)) {
      throw new Error("Phải cung cấp weekId hoặc weekIds");
    }

    // ✅ VALIDATION schoolYear
    if (!schoolYear) {
      throw new Error("schoolYear là bắt buộc");
    }

    let params = `teacherId=${teacherId}&schoolYear=${schoolYear}`;
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

    // ✅ VALIDATION schoolYear
    if (!schoolYear) {
      throw new Error("schoolYear là bắt buộc");
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
    
    // ✅ VALIDATION schoolYear
    if (!schoolYear) {
      throw new Error("schoolYear là bắt buộc");
    }

    let params = `teacherId=${teacherId}&schoolYear=${schoolYear}`;
    if (allBC) params += `&allBC=true`;

    const response = await api.get(`reports/export/year?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },
};
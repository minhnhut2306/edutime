import { api, apiRequest } from "./baseApi";

export const reportsAPI = {
  getTeacherReport: async (teacherId, type, filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ type, ...filters }).toString();
    return await apiRequest(`reports/teacher/${teacherId}?${params}`, "GET", {}, token);
  },

  exportReport: async (options) => {
    const token = localStorage.getItem("token");
    const { teacherIds, schoolYear, type = 'bc', bcNumber, weekId, weekIds, semester } = options;

    console.log(" Token exists:", !!token);
    if (token) {
      console.log(" Token preview:", token.substring(0, 20) + "...");
    }

    if (!token) throw new Error("Chưa đăng nhập! Vui lòng đăng nhập lại.");
    if (!schoolYear) throw new Error("schoolYear là bắt buộc (VD: 2024-2025)");
    if (!teacherIds) throw new Error("teacherIds là bắt buộc");

    const params = new URLSearchParams();
    params.append('schoolYear', schoolYear);
    params.append('type', type);

    if (Array.isArray(teacherIds)) {
      params.append('teacherIds', JSON.stringify(teacherIds));
    } else {
      params.append('teacherId', teacherIds);
    }

    if (bcNumber) params.append('bcNumber', bcNumber);
    if (weekId) params.append('weekId', weekId);
    if (weekIds && weekIds.length > 0) params.append('weekIds', JSON.stringify(weekIds));
    if (semester) params.append('semester', semester);

    const url = `reports/export?${params.toString()}`;
    console.log("Calling API:", url);
    console.log("Full URL:", `http://localhost:5000/api/${url}`);

    try {
      const response = await api.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      console.log("Response received:", response.status);
      return response;
    } catch (error) {
      console.error("Export Error:", error.response?.status, error.response?.data);
      throw error;
    }
  },

  exportMonthReport: async (teacherIds, schoolYear, month = null, bcNumber = null) => {
    const token = localStorage.getItem("token");
    
    if (month === null && bcNumber === null) {
      throw new Error("Phải cung cấp month hoặc bcNumber");
    }

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
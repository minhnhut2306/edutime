import { api, apiRequest } from "./baseApi";

export const reportsAPI = {
  getTeacherReport: async (teacherId, type, filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ type, ...filters }).toString();
    return await apiRequest(`reports/teacher/${teacherId}?${params}`, "GET", {}, token);
  },

  exportReport: async (options) => {
    const token = localStorage.getItem("token");
    const {
      teacherIds,
      teacherId,
      schoolYear,
      schoolYearId,
      type = 'bc',
      bcNumber,
      bcNumbers,
      weekId,
      weekIds,
      semester
    } = options;

    if (!token) throw new Error("Chưa đăng nhập! Vui lòng đăng nhập lại.");
    if (!schoolYearId && !schoolYear) throw new Error("schoolYearId hoặc schoolYear là bắt buộc");
    if (!teacherIds && !teacherId) throw new Error("teacherIds hoặc teacherId là bắt buộc");

    const params = new URLSearchParams();
    
    // School year
    if (schoolYearId) params.append('schoolYearId', schoolYearId);
    else params.append('schoolYear', schoolYear);

    params.append('type', type);

    // Teacher IDs
    if (Array.isArray(teacherIds)) {
      params.append('teacherIds', JSON.stringify(teacherIds));
    } else if (teacherId) {
      params.append('teacherId', teacherId);
    } else {
      params.append('teacherId', teacherIds);
    }

    // BC parameters - hỗ trợ nhiều tháng
    if (bcNumbers && bcNumbers.length > 0) {
      params.append('bcNumbers', JSON.stringify(bcNumbers));
    } else if (bcNumber) {
      params.append('bcNumber', bcNumber);
    }
    
    if (weekId) params.append('weekId', weekId);
    if (weekIds && weekIds.length > 0) params.append('weekIds', JSON.stringify(weekIds));
    if (semester) params.append('semester', semester);

    const url = `reports/export?${params.toString()}`;

    try {
      const response = await api.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      return response;
    } catch (error) {
      console.error("Export Error:", error.response?.status, error.response?.data);
      throw error;
    }
  },

  exportMonthReport: async (teacherIds, schoolYearId, month = null, bcNumber = null, bcNumbers = null) => {
    const token = localStorage.getItem("token");

    if (month === null && bcNumber === null && (!bcNumbers || bcNumbers.length === 0)) {
      throw new Error("Phải cung cấp month, bcNumber hoặc bcNumbers");
    }

    if (!schoolYearId) {
      throw new Error("schoolYearId là bắt buộc");
    }

    let params = `schoolYearId=${schoolYearId}`;

    if (Array.isArray(teacherIds)) {
      params += `&teacherIds=${encodeURIComponent(JSON.stringify(teacherIds))}`;
    } else {
      params += `&teacherId=${teacherIds}`;
    }

    if (bcNumbers && bcNumbers.length > 0) {
      params += `&bcNumbers=${encodeURIComponent(JSON.stringify(bcNumbers))}`;
    } else if (bcNumber !== null) {
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

  exportWeekReport: async (teacherId, weekId = null, weekIds = null, schoolYearId) => {
    const token = localStorage.getItem("token");

    if (!weekId && (!weekIds || weekIds.length === 0)) {
      throw new Error("Phải cung cấp weekId hoặc weekIds");
    }

    if (!schoolYearId) {
      throw new Error("schoolYearId là bắt buộc");
    }

    let params = `teacherId=${teacherId}&schoolYearId=${schoolYearId}`;
    if (weekIds && weekIds.length > 0) {
      params += `&weekIds=${encodeURIComponent(JSON.stringify(weekIds))}`;
    } else if (weekId) {
      params += `&weekId=${weekId}`;
    }

    const response = await api.get(`reports/export/week?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },

  exportSemesterReport: async (teacherId, schoolYearId, semester) => {
    const token = localStorage.getItem("token");

    if (!semester || (semester !== 1 && semester !== 2)) {
      throw new Error("Học kỳ phải là 1 hoặc 2");
    }

    if (!schoolYearId) {
      throw new Error("schoolYearId là bắt buộc");
    }

    const params = `teacherId=${teacherId}&schoolYearId=${schoolYearId}&semester=${semester}`;

    const response = await api.get(`reports/export/semester?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },

  exportYearReport: async (teacherId, schoolYearId, allBC = false) => {
    const token = localStorage.getItem("token");

    if (!schoolYearId) {
      throw new Error("schoolYearId là bắt buộc");
    }

    let params = `teacherId=${teacherId}&schoolYearId=${schoolYearId}`;
    if (allBC) params += `&allBC=true`;

    const response = await api.get(`reports/export/year?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response;
  },
};
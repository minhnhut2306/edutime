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
      weekId,
      weekIds,
      semester
    } = options;

    console.log(" Token exists:", !!token);
    if (token) {
      console.log(" Token preview:", token.substring(0, 20) + "...");
    }

    if (!token) throw new Error("Chưa đăng nhập! Vui lòng đăng nhập lại.");
    // Require either schoolYearId (preferred) or schoolYear (fallback)
    if (!schoolYearId && !schoolYear) throw new Error("schoolYearId hoặc schoolYear là bắt buộc");
    // require teacherIds array or single teacherId
    if (!teacherIds && !teacherId) throw new Error("teacherIds hoặc teacherId là bắt buộc");

    const params = new URLSearchParams();
    // Prefer schoolYearId param (backend expects this)
    if (schoolYearId) params.append('schoolYearId', schoolYearId);
    else params.append('schoolYear', schoolYear);

    params.append('type', type);

    if (Array.isArray(teacherIds)) {
      params.append('teacherIds', JSON.stringify(teacherIds));
    } else if (teacherId) {
      params.append('teacherId', teacherId);
    } else {
      // fallback single teacher id passed in teacherIds as string
      params.append('teacherId', teacherIds);
    }

    if (bcNumber) params.append('bcNumber', bcNumber);
    if (weekId) params.append('weekId', weekId);
    if (weekIds && weekIds.length > 0) params.append('weekIds', JSON.stringify(weekIds));
    if (semester) params.append('semester', semester);

    const url = `reports/export?${params.toString()}`;
    console.log("Calling API:", url);
    console.log("Full URL:", `${api.defaults?.baseURL || 'http://localhost:5000/api/'}${url}`);

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

  exportMonthReport: async (teacherIds, schoolYearId, month = null, bcNumber = null) => {
    const token = localStorage.getItem("token");

    if (month === null && bcNumber === null) {
      throw new Error("Phải cung cấp month hoặc bcNumber");
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
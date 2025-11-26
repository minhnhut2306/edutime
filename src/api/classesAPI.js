// ✅ FIX: src/api/classesAPI.js

import { apiRequest } from "./baseApi";

export const classesAPI = {
  // ✅ THÊM schoolYear parameter
  classes: async (schoolYear = null) => {
    const token = localStorage.getItem("token");
    // ✅ BUILD query string
    const params = schoolYear ? `?schoolYear=${schoolYear}` : "";
    return await apiRequest(`classes${params}`, "GET", {}, token);
  },
  
  addClass: async (classData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`classes`, "POST", classData, token);
  },
  
  deleteClass: async (classId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`classes/${classId}`, "DELETE", {}, token);
  }
};
// src/api/teachingrecordsAPI.js

import { apiRequest } from "./baseApi";

export const teachingrecordsAPI = {
  // ✅ FIX: Thêm tham số schoolYear
  teachingRecords: async (teacherId, schoolYear = null) => {
    const token = localStorage.getItem("token");
    
    // ✅ BUILD QUERY STRING
    let url = `teaching-records`;
    const params = new URLSearchParams();
    
    if (teacherId) {
      params.append('teacherId', teacherId);
    }
    
    // ✅ NẾU CÓ schoolYear, THÊM VÀO QUERY
    if (schoolYear) {
      params.append('schoolYear', schoolYear);
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return await apiRequest(url, "GET", {}, token);
  },

  addTeachingRecord: async (recordData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teaching-records`, "POST", recordData, token);
  },

  updateTeachingRecord: async (recordId, recordData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(
      `teaching-records/${recordId}`,
      "PATCH",
      recordData,
      token
    );
  },

  deleteTeachingRecord: async (recordId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(
      `teaching-records/${recordId}`,
      "DELETE",
      {},
      token
    );
  },
};
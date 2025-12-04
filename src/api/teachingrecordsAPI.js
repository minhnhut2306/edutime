import { apiRequest } from "./baseApi";

export const teachingrecordsAPI = {
  teachingRecords: async (teacherId, schoolYear = null, filters = {}, pagination = {}) => {
    const token = localStorage.getItem("token");
    
    let url = `teaching-records`;
    const params = new URLSearchParams();
    
    if (teacherId) {
      params.append('teacherId', teacherId);
    }
    
    if (schoolYear) {
      params.append('schoolYear', schoolYear);
    }

    // Add filter params
    if (filters.weekId) {
      params.append('weekId', filters.weekId);
    }
    
    if (filters.classId) {
      params.append('classId', filters.classId);
    }
    
    if (filters.subjectId) {
      params.append('subjectId', filters.subjectId);
    }
    
    if (filters.recordType) {
      params.append('recordType', filters.recordType);
    }
    
    if (filters.semester) {
      params.append('semester', filters.semester);
    }

    // Add pagination params
    if (pagination.page) {
      params.append('page', pagination.page);
    }
    
    if (pagination.limit) {
      params.append('limit', pagination.limit);
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
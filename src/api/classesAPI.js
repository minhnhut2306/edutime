import { apiRequest } from "./baseApi";

export const classesAPI = {
  classes: async (schoolYear = null, page = 1, limit = 10, grade = null) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    if (schoolYear) params.append("schoolYear", schoolYear);
    if (grade) params.append("grade", grade);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    
    const queryString = params.toString();
    return await apiRequest(`classes?${queryString}`, "GET", {}, token);
  },

  getAvailableGrades: async (schoolYear = null) => {
    const token = localStorage.getItem("token");
    const params = schoolYear ? `?schoolYear=${schoolYear}` : "";
    return await apiRequest(`classes/grades${params}`, "GET", {}, token);
  },
  
  addClass: async (classData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`classes`, "POST", classData, token);
  },
  
  updateClass: async (classId, classData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`classes/${classId}`, "PUT", classData, token);
  },
  
  deleteClass: async (classId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`classes/${classId}`, "DELETE", {}, token);
  }
};
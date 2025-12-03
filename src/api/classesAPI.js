import { apiRequest } from "./baseApi";

export const classesAPI = {
  classes: async (schoolYear = null) => {
    const token = localStorage.getItem("token");
    const params = schoolYear ? `?schoolYear=${schoolYear}` : "";
    return await apiRequest(`classes${params}`, "GET", {}, token);
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
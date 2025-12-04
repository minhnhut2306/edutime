import { apiRequest } from "./baseApi";

export const weeksAPI = {
  weeks: async (schoolYear = null, page = 1, limit = 10) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    if (schoolYear) params.append("schoolYear", schoolYear);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    
    const queryString = params.toString();
    return await apiRequest(`weeks?${queryString}`, "GET", {}, token);
  },
  
  addWeek: async (weekData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`weeks`, "POST", weekData, token);
  },
  
  updateWeek: async (weekId, weekData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`weeks/${weekId}`, "PUT", weekData, token);
  },
  
  deleteWeek: async (weekId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`weeks/${weekId}`, "DELETE", {}, token);
  },
};
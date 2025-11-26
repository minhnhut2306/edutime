import { apiRequest } from "./baseApi";

export const weeksAPI = {
  weeks: async (schoolYear = null) => {
    const token = localStorage.getItem("token");

    const params = schoolYear ? `?schoolYear=${schoolYear}` : "";
    return await apiRequest(`weeks${params}`, "GET", {}, token);
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

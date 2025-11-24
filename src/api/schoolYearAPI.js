import { apiRequest } from "./baseApi";

export const schoolYearAPI = {

  getSchoolYears: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years", "GET", null, token);
  },


  getActiveSchoolYear: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years/active", "GET", null, token);
  },


  getSchoolYearData: async (year) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`/school-years/${year}`, "GET", null, token);
  },


  createSchoolYear: async (yearData) => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years", "POST", yearData, token);
  },


  finishSchoolYear: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years/finish", "POST", null, token);
  },


  deleteSchoolYear: async (year) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`/school-years/${year}`, "DELETE", null, token);
  },
};
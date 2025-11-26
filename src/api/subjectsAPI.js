import { apiRequest } from "./baseApi";

export const subjectsAPI = {
  subjects: async (schoolYear = null) => {
    const token = localStorage.getItem("token");

    const params = schoolYear ? `?schoolYear=${schoolYear}` : "";
    return await apiRequest(`subjects${params}`, "GET", {}, token);
  },
  addSubject: async (subjectData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`subjects`, "POST", subjectData, token);
  },
  deleteSubject: async (subjectId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`subjects/${subjectId}`, "DELETE", {}, token);
  },
};

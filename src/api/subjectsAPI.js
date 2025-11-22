
import { apiRequest } from "./baseApi";

export const subjectsAPI = {
    subjects: async () => {
        const token = localStorage.getItem("token");
        return await apiRequest(`subjects`, "GET", {}, token);
    },
    addSubject: async (subjectData) => {
        const token = localStorage.getItem("token");
        return await apiRequest(`subjects`, "POST", subjectData, token);
    },
    deleteSubject: async (subjectId) => {
        const token = localStorage.getItem("token");
        return await apiRequest(`subjects/${subjectId}`, "DELETE", {}, token);
    }
};


import { apiRequest } from "./baseApi";

export const classesAPI = {
    classes: async () => {
        const token = localStorage.getItem("token");
        return await apiRequest(`classes`, "GET", {}, token);
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

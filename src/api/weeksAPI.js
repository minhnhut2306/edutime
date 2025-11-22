
import { apiRequest } from "./baseApi";

export const weeksAPI = {
    weeks: async () => {
        const token = localStorage.getItem("token");
        return await apiRequest(`weeks`, "GET", {}, token);
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
    }
};

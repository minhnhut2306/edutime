import { apiRequest } from "./baseApi";

export const teachingrecordsAPI = {
  teachingRecords: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teaching-records`, "GET", {}, token);
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

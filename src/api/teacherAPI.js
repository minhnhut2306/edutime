import { api, apiRequest } from "./baseApi"; 

export const teacherAPI = {
  teachers: async () => {
    return await apiRequest("teachers", "GET");
  },
  addTeacher: async (teacherData) => {
    return await apiRequest("teachers", "POST", teacherData);
  },
  deleteTeacher: async (teacherId) => {
    return await apiRequest(`teachers/${teacherId}`, "DELETE");
  },
  updateTeacher: async (teacherId, teacherData) => {
    return await apiRequest(`teachers/${teacherId}`, "PUT", teacherData);
  },
  updateTeacherUserId: async (teacherId, userId) => {
    return await apiRequest(`teachers/${teacherId}/user`, "PUT", { userId });
  },
  importTeachers: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("teachers/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

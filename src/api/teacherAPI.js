import { apiRequest } from "./baseApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const teacherAPI = {
  teachers: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teachers`, "GET", {}, token);
  },
  
  addTeacher: async (teacherData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teachers`, "POST", teacherData, token);
  },
  
  deleteTeacher: async (teacherId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teachers/${teacherId}`, "DELETE", {}, token);
  },
  
  updateTeacher: async (teacherId, teacherData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teachers/${teacherId}`, "PUT", teacherData, token);
  },
  
  updateTeacherUserId: async (teacherId, userId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`teachers/${teacherId}/user`, "PUT", { userId }, token);
  },
  
  importTeachers: async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${BASE_URL}/teachers/import`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
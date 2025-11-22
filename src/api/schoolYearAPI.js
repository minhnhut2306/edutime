import { apiRequest } from "./baseApi";

export const schoolYearAPI = {
  // Lấy danh sách tất cả các năm học
  getSchoolYears: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years", "GET", null, token);
  },

  // Lấy năm học đang hoạt động
  getActiveSchoolYear: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years/active", "GET", null, token);
  },

  // Lấy dữ liệu của một năm học cụ thể
  getSchoolYearData: async (year) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`/school-years/${year}`, "GET", null, token);
  },

  // Tạo năm học mới
  createSchoolYear: async (yearData) => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years", "POST", yearData, token);
  },

  // Kết thúc năm học hiện tại
  finishSchoolYear: async () => {
    const token = localStorage.getItem("token");
    return await apiRequest("/school-years/finish", "POST", null, token);
  },

  // Xóa năm học
  deleteSchoolYear: async (year) => {
    const token = localStorage.getItem("token");
    return await apiRequest(`/school-years/${year}`, "DELETE", null, token);
  },
};
import axios from "axios";

//const API_URL = "https://edutime-server.vercel.app/api/";
const API_URL = "http://localhost:5000/api/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Sử dụng axios thay vì fetch
export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  token = null
) => {
  try {
    const config = {
      method,
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Axios tự động bỏ qua data nếu null/undefined
    if (body && Object.keys(body).length > 0) {
      config.data = body; // axios dùng 'data' không phải 'body'
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};
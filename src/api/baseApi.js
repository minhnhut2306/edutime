import axios from "axios";

// ✅ KIỂM TRA URL
const API_URL = "http://localhost:5000/api/";
// Nếu deploy thì dùng:
// const API_URL = "https://edutime-server.vercel.app/api/";

console.log("🌐 API_URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // ✅ Tăng timeout cho export Excel
});

// ✅ AUTO ADD TOKEN - Interceptor tự động thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`🔑 Token exists: ${!!token}`);
    
    // ✅ Tự động thêm token nếu có
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ Token auto-added to request`);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error: ${error.config?.url}`, {
        status: error.response.status,
        message: error.response.data?.msg || error.message,
        data: error.response.data
      });
      
      // ✅ Nếu 401 Unauthorized -> Có thể token hết hạn
      if (error.response.status === 401) {
        console.warn("⚠️ Token có thể đã hết hạn. Vui lòng đăng nhập lại.");
        // Có thể redirect đến trang login
        // window.location.href = '/login';
      }
    } else {
      console.error("❌ Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

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

    // ✅ Ưu tiên token được truyền vào, nếu không có thì lấy từ localStorage
    const authToken = token || localStorage.getItem("token");
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    if (body && Object.keys(body).length > 0) {
      config.data = body;
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};
// src/api/baseApi.js - CẬP NHẬT ĐẦY ĐỦ
import axios from "axios";

// const API_URL = "http://localhost:5000/api/";
const API_URL = "https://edutime-server.vercel.app/api/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// 🔥 Biến global để trigger modal với error message
let sessionExpiredCallback = null;

// 🔥 Export function để set callback
export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// 🔥 Response interceptor - Xử lý phiên hết hạn
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`API Error [${status}]:`, data?.msg || error.message);
      
      // 🔥 Kiểm tra nếu là lỗi 401 và message là "Phiên đăng nhập đã hết hạn"
      if (status === 401) {
        const errorMessage = data?.msg || '';
        
        if (errorMessage.includes('Phiên đăng nhập đã hết hạn')) {
          console.warn("🔥 Phiên đăng nhập đã hết hạn (đăng nhập thiết bị khác)");
          
          // Xóa token và user
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 🔥 Trigger modal thông qua callback với error message đầy đủ
          if (sessionExpiredCallback) {
            sessionExpiredCallback(errorMessage); // 🔥 Pass error message
          } else {
            // Fallback nếu chưa setup callback
            alert(`⚠️ ${errorMessage}`);
            window.location.reload();
          }
          
          return Promise.reject(new Error('Session expired'));
        }
        
        console.warn("Token hết hạn hoặc không hợp lệ.");
      }
    } else {
      console.error("Network Error:", error.message);
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
    console.error(`Error fetching ${endpoint}:`, error.message);
    throw error;
  }
};
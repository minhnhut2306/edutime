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

// ✅ Biến global để trigger modal với error message
let sessionExpiredCallback = null;
let sessionExpiredTriggered = false; // ✅ Flag tránh trigger nhiều lần

// ✅ Export function để set callback
export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
  sessionExpiredTriggered = false; // ✅ Reset flag khi set callback mới
  console.log('✅ Session expired callback registered');
};

// Request interceptor - ✅ KIỂM TRA TOKEN TRƯỚC KHI GỌI API
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ BỎ QUA việc verify token cho các endpoint không cần auth
    const skipVerify = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/verify-otp',
      '/auth/reset-password'
    ].some(path => config.url?.includes(path));
    
    // ✅ KIỂM TRA TOKEN TRƯỚC MỖI REQUEST (trừ các endpoint public)
    if (token && !skipVerify && !config._skipTokenVerify) {
      try {
        // Gọi API verify token (thêm flag để tránh loop vô hạn)
        await api.post('/auth/token/verify', {}, {
          headers: { Authorization: `Bearer ${token}` },
          _skipTokenVerify: true // Flag để tránh verify chính nó
        });
      } catch (error) {
        // Nếu token không hợp lệ, interceptor response sẽ handle
        console.log('⚠️ Token pre-check failed, continuing with request...');
      }
    }
    
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Xử lý phiên hết hạn
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`🔥 API Error [${status}]:`, data?.msg || error.message);
      
      // ✅ Kiểm tra nếu là lỗi 401 HOẶC 500 với message "Phiên đăng nhập đã hết hạn"
      if (status === 401 || status === 500) {
        const errorMessage = data?.msg || '';
        
        console.log('🔍 Error Message:', errorMessage);
        
        // ✅ Chỉ trigger 1 lần duy nhất
        if (errorMessage.includes('Phiên đăng nhập đã hết hạn') && !sessionExpiredTriggered) {
          sessionExpiredTriggered = true; // ✅ Đánh dấu đã trigger
          
          console.warn("🔥 TRIGGER SESSION EXPIRED MODAL");
          
          // Xóa token và user
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // ✅ Trigger modal thông qua callback với error message đầy đủ
          if (sessionExpiredCallback) {
            sessionExpiredCallback(errorMessage);
          } else {
            // Fallback nếu chưa setup callback
            console.error('⚠️ sessionExpiredCallback not set!');
            alert(`${errorMessage}`);
            window.location.reload();
          }
          
          return Promise.reject(new Error('Session expired'));
        }
        
        if (status === 401) {
          console.warn("Token hết hạn hoặc không hợp lệ (không phải multi-login)");
        }
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
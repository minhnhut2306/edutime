import axios from "axios";

const API_URL = "https://edutime-server.vercel.app/api/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

let sessionExpiredCallback = null;
let sessionExpiredTriggered = false;

export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
  sessionExpiredTriggered = false;
};

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const skipVerify = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/verify-otp',
      '/auth/reset-password'
    ].some(path => config.url?.includes(path));
    
    if (token && !skipVerify && !config._skipTokenVerify) {
      try {
        await api.post('/auth/token/verify', {}, {
          headers: { Authorization: `Bearer ${token}` },
          _skipTokenVerify: true
        });
      } catch (error) {
        console.log('Token pre-check failed:', error.message);
      }
    }
    
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`API Error [${status}]:`, data?.msg || error.message);
      
      if (status === 401 || status === 500) {
        const errorMessage = data?.msg || '';
        
        console.log('Error Message:', errorMessage);
        
        if (errorMessage.includes('Phiên đăng nhập đã hết hạn') && !sessionExpiredTriggered) {
          sessionExpiredTriggered = true;
          
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (sessionExpiredCallback) {
            sessionExpiredCallback(errorMessage);
          } else {
            console.error('sessionExpiredCallback not set!');
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
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
  console.log("✅ Session expired callback registered");
};

// ✅ BỎ TOKEN VERIFY - Giảm 1 request không cần thiết
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.error(`🔥 API Error [${status}]:`, data?.msg || error.message);

      // ✅ TỰ ĐỘNG ĐĂNG XUẤT KHI GẶP LỖI 401
      if (status === 401) {
        const errorMessage = data?.msg || "Token không hợp lệ";

        console.warn("🔥 AUTO LOGOUT - Token không hợp lệ");

        // Xóa token và user
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Hiển thị thông báo
        alert(
          `Phiên đăng nhập đã hết hạn!\n\n${errorMessage}\n\nVui lòng đăng nhập lại.`
        );

        // Reload trang để về màn hình login
        window.location.reload();

        return Promise.reject(new Error("Session expired"));
      }

      // ✅ XỬ LÝ LỖI SESSION EXPIRED (500)
      if (status === 500) {
        const errorMessage = data?.msg || "";

        if (
          errorMessage.includes("Phiên đăng nhập đã hết hạn") &&
          !sessionExpiredTriggered
        ) {
          sessionExpiredTriggered = true;

          console.warn("🔥 TRIGGER SESSION EXPIRED MODAL");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          if (sessionExpiredCallback) {
            sessionExpiredCallback(errorMessage);
          } else {
            console.error("⚠️ sessionExpiredCallback not set!");
            alert(`${errorMessage}`);
            window.location.reload();
          }

          return Promise.reject(new Error("Session expired"));
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

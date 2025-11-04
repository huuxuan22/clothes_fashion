import axios from "axios";
import { BASE_API_URL } from "../config/Config";

// Tạo axios instance cơ bản
const baseAxios = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 giây
});

// Request interceptor - thêm token vào header nếu có
baseAxios.interceptors.request.use(
    (config) => {
        // Nếu đã có Authorization header trong config, giữ nguyên (cho phép override)
        if (!config.headers.Authorization) {
            // Lấy token từ localStorage hoặc sessionStorage nếu cần
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - xử lý lỗi 401 và 403
baseAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const config = error.config;

            // KHÔNG redirect nếu đang ở trang login hoặc đang gọi API login
            const isLoginRequest = config?.url?.includes("/login") ||
                window.location.pathname === "/login";

            // Xử lý lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
            if ((status === 401 || status === 403) && !isLoginRequest) {
                // Xóa token nếu có
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                localStorage.removeItem("user_principal");

                window.location.href = "/403";
            }
        }

        return Promise.reject(error);
    }
);

export default baseAxios;


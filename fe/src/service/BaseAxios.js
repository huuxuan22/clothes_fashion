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

// Danh sách các API công khai - không redirect khi nhận 401/403
const PUBLIC_API_PATHS = [
    // Product APIs
    "/admin/product/standOut-nam",
    "/admin/product/standOut-nu",
    "/admin/product/search",
    "/admin/product/totalPage",
    "/admin/product/top-deal",
    "/admin/product/category",
    "/admin/product/discount-product",
    "/admin/product/detail",
    "/admin/product/image",
    "/admin/product/same",
    "/admin/product/count",
    "/admin/product/solid",
    "/admin/product/select-color",
    "/admin/product/searchByName",
    // User APIs
    "/api/users/find-product",
    "/api/users/count-all-product",
    "/api/users/get-all-collection",
    "/api/users/collection/first",
    "/api/users/collection/second",
    // Coupon/Deal APIs - public để xem
    "/api/users/coupons",
    "/api/users/deals",
    "/api/users/get-coupon",
    "/api/users/get-deal",
    "/api/admin/coupon/get-all",
    "/api/admin/deal/get-all",
    // Category, Size, Color APIs
    "/api/categories",
    "/api/subcategory",
    "/api/size",
    "/api/color",
    // Image APIs
    "/image",
    // Comment APIs
    "/api/comment",
    // Auth APIs
    "/api/login",
    "/api/register",
    "/api/auth/google",
    "/api/forgot-password",
    "/api/reset-password",
];

// Danh sách các routes công khai - không redirect khi ở các routes này
const PUBLIC_ROUTES = [
    "/",
    "/home",
    "/product-page",
    "/product-detail",
    "/search",
    "/introduce",
    "/contact",
    "/collection-detail",
    "/coupon-detail",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-code",
    "/enter-email-verify",
    "/403",
];

/**
 * Kiểm tra xem API có phải là public API không
 */
const isPublicAPI = (url) => {
    if (!url) return false;
    return PUBLIC_API_PATHS.some(path => url.includes(path));
};

/**
 * Kiểm tra xem route hiện tại có phải là public route không
 */
const isPublicRoute = () => {
    const currentPath = window.location.pathname;
    return PUBLIC_ROUTES.some(route => currentPath === route || currentPath.startsWith(route + "/"));
};

// Response interceptor - xử lý lỗi 401 và 403
baseAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const config = error.config;
            const requestUrl = config?.url || "";

            const isLoginRequest = requestUrl.includes("/login") ||
                window.location.pathname === "/login";
            const isLogoutRequest = requestUrl.includes("/logout") ||
                window.location.pathname === "/logout";

            // Chỉ redirect khi:
            // 1. Nhận 401/403
            // 2. Không phải login/logout request
            // 3. API không phải là public API
            // 4. Không đang ở public route
            if ((status === 401 || status === 403) &&
                !isLoginRequest &&
                !isLogoutRequest &&
                !isPublicAPI(requestUrl) &&
                !isPublicRoute()) {

                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                localStorage.removeItem("user_principal");

                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default baseAxios;


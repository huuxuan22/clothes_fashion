import baseAxios from "./BaseAxios"


/**
 * Login API với xử lý error rõ ràng
 * 
 * Response types từ backend:
 * - 200 OK: String token
 * - 400 BAD_REQUEST: LoginErrors { username?: string, password?: string }
 * - 401 UNAUTHORIZED: ErrorRespones { message: string, status: number }
 * - 500 INTERNAL_SERVER_ERROR: ErrorRespones { message: string, status: number }
 */
export const login = async (data) => {
    try {
        // Login không cần token, nên không truyền Authorization header
        const res = await baseAxios.post(`/api/login`, data, {
            headers: {
                Authorization: undefined, // Không gửi token cho login
            },
        });

        // Success: backend trả về token string
        return {
            success: true,
            data: res.data, // Token string
            token: res.data
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            // 400 BAD_REQUEST: Validation errors (LoginErrors)
            if (status === 400) {
                return {
                    success: false,
                    errorType: 'validation',
                    data: errorData, // { username?: string, password?: string }
                    status: status
                };
            }

            // 401 UNAUTHORIZED: Authentication error (ErrorRespones)
            if (status === 401) {
                return {
                    success: false,
                    errorType: 'authentication',
                    message: errorData.message || 'Tài khoản hoặc mật khẩu không đúng.',
                    data: errorData,
                    status: status
                };
            }

            // 500 INTERNAL_SERVER_ERROR: Server error (ErrorRespones)
            if (status === 500) {
                return {
                    success: false,
                    errorType: 'server',
                    message: errorData.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
                    data: errorData,
                    status: status
                };
            }

            // Other errors
            return {
                success: false,
                errorType: 'unknown',
                message: errorData.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
                data: errorData,
                status: status
            };
        } else {
            return {
                success: false,
                errorType: 'network',
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                status: 0
            };
        }
    }
}

export const register = async (data) => {
    try {
        const { confirmPassword, gender, ...userDTO } = data; // Loại bỏ confirmPassword
        // Chuyển đổi gender thành true nếu là male, ngược lại false
        const updatedGender = gender === 'male' ? true : false;
        // Cập nhật lại giá trị gender trong userDTO
        const updatedUserDTO = { ...userDTO, gender: updatedGender };
        const res = await baseAxios.put(`/api/register`, updatedUserDTO, {
            headers: {
                'Content-Type': 'application/json', // Đảm bảo là gửi dưới dạng JSON
            },
        });

        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            return { success: false, data: error.response.data };
        } else {
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};

export const saveAfterCheck = async (userDTO, code) => {
    try {
        const res = await baseAxios.post(`/api/save`,
            userDTO, // Đây là @RequestBody
            {
                params: { code } // Đây là @RequestParam
            }
        );
        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            return { success: false, data: error.response.data };
        } else {
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
}

export const sendCodeAgain = async (email) => {
    try {
        const res = await baseAxios.post(`/api/send-again?email=${email}`,);
        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            return { success: false, data: error.response.data };
        } else {
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
}


/**
 * Lấy được mã giảm giá khi thanh toán 

 */
export const logOut = async (token) => {
    try {

        const res = await baseAxios.post(
            `/api/logout`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            return { success: false, data: error.response.data };
        } else {
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};
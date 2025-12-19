import baseAxios from "./BaseAxios"


export const login = async (data) => {
    try {
        debugger;
        const res = await baseAxios.post(`/api/login`, data, {
            headers: {
                Authorization: undefined, // Không gửi token cho login
            },
        });
        debugger;

        return {
            success: true,
            data: res.data,
            token: res.data.token,
            user: res.data.user
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            if (status === 400) {
                return {
                    success: false,
                    errorType: 'validation',
                    data: errorData,
                    status: status
                };
            }

            if (status === 401) {
                return {
                    success: false,
                    errorType: 'authentication',
                    message: errorData.message || 'Tài khoản Không tồn tại hoặc mật khẩu không đúng.',
                    data: errorData,
                    status: status
                };
            }

            if (status === 500) {
                return {
                    success: false,
                    errorType: 'server',
                    message: errorData.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
                    data: errorData,
                    status: status
                };
            }

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
        const { confirmPassword, gender, ...userDTO } = data;
        const updatedGender = gender === 'male' ? true : false;
        const updatedUserDTO = { ...userDTO, gender: updatedGender };
        const res = await baseAxios.put(`/api/register`, updatedUserDTO, {
            headers: {
                'Content-Type': 'application/json',
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


export const saveAfterCheck = async (email, code) => {
    try {
        const res = await baseAxios.post(`/api/save`, null, {
            params: {
                email: email,
                code: code
            }
        });

        return {
            success: true,
            data: res.data,
            token: res.data
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            if (status === 400) {
                return {
                    success: false,
                    errorType: 'validation',
                    message: errorData || 'Mã xác thực không đúng hoặc đã hết hạn',
                    data: errorData
                };
            }

            return {
                success: false,
                errorType: 'server',
                message: errorData || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
                data: errorData
            };
        } else {
            return {
                success: false,
                errorType: 'network',
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                data: "Lỗi máy chủ, vui lòng thử lại!"
            };
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
        // Lấy token từ localStorage nếu không có trong param
        const authToken = token || localStorage.getItem("token");

        if (!authToken) {
            return { success: true, data: "Đã đăng xuất" };
        }

        const res = await baseAxios.post(
            `/api/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            console.log("Logout API error:", error.response.data);
            return { success: true, data: "Đã đăng xuất" };
        } else {
            return { success: true, data: "Đã đăng xuất" };
        }
    }
};
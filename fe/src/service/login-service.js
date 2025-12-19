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

export const forgotPassword = async (email) => {
    try {
        const res = await baseAxios.post(`/api/forgot-password?email=${email}`);
        // Backend trả về string message khi thành công
        return {
            success: true,
            data: typeof res.data === 'string' ? res.data : res.data?.message || "Mã xác thực đã được gửi đến email của bạn"
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            // Xử lý các loại lỗi khác nhau
            if (status === 400) {
                return {
                    success: false,
                    data: typeof errorData === 'string'
                        ? errorData
                        : errorData?.message || "Email không tồn tại trong hệ thống"
                };
            }

            if (status === 429 || status === 403) {
                return {
                    success: false,
                    data: typeof errorData === 'string'
                        ? errorData
                        : errorData?.message || "Email đã bị chặn do gửi quá nhiều yêu cầu. Vui lòng đợi 10 phút."
                };
            }

            return {
                success: false,
                data: typeof errorData === 'string'
                    ? errorData
                    : errorData?.message || "Không thể gửi mã xác thực. Vui lòng thử lại."
            };
        } else {
            return {
                success: false,
                data: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
            };
        }
    }
}

export const verifyCodeForResetPassword = async (email, code) => {
    try {
        // Gọi API verify code (tạm thời dùng verifyOtpCode logic)
        // Thực tế có thể tạo endpoint riêng hoặc dùng lại logic
        const res = await baseAxios.post(`/api/verify-code-forgot-password?email=${email}&code=${code}`);
        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            if (status === 400) {
                return {
                    success: false,
                    data: typeof errorData === 'string'
                        ? errorData
                        : errorData?.message || "Mã xác thực không đúng hoặc đã hết hạn"
                };
            }

            return {
                success: false,
                data: typeof errorData === 'string'
                    ? errorData
                    : errorData?.message || "Không thể xác thực mã. Vui lòng thử lại."
            };
        } else {
            return {
                success: false,
                data: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
            };
        }
    }
}

export const resetPassword = async (email, code, newPassword) => {
    try {
        const res = await baseAxios.post(
            `/api/reset-password?email=${email}&code=${code}&newPassword=${newPassword}`
        );
        // Backend trả về JWT token khi thành công
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
                    data: typeof errorData === 'string'
                        ? errorData
                        : errorData?.message || "Mã xác thực không đúng hoặc đã hết hạn"
                };
            }

            return {
                success: false,
                errorType: 'server',
                data: typeof errorData === 'string'
                    ? errorData
                    : errorData?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại."
            };
        } else {
            return {
                success: false,
                errorType: 'network',
                data: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
            };
        }
    }
}

export const sendCodeAgain = async (email) => {
    try {
        const res = await baseAxios.post(`/api/send-again?email=${email}`);
        // Backend trả về string message khi thành công
        return {
            success: true,
            data: typeof res.data === 'string' ? res.data : res.data?.message || "Mã xác thực đã được gửi lại"
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            // Xử lý các loại lỗi khác nhau
            if (status === 400) {
                return {
                    success: false,
                    data: typeof errorData === 'string'
                        ? errorData
                        : errorData?.message || "Dữ liệu không hợp lệ. Vui lòng thử lại."
                };
            }

            if (status === 429 || status === 403) {
                return {
                    success: false,
                    data: typeof errorData === 'string'
                        ? errorData
                        : errorData?.message || "Email đã bị chặn do gửi quá nhiều yêu cầu. Vui lòng đợi 10 phút."
                };
            }

            return {
                success: false,
                data: typeof errorData === 'string'
                    ? errorData
                    : errorData?.message || "Không thể gửi mã xác thực. Vui lòng thử lại."
            };
        } else {
            return {
                success: false,
                data: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
            };
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
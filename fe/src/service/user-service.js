import baseAxios from "./BaseAxios";

export const updateUser = async (formData, token) => {
    try {
        const res = await baseAxios.post(
            `/api/users/update-profile`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            return { success: false, data: error.response.data };
        } else {
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};


export const getAllAddressUser = async (token) => {
    try {
        const res = await baseAxios.get(
            `/api/users/address`,
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
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};


export const addNewAddress = async (token, addressUserDTO) => {
    try {
        const res = await baseAxios.post(
            `/api/users/add-new-address`, addressUserDTO,
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
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};

export const updateAddress = async (token, addressUser) => {
    try {
        const res = await baseAxios.post(
            `/api/users/update-address`, addressUser,
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
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};

export const deleteAddress = async (token, id) => {
    try {
        const res = await baseAxios.delete(
            `/api/users/delete?id=${id}`,
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
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};

export const changePassword = async (token, password) => {
    try {
        console.log(" dư lieeujL ", password);

        const res = await baseAxios.post(
            `/api/users/change-password?oldPassword=${password}`,
            {}, // POST body rỗng
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


/**
 * Gửi mã OTP cho change password
 */
export const sendCodeForPasswordChange = async (token) => {
    try {
        const res = await baseAxios.post(
            `/api/users/send-code-password`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        // Backend trả về string message khi thành công
        return {
            success: true,
            data: typeof res.data === 'string' ? res.data : res.data?.message || "Mã xác thực đã được gửi đến email của bạn"
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            if (status === 401) {
                return {
                    success: false,
                    data: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
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
};

/**
 * Cập nhật mật khẩu sau khi verify OTP
 */
export const updatePassword = async (token, newPassword, code) => {
    try {
        const res = await baseAxios.post(
            `/api/users/update-password?newPassword=${newPassword}&code=${code}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: true, data: res.data, token: res.data };
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
};

/**
 * Lấy danh sách coupon (public API - không cần token)
 */
export const getAllCoupons = async (size = 5, page = 0, token = null) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Chỉ thêm token nếu có
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/users/coupons?size=${size}&page=${page}`,
            {
                headers: headers
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

/**
 * Lấy danh sách deal (public API - không cần token)
 */
export const getAllDeals = async (size = 5, page = 0, token = null) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Chỉ thêm token nếu có
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/users/deals?size=${size}&page=${page}`,
            {
                headers: headers
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

export const getCoupon = async (token, code) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Token là optional cho API này (có thể xem chi tiết mà không cần đăng nhập)
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/users/get-coupon?code=${code}`,
            {
                headers: headers
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


/**
 * Lấy được mã giảm giá khi thanh toán 
 * @param {} token 
 * @param {*} code 
 * @returns 
 */
export const getDeal = async (token, productId) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Token là optional cho API này (có thể xem chi tiết mà không cần đăng nhập)
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/users/get-deal?productId=${productId}`,
            {
                headers: headers
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






/**
 * Lấy được mã giảm giá khi thanh toán 

 */
export const decreaseCoupon = async (token, coupon) => {
    try {

        const res = await baseAxios.post(
            `/api/users/decrease-coupon`, coupon,
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


export const updateNotification = async (token) => {
    try {
        console.log("đã vào đây service");

        const res = await baseAxios.get(
            `/api/users/update-notification`,
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
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};


export const getAllOrderUser = async (data) => {
    try {
        console.log("đã vào đây service");

        const res = await baseAxios.get(
            `/api/users/get-all-order?size=${data.size}&page=${data.page}`,
            {
                headers: {
                    Authorization: `Bearer ${data.token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: true, data: res.data.content };
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            return { success: false, data: error.response.data };
        } else {
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};


export const countAllOrder = async (data) => {
    try {
        console.log("đã vào đây service");

        const res = await baseAxios.get(
            `/api/users/count-all-order`,
            {
                headers: {
                    Authorization: `Bearer ${data.token}`,
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
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};

export const cancelOrder = async (data) => {
    try {
        const res = await baseAxios.post(
            `/api/users/cancel-order?orderId=${data.orderId}`,
            {}, {
            headers: {
                Authorization: `Bearer ${data.token}`,
                "Content-Type": "application/json",
            },
        }
        );

        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            return { success: false, data: error.response.data };
        } else {
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};


export const paymentVNPay = async (data) => {
    try {
        const res = await baseAxios.get(
            `/api/payment/create-payment?money=${data.money}&orderInf=${data.orderInfor}`,
            {}, {
            headers: {
                Authorization: `Bearer ${data.token}`,
                "Content-Type": "application/json",
            },
        }
        );

        return { success: true, data: res.data };
    } catch (error) {
        if (error.response) {
            return { success: false, data: error.response.data };
        } else {
            console.log(error.response.data);
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};
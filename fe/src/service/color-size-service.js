import baseAxios from "./BaseAxios";

export const getAllColor = async (token) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Chỉ thêm token nếu có
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/color`,
            {
                headers: headers
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
};

export const getAllSize = async (token) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Chỉ thêm token nếu có
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/size`,
            {
                headers: headers
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
};
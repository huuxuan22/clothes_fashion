import baseAxios from "./BaseAxios"


export const getAllCategory = async (token) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Chỉ thêm token nếu có
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(
            `/api/categories/getAll`,
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

export const getAllSubCateByCateId = async (token, categoryId) => {
    try {
        const res = await baseAxios.get(
            `/api/subcategory/category/${categoryId}`,
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
            return { success: false, data: error.response.data };
        } else {
            return { success: false, data: "Lỗi máy chủ, vui lòng thử lại!" };
        }
    }
};


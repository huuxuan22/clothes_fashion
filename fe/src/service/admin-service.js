import baseAxios from "./BaseAxios";


export const addProduct = async (formData, token) => {
    try {
        const res = await baseAxios.post(
            `/admin/product/add-product`,
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


/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const searchProduct = async (data) => {
    try {
        const res = await baseAxios.get(`/admin/product/searchByName?value=${data.searchTerm}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const creaeDeal = async (formData, token) => {
    try {
        const res = await baseAxios.post(`/api/admin/create-deal`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}



/**
 * Lấy toàn bộ DEAL
 * @param {*} data 
 * @returns 
 */
export const getAllDEAL = async (size, page, token) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Token là optional - có thể lấy deal mà không cần đăng nhập
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(`/api/admin/deal/get-all?size=${size}&page=${page}`, {
            headers: headers
        });

        return { success: true, data: res.data.content };
    } catch (error) {
        console.log("Lỗi khi getAllDEAL :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}


/**
 * Lấy toàn bộ DEAL
 * @param {*} data 
 * @returns 
 */
export const getAllPageOfDeal = async (token) => {
    try {
        const res = await baseAxios.get(`/api/admin/deal/page`, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Cập nhật deal
 * @param {*} data 
 * @returns 
 */
export const updateDeal = async (deal, token) => {
    try {
        const res = await baseAxios.put(`/api/admin/deal/update`, deal, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Cập nhật deal
 * @param {*} data 
 * @returns 
 */
export const deleteDeal = async (dealId, token) => {
    try {
        const res = await baseAxios.delete(`/api/admin/deal?dealId=${dealId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Cập nhật deal
 * @param {*} data 
 * @returns 
 */
export const createCoupon = async (formData, token) => {
    try {
        console.log("dữ liệu: ", formData);

        const res = await baseAxios.post(`/api/admin/coupon/create`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}


export const getAllCoupon = async (size, page, token) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // Token là optional - có thể lấy coupon mà không cần đăng nhập
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const res = await baseAxios.get(`/api/admin/coupon/get-all?size=${size}&page=${page}`, {
            headers: headers
        });

        return { success: true, data: res.data.content };
    } catch (error) {
        console.log("Lỗi khi getAllCoupon :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}


/**
 * Lấy toàn bộ DEAL
 * @param {*} data 
 * @returns 
 */
export const getAllPageOfCoupon = async (token) => {
    try {
        const res = await baseAxios.get(`/api/admin/coupon/page`, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Cập nhật deal
 * @param {*} data 
 * @returns 
 */
export const deleteCoupon = async (couponId, token) => {
    try {
        const res = await baseAxios.delete(`/api/admin/coupon?couponId=${couponId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}


/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const createCollection = async (formData, token) => {
    try {
        const res = await baseAxios.post(`/api/users/create-collection`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}



/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const getAllCollection = async (token) => {
    try {
        const res = await baseAxios.get(`/api/users/get-all-collection`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}


/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const getFirstCollection = async (token) => {
    try {
        const res = await baseAxios.get(`/api/users/collection/first`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}


/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const getSecondCollection = async (token) => {
    try {
        const res = await baseAxios.get(`/api/users/collection/second`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}




/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const countAllOrder = async (token, param) => {
    try {
        console.log("đã vào đây: ", param);

        const res = await baseAxios.get(`/api/admin/count-all-order?param=${param}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const deliveryOrder = async (token, orderId) => {
    try {
        const res = await baseAxios.get(`/api/admin/delivery-order?orderId=${orderId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}

/**
 * Tìm kiếm ản phẩm
 * @param {*} data 
 * @returns 
 */
export const completeOrder = async (token, orderId) => {
    try {
        const res = await baseAxios.get(`/api/admin/complete-order?orderId=${orderId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("Danh sách sản phẩm giảm giá", res.data);

        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
}
import baseAxios from "../../service/BaseAxios";
import { CURRENT_USER, SET_TOKEN, SET_USER_PRINCIPAL } from "./ActionType";


export const currentUser = (token) => async (dispatch) => {
    try {
        const res = await baseAxios.get(`/api/users/profile`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("res", res.data);

        dispatch({ type: CURRENT_USER, payload: res.data });
        return { success: true, data: res.data };
    } catch (error) {
        console.log("Lỗi khi createChat :", error);
        if (error.response) {
            return { success: false, data: error.response.data }
        } else {
            return { success: false, data: "Lỗi ở server vui lòng truy cập lại" }
        }
    }
};

/**
 * Set token vào Redux store
 */
export const setToken = (token) => {
    return { type: SET_TOKEN, payload: token };
};

/**
 * Set user principal vào Redux store
 */
export const setUserPrincipal = (userPrincipal) => {
    return { type: SET_USER_PRINCIPAL, payload: userPrincipal };
};
import { currentUser } from "./Action"
import { CURRENT_USER, SET_TOKEN, SET_USER_PRINCIPAL } from "./ActionType"


const initialValue = {
    currentUser: null,
    token: null,
    user_principal: null,
}

export const userReducer = (store = initialValue, { type, payload }) => {
    switch (type) {
        case CURRENT_USER:
            return { ...store, currentUser: payload };
        case SET_TOKEN:
            return { ...store, token: payload };
        case SET_USER_PRINCIPAL:
            return { ...store, user_principal: payload };
        default:
            return store;
    }
}

import {
    AUTH_START,
    AUTH_SUCCESS,
    AUTH_FAILURE,
    AUTH_LOGOUT,
    USER_LOADED,
    USER_LOADING
} from '../types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_START:
        case USER_LOADING:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case AUTH_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                user: action.payload,
                error: null
            };

        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                user: action.payload
            };

        case AUTH_FAILURE:
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: action.payload
            };

        case AUTH_LOGOUT:
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null
            };

        default:
            return state;
    }
};

export default authReducer;
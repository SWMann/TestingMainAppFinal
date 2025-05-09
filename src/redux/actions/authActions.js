import authService from '../../services/authService';
import {
    AUTH_START,
    AUTH_SUCCESS,
    AUTH_FAILURE,
    AUTH_LOGOUT,
    USER_LOADED,
    USER_LOADING
} from '../types';

// Action to start the authentication process
export const startAuth = () => ({
    type: AUTH_START
});

// Action for successful authentication
export const authSuccess = (user) => ({
    type: AUTH_SUCCESS,
    payload: user
});

// Action for authentication failure
export const authFailure = (error) => ({
    type: AUTH_FAILURE,
    payload: error
});

// Action to log out the user
export const logout = () => async (dispatch) => {
    await authService.logout();
    dispatch({
        type: AUTH_LOGOUT
    });
};

// Action to initiate Discord OAuth login
export const loginWithDiscord = () => (dispatch) => {
    dispatch(startAuth());
    authService.loginWithDiscord();
};

// Action to handle the Discord OAuth callback
export const handleDiscordCallback = (code) => async (dispatch) => {
    dispatch(startAuth());

    try {
        const result = await authService.handleDiscordCallback(code);

        if (result.success) {
            dispatch(authSuccess(result.user));
            return { success: true };
        } else {
            dispatch(authFailure(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(authFailure(error.message || 'Authentication failed'));
        return { success: false, error: error.message };
    }
};

// Action to load the current user
export const loadUser = () => async (dispatch) => {
    if (!authService.isAuthenticated()) {
        return;
    }

    dispatch({ type: USER_LOADING });

    try {
        const user = await authService.getCurrentUser();
        if (user) {
            dispatch({
                type: USER_LOADED,
                payload: user
            });
        } else {
            dispatch(authFailure('Failed to load user'));
        }
    } catch (error) {
        dispatch(authFailure(error.message || 'Failed to load user'));
    }
};
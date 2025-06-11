// authService.js - Fixed auth service with proper logout handling

import api, { setLoggingOut } from './api';

// Discord OAuth constants
const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/auth/discord/callback`;
const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=1368998293098598401&response_type=code&redirect_uri=https%3A%2F%2Fhammerhead-app-w2flz.ondigitalocean.app%2Fauth%2Fdiscord%2Fcallback&scope=email+identify`;

const authService = {
    // Redirect to Discord OAuth
    loginWithDiscord: () => {
        window.location.href = DISCORD_AUTH_URL;
    },

    // Handle the OAuth callback
    handleDiscordCallback: async (code) => {
        try {
            const response = await api.post('/auth/discord/', { code });
            const { access, refresh, user } = response.data;

            // Store the tokens
            localStorage.setItem('token', access);
            localStorage.setItem('refreshToken', refresh);

            return { success: true, user };
        } catch (error) {
            console.error('Discord auth error:', error);
            return { success: false, error: error.response?.data || 'Authentication failed' };
        }
    },

    // Check if the user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Logout the user
    logout: async () => {
        try {
            // Set the logging out flag to prevent token refresh attempts
            setLoggingOut(true);

            // Try to call logout endpoint (it might not exist or might fail)
            try {
                await api.post('/auth/logout/');
            } catch (error) {
                // Ignore errors from logout endpoint
                console.log('Logout endpoint error (ignoring):', error.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear tokens and reset flag
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setLoggingOut(false);

            // NO REDIRECTS HERE - let React handle the UI update
        }
    },

    // Get the current user
    getCurrentUser: async () => {
        try {
            const response = await api.get('/users/me/');
            return response.data;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }
};

export default authService;
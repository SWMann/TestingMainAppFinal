// src/services/authService.js
import api, { setLoggingOut } from './api';

const authService = {
    // Get Discord OAuth URL from backend
    getDiscordAuthUrl: async () => {
        try {
            const response = await api.get('/auth/discord/');
            return response.data.auth_url;
        } catch (error) {
            console.error('Failed to get Discord auth URL:', error);
            // Fallback to constructed URL if API fails
            const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID || '1368998293098598401';
            const redirectUri = encodeURIComponent('https://shark-app-wnufa.ondigitalocean.app/anotherbackendagain-backend2/api/auth/discord/callback/');
            return `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify+email+guilds`;
        }
    },

    // Redirect to Discord OAuth
    loginWithDiscord: async () => {
        const authUrl = await authService.getDiscordAuthUrl();
        window.location.href = authUrl;
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

            // Try to call logout endpoint
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
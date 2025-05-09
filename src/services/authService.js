
import api from './api';

// Discord OAuth constants
const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/auth/discord/callback`;
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

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
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
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
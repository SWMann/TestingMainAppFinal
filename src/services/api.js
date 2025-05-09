
import axios from 'axios';

// Create an Axios instance with configuration
const api = axios.create({
    baseURL: '/api', // This will use the proxy configuration in package.json during development
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't already tried to refresh
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('/api/auth/refresh/', { refresh: refreshToken });

                // If we get a new token, save it and retry the original request
                if (response.data.access) {
                    localStorage.setItem('token', response.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
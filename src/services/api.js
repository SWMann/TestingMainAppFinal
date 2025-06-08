import axios from 'axios';

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Create an Axios instance with configuration
const api = axios.create({
    baseURL: '/anotherbackendagain-backend2/api', // This will use the proxy configuration in package.json during development
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CSRF token to work
});

// Function to fetch CSRF token from the endpoint
async function fetchCSRFToken() {
    try {
        const response = await axios.get('/anotherbackendagain-backend2/api/auth/csrf/', {
            withCredentials: true
        });
        return response.data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
}

// Add a request interceptor to inject auth token and CSRF token
api.interceptors.request.use(
    async (config) => {
        // Add JWT token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            // First try to get CSRF token from cookie
            let csrfToken = getCookie('csrftoken');

            // If not in cookie, fetch from endpoint
            if (!csrfToken) {
                csrfToken = await fetchCSRFToken();
            }

            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
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
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('/anotherbackendagain-backend2/api/auth/token/refresh/',
                    { refresh: refreshToken },
                    { withCredentials: true }
                );

                // If we get a new token, save it and retry the original request
                if (response.data.access) {
                    localStorage.setItem('token', response.data.access);
                    if (response.data.refresh) {
                        localStorage.setItem('refreshToken', response.data.refresh);
                    }
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
// src/components/auth/DiscordCallback.js
// Version without Material-UI dependencies

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/actions/authActions';
import './DiscordCallback.css'; // You'll need to create this CSS file

const DiscordCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            // Parse URL parameters
            const params = new URLSearchParams(location.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const userId = params.get('user_id');
            const errorParam = params.get('error');

            // Handle error from backend
            if (errorParam) {
                setError(`Authentication failed: ${errorParam}`);
                setLoading(false);
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            // Check if we have the tokens
            if (accessToken && refreshToken) {
                // Store tokens in localStorage
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                try {
                    // Fetch user data
                    const response = await fetch('/anotherbackendagain-backend2/api/users/me/', {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();

                        // Dispatch login success action
                        dispatch(loginSuccess({
                            access: accessToken,
                            refresh: refreshToken,
                            user: userData
                        }));

                        // Redirect to dashboard or home
                        navigate('/dashboard');
                    } else {
                        throw new Error('Failed to fetch user data');
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setError('Failed to complete authentication');
                    setLoading(false);
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                setError('No authentication tokens received');
                setLoading(false);
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleCallback();
    }, [location, navigate, dispatch]);

    return (
        <div className="discord-callback-container">
            {error ? (
                <div className="error-container">
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                    <p className="redirect-text">Redirecting to login...</p>
                </div>
            ) : (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <h2>Completing Discord authentication...</h2>
                </div>
            )}
        </div>
    );
};

export default DiscordCallback;
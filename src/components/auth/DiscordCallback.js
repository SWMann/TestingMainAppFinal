// src/components/auth/DiscordCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/actions/authActions';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

const DiscordCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);

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
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                setError('No authentication tokens received');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleCallback();
    }, [location, navigate, dispatch]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bgcolor="background.default"
        >
            {error ? (
                <>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Typography>Redirecting to login...</Typography>
                </>
            ) : (
                <>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Completing Discord authentication...
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default DiscordCallback;
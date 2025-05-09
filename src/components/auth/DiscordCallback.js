
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleDiscordCallback } from '../../redux/actions/authActions';
import './DiscordCallback.css';

const DiscordCallback = () => {
    const [status, setStatus] = useState('Loading...');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        // Extract the code from URL query parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            setStatus(`Authentication failed: ${error}`);
            // Redirect back to home after a delay
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        if (!code) {
            setStatus('No authorization code received');
            // Redirect back to home after a delay
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        // Handle the Discord OAuth callback
        const processAuth = async () => {
            try {
                setStatus('Authenticating with Discord...');
                const result = await dispatch(handleDiscordCallback(code));

                if (result.success) {
                    setStatus('Authentication successful! Redirecting...');
                    setTimeout(() => navigate('/'), 1500);
                } else {
                    setStatus(`Authentication failed: ${result.error || 'Unknown error'}`);
                    setTimeout(() => navigate('/'), 3000);
                }
            } catch (error) {
                setStatus(`Authentication error: ${error.message || 'Unknown error'}`);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        processAuth();
    }, [dispatch, location.search, navigate]);

    return (
        <div className="discord-callback-container">
            <div className="callback-card">
                <div className="discord-icon">
                    <img src="/discord-logo.svg" alt="Discord" className="discord-logo" />
                </div>
                <h2>Discord Authentication</h2>
                <div className="status-message">{status}</div>
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};

export default DiscordCallback;
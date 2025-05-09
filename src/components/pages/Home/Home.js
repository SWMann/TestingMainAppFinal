
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginWithDiscord, logout } from '../../../redux/actions/authActions';
import './Home.css';

const Home = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);

    const handleDiscordLogin = () => {
        dispatch(loginWithDiscord());
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Welcome to Our Community Platform</h1>
                <p>Connect, organize, and engage with your community</p>

                {isLoading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : isAuthenticated ? (
                    <div className="user-welcome">
                        <div className="user-info">
                            <img
                                src={user.avatar_url || '/default-avatar.png'}
                                alt="User avatar"
                                className="user-avatar"
                            />
                            <h2>Welcome, {user.username}!</h2>
                        </div>
                        <p>You're logged in with Discord</p>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="auth-section">
                        <p>Join our community by logging in with Discord</p>
                        <button className="discord-button" onClick={handleDiscordLogin}>
                            <span className="discord-icon">🎮</span> Login with Discord
                        </button>
                    </div>
                )}
            </div>

            <div className="features-section">
                <h2>Platform Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Event Management</h3>
                        <p>Create and RSVP to events. Never miss an important gathering.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Unit Organization</h3>
                        <p>Organize your community into structured units and teams.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Community Forum</h3>
                        <p>Discuss topics and share information with the community.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Resource Library</h3>
                        <p>Access and share important documents and resources.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
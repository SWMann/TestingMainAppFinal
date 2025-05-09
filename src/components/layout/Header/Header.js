
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginWithDiscord, logout } from '../../../redux/actions/authActions';
import './Header.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    const handleDiscordLogin = () => {
        dispatch(loginWithDiscord());
    };

    const handleLogout = () => {
        dispatch(logout());
        setMenuOpen(false);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className="header">
            <div className="container header-container">
                <div className="logo">
                    <Link to="/">Community Platform</Link>
                </div>

                <button
                    className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className={`main-nav ${menuOpen ? 'active' : ''}`}>
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                        </li>
                        {/* Add more nav items as your app grows */}
                    </ul>

                    <div className="auth-buttons">
                        {isAuthenticated ? (
                            <div className="user-menu">
                                <div className="user-menu-toggle" onClick={toggleMenu}>
                                    <img
                                        src={user?.avatar_url || '/default-avatar.png'}
                                        alt="User avatar"
                                        className="user-avatar-small"
                                    />
                                    <span className="username">{user?.username || 'User'}</span>
                                </div>
                                <div className={`user-dropdown ${menuOpen ? 'active' : ''}`}>
                                    <ul>
                                        <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
                                        <li><Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link></li>
                                        <li><button onClick={handleLogout}>Logout</button></li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <button className="discord-login-button" onClick={handleDiscordLogin}>
                                <span className="discord-icon">🎮</span> Login
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
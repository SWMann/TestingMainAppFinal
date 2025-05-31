import React, { useState } from 'react';
import { ChevronDown, Menu, X, Settings, LogOut, Bell, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../redux/actions/authActions';
import './Header.css';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { label: 'HOME', path: '/' },
        { label: 'OPERATIONS', path: '/operations' },
        { label: 'ROSTER', path: '/roster' },
        { label: 'STANDARDS', path: '/standards' },
        { label: 'RESOURCES', path: '/resources' },
    ];

    return (
        <header className="site-header">
            <div className="header-container">
                {/* Logo Section */}
                <div className="header-logo">
                    <div className="logo-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="logo-text">
                        <h1>5TH EXPEDITIONARY</h1>
                        <span className="logo-subtitle">UNITED EMPIRE OF EARTH</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-nav">
                    <ul className="nav-list">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <a href={item.path} className="nav-link">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Header Actions */}
                <div className="header-actions">
                    {/* Search */}
                    <button className="header-action-btn">
                        <Search size={20} />
                    </button>

                    {/* Notifications */}
                    {isAuthenticated && (
                        <button className="header-action-btn notification-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>
                    )}

                    {/* User Menu */}
                    {isAuthenticated && user ? (
                        <div className="user-menu">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="user-menu-trigger"
                            >
                                <img
                                    src={user.avatar_url || '/api/placeholder/40/40'}
                                    alt={user.username}
                                    className="user-avatar"
                                />
                                <span className="user-info">
                                    <span className="user-rank">{user.current_rank?.abbreviation || ''}</span>
                                    <span className="user-name">{user.username}</span>
                                </span>
                                <ChevronDown size={16} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <img
                                            src={user.avatar_url || '/api/placeholder/60/60'}
                                            alt={user.username}
                                            className="dropdown-avatar"
                                        />
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-username">{user.username}</div>
                                            <div className="dropdown-role">{user.current_rank?.name || 'Recruit'}</div>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <a href="/profile" className="dropdown-item">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                                My Profile
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/settings" className="dropdown-item">
                                                <Settings size={16} />
                                                Settings
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/dashboard" className="dropdown-item">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="7" height="7"></rect>
                                                    <rect x="14" y="3" width="7" height="7"></rect>
                                                    <rect x="14" y="14" width="7" height="7"></rect>
                                                    <rect x="3" y="14" width="7" height="7"></rect>
                                                </svg>
                                                Dashboard
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout} className="dropdown-item logout-item">
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/login" className="login-btn">
                            LOGIN
                        </a>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <nav className="mobile-nav">
                    <ul className="mobile-nav-list">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <a href={item.path} className="mobile-nav-link">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
};

export default Header;
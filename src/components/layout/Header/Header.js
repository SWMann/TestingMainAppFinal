import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Home, Users, Calendar, Award, FileText, BarChart3,
    Shield, Settings, LogOut, User, Building, School,
    Ship, Map
} from 'lucide-react';
import './Header.css';
import api, { setLoggingOut } from '../../../services/api';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileRef = useRef(null);

    // Navigation items
    const navigationItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/units', label: 'Units', icon: Building },
        { path: '/roster', label: 'Roster', icon: Users },
        { path: '/operations', label: 'Operations', icon: Calendar },
        { path: '/training', label: 'Training', icon: School },
        { path: '/awards', label: 'Awards', icon: Award },
        { path: '/documents', label: 'Documents', icon: FileText },
        { path: '/ships', label: 'Ships', icon: Ship },
    ];

    // Admin navigation items
    const adminItems = [
        { path: '/admin', label: 'Admin Panel', icon: Settings },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/hierarchy', label: 'Unit Hierarchy', icon: Map },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            // Set logging out flag to prevent token refresh during logout
            setLoggingOut(true);

            // Call logout endpoint
            await api.post('/auth/logout/');

            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            // Dispatch logout action
            dispatch({ type: 'auth/logout' });

            // Close dropdown
            setProfileDropdownOpen(false);

            // Navigate to home
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    const handleProfileClick = () => {
        setProfileDropdownOpen(false);
        // Navigate to profile using service number if available, otherwise use 'me'
        if (user?.service_number) {
            navigate(`/profile/${user.service_number}`);
        } else {
            navigate('/profile');
        }
    };

    const handleSettingsClick = () => {
        setProfileDropdownOpen(false);
        navigate('/settings');
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    // Check if user has admin access based on rank or admin flag
    const hasAdminAccess = isAuthenticated && (
        user?.is_admin ||
        user?.is_staff ||
        user?.current_rank?.is_officer
    );

    // Format avatar URL if it's a Discord avatar
    const getAvatarUrl = () => {
        if (user?.avatar_url) {
            return user.avatar_url;
        }
        // If no avatar URL but has Discord ID, construct default Discord avatar
        if (user?.discord_id) {
            const discriminator = parseInt(user.discord_id) % 5;
            return `https://cdn.discordapp.com/embed/avatars/${discriminator}.png`;
        }
        return null;
    };

    return (
        <>
            <header className="header">
                <div className="header-container">
                    {/* Logo and Menu Toggle */}
                    <div className="header-logo">
                        <button
                            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                        <Link to="/" className="logo-link">
                            <Shield className="logo-icon" />
                            <span className="logo-text">3RD CORPS</span>
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="nav-container">
                        {isAuthenticated && user ? (
                            <div className="profile-widget" ref={profileRef}>
                                <button
                                    className="profile-button"
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    aria-expanded={profileDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="profile-avatar">
                                        {getAvatarUrl() ? (
                                            <img
                                                src={getAvatarUrl()}
                                                alt={user.username}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <User
                                            size={16}
                                            style={{ display: getAvatarUrl() ? 'none' : 'flex' }}
                                        />
                                    </div>
                                    <div className="profile-info">
                                        <div className="profile-rank">
                                            {user.current_rank?.abbreviation && (
                                                <span className="rank-abbr">
                                                    {user.current_rank.abbreviation}
                                                </span>
                                            )}
                                            <span>{user.username}</span>
                                        </div>
                                        <div className="profile-service-number">
                                            {user.service_number || 'NO-SN'}
                                        </div>
                                    </div>
                                    {user.current_rank?.insignia_image_url && (
                                        <img
                                            src={user.current_rank.insignia_image_url}
                                            alt={user.current_rank.name}
                                            className="rank-insignia-small"
                                        />
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                {profileDropdownOpen && (
                                    <div className="profile-dropdown">
                                        <div className="dropdown-header">
                                            <div className="dropdown-username">
                                                {user.current_rank?.abbreviation} {user.username}
                                            </div>
                                            <div className="dropdown-unit">
                                                {user.primary_unit?.name || 'No Unit Assignment'}
                                            </div>
                                        </div>
                                        <div className="dropdown-menu">
                                            <button
                                                className="dropdown-item"
                                                onClick={handleProfileClick}
                                            >
                                                <User size={16} />
                                                <span>My Profile</span>
                                            </button>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleSettingsClick}
                                            >
                                                <Settings size={16} />
                                                <span>Settings</span>
                                            </button>
                                            <button
                                                className="dropdown-item logout"
                                                onClick={handleLogout}
                                            >
                                                <LogOut size={16} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="login-button">
                                <User size={16} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Navigation Drawer */}
            <nav className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
                <div className="nav-links">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <Icon />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Admin items */}
                    {hasAdminAccess && (
                        <>
                            <div className="nav-divider" />
                            {adminItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-link admin-link ${isActive(item.path) ? 'active' : ''}`}
                                    >
                                        <Icon />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </>
                    )}

                    {/* Login link for unauthenticated users in mobile menu */}
                    {!isAuthenticated && (
                        <>
                            <div className="nav-divider" />
                            <Link
                                to="/login"
                                className="nav-link"
                            >
                                <User />
                                <span>Login</span>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Overlay for mobile */}
            <div
                className={`nav-overlay ${menuOpen ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            />
        </>
    );
};

export default Header;
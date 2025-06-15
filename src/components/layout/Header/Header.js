import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Home, Users, Calendar, Award, FileText, BarChart3,
    Shield, Settings, Menu, X, ChevronDown, LogOut,
    User, Hash, Building, School, Ship, Map
} from 'lucide-react';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileRef = useRef(null);

    // Navigation items with appropriate icons
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

    const handleLogout = () => {
        dispatch({ type: 'auth/logout' });
        navigate('/');
    };

    const handleProfileClick = () => {
        setProfileDropdownOpen(false);
        navigate('/profile');
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo Section */}
                <div className="header-logo">
                    <Link to="/" className="logo-link">
                        <Shield className="logo-icon" size={32} />
                        <div className="logo-text">
                            <span className="logo-primary">3RD CORPS</span>
                            <span className="logo-secondary">US ARMY MILSIM</span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Admin items for officers/admins */}
                    {isAuthenticated && (user?.is_admin || user?.current_rank?.is_officer) && (
                        <>
                            <div className="nav-divider" />
                            {adminItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-item admin-item ${isActive(item.path) ? 'active' : ''}`}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* Profile Section */}
                <div className="header-actions">
                    {isAuthenticated && user ? (
                        <div className="profile-widget" ref={profileRef}>
                            <button
                                className="profile-button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                aria-expanded={profileDropdownOpen}
                            >
                                <div className="profile-avatar">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div className="profile-info">
                                    <div className="profile-name">
                                        {user.current_rank?.abbreviation} {user.username}
                                    </div>
                                    <div className="profile-details">
                                        <Hash size={12} />
                                        <span>{user.service_number || 'No SN'}</span>
                                    </div>
                                </div>
                                {user.current_rank?.insignia_image_url && (
                                    <img
                                        src={user.current_rank.insignia_image_url}
                                        alt={user.current_rank.name}
                                        className="rank-insignia-small"
                                    />
                                )}
                                <ChevronDown
                                    size={16}
                                    className={`dropdown-icon ${profileDropdownOpen ? 'open' : ''}`}
                                />
                            </button>

                            {/* Profile Dropdown */}
                            {profileDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-name">
                                                {user.current_rank?.abbreviation} {user.username}
                                            </div>
                                            <div className="dropdown-unit">
                                                {user.primary_unit?.name || 'No Unit Assignment'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <button
                                        className="dropdown-item"
                                        onClick={handleProfileClick}
                                    >
                                        <User size={16} />
                                        <span>My Profile</span>
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            navigate('/settings');
                                        }}
                                    >
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </button>
                                    <div className="dropdown-divider" />
                                    <button
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="login-button">
                            <User size={18} />
                            <span>Login</span>
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="mobile-nav">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {isAuthenticated && (user?.is_admin || user?.current_rank?.is_officer) && (
                        <>
                            <div className="mobile-nav-divider" />
                            {adminItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`mobile-nav-item admin-item ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </>
                    )}

                    {!isAuthenticated && (
                        <>
                            <div className="mobile-nav-divider" />
                            <Link
                                to="/login"
                                className="mobile-nav-item"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User size={18} />
                                <span>Login</span>
                            </Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    );
};

export default Header;
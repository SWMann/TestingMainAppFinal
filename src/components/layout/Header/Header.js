import React, { useState, useRef, useEffect } from 'react';
import {
    Home, Users, Calendar, Award, FileText, BarChart3,
    Shield, Settings, LogOut, User, Building, School,
    Ship, Map
} from 'lucide-react';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('/');
    const profileRef = useRef(null);

    // Mock user data for demonstration
    const user = {
        username: 'Johnson',
        service_number: 'US-3C-001234',
        avatar_url: null,
        current_rank: {
            abbreviation: 'SGT',
            name: 'Sergeant',
            insignia_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Army-USA-OR-05.svg/50px-Army-USA-OR-05.svg.png'
        },
        primary_unit: {
            name: '2nd Armored Division'
        },
        is_admin: false
    };

    const isAuthenticated = true; // Mock authentication

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

    const handleNavClick = (path) => {
        setActiveNav(path);
        setMenuOpen(false);
    };

    const handleLogout = () => {
        setProfileDropdownOpen(false);
        console.log('Logout clicked');
    };

    const handleProfileClick = () => {
        setProfileDropdownOpen(false);
        console.log('Profile clicked');
    };

    // Check if user has admin access
    const hasAdminAccess = isAuthenticated && (user?.is_admin || user?.current_rank?.is_officer);

    // CSS styles
    const styles = `
        /* Base Header */
        .header {
            position: sticky;
            top: 0;
            z-index: 1000;
            background-color: #111111;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            height: 60px;
            backdrop-filter: blur(10px);
            background-color: rgba(17, 17, 17, 0.95);
        }

        .header-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
        }

        /* Logo Section */
        .header-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .logo-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            color: #ffffff;
            transition: opacity 0.2s;
            cursor: pointer;
        }

        .logo-link:hover {
            opacity: 0.8;
        }

        .logo-icon {
            color: #f59e0b;
            width: 24px;
            height: 24px;
        }

        .logo-text {
            font-size: 0.875rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #ffffff;
        }

        /* Navigation Container */
        .nav-container {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        /* Profile Widget */
        .profile-widget {
            position: relative;
        }

        .profile-button {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 0.5rem;
            color: #ffffff;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }

        .profile-button:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }

        .profile-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            background-color: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .profile-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.125rem;
        }

        .profile-rank {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .rank-abbr {
            color: #f59e0b;
        }

        .profile-service-number {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.6);
            font-family: 'Courier New', monospace;
        }

        .rank-insignia-small {
            width: 20px;
            height: 20px;
            object-fit: contain;
            opacity: 0.8;
        }

        /* Hamburger Menu */
        .menu-toggle {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            padding: 0;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 0.375rem;
        }

        .menu-toggle:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }

        .hamburger {
            position: relative;
            width: 20px;
            height: 14px;
        }

        .hamburger span {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: #ffffff;
            transition: all 0.3s ease;
        }

        .hamburger span:nth-child(1) {
            top: 0;
        }

        .hamburger span:nth-child(2) {
            top: 6px;
        }

        .hamburger span:nth-child(3) {
            bottom: 0;
        }

        /* Hamburger animation */
        .menu-toggle.active .hamburger span:nth-child(1) {
            transform: rotate(45deg);
            top: 6px;
        }

        .menu-toggle.active .hamburger span:nth-child(2) {
            opacity: 0;
        }

        .menu-toggle.active .hamburger span:nth-child(3) {
            transform: rotate(-45deg);
            bottom: 6px;
        }

        /* Navigation Drawer */
        .nav-drawer {
            position: fixed;
            top: 60px;
            left: 0;
            width: 280px;
            height: calc(100vh - 60px);
            background-color: #111111;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
            z-index: 999;
        }

        .nav-drawer.open {
            transform: translateX(0);
        }

        /* Navigation Overlay for mobile */
        .nav-overlay {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 998;
        }

        .nav-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Navigation Links */
        .nav-links {
            padding: 1rem 0;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.875rem 1.5rem;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s;
            border-left: 3px solid transparent;
            cursor: pointer;
            width: 100%;
            background: none;
            border: none;
            text-align: left;
        }

        .nav-link:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }

        .nav-link.active {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            border-left-color: #f59e0b;
        }

        .nav-link svg {
            width: 18px;
            height: 18px;
            opacity: 0.8;
        }

        .nav-divider {
            height: 1px;
            background-color: rgba(255, 255, 255, 0.1);
            margin: 0.5rem 1.5rem;
        }

        /* Admin Links */
        .nav-link.admin-link {
            color: rgba(239, 68, 68, 0.8);
        }

        .nav-link.admin-link:hover {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }

        .nav-link.admin-link.active {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border-left-color: #ef4444;
        }

        /* Profile Dropdown */
        .profile-dropdown {
            position: absolute;
            top: calc(100% + 0.5rem);
            right: 0;
            min-width: 220px;
            background-color: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s ease;
        }

        .profile-dropdown.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-header {
            padding: 1rem;
            background-color: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-username {
            font-weight: 600;
            color: #f59e0b;
            margin-bottom: 0.25rem;
        }

        .dropdown-unit {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.6);
        }

        .dropdown-menu {
            padding: 0.5rem 0;
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.875rem;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
        }

        .dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }

        .dropdown-item svg {
            width: 16px;
            height: 16px;
            opacity: 0.7;
        }

        .dropdown-item.logout {
            color: #ef4444;
        }

        .dropdown-item.logout:hover {
            background-color: rgba(239, 68, 68, 0.1);
        }

        /* Login Button */
        .login-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #f59e0b;
            color: #000000;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 0.375rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .login-button:hover {
            background-color: #f59e0b;
            opacity: 0.9;
            transform: translateY(-1px);
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .header-container {
                padding: 0 1rem;
            }

            .logo-text {
                font-size: 0.75rem;
            }

            .profile-info {
                display: none;
            }

            .rank-insignia-small {
                display: none;
            }

            .nav-drawer {
                width: 100%;
            }

            .profile-dropdown {
                right: -1rem;
                left: 1rem;
                min-width: auto;
            }
        }

        /* Accessibility */
        .menu-toggle:focus-visible,
        .profile-button:focus-visible,
        .nav-link:focus-visible,
        .dropdown-item:focus-visible {
            outline: 2px solid #f59e0b;
            outline-offset: 2px;
        }

        /* Prevent text selection */
        .header {
            user-select: none;
        }

        /* Smooth scrolling for nav drawer */
        .nav-drawer {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .nav-drawer::-webkit-scrollbar {
            width: 4px;
        }

        .nav-drawer::-webkit-scrollbar-track {
            background: transparent;
        }

        .nav-drawer::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <header className="header">
                <div className="header-container">
                    {/* Logo */}
                    <div className="header-logo">
                        <button
                            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                        <div className="logo-link" onClick={() => handleNavClick('/')}>
                            <Shield className="logo-icon" />
                            <span className="logo-text">5th Infantry Division</span>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="nav-container">
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
                                            <User size={16} />
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        <div className="profile-rank">
                                            {user.current_rank?.abbreviation && (
                                                <span className="rank-abbr">{user.current_rank.abbreviation}</span>
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
                                <div className={`profile-dropdown ${profileDropdownOpen ? 'open' : ''}`}>
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
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                console.log('Settings clicked');
                                            }}
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
                            </div>
                        ) : (
                            <button className="login-button">
                                <User size={16} />
                                <span>Login</span>
                            </button>
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
                            <button
                                key={item.path}
                                className={`nav-link ${activeNav === item.path ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.path)}
                            >
                                <Icon />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}

                    {/* Admin items */}
                    {hasAdminAccess && (
                        <>
                            <div className="nav-divider" />
                            {adminItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.path}
                                        className={`nav-link admin-link ${activeNav === item.path ? 'active' : ''}`}
                                        onClick={() => handleNavClick(item.path)}
                                    >
                                        <Icon />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
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
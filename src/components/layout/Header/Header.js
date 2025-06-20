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
    const [rankData, setRankData] = useState(null);
    const [rankLoading, setRankLoading] = useState(false);
    const profileRef = useRef(null);

    // Get user data - check if it's nested
    const userData = user?.user || user;

    // Debug logging for user data
    useEffect(() => {
        if (user) {
            console.log('Header - Raw user from Redux:', user);
            console.log('Header - userData after extraction:', userData);
            if (userData) {
                console.log('Header - Username:', userData.username);
                console.log('Header - Current rank:', userData.current_rank);
                console.log('Header - Service number:', userData.service_number);
            }
        }
    }, [user, userData]);

    // Fetch rank details when user has a current_rank
    // This fetches the complete rank object including abbreviation, insignia_image_url, etc.
    useEffect(() => {
        const fetchRankData = async () => {
            if (userData?.current_rank) {
                // Reset rank data if current_rank changed
                if (rankData && rankData.id !== userData.current_rank) {
                    setRankData(null);
                }

                if (!rankData || rankData.id !== userData.current_rank) {
                    setRankLoading(true);
                    try {
                        console.log('Fetching rank data for:', userData.current_rank);
                        const response = await api.get(`/units/ranks/${userData.current_rank}/`);
                        console.log('Rank data response:', response.data);
                        setRankData(response.data);
                    } catch (error) {
                        console.error('Failed to fetch rank data:', error);
                    } finally {
                        setRankLoading(false);
                    }
                }
            } else {
                // Clear rank data if user has no current_rank
                setRankData(null);
            }
        };

        fetchRankData();
    }, [userData?.current_rank]);

    // Fetch complete user profile if needed
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isAuthenticated && userData) {
                // Check if we need to fetch full profile data
                const needsFullProfile = !userData.current_rank && !userData.rank && !userData.primary_unit && !userData.unit;

                if (needsFullProfile) {
                    try {
                        console.log('Fetching complete user profile...');
                        const response = await api.get('/users/me/');
                        console.log('User profile response:', response.data);

                        // Update the user in Redux store
                        dispatch({
                            type: 'auth/updateUser',
                            payload: response.data
                        });
                    } catch (error) {
                        console.error('Failed to fetch user profile:', error);
                    }
                }
            }
        };

        fetchUserProfile();
    }, [isAuthenticated, userData?.id, dispatch]); // Use userData.id as dependency to avoid infinite loops

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

    // Ensure menu starts closed
    useEffect(() => {
        setMenuOpen(false);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('nav-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('nav-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('nav-open');
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
        if (userData?.service_number) {
            navigate(`/profile/${userData.service_number}`);
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
    const hasAdminAccess = isAuthenticated && userData && (
        userData.is_admin ||
        userData.is_staff ||
        userData.current_rank?.is_officer ||
        userData.rank?.is_officer
    );

    // Format avatar URL if it's a Discord avatar
    const getAvatarUrl = () => {
        if (userData?.avatar_url) {
            return userData.avatar_url;
        }
        // Check for avatar in different possible locations
        if (userData?.avatar) {
            return userData.avatar;
        }
        // If no avatar URL but has Discord ID, construct default Discord avatar
        if (userData?.discord_id) {
            const discriminator = parseInt(userData.discord_id) % 5;
            return `https://cdn.discordapp.com/embed/avatars/${discriminator}.png`;
        }
        return null;
    };

    // Check if user data is still loading (but don't wait for rank data)
    if (isAuthenticated && !userData) {
        return (
            <div className="header-wrapper">
                <header className="header">
                    <div className="header-container">
                        <div className="header-logo">
                            <button className="menu-toggle" disabled>
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
                        <div className="nav-container">
                            <div className="loading-spinner">Loading...</div>
                        </div>
                    </div>
                </header>
            </div>
        );
    }

    return (
        <div className="header-wrapper">
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
                        {isAuthenticated && userData ? (
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
                                                alt={userData.username}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const icon = e.target.parentElement.querySelector('svg');
                                                    if (icon) icon.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <User
                                            size={16}
                                            style={{ display: getAvatarUrl() ? 'none' : 'flex' }}
                                        />
                                    </div>
                                    <div className="profile-info">
                                        <div className={`profile-rank ${!rankData?.abbreviation ? 'no-rank' : ''}`}>
                                            {rankData?.abbreviation ? (
                                                <span className="rank-abbr">{rankData.abbreviation}</span>
                                            ) : null}
                                            <span>{userData.username || 'Unknown'}</span>
                                        </div>
                                        <div className="profile-service-number">
                                            {userData.service_number || userData.serviceNumber || 'NO-SN'}
                                        </div>
                                    </div>
                                    {rankData?.insignia_image_url && (
                                        <img
                                            src={rankData.insignia_image_url}
                                            alt={rankData.name || 'Rank insignia'}
                                            className="rank-insignia-small"
                                        />
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                <div className={`profile-dropdown ${profileDropdownOpen ? 'open' : ''}`}>
                                    <div className="dropdown-header">
                                        <div className="dropdown-username">
                                            {rankData?.abbreviation || ''} {userData.username}
                                        </div>
                                        <div className="dropdown-unit">
                                            {userData.primary_unit?.name || userData.unit?.name || 'No Unit Assignment'}
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
            <nav
                className={`nav-drawer ${menuOpen ? 'open' : ''}`}
                data-menu-open={menuOpen}
            >
                <div className="nav-links">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
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
                                        onClick={() => setMenuOpen(false)}
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
                                onClick={() => setMenuOpen(false)}
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
        </div>
    );
};

export default Header;
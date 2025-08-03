import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Home, Users, Calendar, Award, FileText, BarChart3,
    Shield, Settings, LogOut, User, Building, School,
    Ship, Map, Send, Rocket, Globe, Zap, Star
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
                console.log('Header - Application date:', userData.application_date);
            }
        }
    }, [user, userData]);

    // Fetch rank details when user has a current_rank
    useEffect(() => {
        const fetchRankData = async () => {
            if (userData?.current_rank) {
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
                setRankData(null);
            }
        };

        fetchRankData();
    }, [userData?.current_rank]);

    // Fetch complete user profile if needed
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isAuthenticated && userData) {
                const needsFullProfile = !userData.current_rank && !userData.rank && !userData.primary_unit && !userData.unit;

                if (needsFullProfile) {
                    try {
                        console.log('Fetching complete user profile...');
                        const response = await api.get('/users/me/');
                        console.log('User profile response:', response.data);

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
    }, [isAuthenticated, userData?.id, dispatch]);

    // Navigation items with Star Citizen theme
    const navigationItems = [
        { path: '/', label: 'Command', icon: Home },
        { path: '/organization-chart', label: 'Fleet', icon: Globe },
        { path: '/roster', label: 'Crew', icon: Users },
        { path: '/operations', label: 'Missions', icon: Rocket },
        { path: '/training', label: 'Academy', icon: School },
        { path: '/Commendations', label: 'Commendations', icon: Award },
        { path: '/documents', label: 'Intel', icon: FileText },
        { path: '/ships', label: 'Ships', icon: Ship },
        { path: '/ranks', label: 'Ranks', icon: Star},
    ];

    // Admin navigation items
    const adminItems = [
        { path: '/admindashboard', label: 'Admin Terminal', icon: Settings },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/hierarchy', label: 'Fleet Structure', icon: Map },
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
            setLoggingOut(true);

            await api.post('/auth/logout/');

            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            dispatch({ type: 'auth/logout' });

            setProfileDropdownOpen(false);

            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    const handleProfileClick = () => {
        setProfileDropdownOpen(false);
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

    const handleApplyClick = () => {
        setProfileDropdownOpen(false);
        navigate('/apply');
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

    // Check if user should see apply button
    const shouldShowApplyButton = isAuthenticated &&
        userData &&
        userData.application_date === null &&
        !userData.service_number;

    // Format avatar URL if it's a Discord avatar
    const getAvatarUrl = () => {
        if (userData?.avatar_url) {
            return userData.avatar_url;
        }
        if (userData?.avatar) {
            return userData.avatar;
        }
        if (userData?.discord_id) {
            const discriminator = parseInt(userData.discord_id) % 5;
            return `https://cdn.discordapp.com/embed/avatars/${discriminator}.png`;
        }
        return null;
    };

    // Check if user data is still loading
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
                                <Zap className="logo-icon" />
                                <span className="logo-text">5TH EXG</span>
                            </Link>
                        </div>
                        <div className="nav-container">
                            <div className="loading-spinner">LOADING...</div>
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
                            <Zap className="logo-icon" />
                            <span className="logo-text">5TH EXG</span>
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="nav-container">
                        {isAuthenticated && userData ? (
                            <>
                                {/* Apply Now button - shown before profile widget */}
                                {shouldShowApplyButton && (
                                    <Link to="/apply" className="apply-now-button">
                                        <Send size={16} />
                                        <span>Apply Now</span>
                                    </Link>
                                )}

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
                                                {userData.primary_mos?.code && (
                                                    <span className="mos-abbr">({userData.primary_mos.code})</span>
                                                )}
                                            </div>
                                            <div className="profile-service-number">
                                                {userData.service_number || userData.serviceNumber || 'NO-SN'}
                                            </div>
                                        </div>
                                        {(rankData?.insignia_display_url || rankData?.insignia_image || rankData?.insignia_image_url) && (
                                            <img
                                                src={rankData.insignia_display_url || rankData.insignia_image || rankData.insignia_image_url}
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
                                            {shouldShowApplyButton && (
                                                <button
                                                    className="dropdown-item apply-item"
                                                    onClick={handleApplyClick}
                                                >
                                                    <Send size={16} />
                                                    <span>Apply to Join</span>
                                                </button>
                                            )}
                                            <button
                                                className="dropdown-item"
                                                onClick={handleProfileClick}
                                            >
                                                <User size={16} />
                                                <span>My Terminal</span>
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
                            </>
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
                    {/* Apply Now link in mobile menu for eligible users */}
                    {shouldShowApplyButton && (
                        <>
                            <Link
                                to="/apply"
                                className="nav-link apply-link"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Send />
                                <span>Apply Now</span>
                            </Link>
                            <div className="nav-divider" />
                        </>
                    )}

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
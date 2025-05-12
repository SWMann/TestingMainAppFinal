import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginWithDiscord, logout } from '../../../redux/actions/authActions';
import axios from 'axios';
import {
    ArrowUpRight,
    Calendar,
    MessageSquare,
    Menu,
    X,
    LogOut,
    Shield,
    FileText,
    Award,
    AlertTriangle,
    Users,
    Rocket,
    Map,
    Ship,
    Target,
    ChevronRight,
    Star,
    Zap
} from 'lucide-react';
import './Home.css';

const Home = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [userCertificates, setUserCertificates] = useState([]);
    const [userStats, setUserStats] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Update time every second for the digital clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch data when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserData();
            fetchAnnouncements();
            fetchUpcomingEvents();
        } else {
            // Fetch public data for non-authenticated users
            fetchPublicData();
        }
    }, [isAuthenticated]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            // Get user profile data
            const profileResponse = await axios.get('/api/users/me/');

            // Get user certificates
            const certificatesResponse = await axios.get(`/api/users/${profileResponse.data.id}/certificates/`);
            setUserCertificates(certificatesResponse.data);

            // Get user events
            const eventsResponse = await axios.get(`/api/users/${profileResponse.data.id}/events/`);

            // Calculate user stats
            const stats = [
                {
                    id: 1,
                    title: "Events Attended",
                    value: eventsResponse.data.filter(e =>
                        e.event_attendance && e.event_attendance.status === "Attending" &&
                        new Date(e.end_time) < new Date()
                    ).length,
                    trend: "up"
                },
                {
                    id: 2,
                    title: "Certifications",
                    value: certificatesResponse.data.length,
                    trend: "neutral"
                },
                {
                    id: 3,
                    title: "Position",
                    value: profileResponse.data.primary_unit_id ? "Active" : "Unassigned",
                    trend: profileResponse.data.primary_unit_id ? "up" : "down"
                },
                {
                    id: 4,
                    title: "Next Event",
                    value: calculateNextEvent(eventsResponse.data),
                    trend: "neutral"
                }
            ];

            setUserStats(stats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await axios.get('/api/announcements/');
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const fetchUpcomingEvents = async () => {
        try {
            const response = await axios.get('/api/events/upcoming/');
            setUpcomingEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchPublicData = async () => {
        try {
            setLoading(true);

            // Fetch branches for public display
            const branchesResponse = await axios.get('/api/branches/');
            setBranches(branchesResponse.data);

            // Fetch public announcements
            const announcementsResponse = await axios.get('/api/announcements/');
            setAnnouncements(announcementsResponse.data.filter(a => a.is_public));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching public data:', error);
            setLoading(false);
        }
    };

    const calculateNextEvent = (events) => {
        const futureEvents = events
            .filter(e => new Date(e.start_time) > new Date())
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        if (futureEvents.length === 0) return "None";

        const nextEvent = futureEvents[0];
        const days = Math.ceil((new Date(nextEvent.start_time) - new Date()) / (1000 * 60 * 60 * 24));

        return days <= 0 ? "Today" : `${days}d`;
    };

    const handleDiscordLogin = () => {
        dispatch(loginWithDiscord());
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";

        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Quick links based on actual site structure
    const quickLinks = [
        { id: 1, title: "Forums", icon: <MessageSquare size={18} />, color: "#4FCBF8", url: "/forums" },
        { id: 2, title: "Calendar", icon: <Calendar size={18} />, color: "#39FF14", url: "/events/calendar" },
        { id: 3, title: "Standards", icon: <FileText size={18} />, color: "#FF6B35", url: "/sops/groups" },
        { id: 4, title: "Achievements", icon: <Award size={18} />, color: "#E4D00A", url: "/achievements" },
    ];

    return (
        <div className="home-container">
            {/* Starfield Background with Parallax Effect */}
            <div className="starfield-container">
                <div className="starfield-layer starfield-layer-1"></div>
                <div className="starfield-layer starfield-layer-2"></div>
                <div className="starfield-layer starfield-layer-3"></div>
                <div className="starfield-overlay"></div>
                <div className="starfield-gradient"></div>
            </div>

            {/* Header */}
            <header className="main-header">
                <div className="container">
                    <div className="header-inner">
                        <div className="logo-container">
                            <div className="logo-wrapper">
                                <div className="logo-icon">
                                    <Shield size={18} className="logo-icon-inner" />
                                </div>
                                <h1 className="logo-text">5TH EXPEDITIONARY</h1>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="mobile-menu-button">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="menu-toggle"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="desktop-nav">
                            {isAuthenticated && (
                                <>
                                    <a href="/dashboard" className="nav-link">Dashboard</a>
                                    <a href="/events" className="nav-link">Events</a>
                                    <a href="/units" className="nav-link">Units</a>
                                    <a href="/forums" className="nav-link">Forums</a>
                                </>
                            )}

                            {isAuthenticated ? (
                                <div className="user-controls">
                                    <img
                                        src={user?.avatar_url || '/default-avatar.png'}
                                        alt="User avatar"
                                        className="user-avatar"
                                    />
                                    <span className="username">{user?.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="logout-button"
                                    >
                                        <LogOut size={16} className="logout-icon" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleDiscordLogin}
                                    className="login-button"
                                >
                                    Login with Discord
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="mobile-nav">
                    <div className="mobile-nav-items">
                        {isAuthenticated && (
                            <>
                                <a href="/dashboard" className="mobile-nav-link">Dashboard</a>
                                <a href="/events" className="mobile-nav-link">Events</a>
                                <a href="/units" className="mobile-nav-link">Units</a>
                                <a href="/forums" className="mobile-nav-link">Forums</a>
                            </>
                        )}

                        {isAuthenticated ? (
                            <div className="mobile-user-controls">
                                <div className="mobile-user-info">
                                    <img
                                        src={user?.avatar_url || '/default-avatar.png'}
                                        alt="User avatar"
                                        className="mobile-user-avatar"
                                    />
                                    <span className="mobile-username">{user?.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="mobile-logout-button"
                                >
                                    <LogOut size={16} className="logout-icon" /> Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDiscordLogin}
                                className="mobile-login-button"
                            >
                                Login with Discord
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="main-content">
                {isLoading || loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">
                            <div className="spinner-hexagon"></div>
                            <div className="spinner-hexagon"></div>
                            <div className="spinner-hexagon"></div>
                            <p className="loading-text">SYSTEM INITIALIZING<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span></p>
                        </div>
                    </div>
                ) : isAuthenticated ? (
                    /* AUTHENTICATED USER DASHBOARD */
                    <div className="dashboard">
                        {/* Dashboard Header with holographic elements */}
                        <div className="dashboard-header">
                            <div className="dashboard-header-left">
                                <h2 className="dashboard-title">COMMAND INTERFACE</h2>
                                <div className="dashboard-time-container">
                                    <div className="dashboard-date">{currentTime.toLocaleDateString()}</div>
                                    <div className="dashboard-time">{currentTime.toLocaleTimeString([], {hour12: false})}</div>
                                </div>
                            </div>
                            <div className="dashboard-header-right">
                                <div className="status-display">
                                    <div className="status-indicator"></div>
                                    <p className="status-text">OPERATOR STATUS: <span className="status-active">ACTIVE</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="stats-grid">
                            {userStats.map(stat => (
                                <div
                                    key={stat.id}
                                    className="stat-card"
                                >
                                    <div className={`stat-indicator ${stat.trend}`}></div>
                                    <p className="stat-title">{stat.title}</p>
                                    <p className="stat-value">{stat.value}</p>
                                    <div className={`stat-trend ${stat.trend}`}>
                                        {stat.trend === 'up' && '▲'}
                                        {stat.trend === 'down' && '▼'}
                                        {stat.trend === 'neutral' && '■'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="dashboard-grid">
                            {/* Announcements */}
                            <div className="announcements-section">
                                <div className="panel">
                                    <div className="panel-header">
                                        <h3 className="panel-title">PRIORITY TRANSMISSIONS</h3>
                                        <a href="/announcements" className="view-all-link">
                                            View All <ArrowUpRight size={14} className="arrow-icon" />
                                        </a>
                                    </div>

                                    <div className="announcements-list">
                                        {announcements.slice(0, 3).map(announcement => (
                                            <div
                                                key={announcement.id}
                                                className={`announcement-card ${announcement.is_pinned ? 'pinned' : ''}`}
                                            >
                                                <div className="announcement-header">
                                                    <h4 className="announcement-title">
                                                        {announcement.is_pinned && (
                                                            <AlertTriangle size={14} className="alert-icon" />
                                                        )}
                                                        {announcement.title}
                                                    </h4>
                                                    <span className="announcement-date">
                            {formatDate(announcement.created_at)}
                          </span>
                                                </div>
                                                <p className="announcement-content">{announcement.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Access & Upcoming Events */}
                            <div className="sidebar-content">
                                {/* Quick Access */}
                                <div className="quick-access-panel panel">
                                    <h3 className="panel-title">QUICK ACCESS</h3>
                                    <div className="quick-links-grid">
                                        {quickLinks.map(link => (
                                            <a
                                                key={link.id}
                                                href={link.url}
                                                className="quick-link"
                                                style={{borderLeft: `3px solid ${link.color}`}}
                                            >
                                                <div className="quick-link-icon">{link.icon}</div>
                                                <span className="quick-link-text">{link.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Upcoming Events */}
                                <div className="events-panel panel">
                                    <div className="panel-header">
                                        <h3 className="panel-title">UPCOMING OPERATIONS</h3>
                                        <a href="/events/calendar" className="view-calendar-link">
                                            Calendar <ArrowUpRight size={14} className="arrow-icon" />
                                        </a>
                                    </div>

                                    <div className="events-list">
                                        {upcomingEvents.slice(0, 3).map(event => (
                                            <div key={event.id} className="event-card">
                                                <div className="event-header">
                                                    <h4 className="event-title">{event.title}</h4>
                                                    <span className="event-time">
                            {formatTime(event.start_time)}
                          </span>
                                                </div>
                                                <div className="event-details">
                                                    <span className="event-date">{formatDate(event.start_time)}</span>
                                                    <span className="event-location">{event.location}</span>
                                                    <div className="event-rsvp">
                                                        <a href={`/events/${event.id}`} className="event-rsvp-button">
                                                            RSVP <ChevronRight size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* NON-AUTHENTICATED LANDING PAGE */
                    <div className="landing-page">
                        {/* Hero Section with Animated Elements */}
                        <div className="hero-section">
                            <div className="hero-content">
                                <div className="hero-title-container">
                                    <div className="hero-badge">
                                        <div className="hero-badge-inner"></div>
                                    </div>
                                    <h1 className="hero-title">5TH EXPEDITIONARY FORCE</h1>
                                </div>
                                <h2 className="hero-subtitle">BRAVE THE FRONTIER. FORGE YOUR LEGACY.</h2>
                                <p className="hero-description">
                                    Join an elite interstellar unit dedicated to exploration, security, and scientific advancement at the edge of known space.
                                </p>

                                <div className="hero-cta">
                                    <button onClick={handleDiscordLogin} className="hero-login-button">
                                        <div className="button-glow"></div>
                                        <span className="button-text">LOGIN WITH DISCORD</span>
                                    </button>
                                    <a href="/applications" className="hero-apply-button">
                                        <div className="button-glow"></div>
                                        <span className="button-text">APPLY NOW</span>
                                    </a>
                                </div>
                            </div>

                            {/* Animated ship or emblem */}
                            <div className="hero-emblem">
                                <div className="emblem-glow"></div>
                                <div className="emblem-inner"></div>
                            </div>
                        </div>

                        {/* Branch Showcase */}
                        <div className="branches-section">
                            <h2 className="section-title">BRANCHES OF SERVICE</h2>
                            <div className="branches-grid">
                                {branches.map(branch => (
                                    <div
                                        key={branch.id}
                                        className="branch-card"
                                        style={{
                                            borderColor: branch.name === "Army" ? "#4B5D46" :
                                                branch.name === "Navy" ? "#1F4287" :
                                                    branch.name === "Marines" ? "#CF1020" : "#E4D00A"
                                        }}
                                    >
                                        <div className="branch-icon">
                                            <img src={branch.logo_url} alt={`${branch.name} emblem`} />
                                        </div>
                                        <h3 className="branch-name">{branch.name}</h3>
                                        <p className="branch-description">{branch.description}</p>
                                        <a href={`/branches/${branch.id}`} className="branch-link">Learn More</a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features with Icon Grid */}
                        <div className="features-section">
                            <h2 className="section-title">EXPEDITIONARY CAPABILITIES</h2>
                            <div className="features-grid">
                                <div className="feature-card">
                                    <div className="feature-icon-container">
                                        <Rocket size={32} className="feature-icon" />
                                    </div>
                                    <h3 className="feature-title">DEEP SPACE OPERATIONS</h3>
                                    <p className="feature-description">Conduct missions beyond established territories, pushing the boundaries of human presence.</p>
                                </div>

                                <div className="feature-card">
                                    <div className="feature-icon-container">
                                        <Map size={32} className="feature-icon" />
                                    </div>
                                    <h3 className="feature-title">PLANETARY EXPLORATION</h3>
                                    <p className="feature-description">Map uncharted worlds and establish forward operating bases in hostile environments.</p>
                                </div>

                                <div className="feature-card">
                                    <div className="feature-icon-container">
                                        <Shield size={32} className="feature-icon" />
                                    </div>
                                    <h3 className="feature-title">FRONTIER SECURITY</h3>
                                    <p className="feature-description">Protect vulnerable outposts and settlements from external threats.</p>
                                </div>

                                <div className="feature-card">
                                    <div className="feature-icon-container">
                                        <Ship size={32} className="feature-icon" />
                                    </div>
                                    <h3 className="feature-title">FLEET OPERATIONS</h3>
                                    <p className="feature-description">Coordinate small and large-scale naval assets across multiple star systems.</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonials or Recent Operations */}
                        <div className="operations-section">
                            <h2 className="section-title">RECENT OPERATIONS</h2>
                            <div className="operations-grid">
                                <div className="operation-card">
                                    <div className="operation-image">
                                        <div className="operation-image-overlay"></div>
                                    </div>
                                    <div className="operation-content">
                                        <h3 className="operation-title">OPERATION STARFALL</h3>
                                        <p className="operation-description">Deep space rescue mission to recover a scientific expedition lost in the outer rim.</p>
                                        <div className="operation-stats">
                                            <div className="stat">
                                                <Star size={16} />
                                                <span>Success</span>
                                            </div>
                                            <div className="stat">
                                                <Users size={16} />
                                                <span>24 Operatives</span>
                                            </div>
                                            <div className="stat">
                                                <Calendar size={16} />
                                                <span>3 Months</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="operation-card">
                                    <div className="operation-image">
                                        <div className="operation-image-overlay"></div>
                                    </div>
                                    <div className="operation-content">
                                        <h3 className="operation-title">OPERATION NOVA SHIELD</h3>
                                        <p className="operation-description">Defensive action to protect the Proxima Colony from hostile incursion.</p>
                                        <div className="operation-stats">
                                            <div className="stat">
                                                <Star size={16} />
                                                <span>Success</span>
                                            </div>
                                            <div className="stat">
                                                <Users size={16} />
                                                <span>42 Operatives</span>
                                            </div>
                                            <div className="stat">
                                                <Calendar size={16} />
                                                <span>2 Weeks</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call To Action */}
                        <div className="cta-section">
                            <div className="cta-content">
                                <h2 className="cta-title">JOIN THE 5TH EXPEDITIONARY TODAY</h2>
                                <p className="cta-description">
                                    The frontier needs skilled operators ready to face the unknown. Your journey begins here.
                                </p>
                                <div className="cta-buttons">
                                    <a href="/applications" className="cta-button primary">
                                        <Zap size={18} className="button-icon" />
                                        <span>APPLY NOW</span>
                                    </a>
                                    <a href="/faq" className="cta-button secondary">
                                        <span>LEARN MORE</span>
                                    </a>
                                </div>
                            </div>
                            <div className="cta-background">
                                <div className="cta-stars"></div>
                                <div className="cta-glow"></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="main-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <Shield size={24} className="footer-logo-icon" />
                            <span className="footer-logo-text">5TH EXPEDITIONARY</span>
                        </div>
                        <div className="footer-links">
                            <a href="/terms" className="footer-link">Terms of Service</a>
                            <a href="/privacy" className="footer-link">Privacy Policy</a>
                            <a href="/support" className="footer-link">Support</a>
                            <a href="/contact" className="footer-link">Contact</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="copyright-text">© 2025 5th Expeditionary Force | All Rights Reserved</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
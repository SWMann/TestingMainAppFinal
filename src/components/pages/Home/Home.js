import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginWithDiscord, logout } from '../../../redux/actions/authActions';
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
    Users
} from 'lucide-react';
import './Home.css';

// Mock data for demonstration
const mockAnnouncements = [
    { id: 1, title: "New Mission Briefing", content: "Operation Starlight begins tomorrow at 0800 hours.", date: "2025-05-08", isPinned: true },
    { id: 2, title: "Updated Combat Protocol", content: "All personnel must review the updated rules of engagement.", date: "2025-05-07" },
    { id: 3, title: "System Maintenance", content: "Comms will be down for scheduled maintenance.", date: "2025-05-06" },
];

const mockEvents = [
    { id: 1, title: "Squad Training Exercise", date: "2025-05-10", time: "0900", location: "Training Deck B" },
    { id: 2, title: "Strategic Briefing", date: "2025-05-11", time: "1400", location: "Command Center" },
    { id: 3, title: "Equipment Inspection", date: "2025-05-12", time: "1000", location: "Armory" },
];

const mockStats = [
    { id: 1, title: "Missions Completed", value: 24, trend: "up" },
    { id: 2, title: "Team Readiness", value: "92%", trend: "up" },
    { id: 3, title: "New Messages", value: 7, trend: "neutral" },
    { id: 4, title: "Next Deployment", value: "6d", trend: "down" },
];

const quickLinks = [
    { id: 1, title: "Forums", icon: <MessageSquare size={18} />, color: "#4FCBF8" },
    { id: 2, title: "Calendar", icon: <Calendar size={18} />, color: "#39FF14" },
    { id: 3, title: "Resources", icon: <FileText size={18} />, color: "#FF6B35" },
    { id: 4, title: "Achievements", icon: <Award size={18} />, color: "#E4D00A" },
];

const Home = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for the digital clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    const formatTime = (time) => {
        // Military time formatter
        return time.padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
    };

    return (
        <div className="home-container">

            {/* Starfield Background */}
            <div className="starfield-container">
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
                                <h1 className="logo-text">FRONTIER COMMAND</h1>
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
                                    <a href="#" className="nav-link">Dashboard</a>
                                    <a href="#" className="nav-link">Events</a>
                                    <a href="#" className="nav-link">Units</a>
                                    <a href="#" className="nav-link">Forums</a>
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
                                <a href="#" className="mobile-nav-link">Dashboard</a>
                                <a href="#" className="mobile-nav-link">Events</a>
                                <a href="#" className="mobile-nav-link">Units</a>
                                <a href="#" className="mobile-nav-link">Forums</a>
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
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">
                            <div className="spinner-circle"></div>
                            <p className="loading-text">SYSTEM INITIALIZING...</p>
                        </div>
                    </div>
                ) : isAuthenticated ? (
                    <div className="dashboard">
                        {/* Dashboard Header */}
                        <div className="dashboard-header">
                            <div>
                                <h2 className="dashboard-title">MISSION CONTROL</h2>
                                <p className="dashboard-time">
                                    {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString([], {hour12: false})}
                                </p>
                            </div>
                            <div className="status-display">
                                <p className="status-text">OPERATOR STATUS: <span className="status-active">ACTIVE</span></p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="stats-grid">
                            {mockStats.map(stat => (
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
                                        <h3 className="panel-title">ANNOUNCEMENTS</h3>
                                        <a href="#" className="view-all-link">
                                            View All <ArrowUpRight size={14} className="arrow-icon" />
                                        </a>
                                    </div>

                                    <div className="announcements-list">
                                        {mockAnnouncements.map(announcement => (
                                            <div
                                                key={announcement.id}
                                                className={`announcement-card ${announcement.isPinned ? 'pinned' : ''}`}
                                            >
                                                <div className="announcement-header">
                                                    <h4 className="announcement-title">
                                                        {announcement.isPinned && (
                                                            <AlertTriangle size={14} className="alert-icon" />
                                                        )}
                                                        {announcement.title}
                                                    </h4>
                                                    <span className="announcement-date">
                            {formatDate(announcement.date)}
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
                                                href="#"
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
                                        <h3 className="panel-title">UPCOMING EVENTS</h3>
                                        <a href="#" className="view-calendar-link">
                                            Calendar <ArrowUpRight size={14} className="arrow-icon" />
                                        </a>
                                    </div>

                                    <div className="events-list">
                                        {mockEvents.map(event => (
                                            <div key={event.id} className="event-card">
                                                <div className="event-header">
                                                    <h4 className="event-title">{event.title}</h4>
                                                    <span className="event-time">
                            {formatTime(event.time)}
                          </span>
                                                </div>
                                                <div className="event-details">
                                                    <span className="event-date">{formatDate(event.date)}</span>
                                                    <span className="event-location">{event.location}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hero-section">
                        <div className="hero-content">
                            <h1 className="hero-title">FRONTIER COMMAND NETWORK</h1>
                            <p className="hero-subtitle">Connect, organize, and engage with your unit across the galaxy</p>

                            <div className="login-container">
                                <p className="login-message">Secure access required. Authenticate with Discord credentials to proceed.</p>
                                <button
                                    onClick={handleDiscordLogin}
                                    className="discord-login-button"
                                >
                                    <span className="discord-icon">🎮</span> Login with Discord
                                </button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="features-section">
                            <h2 className="features-title">COMMAND SYSTEM CAPABILITIES</h2>
                            <div className="features-grid">
                                <div className="feature-card">
                                    <Calendar size={32} className="feature-icon" />
                                    <h3 className="feature-title">Mission Planning</h3>
                                    <p className="feature-description">Schedule and coordinate operations with real-time updates and notifications.</p>
                                </div>
                                <div className="feature-card">
                                    <Users size={32} className="feature-icon" />
                                    <h3 className="feature-title">Unit Management</h3>
                                    <p className="feature-description">Organize your forces into structured units with defined command hierarchies.</p>
                                </div>
                                <div className="feature-card">
                                    <MessageSquare size={32} className="feature-icon" />
                                    <h3 className="feature-title">Secure Comms</h3>
                                    <p className="feature-description">Encrypted communication channels for sensitive operational discussions.</p>
                                </div>
                                <div className="feature-card">
                                    <FileText size={32} className="feature-icon" />
                                    <h3 className="feature-title">Intelligence Archive</h3>
                                    <p className="feature-description">Access and share mission-critical resources and documentation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="main-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-copyright">
                            <p className="copyright-text">© 2025 Frontier Command Network</p>
                        </div>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Terms of Service</a>
                            <a href="#" className="footer-link">Privacy Policy</a>
                            <a href="#" className="footer-link">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { Shield, Users, Award, Star, FileText, Calendar, Bell, Clock, Medal,
    BookOpen, Truck, ChevronRight, ChevronDown, Edit, LogOut,
    Menu, Search, AtSign, AlertTriangle, Info, User, Activity } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from "../../../services/api"
import authService from '../../../services/authService';
import './Home.css';

const HomePage = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [recentOperations, setRecentOperations] = useState([]);
    const [featuredUnits, setFeaturedUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orgStats, setOrgStats] = useState({
        memberCount: 0,
        activeOperations: 0,
        completedOperations: 0,
        vehicleCount: 0
    });

    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time function
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to handle Discord login
    const handleDiscordLogin = () => {
        try {
            console.log('Homepage: Starting Discord login');
            authService.loginWithDiscord();
        } catch (error) {
            console.error('Homepage: Discord login error:', error);
            setError('Failed to start Discord login. Please try again.');
        }
    };

    // Function to handle logout
    const handleLogout = async () => {
        try {
            console.log('Homepage: Starting logout');
            await authService.logout();
            dispatch({ type: 'LOGOUT' });
            setIsDropdownOpen(false);
            console.log('Homepage: Logout successful');
        } catch (error) {
            console.error('Homepage: Logout error:', error);
            // Still clear local state even if API call fails
            dispatch({ type: 'LOGOUT' });
            setIsDropdownOpen(false);
        }
    };

    // Function to fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch announcements
                const announcementsResponse = await api.get('/announcements/');
                const announcementsData = announcementsResponse.data.results || announcementsResponse.data;

                // Sort announcements - pinned first, then by date
                const sortedAnnouncements = Array.isArray(announcementsData)
                    ? announcementsData.sort((a, b) => {
                        if (a.is_pinned && !b.is_pinned) return -1;
                        if (!a.is_pinned && b.is_pinned) return 1;
                        return new Date(b.created_at) - new Date(a.created_at);
                    }).slice(0, 5) // Show only 5 most recent
                    : [];

                setAnnouncements(sortedAnnouncements);

                // Fetch upcoming events
                const eventsResponse = await api.get('/events/upcoming/');
                const eventsData = eventsResponse.data.results || eventsResponse.data;
                setUpcomingEvents(Array.isArray(eventsData) ? eventsData.slice(0, 6) : []);

                // Fetch all events for recent operations (completed events)
                const allEventsResponse = await api.get('/events/');
                const allEventsData = allEventsResponse.data.results || allEventsResponse.data;

                // Filter for completed events and sort by date
                const completedEvents = Array.isArray(allEventsData)
                    ? allEventsData.filter(event => {
                        const eventDate = new Date(event.end_time || event.start_time);
                        return eventDate < new Date() && event.status !== 'Cancelled';
                    }).sort((a, b) => new Date(b.start_time) - new Date(a.start_time)).slice(0, 5)
                    : [];

                setRecentOperations(completedEvents);

                // Fetch units
                const unitsResponse = await api.get('/units/');
                const unitsData = unitsResponse.data.results || unitsResponse.data;

                // Get featured units (you might want to add a 'featured' flag to your units)
                const featured = Array.isArray(unitsData)
                    ? unitsData.filter(unit => unit.is_active !== false).slice(0, 3)
                    : [];
                setFeaturedUnits(featured);

                // Fetch users for member count
                try {
                    const usersResponse = await api.get('/users/');
                    const usersData = usersResponse.data.results || usersResponse.data;
                    const activeUsers = Array.isArray(usersData)
                        ? usersData.filter(u => u.is_active).length
                        : 0;

                    // Fetch vehicles for motor pool size
                    const vehiclesResponse = await api.get('/vehicles/');
                    const vehiclesData = vehiclesResponse.data.results || vehiclesResponse.data;
                    const approvedVehicles = Array.isArray(vehiclesData)
                        ? vehiclesData.filter(v => v.approval_status === 'Approved').length
                        : 0;

                    setOrgStats({
                        memberCount: activeUsers,
                        activeOperations: upcomingEvents.length,
                        completedOperations: completedEvents.length,
                        vehicleCount: approvedVehicles
                    });
                } catch (statsError) {
                    console.error('Error fetching stats:', statsError);
                    // Use default stats if can't fetch
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load some data. Please try refreshing the page.');

                // Set empty arrays instead of fallback data
                setAnnouncements([]);
                setUpcomingEvents([]);
                setRecentOperations([]);
                setFeaturedUnits([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get the nearest upcoming event
    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    // Function to get event type badge color
    const getEventTypeBadgeClass = (eventType) => {
        const typeMap = {
            'Combat Operation': 'combat',
            'Training Exercise': 'training',
            'Training': 'training',
            'Logistics': 'logistics',
            'Ceremony': 'ceremony',
            'Operation': 'combat',
            'Routine Operation': 'routine',
            'Rescue Operation': 'rescue'
        };
        return typeMap[eventType] || 'default';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="homepage-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="homepage-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <Shield className="logo-svg" fill="currentColor" />
                        </div>
                        <h1 className="logo-text">III CORPS</h1>
                    </div>
                    <div className="header-actions">
                        {/* Mobile menu button */}
                        <button
                            className="mobile-menu-button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu size={20} className="menu-icon" />
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="desktop-nav">
                            <ul className="nav-list">
                                <li><a href="#" className="nav-link active">HOME</a></li>
                                <li><a href="#" className="nav-link">OPERATIONS</a></li>
                                <li><a href="#" className="nav-link">PERSONNEL</a></li>
                                <li><a href="#" className="nav-link">TRAINING</a></li>
                                <li><a href="#" className="nav-link">RESOURCES</a></li>
                            </ul>
                        </nav>

                        {/* Search button */}
                        <button className="search-button">
                            <Search size={18} className="search-icon" />
                        </button>

                        {/* User dropdown */}
                        <div className="user-dropdown">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="user-dropdown-button"
                                >
                                    <img
                                        src={user?.avatar_url || '/api/placeholder/128/128'}
                                        alt={user?.username || 'User'}
                                        className="user-avatar"
                                    />
                                    <span className="user-name">
                                        {user?.current_rank?.abbreviation || ''} {user?.username || 'User'}
                                    </span>
                                    <ChevronDown size={16} className="dropdown-chevron" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleDiscordLogin}
                                    className="discord-login-button"
                                >
                                    <div className="discord-icon">
                                        <svg width="20" height="15" viewBox="0 0 20 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16.9308 1.25C15.6721 0.680556 14.3183 0.256945 12.9058 0C12.7354 0.294445 12.5404 0.693056 12.4075 1.01389C10.9079 0.774306 9.42208 0.774306 7.95125 1.01389C7.81833 0.693056 7.61958 0.294445 7.44792 0C6.03167 0.256945 4.67792 0.680556 3.42042 1.25C0.49125 5.63889 -0.301666 9.91667 0.0945838 14.1458C1.82542 15.4722 3.49958 16.25 5.14667 16.7569C5.55458 16.1944 5.91833 15.5972 6.23333 14.9653C5.63542 14.7292 5.06625 14.4319 4.52958 14.0833C4.6625 13.9861 4.79292 13.8819 4.91958 13.7778C8.19458 15.2431 11.8279 15.2431 15.0683 13.7778C15.195 13.8819 15.3254 13.9861 15.4571 14.0833C14.9204 14.4319 14.3513 14.7292 13.7546 14.9653C14.0696 15.5972 14.4321 16.1944 14.8413 16.7569C16.4883 16.25 18.1625 15.4722 19.8933 14.1458C20.3596 9.30556 19.0908 5.06945 16.9308 1.25ZM6.66667 11.5694C5.67917 11.5694 4.86875 10.6736 4.86875 9.58333C4.86875 8.49306 5.6625 7.59722 6.66667 7.59722C7.67083 7.59722 8.48125 8.49306 8.465 9.58333C8.465 10.6736 7.67083 11.5694 6.66667 11.5694ZM13.3333 11.5694C12.3458 11.5694 11.5354 10.6736 11.5354 9.58333C11.5354 8.49306 12.3292 7.59722 13.3333 7.59722C14.3375 7.59722 15.1479 8.49306 15.1317 9.58333C15.1317 10.6736 14.3375 11.5694 13.3333 11.5694Z" />
                                        </svg>
                                    </div>
                                    LOGIN WITH DISCORD
                                </button>
                            )}

                            {isDropdownOpen && isAuthenticated && (
                                <div className="dropdown-menu">
                                    <ul className="dropdown-list">
                                        <li>
                                            <Link
                                                to="/profile"
                                                className="dropdown-item"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <div className="dropdown-item-content">
                                                    <User size={16} className="dropdown-item-icon" />
                                                    <span>Profile</span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <div className="dropdown-item-content">
                                                    <Bell size={16} className="dropdown-item-icon" />
                                                    <span>Notifications</span>
                                                </div>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <div className="dropdown-item-content">
                                                    <Truck size={16} className="dropdown-item-icon" />
                                                    <span>My Equipment</span>
                                                </div>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <div className="dropdown-item-content">
                                                    <Calendar size={16} className="dropdown-item-icon" />
                                                    <span>My Schedule</span>
                                                </div>
                                            </a>
                                        </li>
                                        <li className="dropdown-divider">
                                            <button onClick={handleLogout} className="dropdown-item">
                                                <div className="dropdown-item-content">
                                                    <LogOut size={16} className="dropdown-item-icon" />
                                                    <span>Logout</span>
                                                </div>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <ul className="mobile-menu-list">
                            <li><a href="#" className="mobile-menu-link active">HOME</a></li>
                            <li><a href="#" className="mobile-menu-link">OPERATIONS</a></li>
                            <li><a href="#" className="mobile-menu-link">PERSONNEL</a></li>
                            <li><a href="#" className="mobile-menu-link">TRAINING</a></li>
                            <li><a href="#" className="mobile-menu-link">RESOURCES</a></li>
                            <li className="mobile-search-item">
                                <div className="mobile-search-container">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="mobile-search-input"
                                    />
                                    <Search size={16} className="mobile-search-icon" />
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-image-container">
                    <div className="hero-overlay"></div>
                    <img
                        src="https://images.unsplash.com/photo-1526890725091-49b05ceb2b4b?w=1920&h=600&fit=crop"
                        alt="III Corps Operations"
                        className="hero-image"
                    />
                    <div className="hero-gradient"></div>

                    {/* Hero content */}
                    <div className="hero-content">
                        <div className="hero-panel">
                            <h1 className="hero-title">III CORPS</h1>
                            <p className="hero-subtitle">"Phantom Warriors" - Cold War 1989 CENTAG Operations</p>

                            {nextEvent && (
                                <div className="next-op-container">
                                    <div className="next-op-info">
                                        <div className="next-op-label">NEXT OPERATION</div>
                                        <div className="next-op-title">{nextEvent.title}</div>
                                        <div className="next-op-time">{formatDate(nextEvent.start_time)} at {formatTime(nextEvent.start_time)}</div>
                                    </div>
                                    <button className="rsvp-button">
                                        SIGN UP
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Error Message */}
            {error && (
                <div className="error-banner">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content */}
            <section className="main-content">
                <div className="content-container">
                    <div className="grid-layout">
                        {/* Left Column */}
                        <div className="main-column">
                            {/* Announcements */}
                            <div className="panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">
                                        <Bell size={20} className="panel-icon" />
                                        Command Messages
                                    </h2>
                                    <a href="#" className="view-all-link">
                                        View All <ChevronRight size={16} />
                                    </a>
                                </div>

                                <div className="announcements-list">
                                    {announcements.length > 0 ? (
                                        announcements.map(announcement => (
                                            <div
                                                key={announcement.id}
                                                className={announcement.is_pinned ? 'announcement pinned' : 'announcement'}
                                            >
                                                {announcement.is_pinned && (
                                                    <div className="pinned-label">
                                                        <AlertTriangle size={14} />
                                                        <span>PRIORITY MESSAGE</span>
                                                    </div>
                                                )}

                                                <h3 className="announcement-title">{announcement.title}</h3>
                                                <p className="announcement-content">{announcement.content}</p>

                                                <div className="announcement-footer">
                                                    <div className="announcement-author">
                                                        <AtSign size={14} />
                                                        <span>
                                                            {announcement.author?.current_rank?.abbreviation || ''} {announcement.author?.username || 'Command'}
                                                        </span>
                                                    </div>
                                                    <div className="announcement-date">{formatDate(announcement.created_at)}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <Info size={24} />
                                            <p>No command messages at this time</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Events */}
                            <div className="panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">
                                        <Calendar size={20} className="panel-icon" />
                                        Upcoming Operations
                                    </h2>
                                    <a href="#" className="view-all-link">
                                        View Calendar <ChevronRight size={16} />
                                    </a>
                                </div>

                                <div className="events-grid">
                                    {upcomingEvents.length > 0 ? (
                                        upcomingEvents.map(event => (
                                            <div key={event.id} className="event-card">
                                                <div className="event-image-container">
                                                    <img
                                                        src={event.image_url || 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=200&fit=crop'}
                                                        alt={event.title}
                                                        className="event-image"
                                                    />
                                                    <div className="event-image-gradient"></div>
                                                    <div className="event-type-badge"
                                                         data-type={getEventTypeBadgeClass(event.event_type)}>
                                                        {event.event_type}
                                                    </div>
                                                    {event.is_mandatory && (
                                                        <div className="mandatory-badge">
                                                            MANDATORY
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="event-details">
                                                    <h3 className="event-title">{event.title}</h3>
                                                    <p className="event-description">{event.description}</p>

                                                    <div className="event-meta-grid">
                                                        <div className="event-meta-item">
                                                            <div className="event-meta-label">Date</div>
                                                            <div className="event-meta-value">{formatDate(event.start_time)}</div>
                                                        </div>
                                                        <div className="event-meta-item">
                                                            <div className="event-meta-label">Time</div>
                                                            <div className="event-meta-value">{formatTime(event.start_time)}</div>
                                                        </div>
                                                        <div className="event-meta-item">
                                                            <div className="event-meta-label">AO</div>
                                                            <div className="event-meta-value">{event.location?.split(' - ')[0] || 'TBD'}</div>
                                                        </div>
                                                        <div className="event-meta-item">
                                                            <div className="event-meta-label">Host Unit</div>
                                                            <div className="event-meta-value">{event.host_unit?.abbreviation || 'III Corps'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="event-footer">
                                                    <button className="event-rsvp-button">
                                                        SIGN UP
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <Calendar size={24} />
                                            <p>No upcoming operations scheduled</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Operations */}
                            <div className="panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">
                                        <Activity size={20} className="panel-icon" />
                                        Recent Operations
                                    </h2>
                                    <a href="#" className="view-all-link">
                                        View All <ChevronRight size={16} />
                                    </a>
                                </div>

                                <div className="table-container">
                                    {recentOperations.length > 0 ? (
                                        <table className="operations-table">
                                            <thead>
                                            <tr>
                                                <th>Operation</th>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Personnel</th>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {recentOperations.map(operation => (
                                                <tr key={operation.id} className="operation-row">
                                                    <td className="operation-name">{operation.title}</td>
                                                    <td className="operation-date">{formatDate(operation.start_time)}</td>
                                                    <td>
                                                        <span className={`operation-type-badge ${getEventTypeBadgeClass(operation.event_type)}`}>
                                                            {operation.event_type}
                                                        </span>
                                                    </td>
                                                    <td className="operation-personnel">
                                                        {operation.max_participants || 'N/A'}
                                                    </td>
                                                    <td>
                                                        <div className="rating-dots">
                                                            {operation.status === 'Completed' ? (
                                                                <span className="status-completed">Completed</span>
                                                            ) : (
                                                                <span className="status-other">{operation.status || 'Unknown'}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="empty-state">
                                            <Activity size={24} />
                                            <p>No recent operations to display</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="sidebar-column">
                            {/* User Welcome */}
                            {isAuthenticated ? (
                                <div className="panel">
                                    <div className="user-welcome">
                                        <img
                                            src={user?.avatar_url || '/api/placeholder/128/128'}
                                            alt={user?.username || 'User'}
                                            className="welcome-avatar"
                                        />
                                        <div>
                                            <h2 className="welcome-title">Welcome back,</h2>
                                            <div className="welcome-name">
                                                {user?.current_rank?.abbreviation || ''} {user?.username || 'Soldier'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="stats-grid">
                                        <div className="stat-box">
                                            <div className="stat-value">{upcomingEvents.length}</div>
                                            <div className="stat-label">Upcoming Operations</div>
                                        </div>
                                        <div className="stat-box">
                                            <div className="stat-value">0</div>
                                            <div className="stat-label">New Messages</div>
                                        </div>
                                    </div>

                                    <Link to="/profile" className="dashboard-button">
                                        MY DASHBOARD
                                    </Link>
                                </div>
                            ) : (
                                <div className="panel">
                                    <h2 className="panel-title">
                                        <Info size={20} className="panel-icon" />
                                        Join the Regiment
                                    </h2>
                                    <p className="join-text">
                                        Sign in with Discord to access training materials, operation schedules, and unit resources.
                                    </p>
                                    <button onClick={handleDiscordLogin} className="discord-login-button-large">
                                        <div className="discord-icon">
                                            <svg width="20" height="15" viewBox="0 0 20 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16.9308 1.25C15.6721 0.680556 14.3183 0.256945 12.9058 0C12.7354 0.294445 12.5404 0.693056 12.4075 1.01389C10.9079 0.774306 9.42208 0.774306 7.95125 1.01389C7.81833 0.693056 7.61958 0.294445 7.44792 0C6.03167 0.256945 4.67792 0.680556 3.42042 1.25C0.49125 5.63889 -0.301666 9.91667 0.0945838 14.1458C1.82542 15.4722 3.49958 16.25 5.14667 16.7569C5.55458 16.1944 5.91833 15.5972 6.23333 14.9653C5.63542 14.7292 5.06625 14.4319 4.52958 14.0833C4.6625 13.9861 4.79292 13.8819 4.91958 13.7778C8.19458 15.2431 11.8279 15.2431 15.0683 13.7778C15.195 13.8819 15.3254 13.9861 15.4571 14.0833C14.9204 14.4319 14.3513 14.7292 13.7546 14.9653C14.0696 15.5972 14.4321 16.1944 14.8413 16.7569C16.4883 16.25 18.1625 15.4722 19.8933 14.1458C20.3596 9.30556 19.0908 5.06945 16.9308 1.25ZM6.66667 11.5694C5.67917 11.5694 4.86875 10.6736 4.86875 9.58333C4.86875 8.49306 5.6625 7.59722 6.66667 7.59722C7.67083 7.59722 8.48125 8.49306 8.465 9.58333C8.465 10.6736 7.67083 11.5694 6.66667 11.5694ZM13.3333 11.5694C12.3458 11.5694 11.5354 10.6736 11.5354 9.58333C11.5354 8.49306 12.3292 7.59722 13.3333 7.59722C14.3375 7.59722 15.1479 8.49306 15.1317 9.58333C15.1317 10.6736 14.3375 11.5694 13.3333 11.5694Z" />
                                            </svg>
                                        </div>
                                        LOGIN WITH DISCORD
                                    </button>
                                </div>
                            )}

                            {/* Organization Stats */}
                            <div className="panel">
                                <h2 className="panel-title">
                                    <Info size={20} className="panel-icon" />
                                    III Corps Stats
                                </h2>

                                <div className="stats-grid">
                                    <div className="org-stat-box">
                                        <div className="org-stat-icon">
                                            <Users size={20} className="stat-icon" />
                                        </div>
                                        <div className="org-stat-content">
                                            <div className="org-stat-value">{orgStats.memberCount}</div>
                                            <div className="org-stat-label">ACTIVE PERSONNEL</div>
                                        </div>
                                    </div>
                                    <div className="org-stat-box">
                                        <div className="org-stat-icon">
                                            <Activity size={20} className="stat-icon" />
                                        </div>
                                        <div className="org-stat-content">
                                            <div className="org-stat-value">{orgStats.activeOperations}</div>
                                            <div className="org-stat-label">ACTIVE OPERATIONS</div>
                                        </div>
                                    </div>
                                    <div className="org-stat-box">
                                        <div className="org-stat-icon">
                                            <Truck size={20} className="stat-icon" />
                                        </div>
                                        <div className="org-stat-content">
                                            <div className="org-stat-value">{orgStats.vehicleCount}</div>
                                            <div className="org-stat-label">MOTOR POOL</div>
                                        </div>
                                    </div>
                                    <div className="org-stat-box">
                                        <div className="org-stat-icon">
                                            <Award size={20} className="stat-icon" />
                                        </div>
                                        <div className="org-stat-content">
                                            <div className="org-stat-value">{orgStats.completedOperations}</div>
                                            <div className="org-stat-label">OPS COMPLETED</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Units */}
                            <div className="panel">
                                <h2 className="panel-title">
                                    <Shield size={20} className="panel-icon" />
                                    Featured Units
                                </h2>

                                <div className="units-list">
                                    {featuredUnits.length > 0 ? (
                                        featuredUnits.map(unit => (
                                            <div key={unit.id} className="unit-card">
                                                <div className="unit-banner">
                                                    <img
                                                        src={unit.banner_image_url || 'https://images.unsplash.com/photo-1526890725091-49b05ceb2b4b?w=300&h=150&fit=crop'}
                                                        alt={unit.name}
                                                        className="unit-banner-image"
                                                    />
                                                    <div className="unit-banner-gradient"></div>
                                                    <div className="unit-info">
                                                        <div className="unit-emblem">
                                                            <img
                                                                src={unit.emblem_url || '/api/placeholder/64/64'}
                                                                alt={unit.abbreviation}
                                                                className="unit-emblem-image"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="unit-name">{unit.name}</div>
                                                            <div className="unit-abbr">{unit.abbreviation}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="unit-footer">
                                                    <div className="unit-member-count">
                                                        {unit.member_count || 0} Personnel
                                                    </div>
                                                    <a href="#" className="unit-details-link">View Details</a>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <Shield size={24} />
                                            <p>No units to display</p>
                                        </div>
                                    )}
                                </div>

                                {featuredUnits.length > 0 && (
                                    <div className="view-all-units">
                                        <a href="#" className="view-all-units-button">
                                            VIEW ALL UNITS
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Banner */}
            {!isAuthenticated && (
                <section className="join-banner">
                    <div className="join-banner-content">
                        <h2 className="join-banner-title">Ready to serve in the III Corps?</h2>
                        <p className="join-banner-text">The III Corps is actively recruiting soldiers for combined arms operations in the CENTAG theater. Experience authentic Cold War military simulation with professional training and teamwork.</p>
                        <div className="join-banner-buttons">
                            <button onClick={handleDiscordLogin} className="join-button primary">
                                LOGIN WITH DISCORD
                            </button>
                            <button className="join-button secondary">
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Links */}
            <section className="quick-links">
                <div className="quick-links-container">
                    <div className="quick-links-grid">
                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <FileText size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">SOPs & Doctrine</h3>
                            <p className="quick-link-description">Access standard operating procedures and tactical doctrine</p>
                        </a>

                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <Users size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">Personnel Directory</h3>
                            <p className="quick-link-description">View unit roster and chain of command</p>
                        </a>

                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <BookOpen size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">Training Center</h3>
                            <p className="quick-link-description">Complete courses and earn certifications</p>
                        </a>

                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <Medal size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">Awards Board</h3>
                            <p className="quick-link-description">View commendations and unit citations</p>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-grid">
                        <div className="footer-about">
                            <h3 className="footer-heading">III CORPS</h3>
                            <p className="footer-text">Professional military simulation unit conducting combined arms operations in the Cold War 1989 era. Defending freedom through tactical excellence and teamwork in Arma Reforger.</p>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-subheading">Navigation</h4>
                            <ul className="footer-list">
                                <li><a href="#" className="footer-link">Home</a></li>
                                <li><a href="#" className="footer-link">Operations</a></li>
                                <li><a href="#" className="footer-link">Personnel</a></li>
                                <li><a href="#" className="footer-link">Training</a></li>
                                <li><a href="#" className="footer-link">Resources</a></li>
                            </ul>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-subheading">Resources</h4>
                            <ul className="footer-list">
                                <li><a href="#" className="footer-link">Enlistment</a></li>
                                <li><a href="#" className="footer-link">BCT Info</a></li>
                                <li><a href="#" className="footer-link">Unit Standards</a></li>
                                <li><a href="#" className="footer-link">Contact</a></li>
                                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div className="footer-social">
                            <h4 className="footer-subheading">Connect</h4>
                            <div className="social-icons">
                                <a href="#" className="social-icon">
                                    <svg className="social-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.599-.1-.898a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
                                    </svg>
                                </a>
                                <a href="#" className="social-icon">
                                    <svg className="social-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"></path>
                                    </svg>
                                </a>
                                <a href="#" className="social-icon">
                                    <svg className="social-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z"></path>
                                    </svg>
                                </a>
                            </div>
                            <p className="discord-text">Join our Discord for real-time coordination and communication with the regiment.</p>
                        </div>
                    </div>

                    <div className="footer-copyright">
                        <p>© 2025 III Corps MILSIM. All rights reserved. Not affiliated with the United States Army. This is a gaming community for Arma Reforger.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
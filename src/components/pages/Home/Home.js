import React, { useState, useEffect } from 'react';
import { Shield, Users, Award, Star, FileText, Calendar, Bell, Clock, Medal,
    BookOpen, Ship, ChevronRight, ChevronDown, Edit, LogOut,
    Menu, Search, AtSign, AlertTriangle, Info, User, Activity } from 'lucide-react';
import './Home.css';

const HomePage = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [recentOperations, setRecentOperations] = useState([]);
    const [featuredUnits, setFeaturedUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock user data (in a real app this would come from authentication context)
    const user = {
        id: '8f7e6d5c-4b3a-2c1d-0e9f-8a7b6c5d4e3f',
        discord_id: '123456789012345678',
        username: 'Cmdr_Starhawk',
        email: 'starhawk@ueenavy.org',
        avatar_url: '/api/placeholder/128/128',
        service_number: 'UEE-N-47291',
        is_active: true,
        is_staff: true,
        is_admin: false,
        rank: {
            name: 'Lieutenant Commander',
            abbreviation: 'Lt. Cmdr.',
            insignia_image_url: '/api/placeholder/64/32',
        },
        branch: {
            name: 'UEE Navy',
            abbreviation: 'UEEN',
            color_code: '#1F4287'
        },
    };

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

    // Function to fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // In a real application, these would be actual API calls
                // For now, we'll simulate the API responses with mock data

                // Fetch announcements
                // GET /api/announcements
                const announcementsResponse = [
                    {
                        id: 'ann-1',
                        title: 'Operation Phoenix Dawn Briefing',
                        content: 'All officers are required to attend the pre-operation briefing for Operation Phoenix Dawn. Critical mission parameters will be discussed.',
                        author_id: 'user-123',
                        author: {
                            username: 'Admiral_Voss',
                            rank: { abbreviation: 'Adm.' }
                        },
                        is_pinned: true,
                        created_at: '2955-05-16T14:30:00Z',
                    },
                    {
                        id: 'ann-2',
                        title: 'Fleet Mobilization Order',
                        content: 'By order of Fleet Command, all vessels are to prepare for Deployment Phase Delta. Maintenance inspections must be completed within 48 hours.',
                        author_id: 'user-456',
                        author: {
                            username: 'Commander_Chen',
                            rank: { abbreviation: 'Cmdr.' }
                        },
                        is_pinned: false,
                        created_at: '2955-05-14T09:15:00Z',
                    },
                    {
                        id: 'ann-3',
                        title: 'New Combat Doctrine Published',
                        content: 'The updated Fleet Combat Engagement Doctrine v5.3 has been published to the Standards Library. All officers must review by end of month.',
                        author_id: 'user-789',
                        author: {
                            username: 'Capt_Reynolds',
                            rank: { abbreviation: 'Capt.' }
                        },
                        is_pinned: false,
                        created_at: '2955-05-10T11:45:00Z',
                    }
                ];

                // Fetch upcoming events
                // GET /api/events/upcoming
                const eventsResponse = [
                    {
                        id: 'event-1',
                        title: 'Operation Phoenix Dawn',
                        description: 'Large-scale fleet operation targeting hostile activity in the Pyro system.',
                        event_type: 'Combat Operation',
                        start_time: '2955-05-19T18:00:00Z',
                        end_time: '2955-05-19T21:30:00Z',
                        location: 'Pyro System - Nav Point Alpha',
                        host_unit_id: 'unit-1',
                        host_unit: {
                            name: '3rd Fleet, 2nd Squadron',
                            abbreviation: '3F-2S'
                        },
                        is_mandatory: true,
                        image_url: '/api/placeholder/400/200'
                    },
                    {
                        id: 'event-2',
                        title: 'Advanced Formation Training',
                        description: 'Training exercise focused on multi-ship tactical formations and maneuvers.',
                        event_type: 'Training Exercise',
                        start_time: '2955-05-21T19:00:00Z',
                        end_time: '2955-05-21T21:00:00Z',
                        location: 'Stanton System - Training Area B',
                        host_unit_id: 'unit-2',
                        host_unit: {
                            name: 'Fleet Training Command',
                            abbreviation: 'FTC'
                        },
                        is_mandatory: false,
                        image_url: '/api/placeholder/400/200'
                    },
                    {
                        id: 'event-3',
                        title: 'Quartermaster Supply Distribution',
                        description: 'Distribution of standard issue gear and equipment to authorized personnel.',
                        event_type: 'Logistics',
                        start_time: '2955-05-22T16:00:00Z',
                        end_time: '2955-05-22T18:00:00Z',
                        location: 'Port Tressler - Deck 4',
                        host_unit_id: 'unit-3',
                        host_unit: {
                            name: 'Logistics Division',
                            abbreviation: 'LOG'
                        },
                        is_mandatory: false,
                        image_url: '/api/placeholder/400/200'
                    }
                ];

                // Fetch recent operations
                // GET /api/events/recent (custom endpoint)
                const operationsResponse = [
                    {
                        id: 'op-1',
                        title: 'Border Security Patrol',
                        description: 'Routine patrol of system borders to deter unauthorized incursions.',
                        event_type: 'Routine Operation',
                        start_time: '2955-05-12T19:00:00Z',
                        end_time: '2955-05-12T22:00:00Z',
                        status: 'Completed',
                        participants: 24,
                        success_rating: 5
                    },
                    {
                        id: 'op-2',
                        title: 'Operation Starfall',
                        description: 'Coordinated attack on pirate outpost in asteroid belt.',
                        event_type: 'Combat Operation',
                        start_time: '2955-05-08T20:00:00Z',
                        end_time: '2955-05-08T23:30:00Z',
                        status: 'Completed',
                        participants: 32,
                        success_rating: 4
                    },
                    {
                        id: 'op-3',
                        title: 'Search and Rescue Mission',
                        description: 'Emergency rescue of stranded civilian transport.',
                        event_type: 'Rescue Operation',
                        start_time: '2955-05-05T15:30:00Z',
                        end_time: '2955-05-05T18:45:00Z',
                        status: 'Completed',
                        participants: 16,
                        success_rating: 5
                    }
                ];

                // Fetch featured units
                // GET /api/units (with some filter parameters)
                const unitsResponse = [
                    {
                        id: 'unit-1',
                        name: '3rd Fleet, 2nd Squadron',
                        abbreviation: '3F-2S',
                        description: 'Naval combat squadron specializing in coordinated fleet actions',
                        emblem_url: '/api/placeholder/64/64',
                        banner_image_url: '/api/placeholder/300/150',
                        motto: 'Swift Justice',
                        member_count: 42,
                        established_date: '2941-03-15'
                    },
                    {
                        id: 'unit-2',
                        name: 'Special Operations Group',
                        abbreviation: 'SOG',
                        description: 'Elite unit conducting covert and high-risk operations',
                        emblem_url: '/api/placeholder/64/64',
                        banner_image_url: '/api/placeholder/300/150',
                        motto: 'Unseen, Unheard, Unstoppable',
                        member_count: 24,
                        established_date: '2947-09-22'
                    },
                    {
                        id: 'unit-3',
                        name: 'Fleet Intelligence Division',
                        abbreviation: 'FID',
                        description: 'Intelligence gathering and tactical analysis unit',
                        emblem_url: '/api/placeholder/64/64',
                        banner_image_url: '/api/placeholder/300/150',
                        motto: 'Knowledge Is Power',
                        member_count: 18,
                        established_date: '2944-11-05'
                    }
                ];

                // Update state with fetched data
                setAnnouncements(announcementsResponse);
                setUpcomingEvents(eventsResponse);
                setRecentOperations(operationsResponse);
                setFeaturedUnits(unitsResponse);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle errors appropriately
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get the nearest upcoming event
    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    // Organization stats (would come from API in a real app)
    const orgStats = {
        memberCount: 248,
        activeOperations: 3,
        completedOperations: 143,
        fleetSize: 86
    };

    return (
        <div className="homepage-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <svg className="logo-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <h1 className="logo-text">5TH EXPEDITIONARY</h1>
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
                                <li><a href="#" className="nav-link">ROSTER</a></li>
                                <li><a href="#" className="nav-link">STANDARDS</a></li>
                            </ul>
                        </nav>

                        {/* Search button */}
                        <button className="search-button">
                            <Search size={18} className="search-icon" />
                        </button>

                        {/* User dropdown */}
                        <div className="user-dropdown">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="user-dropdown-button"
                            >
                                <img
                                    src={user.avatar_url}
                                    alt={user.username}
                                    className="user-avatar"
                                />
                                <span className="user-name">{user.rank.abbreviation} {user.username}</span>
                                <ChevronDown size={16} className="dropdown-chevron" />
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <ul className="dropdown-list">
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <div className="dropdown-item-content">
                                                    <User size={16} className="dropdown-item-icon" />
                                                    <span>Profile</span>
                                                </div>
                                            </a>
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
                                                    <Ship size={16} className="dropdown-item-icon" />
                                                    <span>My Ships</span>
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
                                            <a href="#" className="dropdown-item">
                                                <div className="dropdown-item-content">
                                                    <LogOut size={16} className="dropdown-item-icon" />
                                                    <span>Logout</span>
                                                </div>
                                            </a>
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
                            <li><a href="#" className="mobile-menu-link">ROSTER</a></li>
                            <li><a href="#" className="mobile-menu-link">STANDARDS</a></li>
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
                        src="/api/placeholder/1920/600"
                        alt="5th Expeditionary Fleet"
                        className="hero-image"
                    />
                    <div className="hero-gradient"></div>

                    {/* Hero content */}
                    <div className="hero-content">
                        <div className="hero-panel">
                            <h1 className="hero-title">5TH EXPEDITIONARY GROUP</h1>
                            <p className="hero-subtitle">Defending freedom across the stars</p>

                            {nextEvent && (
                                <div className="next-op-container">
                                    <div className="next-op-info">
                                        <div className="next-op-label">NEXT OPERATION</div>
                                        <div className="next-op-title">{nextEvent.title}</div>
                                        <div className="next-op-time">{formatDate(nextEvent.start_time)} at {formatTime(nextEvent.start_time)}</div>
                                    </div>
                                    <button className="rsvp-button">
                                        RSVP NOW
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

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
                                        Announcements
                                    </h2>
                                    <a href="#" className="view-all-link">
                                        View All <ChevronRight size={16} />
                                    </a>
                                </div>

                                <div className="announcements-list">
                                    {announcements.map(announcement => (
                                        <div
                                            key={announcement.id}
                                            className={announcement.is_pinned ? 'announcement pinned' : 'announcement'}
                                        >
                                            {announcement.is_pinned && (
                                                <div className="pinned-label">
                                                    <AlertTriangle size={14} />
                                                    <span>PINNED ANNOUNCEMENT</span>
                                                </div>
                                            )}

                                            <h3 className="announcement-title">{announcement.title}</h3>
                                            <p className="announcement-content">{announcement.content}</p>

                                            <div className="announcement-footer">
                                                <div className="announcement-author">
                                                    <AtSign size={14} />
                                                    <span>{announcement.author.rank.abbreviation} {announcement.author.username}</span>
                                                </div>
                                                <div className="announcement-date">{formatDate(announcement.created_at)}</div>
                                            </div>
                                        </div>
                                    ))}
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
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="event-card">
                                            <div className="event-image-container">
                                                <img
                                                    src={event.image_url}
                                                    alt={event.title}
                                                    className="event-image"
                                                />
                                                <div className="event-image-gradient"></div>
                                                <div className="event-type-badge"
                                                     data-type={event.event_type === 'Combat Operation' ? 'combat' :
                                                         event.event_type === 'Training Exercise' ? 'training' : 'logistics'}>
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
                                                        <div className="event-meta-label">Location</div>
                                                        <div className="event-meta-value">{event.location.split(' - ')[0]}</div>
                                                    </div>
                                                    <div className="event-meta-item">
                                                        <div className="event-meta-label">Host</div>
                                                        <div className="event-meta-value">{event.host_unit.abbreviation}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="event-footer">
                                                <button className="event-rsvp-button">
                                                    RSVP
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                                    <table className="operations-table">
                                        <thead>
                                        <tr>
                                            <th>Operation</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Personnel</th>
                                            <th>Result</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentOperations.map(operation => (
                                            <tr key={operation.id} className="operation-row">
                                                <td className="operation-name">{operation.title}</td>
                                                <td className="operation-date">{formatDate(operation.start_time)}</td>
                                                <td>
                            <span className={`operation-type-badge ${operation.event_type === 'Combat Operation' ? 'combat' :
                                operation.event_type === 'Routine Operation' ? 'routine' : 'rescue'}`}>
                              {operation.event_type}
                            </span>
                                                </td>
                                                <td className="operation-personnel">{operation.participants} deployed</td>
                                                <td>
                                                    <div className="rating-dots">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={i < operation.success_rating ? 'rating-dot filled' : 'rating-dot'}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="sidebar-column">
                            {/* User Welcome */}
                            <div className="panel">
                                <div className="user-welcome">
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="welcome-avatar"
                                    />
                                    <div>
                                        <h2 className="welcome-title">Welcome back,</h2>
                                        <div className="welcome-name">{user.rank.abbreviation} {user.username}</div>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-box">
                                        <div className="stat-value">3</div>
                                        <div className="stat-label">Upcoming Events</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-value">2</div>
                                        <div className="stat-label">New Messages</div>
                                    </div>
                                </div>

                                <a href="#" className="dashboard-button">
                                    MY DASHBOARD
                                </a>
                            </div>

                            {/* Organization Stats */}
                            <div className="panel">
                                <h2 className="panel-title">
                                    <Info size={20} className="panel-icon" />
                                    Organization Stats
                                </h2>

                                <div className="stats-grid">
                                    <div className="org-stat-box">
                                        <div className="org-stat-icon">
                                            <Users size={20} className="stat-icon" />
                                        </div>
                                        <div className="org-stat-content">
                                            <div className="org-stat-value">{orgStats.memberCount}</div>
                                            <div className="org-stat-label">ACTIVE MEMBERS</div>
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
                                            <Ship size={20} className="stat-icon" />
                                        </div>
                                        <div className="org-stat-content">
                                            <div className="org-stat-value">{orgStats.fleetSize}</div>
                                            <div className="org-stat-label">REGISTERED VESSELS</div>
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
                                    {featuredUnits.map(unit => (
                                        <div key={unit.id} className="unit-card">
                                            <div className="unit-banner">
                                                <img
                                                    src={unit.banner_image_url}
                                                    alt={unit.name}
                                                    className="unit-banner-image"
                                                />
                                                <div className="unit-banner-gradient"></div>
                                                <div className="unit-info">
                                                    <div className="unit-emblem">
                                                        <img src={unit.emblem_url} alt={unit.abbreviation} className="unit-emblem-image" />
                                                    </div>
                                                    <div>
                                                        <div className="unit-name">{unit.name}</div>
                                                        <div className="unit-abbr">{unit.abbreviation}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="unit-footer">
                                                <div className="unit-member-count">{unit.member_count} Members</div>
                                                <a href="#" className="unit-details-link">View Details</a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="view-all-units">
                                    <a href="#" className="view-all-units-button">
                                        VIEW ALL UNITS
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Banner */}
            <section className="join-banner">
                <div className="join-banner-content">
                    <h2 className="join-banner-title">Ready to join our ranks?</h2>
                    <p className="join-banner-text">The 5th Expeditionary Group is actively recruiting pilots, marines, and support personnel. Apply today and become part of our elite fighting force.</p>
                    <div className="join-banner-buttons">
                        <button className="join-button primary">
                            APPLY NOW
                        </button>
                        <button className="join-button secondary">
                            LEARN MORE
                        </button>
                    </div>
                </div>
            </section>

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
                            <h3 className="quick-link-title">Standards Library</h3>
                            <p className="quick-link-description">Access operational procedures and protocols</p>
                        </a>

                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <Users size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">Member Directory</h3>
                            <p className="quick-link-description">Look up personnel and chain of command</p>
                        </a>

                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <BookOpen size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">Training Center</h3>
                            <p className="quick-link-description">Improve your skills with certifications</p>
                        </a>

                        <a href="#" className="quick-link-card">
                            <div className="quick-link-icon">
                                <div className="icon-circle">
                                    <Medal size={24} className="quick-icon" />
                                </div>
                            </div>
                            <h3 className="quick-link-title">Recognition</h3>
                            <p className="quick-link-description">View awards and achievements</p>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-grid">
                        <div className="footer-about">
                            <h3 className="footer-heading">5TH EXPEDITIONARY</h3>
                            <p className="footer-text">Defending freedom and maintaining order across the stars. The 5th Expeditionary Group is an elite military organization.</p>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-subheading">Navigation</h4>
                            <ul className="footer-list">
                                <li><a href="#" className="footer-link">Home</a></li>
                                <li><a href="#" className="footer-link">Operations</a></li>
                                <li><a href="#" className="footer-link">Roster</a></li>
                                <li><a href="#" className="footer-link">Standards</a></li>
                                <li><a href="#" className="footer-link">Training</a></li>
                            </ul>
                        </div>

                        <div className="footer-links">
                            <h4 className="footer-subheading">Resources</h4>
                            <ul className="footer-list">
                                <li><a href="#" className="footer-link">Join Us</a></li>
                                <li><a href="#" className="footer-link">FAQ</a></li>
                                <li><a href="#" className="footer-link">Support</a></li>
                                <li><a href="#" className="footer-link">Policy</a></li>
                                <li><a href="#" className="footer-link">Terms of Service</a></li>
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
                            <p className="discord-text">Join our Discord community for real-time updates and coordination.</p>
                        </div>
                    </div>

                    <div className="footer-copyright">
                        <p>© 2943-2955 5th Expeditionary Group. All rights reserved. This is a fan-made Star Citizen organization.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
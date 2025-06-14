import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar, Clock, MapPin, Users, Filter, Search, ChevronRight, AlertCircle,
    Grid, List, FileText, Shield, ChevronLeft, CheckCircle, XCircle,
    AlertTriangle, User, Download, Printer, Share2
} from 'lucide-react';

const OperationsManager = () => {
    const [view, setView] = useState('list'); // 'list' or 'detail'
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Navigate to detail view
    const viewEventDetail = (eventId) => {
        setSelectedEventId(eventId);
        setView('detail');
    };

    // Navigate back to list
    const backToList = () => {
        setView('list');
        setSelectedEventId(null);
        setSelectedEvent(null);
    };

    // List View Component
    const ListView = () => {
        const [viewMode, setViewMode] = useState('grid');
        const [searchTerm, setSearchTerm] = useState('');
        const [eventTypeFilter, setEventTypeFilter] = useState('all');
        const [statusFilter, setStatusFilter] = useState('all');
        const [dateFilter, setDateFilter] = useState('upcoming');
        const [sortBy, setSortBy] = useState('start_time');
        const [showFilters, setShowFilters] = useState(false);
        const [isFetching, setIsFetching] = useState(false);
        const isInitialMount = useRef(true);

        useEffect(() => {
            // Skip the effect on initial mount if needed
            if (isInitialMount.current) {
                isInitialMount.current = false;
                // Fetch immediately on first mount
                fetchEvents();
                return;
            }

            // Add abort controller to cancel in-flight requests
            const abortController = new AbortController();

            // Add a small delay to debounce rapid filter changes
            const timeoutId = setTimeout(() => {
                fetchEvents(abortController.signal);
            }, 300);

            // Cleanup function
            return () => {
                clearTimeout(timeoutId);
                abortController.abort();
            };
        }, [eventTypeFilter, statusFilter, dateFilter, sortBy]);

        const fetchEvents = async (signal) => {
            // Don't fetch if already fetching
            if (isFetching) return;

            try {
                setIsFetching(true);
                setLoading(true);
                let url = '/api/events/';
                const params = new URLSearchParams();

                // Build URL based on filters
                if (dateFilter === 'upcoming') {
                    url = '/api/events/upcoming/';
                } else if (dateFilter === 'past') {
                    // Add filter for past events
                    const now = new Date().toISOString();
                    params.append('end_time__lt', now);
                }

                // Add other filters only if not using upcoming endpoint
                if (dateFilter !== 'upcoming') {
                    if (eventTypeFilter !== 'all') params.append('event_type', eventTypeFilter);
                    if (statusFilter !== 'all') params.append('status', statusFilter);
                }

                // Add ordering
                params.append('ordering', sortBy === 'start_time' ? 'start_time' : sortBy);

                const queryString = params.toString();
                if (queryString) url += '?' + queryString;

                const response = await fetch(url, signal ? { signal } : {});
                if (!response.ok) throw new Error('Failed to fetch events');

                const data = await response.json();
                setEvents(Array.isArray(data) ? data : data.results || []);
                setError(null);
            } catch (err) {
                // Ignore abort errors
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    console.error('Error fetching events:', err);
                }
            } finally {
                setIsFetching(false);
                setLoading(false);
            }
        };

        const handleRSVP = async (eventId, status, e) => {
            // Prevent event bubbling to parent card
            if (e) {
                e.stopPropagation();
            }

            try {
                const response = await fetch(`/api/events/${eventId}/attend/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) throw new Error('Failed to update RSVP');

                // Update only the specific event in the list instead of refetching all
                const updatedEvent = await response.json();
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === eventId
                            ? { ...event, attendees_count: (event.attendees_count || 0) + 1 }
                            : event
                    )
                );
            } catch (err) {
                console.error('RSVP error:', err);
                // Could show a toast notification here
            }
        };

        const filteredEvents = events.filter(event => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return event.title.toLowerCase().includes(search) ||
                    event.description?.toLowerCase().includes(search) ||
                    event.location?.toLowerCase().includes(search);
            }
            return true;
        });

        const sortedEvents = [...filteredEvents].sort((a, b) => {
            switch (sortBy) {
                case 'start_time':
                    return new Date(a.start_time) - new Date(b.start_time);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'event_type':
                    return a.event_type.localeCompare(b.event_type);
                default:
                    return 0;
            }
        });

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        const formatTime = (dateString) => {
            return new Date(dateString).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        const getEventTypeColor = (type) => {
            switch (type) {
                case 'Operation': return 'var(--error-color)';
                case 'Training': return 'var(--info-color)';
                case 'Ceremony': return 'var(--warning-color)';
                case 'Meeting': return 'var(--military-green)';
                case 'Social': return 'var(--military-tan)';
                default: return 'var(--text-secondary)';
            }
        };

        const getStatusColor = (status) => {
            switch (status) {
                case 'Scheduled': return 'var(--info-color)';
                case 'In Progress': return 'var(--warning-color)';
                case 'Completed': return 'var(--success-color)';
                case 'Cancelled': return 'var(--error-color)';
                case 'Postponed': return 'var(--text-secondary)';
                default: return 'var(--text-secondary)';
            }
        };

        if (loading) {
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading operations...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>Error loading operations: {error}</span>
                </div>
            );
        }

        return (
            <>
                <div className="operations-header">
                    <div className="operations-header-content">
                        <div>
                            <h1 className="operations-title">Operations & Events</h1>
                            <p className="operations-subtitle">View and manage upcoming operations, training, and unit events</p>
                        </div>

                        <div className="header-actions-group">
                            <button
                                className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="operations-controls">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search operations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <button
                        className="filter-toggle-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                        <span className="filter-count">{eventTypeFilter !== 'all' || statusFilter !== 'all' ? '•' : ''}</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label className="filter-label">Event Type</label>
                                <select
                                    value={eventTypeFilter}
                                    onChange={(e) => setEventTypeFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Types</option>
                                    <option value="Operation">Operations</option>
                                    <option value="Training">Training</option>
                                    <option value="Ceremony">Ceremonies</option>
                                    <option value="Meeting">Meetings</option>
                                    <option value="Social">Social</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Postponed">Postponed</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Date Range</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="all">All Time</option>
                                    <option value="past">Past Events</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="start_time">Date</option>
                                    <option value="title">Title</option>
                                    <option value="event_type">Type</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="operations-content">
                    {sortedEvents.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} />
                            <h3>No operations found</h3>
                            <p>Try adjusting your filters or search terms</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="operations-grid">
                            {sortedEvents.map(event => (
                                <div key={event.id} className="operation-card">
                                    {event.image_url && (
                                        <div className="operation-image-container">
                                            <img src={event.image_url} alt={event.title} className="operation-image" />
                                            <div className="operation-image-gradient"></div>
                                            <span
                                                className="operation-type-badge"
                                                style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                                            >
                        {event.event_type}
                      </span>
                                            {event.is_mandatory && (
                                                <span className="mandatory-badge">MANDATORY</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="operation-card-content">
                                        <h3 className="operation-card-title">{event.title}</h3>

                                        <div className="operation-meta">
                                            <div className="meta-item">
                                                <Calendar size={14} />
                                                <span>{formatDate(event.start_time)}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Clock size={14} />
                                                <span>{formatTime(event.start_time)}</span>
                                            </div>
                                            {event.location && (
                                                <div className="meta-item">
                                                    <MapPin size={14} />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {event.description && (
                                            <p className="operation-description">{event.description}</p>
                                        )}

                                        <div className="operation-footer">
                                            <div className="attendees-info">
                                                <Users size={14} />
                                                <span>{event.attendees_count || 0} attending</span>
                                            </div>
                                            <span
                                                className="status-badge"
                                                style={{ color: getStatusColor(event.status) }}
                                            >
                        {event.status}
                      </span>
                                        </div>

                                        <div className="operation-actions">
                                            <button
                                                onClick={() => viewEventDetail(event.id)}
                                                className="details-link"
                                            >
                                                View Details
                                                <ChevronRight size={16} />
                                            </button>
                                            {event.status === 'Scheduled' && (
                                                <button
                                                    className="rsvp-button-small"
                                                    onClick={(e) => handleRSVP(event.id, 'Attending', e)}
                                                >
                                                    RSVP
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="operations-list">
                            <table className="operations-table">
                                <thead>
                                <tr>
                                    <th>Operation</th>
                                    <th>Type</th>
                                    <th>Date & Time</th>
                                    <th>Location</th>
                                    <th>Host Unit</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedEvents.map(event => (
                                    <tr key={event.id} className="operation-row">
                                        <td>
                                            <div className="operation-name-cell">
                                                <span className="operation-name">{event.title}</span>
                                                {event.is_mandatory && (
                                                    <span className="mandatory-indicator">*</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                        <span
                            className="type-badge-inline"
                            style={{ color: getEventTypeColor(event.event_type) }}
                        >
                          {event.event_type}
                        </span>
                                        </td>
                                        <td>
                                            <div className="datetime-cell">
                                                <div>{formatDate(event.start_time)}</div>
                                                <div className="time-text">{formatTime(event.start_time)}</div>
                                            </div>
                                        </td>
                                        <td>{event.location || '-'}</td>
                                        <td>{event.host_unit_name || '-'}</td>
                                        <td>
                        <span
                            className="status-text"
                            style={{ color: getStatusColor(event.status) }}
                        >
                          {event.status}
                        </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    onClick={() => viewEventDetail(event.id)}
                                                    className="table-link"
                                                >
                                                    Details
                                                </button>
                                                {event.status === 'Scheduled' && (
                                                    <button
                                                        className="table-button"
                                                        onClick={(e) => handleRSVP(event.id, 'Attending', e)}
                                                    >
                                                        RSVP
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </>
        );
    };

    // Detail View Component
    const DetailView = () => {
        const [event, setEvent] = useState(null);
        const [opord, setOpord] = useState(null);
        const [attendance, setAttendance] = useState([]);
        const [myAttendance, setMyAttendance] = useState(null);
        const [detailLoading, setDetailLoading] = useState(true);
        const [activeTab, setActiveTab] = useState('details');
        const [rsvpLoading, setRsvpLoading] = useState(false);

        // Mock current user - replace with actual auth context
        const currentUser = { id: 1, username: 'current_user' };

        useEffect(() => {
            if (selectedEventId) {
                fetchEventDetails();
            }
        }, [selectedEventId]);

        const fetchEventDetails = async () => {
            try {
                setDetailLoading(true);

                const eventResponse = await fetch(`/api/events/${selectedEventId}/`);
                if (!eventResponse.ok) throw new Error('Failed to fetch event details');
                const eventData = await eventResponse.json();
                setEvent(eventData);

                if (eventData.operation_order) {
                    const opordResponse = await fetch(`/api/opords/${eventData.operation_order}/`);
                    if (opordResponse.ok) {
                        const opordData = await opordResponse.json();
                        setOpord(opordData);
                    }
                }

                const attendanceResponse = await fetch(`/api/events/${selectedEventId}/attendance/`);
                if (attendanceResponse.ok) {
                    const attendanceData = await attendanceResponse.json();
                    setAttendance(attendanceData);

                    const userAttendance = attendanceData.find(a => a.user === currentUser.id);
                    setMyAttendance(userAttendance);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setDetailLoading(false);
            }
        };

        const handleRSVP = async (status) => {
            try {
                setRsvpLoading(true);
                const response = await fetch(`/api/events/${selectedEventId}/attend/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) throw new Error('Failed to update RSVP');
                await fetchEventDetails();
            } catch (err) {
                console.error('RSVP error:', err);
            } finally {
                setRsvpLoading(false);
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        };

        const formatTime = (dateString) => {
            return new Date(dateString).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        const getEventTypeColor = (type) => {
            switch (type) {
                case 'Operation': return 'var(--error-color)';
                case 'Training': return 'var(--info-color)';
                case 'Ceremony': return 'var(--warning-color)';
                case 'Meeting': return 'var(--military-green)';
                case 'Social': return 'var(--military-tan)';
                default: return 'var(--text-secondary)';
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'Attending': return <CheckCircle size={16} color="var(--success-color)" />;
                case 'Declined': return <XCircle size={16} color="var(--error-color)" />;
                case 'Maybe': return <AlertTriangle size={16} color="var(--warning-color)" />;
                case 'Excused': return <Shield size={16} color="var(--info-color)" />;
                default: return <AlertCircle size={16} color="var(--text-muted)" />;
            }
        };

        const getClassificationColor = (classification) => {
            switch (classification) {
                case 'Top Secret': return 'var(--error-color)';
                case 'Secret': return 'var(--warning-color)';
                case 'Confidential': return 'var(--info-color)';
                default: return 'var(--text-secondary)';
            }
        };

        if (detailLoading) {
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading operation details...</p>
                </div>
            );
        }

        if (!event) {
            return (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>Operation not found</span>
                </div>
            );
        }

        const attendingCount = attendance.filter(a => a.status === 'Attending').length;
        const maybeCount = attendance.filter(a => a.status === 'Maybe').length;
        const declinedCount = attendance.filter(a => a.status === 'Declined').length;

        return (
            <>
                <div className="detail-header" style={{ backgroundImage: event.image_url ? `url(${event.image_url})` : 'none' }}>
                    <div className="header-overlay"></div>
                    <div className="header-content-wrapper">
                        <div className="header-navigation">
                            <button onClick={backToList} className="back-link">
                                <ChevronLeft size={20} />
                                <span>Back to Operations</span>
                            </button>
                            <div className="header-actions">
                                <button className="icon-button" title="Share">
                                    <Share2 size={18} />
                                </button>
                                <button className="icon-button" title="Print">
                                    <Printer size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="header-info">
                            <div className="header-badges">
                <span
                    className="type-badge-large"
                    style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                >
                  {event.event_type}
                </span>
                                {event.is_mandatory && (
                                    <span className="mandatory-badge-large">MANDATORY ATTENDANCE</span>
                                )}
                            </div>

                            <h1 className="operation-title-large">{event.title}</h1>

                            <div className="header-meta">
                                <div className="meta-item-large">
                                    <Calendar size={18} />
                                    <span>{formatDate(event.start_time)}</span>
                                </div>
                                <div className="meta-item-large">
                                    <Clock size={18} />
                                    <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                </div>
                                {event.location && (
                                    <div className="meta-item-large">
                                        <MapPin size={18} />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-content">
                    <div className="content-grid">
                        <div className="main-column">
                            <div className="tab-navigation">
                                <button
                                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Operation Details
                                </button>
                                {opord && (
                                    <button
                                        className={`tab-button ${activeTab === 'opord' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('opord')}
                                    >
                                        OPORD
                                    </button>
                                )}
                                <button
                                    className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('attendance')}
                                >
                                    Attendance ({attendingCount})
                                </button>
                            </div>

                            <div className="tab-content">
                                {activeTab === 'details' && (
                                    <div className="details-tab">
                                        <section className="detail-section">
                                            <h2 className="section-title">Operation Overview</h2>
                                            <p className="description-text">{event.description || 'No description provided.'}</p>
                                        </section>

                                        <section className="detail-section">
                                            <h2 className="section-title">Event Information</h2>
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <span className="info-label">Host Unit</span>
                                                    <span className="info-value">{event.host_unit_name}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Created By</span>
                                                    <span className="info-value">{event.creator_username}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Status</span>
                                                    <span className="info-value">{event.status}</span>
                                                </div>
                                                {event.max_participants && (
                                                    <div className="info-item">
                                                        <span className="info-label">Max Participants</span>
                                                        <span className="info-value">{attendingCount}/{event.max_participants}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {event.coordinates && (
                                            <section className="detail-section">
                                                <h2 className="section-title">Location Details</h2>
                                                <div className="location-info">
                                                    <p><strong>Coordinates:</strong> {event.coordinates}</p>
                                                    {event.briefing_url && (
                                                        <a href={event.briefing_url} className="briefing-link" target="_blank" rel="noopener noreferrer">
                                                            <FileText size={16} />
                                                            View Mission Briefing
                                                        </a>
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'opord' && opord && (
                                    <div className="opord-tab">
                                        <div className="opord-header">
                                            <h2 className="opord-title">{opord.operation_name}</h2>
                                            <div className="opord-meta">
                        <span
                            className="classification-badge"
                            style={{ color: getClassificationColor(opord.classification) }}
                        >
                          {opord.classification}
                        </span>
                                                <span className="opord-version">Version {opord.version}</span>
                                            </div>
                                        </div>

                                        {opord.situation && (
                                            <section className="opord-section">
                                                <h3 className="opord-section-title">1. SITUATION</h3>
                                                <p className="opord-text">{opord.situation}</p>
                                            </section>
                                        )}

                                        {opord.mission && (
                                            <section className="opord-section">
                                                <h3 className="opord-section-title">2. MISSION</h3>
                                                <p className="opord-text">{opord.mission}</p>
                                            </section>
                                        )}

                                        {opord.execution && (
                                            <section className="opord-section">
                                                <h3 className="opord-section-title">3. EXECUTION</h3>
                                                <p className="opord-text">{opord.execution}</p>
                                            </section>
                                        )}

                                        {opord.service_support && (
                                            <section className="opord-section">
                                                <h3 className="opord-section-title">4. SERVICE SUPPORT</h3>
                                                <p className="opord-text">{opord.service_support}</p>
                                            </section>
                                        )}

                                        {opord.command_signal && (
                                            <section className="opord-section">
                                                <h3 className="opord-section-title">5. COMMAND & SIGNAL</h3>
                                                <p className="opord-text">{opord.command_signal}</p>
                                            </section>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'attendance' && (
                                    <div className="attendance-tab">
                                        <div className="attendance-summary">
                                            <div className="summary-item">
                                                <CheckCircle size={20} color="var(--success-color)" />
                                                <span className="summary-count">{attendingCount}</span>
                                                <span className="summary-label">Attending</span>
                                            </div>
                                            <div className="summary-item">
                                                <AlertTriangle size={20} color="var(--warning-color)" />
                                                <span className="summary-count">{maybeCount}</span>
                                                <span className="summary-label">Maybe</span>
                                            </div>
                                            <div className="summary-item">
                                                <XCircle size={20} color="var(--error-color)" />
                                                <span className="summary-count">{declinedCount}</span>
                                                <span className="summary-label">Declined</span>
                                            </div>
                                        </div>

                                        <div className="attendance-list">
                                            {attendance.map(att => (
                                                <div key={att.id} className="attendance-item">
                                                    <div className="attendance-user">
                                                        {att.user_avatar ? (
                                                            <img src={att.user_avatar} alt={att.user_username} className="user-avatar-small" />
                                                        ) : (
                                                            <div className="avatar-placeholder">
                                                                <User size={16} />
                                                            </div>
                                                        )}
                                                        <span className="user-username">{att.user_username}</span>
                                                    </div>
                                                    <div className="attendance-status">
                                                        {getStatusIcon(att.status)}
                                                        <span>{att.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-column">
                            <div className="rsvp-panel">
                                <h3 className="panel-title">Your Response</h3>

                                {myAttendance ? (
                                    <div className="current-response">
                                        <div className="response-status">
                                            {getStatusIcon(myAttendance.status)}
                                            <span>You are <strong>{myAttendance.status}</strong></span>
                                        </div>
                                        <p className="response-time">
                                            Responded {new Date(myAttendance.response_time).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="no-response">You haven't responded yet</p>
                                )}

                                {event.status === 'Scheduled' && (
                                    <div className="rsvp-buttons">
                                        <button
                                            className="rsvp-button attending"
                                            onClick={() => handleRSVP('Attending')}
                                            disabled={rsvpLoading}
                                        >
                                            <CheckCircle size={18} />
                                            Attending
                                        </button>
                                        <button
                                            className="rsvp-button maybe"
                                            onClick={() => handleRSVP('Maybe')}
                                            disabled={rsvpLoading}
                                        >
                                            <AlertTriangle size={18} />
                                            Maybe
                                        </button>
                                        <button
                                            className="rsvp-button declined"
                                            onClick={() => handleRSVP('Declined')}
                                            disabled={rsvpLoading}
                                        >
                                            <XCircle size={18} />
                                            Declined
                                        </button>
                                        {event.is_mandatory && (
                                            <button
                                                className="rsvp-button excused"
                                                onClick={() => handleRSVP('Excused')}
                                                disabled={rsvpLoading}
                                            >
                                                <Shield size={18} />
                                                Request Excuse
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="info-panel">
                                <h3 className="panel-title">Quick Information</h3>
                                <div className="quick-info">
                                    <div className="quick-info-item">
                                        <Users size={16} />
                                        <span>{attendingCount} personnel attending</span>
                                    </div>
                                    {event.required_ranks && (
                                        <div className="quick-info-item">
                                            <Shield size={16} />
                                            <span>Required ranks: {event.required_ranks.join(', ')}</span>
                                        </div>
                                    )}
                                    {opord && (
                                        <div className="quick-info-item">
                                            <FileText size={16} />
                                            <span>OPORD: {opord.approval_status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };



    // Main render
    return (
        <div className="operations-page">
            {view === 'list' ? <ListView /> : <DetailView />}

            <style jsx>{`
        /* Include all the CSS from the previous components here */
        /* I'll include a condensed version for space */
        
        .operations-page {
          min-height: 100vh;
          background-color: var(--primary-bg);
          color: var(--text-primary);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--military-yellow);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background-color: var(--error-color);
          color: white;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .operation-detail-page {
            min-height: 100vh;
            background-color: var(--primary-bg);
            color: var(--text-primary);
        }

        .detail-header {
            position: relative;
            height: 20rem;
            background-size: cover;
            background-position: center;
            background-color: var(--secondary-bg);
        }

        .header-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%);
        }

        .header-content-wrapper {
            position: relative;
            height: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .back-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .back-link:hover {
            color: var(--military-yellow);
        }

        .header-actions {
            display: flex;
            gap: 0.5rem;
        }

        .icon-button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.5rem;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .icon-button:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .header-info {
            color: white;
        }

        .header-badges {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .type-badge-large {
            padding: 0.375rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
            letter-spacing: 0.05em;
        }

        .mandatory-badge-large {
            background: var(--warning-color);
            color: black;
            padding: 0.375rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 700;
            letter-spacing: 0.1em;
        }

        .operation-title-large {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        .header-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
        }

        .meta-item-large {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }

        .detail-content {
            max-width: 1200px;
            margin: -3rem auto 0;
            padding: 0 1rem 2rem;
            position: relative;
            z-index: 1;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr 24rem;
            gap: 2rem;
        }

        .main-column {
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .sidebar-column {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .tab-navigation {
            display: flex;
            border-bottom: 1px solid var(--border-color);
        }

        .tab-button {
            flex: 1;
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .tab-button:hover {
            background: var(--accent-bg);
        }

        .tab-button.active {
            color: var(--military-yellow);
        }

        .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--military-yellow);
        }

        .tab-content {
            padding: 2rem;
        }

        .detail-section {
            margin-bottom: 2rem;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .description-text {
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 0.875rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
        }

        .info-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            letter-spacing: 0.05em;
        }

        .info-value {
            font-size: 0.875rem;
            color: var(--text-primary);
        }

        .location-info {
            background: var(--accent-bg);
            padding: 1rem;
            border-radius: 0.375rem;
        }

        .location-info p {
            margin-bottom: 0.75rem;
            color: var(--text-secondary);
        }

        .briefing-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--military-yellow);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .briefing-link:hover {
            color: #e6c200;
        }

        /* OPORD Styles */
        .opord-tab {
            background: var(--accent-bg);
            border-radius: 0.5rem;
            padding: 2rem;
        }

        .opord-header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        .opord-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.75rem;
        }

        .opord-meta {
            display: flex;
            gap: 1.5rem;
            align-items: center;
        }

        .classification-badge {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.1em;
        }

        .opord-version {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .opord-section {
            margin-bottom: 2rem;
        }

        .opord-section-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--military-yellow);
            margin-bottom: 0.75rem;
            letter-spacing: 0.05em;
        }

        .opord-text {
            color: var(--text-secondary);
            line-height: 1.6;
            white-space: pre-wrap;
        }

        .attachments-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .attachment-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.375rem;
            color: var(--text-primary);
            text-decoration: none;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }

        .attachment-link:hover {
            background: var(--accent-bg);
            border-color: var(--military-yellow);
        }

        /* Attendance Tab */
        .attendance-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: var(--accent-bg);
            border-radius: 0.5rem;
        }

        .summary-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-count {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .summary-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-weight: 500;
        }

        .attendance-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .attendance-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem;
            background: var(--accent-bg);
            border-radius: 0.375rem;
            transition: background 0.2s ease;
        }

        .attendance-item:hover {
            background: var(--border-color);
        }

        .attendance-user {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .user-avatar-small {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            object-fit: cover;
        }

        .avatar-placeholder {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
        }

        .user-username {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
        }

        .attendance-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        /* RSVP Panel */
        .rsvp-panel,
        .info-panel {
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            padding: 1.5rem;
        }

        .panel-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .current-response {
            background: var(--accent-bg);
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1.5rem;
        }

        .response-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .response-time {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .no-response {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }

        .rsvp-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .rsvp-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .rsvp-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .rsvp-button.attending {
            background: var(--success-color);
            color: black;
        }

        .rsvp-button.attending:hover:not(:disabled) {
            background: #22c55e;
        }

        .rsvp-button.maybe {
            background: var(--warning-color);
            color: black;
        }

        .rsvp-button.maybe:hover:not(:disabled) {
            background: #d97706;
        }

        .rsvp-button.declined {
            background: var(--error-color);
            color: white;
        }

        .rsvp-button.declined:hover:not(:disabled) {
            background: #dc2626;
        }

        .rsvp-button.excused {
            background: var(--info-color);
            color: white;
        }

        .rsvp-button.excused:hover:not(:disabled) {
            background: #2563eb;
        }

        /* Quick Info Panel */
        .quick-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .quick-info-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .content-grid {
                grid-template-columns: 1fr;
            }

            .detail-header {
                height: 16rem;
            }

            .operation-title-large {
                font-size: 2rem;
            }

            .header-meta {
                flex-direction: column;
                gap: 0.5rem;
            }

            .tab-navigation {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            .tab-button {
                white-space: nowrap;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .attendance-summary {
                grid-template-columns: 1fr;
            }

            .sidebar-column {
                order: -1;
            }

            .operations-page {
                min-height: 100vh;
                background-color: var(--primary-bg);
                color: var(--text-primary);
            }

            .operations-header {
                background-color: var(--secondary-bg);
                border-bottom: 1px solid var(--border-color);
                padding: 2rem 0;
            }

            .operations-header-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .operations-title {
                font-size: 2rem;
                font-weight: 700;
                color: var(--military-yellow);
                margin-bottom: 0.5rem;
            }

            .operations-subtitle {
                color: var(--text-secondary);
                font-size: 1rem;
            }

            .header-actions-group {
                display: flex;
                gap: 0.5rem;
            }

            .view-toggle-button {
                background: var(--accent-bg);
                border: 1px solid var(--border-color);
                color: var(--text-secondary);
                padding: 0.5rem;
                border-radius: 0.375rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .view-toggle-button:hover {
                background: var(--military-yellow);
                color: black;
            }

            .view-toggle-button.active {
                background: var(--military-yellow);
                color: black;
            }

            .operations-controls {
                max-width: 1200px;
                margin: 2rem auto 0;
                padding: 0 1rem;
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .search-container {
                flex: 1;
                position: relative;
            }

            .search-icon {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-muted);
            }

            .search-input {
                width: 100%;
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 0.75rem 1rem 0.75rem 3rem;
                color: var(--text-primary);
                font-size: 0.875rem;
            }

            .search-input:focus {
                outline: none;
                border-color: var(--military-yellow);
            }

            .filter-toggle-button {
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
            }

            .filter-toggle-button:hover {
                background: var(--accent-bg);
            }

            .filter-count {
                color: var(--military-yellow);
                font-size: 1.25rem;
                line-height: 0;
            }

            .filters-panel {
                max-width: 1200px;
                margin: 1rem auto 0;
                padding: 0 1rem;
            }

            .filters-grid {
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .filter-label {
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--text-muted);
                letter-spacing: 0.05em;
            }

            .filter-select {
                background: var(--accent-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.375rem;
                padding: 0.5rem;
                color: var(--text-primary);
                font-size: 0.875rem;
                cursor: pointer;
            }

            .operations-content {
                max-width: 1200px;
                margin: 2rem auto;
                padding: 0 1rem;
            }

            .operations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 1.5rem;
            }

            .operation-card {
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                overflow: hidden;
                transition: transform 0.2s ease;
            }

            .operation-card:hover {
                transform: translateY(-2px);
            }

            .operation-image-container {
                position: relative;
                height: 10rem;
            }

            .operation-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .operation-image-gradient {
                position: absolute;
                inset: 0;
                background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
            }

            .operation-type-badge {
                position: absolute;
                top: 0.75rem;
                left: 0.75rem;
                padding: 0.25rem 0.75rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: 600;
                color: white;
                letter-spacing: 0.05em;
            }

            .mandatory-badge {
                position: absolute;
                top: 0.75rem;
                right: 0.75rem;
                background: var(--warning-color);
                color: black;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.625rem;
                font-weight: 700;
                letter-spacing: 0.1em;
            }

            .operation-card-content {
                padding: 1.5rem;
            }

            .operation-card-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 1rem;
            }

            .operation-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.375rem;
                color: var(--text-secondary);
                font-size: 0.875rem;
            }

            .operation-description {
                color: var(--text-secondary);
                font-size: 0.875rem;
                line-height: 1.5;
                margin-bottom: 1rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .operation-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }

            .attendees-info {
                display: flex;
                align-items: center;
                gap: 0.375rem;
                color: var(--text-muted);
                font-size: 0.875rem;
            }

            .status-badge {
                font-size: 0.75rem;
                font-weight: 600;
                letter-spacing: 0.05em;
            }

            .operation-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            .details-link {
                color: var(--military-yellow);
                text-decoration: none;
                font-size: 0.875rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                transition: color 0.2s ease;
            }

            .details-link:hover {
                color: #e6c200;
            }

            .rsvp-button-small {
                background: var(--military-yellow);
                color: black;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                font-size: 0.75rem;
                font-weight: 600;
                letter-spacing: 0.05em;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .rsvp-button-small:hover {
                background: #e6c200;
                transform: translateY(-1px);
            }

            .operations-list {
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                overflow: hidden;
            }

            .operations-table {
                width: 100%;
                border-collapse: collapse;
            }

            .operations-table th {
                text-align: left;
                padding: 1rem;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text-muted);
                border-bottom: 1px solid var(--border-color);
                letter-spacing: 0.05em;
            }

            .operations-table td {
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
            }

            .operation-row:hover {
                background-color: var(--accent-bg);
            }

            .operation-name-cell {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .operation-name {
                font-weight: 500;
                color: var(--text-primary);
            }

            .mandatory-indicator {
                color: var(--warning-color);
                font-weight: 700;
            }

            .type-badge-inline {
                font-size: 0.875rem;
                font-weight: 500;
            }

            .datetime-cell {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .time-text {
                font-size: 0.75rem;
                color: var(--text-muted);
            }

            .status-text {
                font-size: 0.875rem;
                font-weight: 500;
            }

            .table-actions {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .table-link {
                color: var(--military-yellow);
                text-decoration: none;
                font-size: 0.875rem;
                font-weight: 500;
                transition: color 0.2s ease;
            }

            .table-link:hover {
                color: #e6c200;
            }

            .table-button {
                background: transparent;
                color: var(--military-yellow);
                border: 1px solid var(--military-yellow);
                padding: 0.25rem 0.75rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: 600;
                letter-spacing: 0.05em;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .table-button:hover {
                background: var(--military-yellow);
                color: black;
            }

            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                color: var(--text-muted);
                text-align: center;
                gap: 1rem;
            }

            .empty-state h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-secondary);
            }

            @media (max-width: 768px) {
                .operations-header-content {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .operations-controls {
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .search-container {
                    width: 100%;
                }

                .filters-grid {
                    grid-template-columns: 1fr;
                }

                .operations-grid {
                    grid-template-columns: 1fr;
                }

                .operations-table {
                    font-size: 0.75rem;
                }

                .operations-table th,
                .operations-table td {
                    padding: 0.5rem;
                }

                .operation-meta {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }

        }
        /* Add all other CSS styles from the previous components */
        /* This is a condensed version - you should include all styles */
      `}</style>
        </div>
    );
};

export default OperationsManager;
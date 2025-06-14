import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Search, ChevronRight, AlertCircle, Grid, List } from 'lucide-react';

const OperationsViewer = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('upcoming');
    const [sortBy, setSortBy] = useState('start_time');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [eventTypeFilter, statusFilter, dateFilter, sortBy]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            let url = '/api/events/';
            const params = new URLSearchParams();

            if (eventTypeFilter !== 'all') params.append('event_type', eventTypeFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (dateFilter === 'upcoming') {
                url = '/api/events/upcoming/';
            }

            const queryString = params.toString();
            if (queryString) url += '?' + queryString;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();
            setEvents(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (eventId, status) => {
        try {
            const response = await fetch(`/api/events/${eventId}/attend/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update RSVP');

            // Refresh events after RSVP
            fetchEvents();
        } catch (err) {
            console.error('RSVP error:', err);
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
        <div className="operations-page">
            {/* Header Section */}
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

            {/* Search and Filter Bar */}
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

            {/* Expanded Filters */}
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

            {/* Events Display */}
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
                                        <a href={`/operations/${event.id}`} className="details-link">
                                            View Details
                                            <ChevronRight size={16} />
                                        </a>
                                        {event.status === 'Scheduled' && (
                                            <button
                                                className="rsvp-button-small"
                                                onClick={() => handleRSVP(event.id, 'Attending')}
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
                                            <a href={`/operations/${event.id}`} className="table-link">
                                                Details
                                            </a>
                                            {event.status === 'Scheduled' && (
                                                <button
                                                    className="table-button"
                                                    onClick={() => handleRSVP(event.id, 'Attending')}
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

            <style jsx>{`
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
      `}</style>
        </div>
    );
};

export default OperationsViewer;
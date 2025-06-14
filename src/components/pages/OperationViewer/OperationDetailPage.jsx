import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, MapPin, Users, FileText, Shield,
    ChevronLeft, AlertCircle, CheckCircle, XCircle,
    AlertTriangle, User, Download, Printer, Share2
} from 'lucide-react';

const OperationDetail = ({ operationId = 1 }) => {
    const [event, setEvent] = useState(null);
    const [opord, setOpord] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [myAttendance, setMyAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [rsvpLoading, setRsvpLoading] = useState(false);

    // Mock current user - replace with actual auth context
    const currentUser = { id: 1, username: 'current_user' };

    useEffect(() => {
        fetchEventDetails();
    }, [operationId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);

            // Fetch event details
            const eventResponse = await fetch(`/api/events/${operationId}/`);
            if (!eventResponse.ok) throw new Error('Failed to fetch event details');
            const eventData = await eventResponse.json();
            setEvent(eventData);

            // Fetch OPORD if linked
            if (eventData.operation_order) {
                const opordResponse = await fetch(`/api/opords/${eventData.operation_order}/`);
                if (opordResponse.ok) {
                    const opordData = await opordResponse.json();
                    setOpord(opordData);
                }
            }

            // Fetch attendance
            const attendanceResponse = await fetch(`/api/events/${operationId}/attendance/`);
            if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                setAttendance(attendanceData);

                // Find current user's attendance
                const userAttendance = attendanceData.find(a => a.user === currentUser.id);
                setMyAttendance(userAttendance);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (status) => {
        try {
            setRsvpLoading(true);
            const response = await fetch(`/api/events/${operationId}/attend/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update RSVP');

            // Refresh event details
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading operation details...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="error-banner">
                <AlertCircle size={20} />
                <span>Error loading operation: {error || 'Not found'}</span>
            </div>
        );
    }

    const attendingCount = attendance.filter(a => a.status === 'Attending').length;
    const maybeCount = attendance.filter(a => a.status === 'Maybe').length;
    const declinedCount = attendance.filter(a => a.status === 'Declined').length;

    return (
        <div className="operation-detail-page">
            {/* Header with background image */}
            <div className="detail-header" style={{ backgroundImage: event.image_url ? `url(${event.image_url})` : 'none' }}>
                <div className="header-overlay"></div>
                <div className="header-content-wrapper">
                    <div className="header-navigation">
                        <a href="/operations" className="back-link">
                            <ChevronLeft size={20} />
                            <span>Back to Operations</span>
                        </a>
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

            {/* Main content */}
            <div className="detail-content">
                <div className="content-grid">
                    {/* Left column - Main details */}
                    <div className="main-column">
                        {/* Tab navigation */}
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

                        {/* Tab content */}
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

                                    {opord.attachments && opord.attachments.length > 0 && (
                                        <section className="opord-section">
                                            <h3 className="opord-section-title">ATTACHMENTS</h3>
                                            <div className="attachments-list">
                                                {opord.attachments.map((attachment, index) => (
                                                    <a key={index} href={attachment.url} className="attachment-link" download>
                                                        <Download size={16} />
                                                        {attachment.name}
                                                    </a>
                                                ))}
                                            </div>
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

                    {/* Right column - RSVP and info */}
                    <div className="sidebar-column">
                        {/* RSVP Panel */}
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

                        {/* Quick Info Panel */}
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

            <style jsx>{`
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
        }
      `}</style>
        </div>
    );
};

export default OperationDetail;
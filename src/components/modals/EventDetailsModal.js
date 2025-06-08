import React from 'react';
import {
    X, Calendar, MapPin, Clock, Users, Flag, Building,
    FileText, ExternalLink, Edit, User, CheckCircle,
    XCircle, AlertCircle, Shield
} from 'lucide-react';
import './AdminModals.css';

const EventDetailsModal = ({ event, onClose, onEdit, onManageAttendance }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return 'scheduled';
            case 'In Progress': return 'in-progress';
            case 'Completed': return 'completed';
            case 'Cancelled': return 'cancelled';
            case 'Postponed': return 'postponed';
            default: return '';
        }
    };

    const getAttendanceStatusColor = (status) => {
        switch (status) {
            case 'Attending': return 'attending';
            case 'Declined': return 'declined';
            case 'Maybe': return 'maybe';
            case 'Excused': return 'excused';
            case 'No Response': return 'no-response';
            default: return '';
        }
    };

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventDuration = () => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.round((diffMs % 3600000) / 60000);

        if (diffHrs > 0 && diffMins > 0) {
            return `${diffHrs}h ${diffMins}m`;
        } else if (diffHrs > 0) {
            return `${diffHrs} hour${diffHrs > 1 ? 's' : ''}`;
        } else {
            return `${diffMins} minutes`;
        }
    };

    // Group attendances by status
    const attendanceByStatus = event.attendances?.reduce((acc, attendance) => {
        const status = attendance.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(attendance);
        return acc;
    }, {}) || {};

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Calendar size={20} />
                        Event Details
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-form">
                    {/* Event Header */}
                    <div className="event-details-header">
                        {event.image_url && (
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="event-banner-image"
                            />
                        )}
                        <div className="event-header-content">
                            <h3>{event.title}</h3>
                            <div className="event-meta">
                                <span className={`status-badge ${getStatusColor(event.status)}`}>
                                    {event.status}
                                </span>
                                <span className="event-type-badge">{event.event_type}</span>
                                {event.is_mandatory && (
                                    <span className="mandatory-badge">
                                        <Flag size={14} />
                                        MANDATORY
                                    </span>
                                )}
                                {!event.is_public && (
                                    <span className="private-badge">
                                        <Shield size={14} />
                                        PRIVATE
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Event Information */}
                    <div className="detail-sections">
                        <div className="detail-section">
                            <h4>Event Information</h4>

                            <div className="detail-row">
                                <span className="label">
                                    <Clock size={16} />
                                    Date & Time:
                                </span>
                                <span className="value">
                                    <div>{formatDateTime(event.start_time)}</div>
                                    <div className="sub-value">to {formatDateTime(event.end_time)}</div>
                                    <div className="sub-value">Duration: {getEventDuration()}</div>
                                </span>
                            </div>

                            {(event.location || event.coordinates) && (
                                <div className="detail-row">
                                    <span className="label">
                                        <MapPin size={16} />
                                        Location:
                                    </span>
                                    <span className="value">
                                        {event.location && <div>{event.location}</div>}
                                        {event.coordinates && (
                                            <div className="sub-value">Coordinates: {event.coordinates}</div>
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className="detail-row">
                                <span className="label">
                                    <Building size={16} />
                                    Host Unit:
                                </span>
                                <span className="value">{event.host_unit_name}</span>
                            </div>

                            <div className="detail-row">
                                <span className="label">
                                    <User size={16} />
                                    Created By:
                                </span>
                                <span className="value">
                                    <div className="user-info">
                                        {event.creator_avatar && (
                                            <img
                                                src={event.creator_avatar}
                                                alt={event.creator_username}
                                                className="user-avatar-small"
                                            />
                                        )}
                                        <span>{event.creator_username}</span>
                                    </div>
                                </span>
                            </div>

                            {event.max_participants && (
                                <div className="detail-row">
                                    <span className="label">
                                        <Users size={16} />
                                        Capacity:
                                    </span>
                                    <span className="value">
                                        {event.attending_count || 0} / {event.max_participants} participants
                                    </span>
                                </div>
                            )}
                        </div>

                        {event.description && (
                            <div className="detail-section">
                                <h4>Description</h4>
                                <p className="description-text">{event.description}</p>
                            </div>
                        )}

                        {/* Links and Resources */}
                        <div className="detail-section">
                            <h4>Resources</h4>

                            {event.briefing_url ? (
                                <div className="detail-row">
                                    <span className="label">Briefing:</span>
                                    <a
                                        href={event.briefing_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="external-link"
                                    >
                                        <ExternalLink size={16} />
                                        View Briefing Document
                                    </a>
                                </div>
                            ) : (
                                <p className="no-data">No briefing document attached</p>
                            )}

                            {event.operation_order_name ? (
                                <div className="detail-row">
                                    <span className="label">OPORD:</span>
                                    <span className="value">
                                        <FileText size={16} />
                                        {event.operation_order_name}
                                    </span>
                                </div>
                            ) : (
                                <div className="detail-row">
                                    <span className="label">OPORD:</span>
                                    <span className="no-data">No OPORD linked</span>
                                </div>
                            )}
                        </div>

                        {/* Attendance Summary */}
                        <div className="detail-section">
                            <h4>Attendance Summary</h4>
                            <div className="attendance-summary">
                                <div className="attendance-stat attending">
                                    <CheckCircle size={20} />
                                    <div>
                                        <div className="stat-value">{attendanceByStatus['Attending']?.length || 0}</div>
                                        <div className="stat-label">Attending</div>
                                    </div>
                                </div>
                                <div className="attendance-stat declined">
                                    <XCircle size={20} />
                                    <div>
                                        <div className="stat-value">{attendanceByStatus['Declined']?.length || 0}</div>
                                        <div className="stat-label">Declined</div>
                                    </div>
                                </div>
                                <div className="attendance-stat maybe">
                                    <AlertCircle size={20} />
                                    <div>
                                        <div className="stat-value">{attendanceByStatus['Maybe']?.length || 0}</div>
                                        <div className="stat-label">Maybe</div>
                                    </div>
                                </div>
                                <div className="attendance-stat no-response">
                                    <Users size={20} />
                                    <div>
                                        <div className="stat-value">{attendanceByStatus['No Response']?.length || 0}</div>
                                        <div className="stat-label">No Response</div>
                                    </div>
                                </div>
                            </div>

                            {event.attendances && event.attendances.length > 0 && (
                                <div className="recent-attendances">
                                    <h5>Recent Responses</h5>
                                    {event.attendances.slice(0, 5).map(attendance => (
                                        <div key={attendance.id} className="attendance-item">
                                            <img
                                                src={attendance.user_avatar || '/default-avatar.png'}
                                                alt={attendance.user_username}
                                                className="user-avatar-small"
                                            />
                                            <span className="user-name">{attendance.user_username}</span>
                                            <span className={`attendance-status ${getAttendanceStatusColor(attendance.status)}`}>
                                                {attendance.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="section-action-btn"
                                onClick={onManageAttendance}
                            >
                                <Users size={16} />
                                Manage All Attendance
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="submit-button"
                            onClick={onEdit}
                        >
                            <Edit size={16} />
                            Edit Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
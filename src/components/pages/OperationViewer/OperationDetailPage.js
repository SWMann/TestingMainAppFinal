import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Calendar, MapPin, Users, Clock, ChevronLeft, User,
    AlertCircle, Target, Shield, School, Trophy, Coffee,
    Users2, CheckCircle, XCircle, AlertTriangle, FileText,
    Link, RefreshCw, Send, Star
} from 'lucide-react';
import './OperationDetailPage.css';
import api from '../../../services/api';

const OperationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    // State management
    const [operation, setOperation] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [userAttendance, setUserAttendance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    // Event type icons
    const eventTypeIcons = {
        'Operation': Target,
        'Training': School,
        'Ceremony': Trophy,
        'Meeting': Users2,
        'Social': Coffee,
        'Other': Calendar
    };

    // Attendance status icons and colors
    const attendanceStatusConfig = {
        'Attending': { icon: CheckCircle, color: '#4ade80' },
        'Declined': { icon: XCircle, color: '#ef4444' },
        'Maybe': { icon: AlertTriangle, color: '#fbbf24' },
        'Excused': { icon: AlertCircle, color: '#3b82f6' },
        'No Response': { icon: User, color: '#666666' }
    };

    // Fetch operation details
    useEffect(() => {
        fetchOperationDetails();
    }, [id]);

    const fetchOperationDetails = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch operation details
            const opResponse = await api.get(`/events/${id}/`);
            setOperation(opResponse.data);

            // Fetch attendance list
            const attendanceResponse = await api.get(`/events/${id}/attendance/`);
            setAttendance(attendanceResponse.data);

            // Find current user's attendance
            const myAttendance = attendanceResponse.data.find(
                att => att.user === currentUser?.id
            );
            setUserAttendance(myAttendance);
            if (myAttendance?.feedback) {
                setFeedbackText(myAttendance.feedback);
            }
        } catch (err) {
            console.error('Error fetching operation details:', err);
            setError('Failed to load operation details');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle RSVP
    const handleRSVP = async (status) => {
        setIsSubmitting(true);

        try {
            const response = await api.post(`/events/${id}/attend/`, {
                status: status,
                feedback: feedbackText
            });

            // Update user attendance
            setUserAttendance({
                ...userAttendance,
                status: response.data.status,
                feedback: feedbackText,
                response_time: response.data.response_time
            });

            // Refresh attendance list
            await fetchOperationDetails();

            // Hide feedback form after successful submission
            setShowFeedback(false);
        } catch (err) {
            console.error('Error updating RSVP:', err);
            alert('Failed to update RSVP status');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate duration
    const calculateDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = endDate - startDate;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Check if event is in the past
    const isPastEvent = () => {
        return new Date(operation?.start_time) < new Date();
    };

    // Group attendance by status
    const groupAttendanceByStatus = () => {
        const grouped = {
            'Attending': [],
            'Declined': [],
            'Maybe': [],
            'Excused': [],
            'No Response': []
        };

        attendance.forEach(att => {
            if (grouped[att.status]) {
                grouped[att.status].push(att);
            }
        });

        return grouped;
    };

    if (isLoading) {
        return (
            <div className="operation-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading operation details...</p>
            </div>
        );
    }

    if (error || !operation) {
        return (
            <div className="operation-detail-error">
                <AlertCircle size={48} />
                <h2>Error Loading Operation</h2>
                <p>{error || 'Operation not found'}</p>
                <button onClick={() => navigate('/operations')}>Back to Operations</button>
            </div>
        );
    }

    const IconComponent = eventTypeIcons[operation.event_type] || Calendar;
    const groupedAttendance = groupAttendanceByStatus();

    return (
        <div className="operation-detail-container">
            {/* Header */}
            <div className="operation-detail-header">
                <div className="header-background">
                    <img
                        src={operation.image_url || 'https://images.unsplash.com/photo-1569163139394-de4798d0c2c6?w=1920&h=400&fit=crop'}
                        alt={operation.title}
                    />
                    <div className="header-overlay"></div>
                </div>

                <div className="header-content">
                    <button className="back-button" onClick={() => navigate('/operations')}>
                        <ChevronLeft size={20} />
                        Back to Operations
                    </button>

                    <div className="operation-title-section">
                        <div className="operation-icon-large">
                            <IconComponent size={48} />
                        </div>
                        <div>
                            <h1>{operation.title}</h1>
                            <div className="operation-meta">
                                <span className={`type-badge ${operation.event_type.toLowerCase()}`}>
                                    {operation.event_type}
                                </span>
                                {operation.is_mandatory && (
                                    <span className="mandatory-badge">MANDATORY</span>
                                )}
                                <span className={`status-badge ${operation.status.toLowerCase().replace(' ', '-')}`}>
                                    {operation.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="operation-detail-content">
                <div className="content-grid">
                    {/* Left Column - Main Info */}
                    <div className="main-column">
                        {/* Key Details Card */}
                        <div className="detail-card">
                            <h2>Operation Details</h2>
                            <div className="details-grid">
                                <div className="detail-row">
                                    <div className="detail-label">
                                        <Calendar size={18} />
                                        <span>Start Time</span>
                                    </div>
                                    <div className="detail-value">
                                        {formatDateTime(operation.start_time)}
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-label">
                                        <Clock size={18} />
                                        <span>Duration</span>
                                    </div>
                                    <div className="detail-value">
                                        {calculateDuration(operation.start_time, operation.end_time)}
                                    </div>
                                </div>

                                {operation.location && (
                                    <div className="detail-row">
                                        <div className="detail-label">
                                            <MapPin size={18} />
                                            <span>Location</span>
                                        </div>
                                        <div className="detail-value">
                                            {operation.location}
                                            {operation.coordinates && (
                                                <span className="coordinates"> ({operation.coordinates})</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="detail-row">
                                    <div className="detail-label">
                                        <Shield size={18} />
                                        <span>Host Unit</span>
                                    </div>
                                    <div className="detail-value">
                                        {operation.host_unit_name}
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-label">
                                        <User size={18} />
                                        <span>Created By</span>
                                    </div>
                                    <div className="detail-value">
                                        {operation.creator_avatar && (
                                            <img
                                                src={operation.creator_avatar}
                                                alt={operation.creator_username}
                                                className="creator-avatar"
                                            />
                                        )}
                                        {operation.creator_username}
                                    </div>
                                </div>

                                {operation.max_participants && (
                                    <div className="detail-row">
                                        <div className="detail-label">
                                            <Users size={18} />
                                            <span>Capacity</span>
                                        </div>
                                        <div className="detail-value">
                                            {operation.attending_count} / {operation.max_participants}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Card */}
                        {operation.description && (
                            <div className="detail-card">
                                <h2>Description</h2>
                                <p className="operation-description">{operation.description}</p>
                            </div>
                        )}

                        {/* Additional Resources */}
                        {(operation.briefing_url || operation.operation_order_name) && (
                            <div className="detail-card">
                                <h2>Resources</h2>
                                <div className="resources-list">
                                    {operation.operation_order_name && (
                                        <div className="resource-item">
                                            <FileText size={18} />
                                            <span>Operation Order: {operation.operation_order_name}</span>
                                        </div>
                                    )}
                                    {operation.briefing_url && (
                                        <a
                                            href={operation.briefing_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-item"
                                        >
                                            <Link size={18} />
                                            <span>View Briefing</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - RSVP and Attendance */}
                    <div className="sidebar-column">
                        {/* RSVP Card */}
                        {!isPastEvent() && (
                            <div className="detail-card rsvp-card">
                                <h2>Your RSVP</h2>
                                {userAttendance ? (
                                    <div className="current-rsvp">
                                        <div className="rsvp-status">
                                            <span>Current Status:</span>
                                            <span className={`attendance-status ${userAttendance.status.toLowerCase()}`}>
                                                {userAttendance.status}
                                            </span>
                                        </div>
                                        <p className="rsvp-time">
                                            Responded {new Date(userAttendance.response_time).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="no-rsvp">You haven't responded yet</p>
                                )}

                                <div className="rsvp-buttons">
                                    <button
                                        className="rsvp-button attending"
                                        onClick={() => handleRSVP('Attending')}
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle size={18} />
                                        Attending
                                    </button>
                                    <button
                                        className="rsvp-button maybe"
                                        onClick={() => setShowFeedback(true)}
                                        disabled={isSubmitting}
                                    >
                                        <AlertTriangle size={18} />
                                        Maybe
                                    </button>
                                    <button
                                        className="rsvp-button declined"
                                        onClick={() => setShowFeedback(true)}
                                        disabled={isSubmitting}
                                    >
                                        <XCircle size={18} />
                                        Can't Attend
                                    </button>
                                </div>

                                {showFeedback && (
                                    <div className="feedback-form">
                                        <textarea
                                            placeholder="Add a note (optional)..."
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="feedback-actions">
                                            <button
                                                className="cancel-button"
                                                onClick={() => setShowFeedback(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="submit-button"
                                                onClick={() => handleRSVP(userAttendance?.status || 'Maybe')}
                                                disabled={isSubmitting}
                                            >
                                                <Send size={16} />
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attendance Summary Card */}
                        <div className="detail-card">
                            <h2>Attendance ({attendance.length})</h2>
                            <div className="attendance-summary">
                                {Object.entries(groupedAttendance).map(([status, users]) => {
                                    const config = attendanceStatusConfig[status];
                                    const IconComp = config.icon;

                                    return (
                                        <div key={status} className="attendance-group">
                                            <div className="attendance-group-header">
                                                <IconComp size={18} style={{ color: config.color }} />
                                                <span>{status}</span>
                                                <span className="count">({users.length})</span>
                                            </div>
                                            {users.length > 0 && (
                                                <div className="attendance-users">
                                                    {users.slice(0, 5).map(att => (
                                                        <div key={att.id} className="attendance-user">
                                                            <img
                                                                src={att.user_avatar || '/api/placeholder/32/32'}
                                                                alt={att.user_username}
                                                                className="user-avatar-small"
                                                            />
                                                            <span>{att.user_username}</span>
                                                            {att.performance_rating && (
                                                                <div className="performance-stars">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            size={12}
                                                                            className={i < att.performance_rating ? 'filled' : ''}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {users.length > 5 && (
                                                        <p className="more-users">
                                                            +{users.length - 5} more
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationDetailPage;
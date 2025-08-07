// src/components/pages/RecruiterDashboard/RecruiterDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Users, UserCheck, UserX, Clock, Calendar, MessageCircle,
    Search, Filter, FileText, Star, Shield, CheckCircle,
    XCircle, AlertCircle, Activity, TrendingUp, Award,
    MessageSquare, UserPlus, Navigation, Globe, Send,
    Mail, BellRing, ClipboardCheck, Bot, Heart,
    Eye, Save, Hash, MapPin, Briefcase
} from 'lucide-react';
import './RecruiterDashboard.css';
import api from '../../../services/api';
import ApplicationReviewModal from '../../modals/ApplicationReviewModal';
import InterviewScheduleModal from '../../modals/InterviewScheduleModal';
import MentorAssignmentModal from '../../modals/MentorAssignmentModal';
import OnboardingGuideModal from '../../modals/OnboardingGuideModal';
import BulkActionsModal from '../../modals/BulkActionsModal';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    // State management
    const [applications, setApplications] = useState([]);
    const [statistics, setStatistics] = useState({
        draft: 0,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        onboarding: 0,
        completed: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterProgress, setFilterProgress] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');

    // Selected items for bulk actions
    const [selectedApplications, setSelectedApplications] = useState([]);

    // Modals
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showMentorModal, setShowMentorModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Discord message handling
    const [showDiscordPreview, setShowDiscordPreview] = useState(false);
    const [discordMessage, setDiscordMessage] = useState('');
    const [discordRecipient, setDiscordRecipient] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = {
                ordering: `-${sortBy}`,
            };

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            if (filterBranch !== 'all') {
                params.branch = filterBranch;
            }

            // Fetch applications
            const response = await api.get('/onboarding/applications/', { params });
            const fetchedApplications = response.data.results || response.data;
            setApplications(fetchedApplications);

            // Calculate statistics
            calculateStatistics(fetchedApplications);

        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load recruitment data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterBranch, sortBy]);

    // Calculate statistics from applications
    const calculateStatistics = (apps) => {
        const stats = {
            draft: apps.filter(app => app.status === 'draft').length,
            submitted: apps.filter(app => app.status === 'submitted').length,
            under_review: apps.filter(app => app.status === 'under_review').length,
            approved: apps.filter(app => app.status === 'approved').length,
            rejected: apps.filter(app => app.status === 'rejected').length,
            onboarding: apps.filter(app =>
                app.status === 'approved' && app.progress?.completion_percentage < 100
            ).length,
            completed: apps.filter(app =>
                app.status === 'approved' && app.progress?.completion_percentage === 100
            ).length
        };
        setStatistics(stats);
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Discord message templates
    const DISCORD_MESSAGES = {
        applicationReceived: (app) =>
            `Greetings ${app.discord_username},\n\n` +
            `This is an automated confirmation that your application to join the 5th Expeditionary Group has been received and logged in our recruitment system.\n\n` +
            `Application Reference: ${app.application_number}\n` +
            `Status: Under Review\n\n` +
            `A recruitment officer will review your application within 24-48 hours. You will receive further communication regarding the next steps in the recruitment process.\n\n` +
            `If you have any questions, please contact a recruitment officer in the Discord server.\n\n` +
            `Welcome aboard, recruit.\n\n` +
            `5th Expeditionary Group\n` +
            `Recruitment Division`,

        interviewScheduled: (app) =>
            `Recruit ${app.discord_username},\n\n` +
            `Your recruitment interview has been scheduled.\n\n` +
            `Date/Time: ${app.interview_date ? new Date(app.interview_date).toLocaleString() : 'TBD'}\n` +
            `Location: Discord Voice Channel - Recruitment Interview Room\n` +
            `Duration: Approximately 30 minutes\n\n` +
            `Please ensure you are available at the scheduled time with a working microphone. The interview will cover your application, experience, and expectations for service within the 5th EXG.\n\n` +
            `If you cannot attend at the scheduled time, please notify a recruitment officer immediately.\n\n` +
            `5th Expeditionary Group\n` +
            `Recruitment Division`,

        applicationApproved: (app) =>
            `Congratulations ${app.discord_username}!\n\n` +
            `Your application to the 5th Expeditionary Group has been APPROVED.\n\n` +
            `You are now officially a recruit of the 5th EXG. Your next steps:\n\n` +
            `1. Access your recruit profile on our website\n` +
            `2. Complete Basic Introduction Training (BIT)\n` +
            `3. Receive your branch assignment\n` +
            `4. Complete Advanced Individual Training (AIT)\n` +
            `5. Receive your unit assignment\n\n` +
            `Your onboarding officer will contact you shortly with specific instructions.\n\n` +
            `Welcome to the 5th Expeditionary Group. We look forward to your service.\n\n` +
            `"Beyond the Stars"\n\n` +
            `5th Expeditionary Group\n` +
            `Personnel Command`,

        applicationRejected: (app) =>
            `${app.discord_username},\n\n` +
            `After careful review, we regret to inform you that your application to the 5th Expeditionary Group has not been approved at this time.\n\n` +
            `This decision may be due to various factors including current recruitment capacity, qualification requirements, or operational needs.\n\n` +
            `You may reapply after 30 days if you wish to be reconsidered. We encourage you to gain additional experience and familiarize yourself with our unit structure and requirements before reapplying.\n\n` +
            `Thank you for your interest in the 5th Expeditionary Group.\n\n` +
            `5th Expeditionary Group\n` +
            `Recruitment Division`
    };

    // Send Discord DM
    const sendDiscordMessage = async (application, messageType) => {
        const message = DISCORD_MESSAGES[messageType](application);
        setDiscordMessage(message);
        setDiscordRecipient(application);
        setShowDiscordPreview(true);
    };

    const copyDiscordMessage = () => {
        navigator.clipboard.writeText(discordMessage);
        alert('Message copied to clipboard!');
    };

    // Handle application actions
    const handleApplicationAction = async (applicationId, action, data = {}) => {
        try {
            let endpoint = '';
            let method = 'POST';
            let payload = {};

            switch (action) {
                case 'review':
                    navigate(`/recruitment/application/${applicationId}`);
                    return;

                case 'approve':
                    endpoint = `/onboarding/applications/${applicationId}/approve/`;
                    payload = { notes: data.notes };
                    break;

                case 'reject':
                    endpoint = `/onboarding/applications/${applicationId}/reject/`;
                    payload = { notes: data.notes };
                    break;

                case 'schedule_interview':
                    endpoint = `/onboarding/applications/${applicationId}/schedule-interview/`;
                    payload = {
                        scheduled_at: data.scheduled_at,
                        interviewer: data.interviewer,
                        interview_type: data.interview_type || 'initial',
                        notes: data.notes
                    };
                    break;

                case 'add_comment':
                    endpoint = `/onboarding/applications/${applicationId}/add-comment/`;
                    payload = {
                        comment: data.comment,
                        is_visible_to_applicant: data.is_visible || false
                    };
                    break;

                default:
                    console.error('Unknown action:', action);
                    return;
            }

            const response = await api.post(endpoint, payload);

            // Refresh data
            await fetchDashboardData();

            // Send Discord notification if appropriate
            const app = applications.find(a => a.id === applicationId);
            if (app) {
                if (action === 'approve') {
                    sendDiscordMessage(app, 'applicationApproved');
                } else if (action === 'reject') {
                    sendDiscordMessage(app, 'applicationRejected');
                } else if (action === 'schedule_interview') {
                    app.interview_date = data.scheduled_at;
                    sendDiscordMessage(app, 'interviewScheduled');
                }
            }

            // Close modals
            setShowReviewModal(false);
            setShowInterviewModal(false);

        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} application. Please try again.`);
        }
    };

    // Modal handlers
    const openApplicationReview = (application) => {
        setSelectedApplication(application);
        setShowReviewModal(true);
    };

    const openInterviewScheduler = (application) => {
        setSelectedApplication(application);
        setShowInterviewModal(true);
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            app.discord_username?.toLowerCase().includes(searchLower) ||
            app.first_name?.toLowerCase().includes(searchLower) ||
            app.last_name?.toLowerCase().includes(searchLower) ||
            app.email?.toLowerCase().includes(searchLower) ||
            app.application_number?.includes(searchTerm)
        );
    });

    // Utility functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return formatDate(dateString);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'draft': { label: 'DRAFT', class: 'status-draft' },
            'submitted': { label: 'SUBMITTED', class: 'status-pending' },
            'under_review': { label: 'UNDER REVIEW', class: 'status-interviewing' },
            'approved': { label: 'APPROVED', class: 'status-approved' },
            'rejected': { label: 'REJECTED', class: 'status-rejected' }
        };
        return statusMap[status] || { label: status.toUpperCase(), class: 'status-default' };
    };

    const getProgressIndicator = (progress) => {
        if (!progress) return null;
        const percentage = progress.completion_percentage || 0;

        return (
            <div className="progress-indicator">
                <div className="progress-bar-small">
                    <div
                        className="progress-fill-small"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="progress-text">{percentage}%</span>
            </div>
        );
    };

    // Render loading state
    if (isLoading && applications.length === 0) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>ACCESSING RECRUITMENT DATABASE...</p>
            </div>
        );
    }

    // Main render
    return (
        <div className="recruiter-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <Shield size={32} />
                        <h1>RECRUITMENT COMMAND</h1>
                    </div>
                    <div className="header-actions">
                        <button className="action-button primary">
                            <Navigation size={18} />
                            ONBOARDING PROTOCOLS
                        </button>
                        {selectedApplications.length > 0 && (
                            <button
                                className="action-button bulk"
                                onClick={() => setShowBulkModal(true)}
                            >
                                <Users size={18} />
                                BULK OPERATIONS ({selectedApplications.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.draft}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.submitted}</div>
                        <div className="stat-label">Awaiting Review</div>
                    </div>
                </div>

                <div className="stat-card interviewing">
                    <div className="stat-icon">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.under_review}</div>
                        <div className="stat-label">Under Review</div>
                    </div>
                </div>

                <div className="stat-card approved">
                    <div className="stat-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.approved}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                </div>

                <div className="stat-card active">
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.onboarding}</div>
                        <div className="stat-label">Onboarding</div>
                    </div>
                </div>

                <div className="stat-card completion">
                    <div className="stat-icon">
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="dashboard-controls">
                <div className="search-section">
                    <div className="search-input">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, Discord ID, email, or application number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-section">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Calendar size={18} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="created_at">Created Date</option>
                            <option value="submitted_at">Submission Date</option>
                            <option value="updated_at">Last Updated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="applications-section">
                <div className="section-header">
                    <h2>RECRUITMENT APPLICATIONS</h2>
                </div>

                <div className="applications-table">
                    {filteredApplications.length > 0 ? (
                        <table>
                            <thead>
                            <tr>
                                <th>APPLICATION</th>
                                <th>RECRUIT</th>
                                <th>STATUS</th>
                                <th>PROGRESS</th>
                                <th>UNIT PREFERENCE</th>
                                <th>SUBMITTED</th>
                                <th>ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredApplications.map(app => (
                                <tr key={app.id}>
                                    <td>
                                        <div className="app-number">
                                            <Hash size={14} />
                                            {app.application_number || 'DRAFT'}
                                        </div>
                                    </td>
                                    <td className="pilot-cell">
                                        <div className="pilot-info">
                                            <div className="pilot-details">
                                                <div className="pilot-name">
                                                    {app.first_name && app.last_name
                                                        ? `${app.first_name} ${app.last_name}`
                                                        : app.discord_username}
                                                </div>
                                                <div className="pilot-discord">
                                                    {app.email || 'No email'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                            <span className={`status-badge ${getStatusBadge(app.status).class}`}>
                                                {getStatusBadge(app.status).label}
                                            </span>
                                    </td>
                                    <td>
                                        {app.progress && getProgressIndicator(app.progress)}
                                    </td>
                                    <td>
                                        <div className="unit-preference">
                                            {app.branch_details?.name && (
                                                <div>{app.branch_details.name}</div>
                                            )}
                                            {app.primary_unit_details?.name && (
                                                <div className="unit-sub">
                                                    {app.primary_unit_details.name}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="date-cell">
                                        <div className="date-info">
                                            <div>{formatDate(app.submitted_at || app.created_at)}</div>
                                            <div className="time-ago">
                                                {getTimeAgo(app.submitted_at || app.created_at)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn review"
                                                onClick={() => openApplicationReview(app)}
                                                title="Review Application"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {app.status === 'submitted' && (
                                                <>
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleApplicationAction(app.id, 'approve', { notes: 'Quick approval' })}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn interview"
                                                        onClick={() => openInterviewScheduler(app)}
                                                        title="Schedule Interview"
                                                    >
                                                        <Calendar size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="action-btn discord"
                                                onClick={() => sendDiscordMessage(app, 'applicationReceived')}
                                                title="Send Discord Message"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-applications">
                            <Users size={48} />
                            <h3>No Applications Found</h3>
                            <p>Adjust your filters or wait for new applications</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Discord Message Preview */}
            {showDiscordPreview && (
                <div className="modal-overlay" onClick={() => setShowDiscordPreview(false)}>
                    <div className="modal-content discord-preview" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <MessageCircle size={20} />
                                DISCORD MESSAGE TEMPLATE
                            </h3>
                        </div>
                        <div className="discord-recipient">
                            To: {discordRecipient?.discord_username}
                        </div>
                        <div className="discord-message-box">
                            <pre>{discordMessage}</pre>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="action-button primary"
                                onClick={copyDiscordMessage}
                            >
                                <Bot size={18} />
                                COPY TO CLIPBOARD
                            </button>
                            <button
                                className="action-button"
                                onClick={() => setShowDiscordPreview(false)}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showReviewModal && selectedApplication && (
                <ApplicationReviewModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedApplication(null);
                    }}
                    onAction={handleApplicationAction}
                />
            )}

            {showInterviewModal && selectedApplication && (
                <InterviewScheduleModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowInterviewModal(false);
                        setSelectedApplication(null);
                    }}
                    onSchedule={(date, data) =>
                        handleApplicationAction(selectedApplication.id, 'schedule_interview', {
                            scheduled_at: date,
                            ...data
                        })
                    }
                />
            )}
        </div>
    );
};

export default RecruiterDashboard;
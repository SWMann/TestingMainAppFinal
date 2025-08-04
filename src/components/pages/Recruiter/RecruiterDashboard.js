// src/components/pages/RecruiterDashboard/RecruiterDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Users, UserCheck, UserX, Clock, Calendar, MessageCircle,
    Search, Filter, FileText, Star, Shield, CheckCircle,
    XCircle, AlertCircle, Activity, TrendingUp, Award,
    MessageSquare, UserPlus, Navigation, Globe, Send,
    Mail, BellRing, ClipboardCheck, Bot, Heart
} from 'lucide-react';
import './RecruiterDashboard.css';
import api from '../../../services/api';
import ApplicationReviewModal from '../../modals/ApplicationReviewModal';
import InterviewScheduleModal from '../../modals/InterviewScheduleModal';
import MentorAssignmentModal from '../../modals/MentorAssignmentModal';
import OnboardingGuideModal from '../../modals/OnboardingGuideModal';
import BulkActionsModal from '../../modals/BulkActionsModal';

// Discord DM template messages
const DISCORD_TEMPLATES = {
    applicationReceived: (username) =>
        `Hey ${username}! 👋 We've received your application to join our organization. A recruiter will review it shortly. If you have any questions, feel free to ask!`,

    interviewScheduled: (username, date) =>
        `Hi ${username}! Your interview has been scheduled for ${date}. Please make sure you're available on Discord at that time. Looking forward to speaking with you! 🎮`,

    applicationApproved: (username) =>
        `🎉 Congratulations ${username}! Your application has been APPROVED! Welcome to the team! Next steps:\n1. Attend Basic Introduction Training (BIT)\n2. Choose your branch\n3. Get your unit assignment\n\nI'll be here to guide you through the process!`,

    applicationRejected: (username) =>
        `Hi ${username}, thank you for your interest in joining us. Unfortunately, we're unable to approve your application at this time. You're welcome to reapply in 30 days. Best of luck in the verse! o7`,

    mentorAssigned: (recruitName, mentorName) =>
        `Hey ${recruitName}! You've been assigned ${mentorName} as your mentor. They'll help you get settled in and answer any questions. They should be reaching out soon!`,

    trainingReminder: (username, eventName, date) =>
        `Reminder ${username}: ${eventName} is scheduled for ${date}. Don't miss it! This is required for your progression. 📅`,

    checkIn: (username) =>
        `Hey ${username}! Just checking in on your onboarding progress. How's everything going? Need any help or have questions? 🤔`,

    documentRequest: (username, docType) =>
        `Hi ${username}! We need you to submit your ${docType}. Please upload it to the portal or send it here when you get a chance. Thanks!`,

    welcomeToBranch: (username, branch) =>
        `Welcome to ${branch}, ${username}! 🚀 You're now officially part of our ${branch} division. Your commanding officer will reach out with your first assignment soon.`,

    bitCompletion: (username) =>
        `Great job completing Basic Introduction Training, ${username}! ✅ You can now apply to your preferred branch. Check the portal for available positions!`
};

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    // State management
    const [applications, setApplications] = useState([]);
    const [statistics, setStatistics] = useState({
        pending: 0,
        interviewing: 0,
        approved: 0,
        rejected: 0,
        activeRecruits: 0,
        completionRate: 0,
        awaitingBIT: 0,
        awaitingBranch: 0,
        needsMentor: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterOnboardingStage, setFilterOnboardingStage] = useState('all');
    const [sortBy, setSortBy] = useState('submission_date');

    // Selected items for bulk actions
    const [selectedApplications, setSelectedApplications] = useState([]);

    // Modals
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showMentorModal, setShowMentorModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Available branches and units
    const [branches, setBranches] = useState([]);
    const [units, setUnits] = useState([]);

    // Discord message preview
    const [showDiscordPreview, setShowDiscordPreview] = useState(false);
    const [discordMessage, setDiscordMessage] = useState('');

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
                params.preferred_branch = filterBranch;
            }

            if (filterOnboardingStage !== 'all') {
                params.onboarding_status = filterOnboardingStage;
            }

            // Fetch applications
            const response = await api.get('/onboarding/applications/', { params });
            const fetchedApplications = response.data.results || response.data;
            setApplications(fetchedApplications);

            // Calculate enhanced statistics
            calculateStatistics(fetchedApplications);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load applications. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterBranch, filterOnboardingStage, sortBy]);

    // Calculate statistics from applications
    const calculateStatistics = (apps) => {
        const stats = {
            pending: apps.filter(app => app.status === 'Pending').length,
            interviewing: apps.filter(app => app.status === 'Interviewing').length,
            approved: apps.filter(app => app.status === 'Approved').length,
            rejected: apps.filter(app => app.status === 'Rejected').length,
            activeRecruits: apps.filter(app =>
                app.status === 'Approved' && !app.onboarding_complete
            ).length,
            awaitingBIT: apps.filter(app =>
                app.status === 'Approved' &&
                app.onboarding_status === 'Approved' &&
                !app.bit_completion_date
            ).length,
            awaitingBranch: apps.filter(app =>
                app.status === 'Approved' &&
                app.bit_completion_date &&
                !app.branch_id
            ).length,
            needsMentor: apps.filter(app =>
                app.status === 'Approved' &&
                !app.mentor_id &&
                app.onboarding_status !== 'Active'
            ).length,
            completionRate: 0
        };

        // Calculate completion rate
        const totalProcessed = stats.approved + stats.rejected;
        if (totalProcessed > 0) {
            stats.completionRate = Math.round((stats.approved / totalProcessed) * 100);
        }

        setStatistics(stats);
    };

    // Fetch filter options
    const fetchFilterOptions = useCallback(async () => {
        try {
            // Fetch branches
            const branchesResponse = await api.get('/units/branches/');
            setBranches(branchesResponse.data.results || branchesResponse.data);

            // Fetch units
            const unitsResponse = await api.get('/units/');
            setUnits(unitsResponse.data.results || unitsResponse.data);
        } catch (err) {
            console.error('Error fetching filter options:', err);
        }
    }, []);

    // Load data when component mounts or filters change
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Load filter options once on mount
    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    // Discord DM handler
    const sendDiscordDM = (discordId, message) => {
        // Copy message to clipboard
        navigator.clipboard.writeText(message);

        // Open Discord in browser/app (you could also use Discord's URL scheme)
        window.open(`https://discord.com/users/${discordId}`, '_blank');

        // Show notification
        alert('Message copied to clipboard! Discord opened in new tab.');
    };

    // Show Discord message preview
    const previewDiscordMessage = (template, app) => {
        let message = '';

        switch(template) {
            case 'applicationReceived':
                message = DISCORD_TEMPLATES.applicationReceived(app.username);
                break;
            case 'interviewScheduled':
                message = DISCORD_TEMPLATES.interviewScheduled(
                    app.username,
                    app.interview_date ? new Date(app.interview_date).toLocaleString() : 'TBD'
                );
                break;
            case 'applicationApproved':
                message = DISCORD_TEMPLATES.applicationApproved(app.username);
                break;
            case 'applicationRejected':
                message = DISCORD_TEMPLATES.applicationRejected(app.username);
                break;
            case 'checkIn':
                message = DISCORD_TEMPLATES.checkIn(app.username);
                break;
            case 'bitReminder':
                message = DISCORD_TEMPLATES.trainingReminder(app.username, 'Basic Introduction Training', 'this Saturday at 20:00 UTC');
                break;
            default:
                message = `Hi ${app.username}!`;
        }

        setDiscordMessage(message);
        setShowDiscordPreview(true);
    };

    // Handle application actions
    const handleApplicationAction = async (applicationId, action, data = {}) => {
        try {
            const endpoint = `/onboarding/applications/${applicationId}/`;
            let payload = {};
            let app = applications.find(a => a.id === applicationId);

            switch (action) {
                case 'approve':
                    payload = {
                        status: 'Approved',
                        reviewer_notes: data.notes,
                        review_date: new Date().toISOString(),
                        reviewer: currentUser.id
                    };
                    // Queue Discord notification
                    if (app) {
                        previewDiscordMessage('applicationApproved', app);
                    }
                    break;

                case 'reject':
                    payload = {
                        status: 'Rejected',
                        reviewer_notes: data.notes,
                        review_date: new Date().toISOString(),
                        reviewer: currentUser.id
                    };
                    // Queue Discord notification
                    if (app) {
                        previewDiscordMessage('applicationRejected', app);
                    }
                    break;

                case 'schedule_interview':
                    payload = {
                        status: 'Interviewing',
                        interview_date: data.interviewDate,
                        reviewer_notes: data.notes
                    };
                    // Queue Discord notification
                    if (app) {
                        app.interview_date = data.interviewDate;
                        previewDiscordMessage('interviewScheduled', app);
                    }
                    break;

                default:
                    console.error('Unknown action:', action);
                    return;
            }

            await api.patch(endpoint, payload);

            // Refresh data
            await fetchDashboardData();

            // Close modals
            setShowReviewModal(false);
            setShowInterviewModal(false);

            console.log(`Successfully ${action} application`);

        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} application. Please try again.`);
        }
    };

    // Handle bulk actions
    const handleBulkAction = async (action, data) => {
        try {
            const promises = selectedApplications.map(appId =>
                handleApplicationAction(appId, action, data)
            );

            await Promise.all(promises);

            // Clear selection
            setSelectedApplications([]);
            setShowBulkModal(false);

            console.log(`Successfully performed bulk ${action}`);

        } catch (err) {
            console.error('Error performing bulk action:', err);
            alert('Some bulk actions failed. Please check the applications.');
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

    const openMentorAssignment = (application) => {
        setSelectedApplication(application);
        setShowMentorModal(true);
    };

    const openOnboardingGuide = (application) => {
        setSelectedApplication(application);
        setShowGuideModal(true);
    };

    // Selection handlers
    const toggleApplicationSelection = (applicationId) => {
        setSelectedApplications(prev =>
            prev.includes(applicationId)
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const selectAllApplications = () => {
        if (selectedApplications.length === filteredApplications.length) {
            setSelectedApplications([]);
        } else {
            setSelectedApplications(filteredApplications.map(app => app.id));
        }
    };

    // Filter applications based on search term
    const filteredApplications = applications.filter(app => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            app.username?.toLowerCase().includes(searchLower) ||
            app.discord_id?.includes(searchTerm) ||
            app.email?.toLowerCase().includes(searchLower)
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

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'status-pending',
            'Interviewing': 'status-interviewing',
            'Approved': 'status-approved',
            'Rejected': 'status-rejected'
        };
        return colors[status] || 'status-default';
    };

    const getOnboardingStageLabel = (app) => {
        if (app.status !== 'Approved') return null;

        if (app.onboarding_status === 'Active') return 'Active Member';
        if (!app.bit_completion_date) return 'Awaiting BIT';
        if (!app.branch_id) return 'Needs Branch';
        if (!app.unit_id) return 'Needs Unit';
        if (!app.mentor_id) return 'Needs Mentor';

        return 'In Progress';
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

    // Render error state
    if (error) {
        return (
            <div className="dashboard-error">
                <AlertCircle size={48} />
                <h2>ERROR LOADING DASHBOARD</h2>
                <p>{error}</p>
                <button onClick={fetchDashboardData} className="action-button">
                    RETRY
                </button>
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
                        <h1>RECRUITMENT COMMAND CENTER</h1>
                    </div>
                    <div className="header-actions">
                        <button
                            className="action-button primary"
                            onClick={() => setShowGuideModal(true)}
                        >
                            <Navigation size={18} />
                            ONBOARDING GUIDE
                        </button>
                        {selectedApplications.length > 0 && (
                            <button
                                className="action-button bulk"
                                onClick={() => setShowBulkModal(true)}
                            >
                                <Users size={18} />
                                BULK ACTIONS ({selectedApplications.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="dashboard-stats">
                <div className="stat-card pending">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.pending}</div>
                        <div className="stat-label">Pending Review</div>
                    </div>
                </div>

                <div className="stat-card interviewing">
                    <div className="stat-icon">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.interviewing}</div>
                        <div className="stat-label">In Interview</div>
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
                        <div className="stat-value">{statistics.activeRecruits}</div>
                        <div className="stat-label">Active Recruits</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <BellRing size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.awaitingBIT}</div>
                        <div className="stat-label">Awaiting BIT</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.needsMentor}</div>
                        <div className="stat-label">Need Mentor</div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="dashboard-controls">
                <div className="search-section">
                    <div className="search-input">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by username, Discord ID, or email..."
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
                            <option value="Pending">Pending</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Globe size={18} />
                        <select
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <ClipboardCheck size={18} />
                        <select
                            value={filterOnboardingStage}
                            onChange={(e) => setFilterOnboardingStage(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Stages</option>
                            <option value="Applied">Applied</option>
                            <option value="BIT Completed">BIT Completed</option>
                            <option value="Branch Applied">Branch Applied</option>
                            <option value="Active">Active Member</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Calendar size={18} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="submission_date">Submission Date</option>
                            <option value="interview_date">Interview Date</option>
                            <option value="review_date">Review Date</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="applications-section">
                <div className="section-header">
                    <h2>RECRUITMENT APPLICATIONS</h2>
                    {filteredApplications.length > 0 && (
                        <div className="section-actions">
                            <input
                                type="checkbox"
                                checked={selectedApplications.length === filteredApplications.length}
                                onChange={selectAllApplications}
                                className="select-all-checkbox"
                            />
                            <span className="select-all-label">Select All</span>
                        </div>
                    )}
                </div>

                <div className="applications-table">
                    {filteredApplications.length > 0 ? (
                        <table>
                            <thead>
                            <tr>
                                <th className="checkbox-column"></th>
                                <th>PILOT</th>
                                <th>STATUS</th>
                                <th>STAGE</th>
                                <th>BRANCH</th>
                                <th>SUBMITTED</th>
                                <th>DISCORD ACTIONS</th>
                                <th>ADMIN ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredApplications.map(app => (
                                <tr key={app.id} className={selectedApplications.includes(app.id) ? 'selected' : ''}>
                                    <td className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={selectedApplications.includes(app.id)}
                                            onChange={() => toggleApplicationSelection(app.id)}
                                        />
                                    </td>
                                    <td className="pilot-cell">
                                        <div className="pilot-info">
                                            <div className="pilot-details">
                                                <div className="pilot-name">{app.username}</div>
                                                <div className="pilot-discord">{app.discord_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        {getOnboardingStageLabel(app) && (
                                            <span className="stage-label">
                                                {getOnboardingStageLabel(app)}
                                            </span>
                                        )}
                                    </td>
                                    <td>{app.preferred_branch_name || 'None'}</td>
                                    <td className="date-cell">
                                        <div className="date-info">
                                            <div>{formatDate(app.submission_date)}</div>
                                            <div className="time-ago">{getTimeAgo(app.submission_date)}</div>
                                        </div>
                                    </td>
                                    <td className="discord-actions-cell">
                                        <div className="action-buttons">
                                            {app.status === 'Pending' && (
                                                <button
                                                    className="action-btn discord"
                                                    onClick={() => previewDiscordMessage('applicationReceived', app)}
                                                    title="Send Welcome DM"
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                            )}
                                            {app.status === 'Approved' && !app.bit_completion_date && (
                                                <button
                                                    className="action-btn discord"
                                                    onClick={() => previewDiscordMessage('bitReminder', app)}
                                                    title="Send BIT Reminder"
                                                >
                                                    <BellRing size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="action-btn discord"
                                                onClick={() => previewDiscordMessage('checkIn', app)}
                                                title="Send Check-in Message"
                                            >
                                                <Heart size={16} />
                                            </button>
                                            <button
                                                className="action-btn discord"
                                                onClick={() => sendDiscordDM(app.discord_id, '')}
                                                title="Open Discord DM"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn review"
                                                onClick={() => openApplicationReview(app)}
                                                title="Review Application"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            {app.status === 'Pending' && (
                                                <>
                                                    <button
                                                        className="action-btn interview"
                                                        onClick={() => openInterviewScheduler(app)}
                                                        title="Schedule Interview"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleApplicationAction(app.id, 'approve', { notes: 'Quick approval' })}
                                                        title="Quick Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn reject"
                                                        onClick={() => handleApplicationAction(app.id, 'reject', { notes: 'Quick rejection' })}
                                                        title="Quick Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'Approved' && (
                                                <>
                                                    <button
                                                        className="action-btn mentor"
                                                        onClick={() => openMentorAssignment(app)}
                                                        title="Assign Mentor"
                                                    >
                                                        <UserPlus size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn guide"
                                                        onClick={() => openOnboardingGuide(app)}
                                                        title="Onboarding Guide"
                                                    >
                                                        <Navigation size={16} />
                                                    </button>
                                                </>
                                            )}
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
                            <p>{searchTerm || filterStatus !== 'all' || filterBranch !== 'all'
                                ? 'Try adjusting your filters or search criteria'
                                : 'No applications have been submitted yet'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Discord Message Preview Modal */}
            {showDiscordPreview && (
                <div className="modal-overlay" onClick={() => setShowDiscordPreview(false)}>
                    <div className="modal-content discord-preview" onClick={e => e.stopPropagation()}>
                        <h3>Discord Message Preview</h3>
                        <div className="discord-message-box">
                            <pre>{discordMessage}</pre>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="action-button primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(discordMessage);
                                    setShowDiscordPreview(false);
                                    alert('Message copied to clipboard!');
                                }}
                            >
                                <Bot size={18} />
                                Copy Message
                            </button>
                            <button
                                className="action-button"
                                onClick={() => {
                                    sendDiscordDM(selectedApplication?.discord_id, discordMessage);
                                    setShowDiscordPreview(false);
                                }}
                            >
                                <Send size={18} />
                                Open Discord & Copy
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
                            interviewDate: date,
                            ...data
                        })
                    }
                />
            )}

            {showMentorModal && selectedApplication && (
                <MentorAssignmentModal
                    recruit={selectedApplication}
                    onClose={() => {
                        setShowMentorModal(false);
                        setSelectedApplication(null);
                    }}
                    onAssign={fetchDashboardData}
                />
            )}

            {showGuideModal && (
                <OnboardingGuideModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowGuideModal(false);
                        setSelectedApplication(null);
                    }}
                />
            )}

            {showBulkModal && (
                <BulkActionsModal
                    selectedCount={selectedApplications.length}
                    onClose={() => {
                        setShowBulkModal(false);
                    }}
                    onAction={handleBulkAction}
                />
            )}
        </div>
    );
};

export default RecruiterDashboard;
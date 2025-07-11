// src/components/pages/RecruiterDashboard/RecruiterDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Users, UserCheck, UserX, Clock, Calendar, ChevronRight,
    Search, Filter, FileText, Star, Shield, CheckCircle,
    XCircle, AlertCircle, Activity, TrendingUp, Award,
    MessageSquare, UserPlus, Navigation, Globe, Briefcase
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
        pending: 0,
        interviewing: 0,
        approved: 0,
        rejected: 0,
        activeRecruits: 0,
        completionRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
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

    useEffect(() => {
        // Check if user has recruiter permissions
        if (!currentUser?.is_admin && !currentUser?.is_staff) {
            navigate('/');
            return;
        }

        fetchDashboardData();
        fetchFilterOptions();
    }, [filterStatus, filterBranch, sortBy]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch applications with filters
            const params = {
                ordering: `-${sortBy}`,
            };

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            if (filterBranch !== 'all') {
                params.preferred_branch = filterBranch;
            }

            const response = await api.get('/onboarding/applications/', { params });
            setApplications(response.data.results || response.data);

            // Fetch statistics
            const statsResponse = await api.get('/onboarding/applications/statistics/');
            setStatistics(statsResponse.data);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            // Fetch branches for filter
            const branchesResponse = await api.get('/units/branches/');
            setBranches(branchesResponse.data.results || branchesResponse.data);

            // Fetch units for assignment
            const unitsResponse = await api.get('/units/');
            setUnits(unitsResponse.data.results || unitsResponse.data);
        } catch (err) {
            console.error('Error fetching filter options:', err);
        }
    };

    const handleApplicationAction = async (applicationId, action, data = {}) => {
        try {
            switch (action) {
                case 'approve':
                    await api.patch(`/onboarding/applications/${applicationId}/`, {
                        status: 'Approved',
                        reviewer_notes: data.notes,
                        review_date: new Date().toISOString()
                    });
                    break;

                case 'reject':
                    await api.patch(`/onboarding/applications/${applicationId}/`, {
                        status: 'Rejected',
                        reviewer_notes: data.notes,
                        review_date: new Date().toISOString()
                    });
                    break;

                case 'schedule_interview':
                    await api.patch(`/onboarding/applications/${applicationId}/`, {
                        status: 'Interviewing',
                        interview_date: data.interviewDate
                    });
                    break;

                default:
                    break;
            }

            // Refresh data
            await fetchDashboardData();

            // Close modals
            setShowReviewModal(false);
            setShowInterviewModal(false);

        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} application`);
        }
    };

    const handleBulkAction = async (action, data) => {
        try {
            // Process bulk actions
            const promises = selectedApplications.map(appId =>
                handleApplicationAction(appId, action, data)
            );

            await Promise.all(promises);

            // Clear selection
            setSelectedApplications([]);
            setShowBulkModal(false);

        } catch (err) {
            console.error('Error performing bulk action:', err);
            alert('Some bulk actions failed');
        }
    };

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
        const matchesSearch = !searchTerm ||
            app.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.discord_id.includes(searchTerm) ||
            app.email?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>ACCESSING RECRUITMENT DATABASE...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <AlertCircle size={48} />
                <h2>ERROR LOADING DASHBOARD</h2>
                <p>{error}</p>
                <button onClick={fetchDashboardData}>RETRY</button>
            </div>
        );
    }

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
                        <button className="action-button primary" onClick={() => setShowGuideModal(true)}>
                            <Navigation size={18} />
                            ONBOARDING GUIDE
                        </button>
                        {selectedApplications.length > 0 && (
                            <button className="action-button bulk" onClick={() => setShowBulkModal(true)}>
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
                    <div className="stat-trend">
                        <TrendingUp size={16} />
                        <span>+12% this week</span>
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

                <div className="stat-card completion">
                    <div className="stat-icon">
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.completionRate}%</div>
                        <div className="stat-label">Completion Rate</div>
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
                    <div className="section-actions">
                        <input
                            type="checkbox"
                            checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                            onChange={selectAllApplications}
                            className="select-all-checkbox"
                        />
                        <span className="select-all-label">Select All</span>
                    </div>
                </div>

                <div className="applications-table">
                    <table>
                        <thead>
                        <tr>
                            <th className="checkbox-column"></th>
                            <th>PILOT</th>
                            <th>STATUS</th>
                            <th>PREFERRED BRANCH</th>
                            <th>MOS CHOICES</th>
                            <th>SUBMITTED</th>
                            <th>REFERRER</th>
                            <th>ACTIONS</th>
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
                                <td>{app.preferred_branch_name || 'None'}</td>
                                <td className="mos-cell">
                                    {app.mos_priority_1_details && (
                                        <div className="mos-choice primary">
                                            <span className="mos-priority">1st:</span>
                                            <span className="mos-code">{app.mos_priority_1_details.code}</span>
                                        </div>
                                    )}
                                    {app.mos_priority_2_details && (
                                        <div className="mos-choice">
                                            <span className="mos-priority">2nd:</span>
                                            <span className="mos-code">{app.mos_priority_2_details.code}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="date-cell">
                                    <div className="date-info">
                                        <div>{formatDate(app.submission_date)}</div>
                                        <div className="time-ago">{getTimeAgo(app.submission_date)}</div>
                                    </div>
                                </td>
                                <td>{app.referrer_username || 'None'}</td>
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

                    {filteredApplications.length === 0 && (
                        <div className="no-applications">
                            <Users size={48} />
                            <h3>No Applications Found</h3>
                            <p>Try adjusting your filters or search criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showReviewModal && selectedApplication && (
                <ApplicationReviewModal
                    application={selectedApplication}
                    onClose={() => setShowReviewModal(false)}
                    onAction={handleApplicationAction}
                />
            )}

            {showInterviewModal && selectedApplication && (
                <InterviewScheduleModal
                    application={selectedApplication}
                    onClose={() => setShowInterviewModal(false)}
                    onSchedule={(date) => handleApplicationAction(selectedApplication.id, 'schedule_interview', { interviewDate: date })}
                />
            )}

            {showMentorModal && selectedApplication && (
                <MentorAssignmentModal
                    recruit={selectedApplication}
                    onClose={() => setShowMentorModal(false)}
                    onAssign={fetchDashboardData}
                />
            )}

            {showGuideModal && (
                <OnboardingGuideModal
                    application={selectedApplication}
                    onClose={() => setShowGuideModal(false)}
                />
            )}

            {showBulkModal && (
                <BulkActionsModal
                    selectedCount={selectedApplications.length}
                    onClose={() => setShowBulkModal(false)}
                    onAction={handleBulkAction}
                />
            )}
        </div>
    );
};

export default RecruiterDashboard;
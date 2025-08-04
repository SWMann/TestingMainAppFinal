// src/components/pages/RecruiterDashboard/RecruiterDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
    const dispatch = useDispatch();
    const { user: currentUser, loading: authLoading } = useSelector(state => state.auth);

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
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [userDataLoaded, setUserDataLoaded] = useState(false);

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

    // Permission check
    const hasRecruiterPermissions = useCallback(() => {
        if (!currentUser) return false;

        console.log('Checking permissions for user:', {
            username: currentUser.username,
            is_admin: currentUser.is_admin,
            is_staff: currentUser.is_staff,
            is_recruiter: currentUser.is_recruiter,
            roles: currentUser.roles,
            permissions: currentUser.permissions
        });

        // Check various permission flags
        return (
            currentUser.is_admin ||
            currentUser.is_staff ||
            currentUser.is_recruiter ||
            currentUser.roles?.includes('recruiter') ||
            currentUser.permissions?.includes('recruitment.view')
        );
    }, [currentUser]);

    // Load user data if needed
    useEffect(() => {
        const loadUserData = async () => {
            // If we have a token but no user data, try to fetch it
            const token = localStorage.getItem('token');
            if (token && !currentUser && !authLoading) {
                console.log('RecruiterDashboard: Token exists but no user data, fetching user...');
                try {
                    const response = await api.get('/users/me/');
                    // You would dispatch this to your Redux store
                    // dispatch(setUser(response.data));
                    console.log('Fetched user data:', response.data);
                    setUserDataLoaded(true);
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    setUserDataLoaded(true); // Set as loaded even on error
                }
            } else if (currentUser) {
                setUserDataLoaded(true);
            } else if (!token) {
                setUserDataLoaded(true); // No token, so we're done loading
            }
        };

        loadUserData();
    }, [currentUser, authLoading]);

    // Check permissions after user data is loaded
    useEffect(() => {
        // Only check permissions after we've attempted to load user data
        if (!userDataLoaded) {
            console.log('RecruiterDashboard: Waiting for user data to load...');
            return;
        }

        // If still loading auth, wait
        if (authLoading) {
            console.log('RecruiterDashboard: Auth still loading...');
            return;
        }

        // Now we can safely check permissions
        setPermissionChecked(true);

        // Check if user is logged in
        if (!currentUser) {
            console.log('RecruiterDashboard: No user found after loading, redirecting to home');
            navigate('/');
            return;
        }

        // Check permissions
        if (!hasRecruiterPermissions()) {
            console.log('RecruiterDashboard: User lacks permissions', {
                user: currentUser.username,
                is_admin: currentUser.is_admin,
                is_staff: currentUser.is_staff,
                is_recruiter: currentUser.is_recruiter,
                roles: currentUser.roles,
                permissions: currentUser.permissions
            });
            navigate('/');
            return;
        }

        console.log('RecruiterDashboard: User has permissions, proceeding');
    }, [currentUser, authLoading, userDataLoaded, navigate, hasRecruiterPermissions]);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        if (!hasRecruiterPermissions() || !permissionChecked) {
            return;
        }

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

            // Fetch applications
            const response = await api.get('/onboarding/applications/', { params });
            const fetchedApplications = response.data.results || response.data;
            setApplications(fetchedApplications);

            // Try to fetch statistics, fallback to calculating from applications
            try {
                const statsResponse = await api.get('/onboarding/applications/statistics/');
                setStatistics(statsResponse.data);
            } catch (statsError) {
                console.log('Statistics endpoint not available, calculating manually');
                calculateStatistics(fetchedApplications);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load applications. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterBranch, sortBy, hasRecruiterPermissions, permissionChecked]);

    // Calculate statistics from applications
    const calculateStatistics = (apps) => {
        const stats = {
            pending: apps.filter(app => app.status === 'Pending').length,
            interviewing: apps.filter(app => app.status === 'Interviewing').length,
            approved: apps.filter(app => app.status === 'Approved').length,
            rejected: apps.filter(app => app.status === 'Rejected').length,
            activeRecruits: apps.filter(app => app.status === 'Approved' && !app.onboarding_complete).length,
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
        if (!hasRecruiterPermissions() || !permissionChecked) {
            return;
        }

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
    }, [hasRecruiterPermissions, permissionChecked]);

    // Load data when permissions are confirmed
    useEffect(() => {
        if (permissionChecked && hasRecruiterPermissions()) {
            fetchDashboardData();
            fetchFilterOptions();
        }
    }, [permissionChecked, hasRecruiterPermissions, fetchDashboardData, fetchFilterOptions]);

    // Handle application actions
    const handleApplicationAction = async (applicationId, action, data = {}) => {
        try {
            const endpoint = `/onboarding/applications/${applicationId}/`;
            let payload = {};

            switch (action) {
                case 'approve':
                    payload = {
                        status: 'Approved',
                        reviewer_notes: data.notes,
                        review_date: new Date().toISOString(),
                        reviewer: currentUser.id
                    };
                    break;

                case 'reject':
                    payload = {
                        status: 'Rejected',
                        reviewer_notes: data.notes,
                        review_date: new Date().toISOString(),
                        reviewer: currentUser.id
                    };
                    break;

                case 'schedule_interview':
                    payload = {
                        status: 'Interviewing',
                        interview_date: data.interviewDate,
                        reviewer_notes: data.notes
                    };
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

            // Show success message (you could add a toast notification here)
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

            // Show success message
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

    // Render loading state
    if (!userDataLoaded || authLoading || !permissionChecked) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>INITIALIZING RECRUITMENT INTERFACE...</p>
            </div>
        );
    }

    // Render loading state for data
    if (isLoading && applications.length === 0 && permissionChecked) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>ACCESSING RECRUITMENT DATABASE...</p>
            </div>
        );
    }

    // Render error state
    if (error && permissionChecked) {
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

    // Don't render if no permissions (will redirect)
    if (!hasRecruiterPermissions()) {
        return null;
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

                <div className="stat-card completion">
                    <div className="stat-icon">
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.completionRate}%</div>
                        <div className="stat-label">Approval Rate</div>
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
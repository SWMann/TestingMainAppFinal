import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    User, Shield, Star, Calendar, Clock, Award, ChevronRight,
    Activity, Medal, Briefcase, Ship, FileText, Users,
    TrendingUp, Target, Zap, Hash, Mail, MapPin, Globe,
    CheckCircle, XCircle, AlertCircle, ChevronUp, ChevronDown,
    Book, Bookmark, BarChart3, UserCheck
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Additional data states
    const [userPositions, setUserPositions] = useState([]);
    const [userCertificates, setUserCertificates] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [userShips, setUserShips] = useState([]);
    const [unitHistory, setUnitHistory] = useState([]);
    const [rankProgression, setRankProgression] = useState([]);
    const [orgStats, setOrgStats] = useState({
        memberCount: 0,
        activeOperations: 0,
        completedOperations: 0,
        fleetSize: 0,
        days_in_service: 0,
        completed_operations: 0,
        upcoming_operations: 0,
        total_certificates: 0,
        active_certificates: 0,
        total_ships: 0,
        approved_ships: 0
    });

    // Determine which user to display
    const targetUserId = userId || currentUser?.id;

    // Format date functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDaysInService = (joinDate) => {
        if (!joinDate) return 0;
        const join = new Date(joinDate);
        const now = new Date();
        const diffTime = Math.abs(now - join);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!targetUserId && !isAuthenticated) {
                setError('Please log in to view profile');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch comprehensive user profile data
                const profileEndpoint = targetUserId
                    ? `/users/profile/${targetUserId}/`
                    : '/users/profile/me/';

                const profileResponse = await api.get(profileEndpoint);
                const data = profileResponse.data;

                // Set all the data from the comprehensive response
                setProfileData(data.user);
                setUserPositions(data.positions || []);
                setUserCertificates(data.certificates || []);
                setUserEvents(data.events || []);
                setUserShips(data.ships || []);

                // Set organization stats
                if (data.statistics) {
                    setOrgStats({
                        ...orgStats,
                        ...data.statistics
                    });
                }

                // Fetch unit history
                if (data.user?.id) {
                    try {
                        const unitHistoryResponse = await api.get(`/users/${data.user.id}/unit-history/`);
                        setUnitHistory(unitHistoryResponse.data.history || []);
                    } catch (err) {
                        console.error('Error fetching unit history:', err);
                    }

                    // Fetch rank progression
                    try {
                        const rankProgressionResponse = await api.get(`/users/${data.user.id}/rank-progression/`);
                        setRankProgression(rankProgressionResponse.data.progression || []);
                    } catch (err) {
                        console.error('Error fetching rank progression:', err);
                    }
                }

            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [targetUserId, isAuthenticated]);

    // Loading state
    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading profile data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !profileData) {
        return (
            <div className="profile-page">
                <div className="error-container">
                    <AlertCircle size={48} />
                    <h2>Unable to Load Profile</h2>
                    <p>{error || 'Profile not found'}</p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const daysInService = calculateDaysInService(profileData.join_date);
    const completedOps = userEvents.filter(e => e.status === 'Completed').length;
    const upcomingOps = userEvents.filter(e => new Date(e.start_time) > new Date()).length;

    // Tab content components
    const renderOverview = () => (
        <div className="tab-content overview">
            {/* Bio Section */}
            <div className="section-card">
                <h3 className="section-title">
                    <User size={20} />
                    About
                </h3>
                <p className="bio-text">
                    {profileData.bio || 'No bio provided yet.'}
                </p>
            </div>

            {/* Service Record */}
            <div className="section-card">
                <h3 className="section-title">
                    <FileText size={20} />
                    Service Record
                </h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Service Number</span>
                        <span className="info-value">{profileData.service_number || 'Not Assigned'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Join Date</span>
                        <span className="info-value">{formatDate(profileData.join_date)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Days in Service</span>
                        <span className="info-value">{daysInService}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Last Active</span>
                        <span className="info-value">{formatDateTime(profileData.last_login)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Commission Stage</span>
                        <span className="info-value">
                            {profileData.commission_stage?.name || 'Recruit'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Status</span>
                        <span className={`status-badge ${profileData.is_active ? 'active' : 'inactive'}`}>
                            {profileData.is_active ? 'Active Duty' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Mentor Assignment */}
                {profileData.mentor && (
                    <div className="mentor-section">
                        <h4 className="mentor-title">Assigned Mentor</h4>
                        <div className="mentor-info">
                            <img
                                src={profileData.mentor.avatar_url || '/api/placeholder/64/64'}
                                alt={profileData.mentor.username}
                                className="mentor-avatar"
                            />
                            <div className="mentor-details">
                                <span className="mentor-name">
                                    {profileData.mentor.rank?.abbreviation} {profileData.mentor.username}
                                </span>
                                <span className="mentor-role">Training Mentor</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Positions */}
            {userPositions.length > 0 && (
                <div className="section-card">
                    <h3 className="section-title">
                        <Briefcase size={20} />
                        Current Positions
                    </h3>
                    <div className="positions-list">
                        {userPositions.filter(p => p.status === 'Active').map(position => (
                            <div key={position.id} className="position-item">
                                <div className="position-icon">
                                    <Shield size={24} />
                                </div>
                                <div className="position-info">
                                    <h4>{position.position?.title || 'Unknown Position'}</h4>
                                    <p>{position.unit?.name || 'Unknown Unit'}</p>
                                    <span className="position-date">Since {formatDate(position.assignment_date)}</span>
                                </div>
                                {position.is_primary && (
                                    <div className="primary-badge">PRIMARY</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {userCertificates.length > 0 && (
                <div className="section-card">
                    <h3 className="section-title">
                        <Award size={20} />
                        Certifications
                    </h3>
                    <div className="certifications-grid">
                        {userCertificates.filter(c => c.is_active).slice(0, 6).map(cert => (
                            <div key={cert.id} className="certification-item">
                                <div className="cert-icon">
                                    {cert.certificate?.badge_image_url ? (
                                        <img src={cert.certificate.badge_image_url} alt={cert.certificate.name} />
                                    ) : (
                                        <Medal size={32} />
                                    )}
                                </div>
                                <div className="cert-info">
                                    <h5>{cert.certificate?.name || 'Unknown Certification'}</h5>
                                    <span className="cert-date">{formatDate(cert.issue_date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {userCertificates.length > 6 && (
                        <p className="view-more">And {userCertificates.length - 6} more...</p>
                    )}
                </div>
            )}

            {/* Fleet */}
            {userShips.length > 0 && (
                <div className="section-card">
                    <h3 className="section-title">
                        <Ship size={20} />
                        Fleet
                    </h3>
                    <div className="ships-grid">
                        {userShips.filter(s => s.approval_status === 'Approved').map(ship => (
                            <div key={ship.id} className="ship-item">
                                <div className="ship-image">
                                    {ship.primary_image_url ? (
                                        <img src={ship.primary_image_url} alt={ship.name} />
                                    ) : (
                                        <Ship size={48} />
                                    )}
                                </div>
                                <h5>{ship.name}</h5>
                                <p>{ship.class_type}</p>
                                <span className="ship-role">{ship.primary_role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderUnitHistory = () => (
        <div className="tab-content unit-history">
            <div className="section-card">
                <h3 className="section-title">
                    <Users size={20} />
                    Unit Assignment History
                </h3>
                {unitHistory.length > 0 ? (
                    <div className="timeline">
                        {unitHistory.map((item, index) => (
                            <div key={item.id} className="timeline-item">
                                <div className="timeline-marker">
                                    <div className={`marker ${item.status === 'Active' ? 'active' : ''}`}></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <h4>{item.unit?.name || 'Unknown Unit'}</h4>
                                        <span className={`status-badge ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="timeline-position">{item.position?.title || 'Unknown Position'}</p>
                                    <div className="timeline-meta">
                                        <span>
                                            <Calendar size={14} />
                                            {formatDate(item.assignment_date)}
                                        </span>
                                        {item.order_number && (
                                            <span>
                                                <Hash size={14} />
                                                Order: {item.order_number}
                                            </span>
                                        )}
                                    </div>
                                    {item.unit?.description && (
                                        <p className="timeline-description">{item.unit.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : userPositions.length > 0 ? (
                    <div className="timeline">
                        {userPositions.sort((a, b) => new Date(b.assignment_date) - new Date(a.assignment_date)).map((position, index) => (
                            <div key={position.id} className="timeline-item">
                                <div className="timeline-marker">
                                    <div className={`marker ${position.status === 'Active' ? 'active' : ''}`}></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <h4>{position.unit_name || 'Unknown Unit'}</h4>
                                        <span className={`status-badge ${position.status === 'Active' ? 'active' : 'inactive'}`}>
                                            {position.status}
                                        </span>
                                    </div>
                                    <p className="timeline-position">{position.position_title || 'Unknown Position'}</p>
                                    <div className="timeline-meta">
                                        <span>
                                            <Calendar size={14} />
                                            {formatDate(position.assignment_date)}
                                        </span>
                                        {position.order_number && (
                                            <span>
                                                <Hash size={14} />
                                                Order: {position.order_number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No unit history available</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRoleProgression = () => (
        <div className="tab-content role-progression">
            <div className="section-card">
                <h3 className="section-title">
                    <TrendingUp size={20} />
                    Role Progression
                </h3>
                {userPositions.length > 0 ? (
                    <div className="progression-chart">
                        {userPositions.sort((a, b) => new Date(a.assignment_date) - new Date(b.assignment_date)).map((position, index) => (
                            <div key={position.id} className="progression-item">
                                <div className="progression-connector">
                                    {index < userPositions.length - 1 && <div className="connector-line"></div>}
                                </div>
                                <div className="progression-node">
                                    <div className="node-icon">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="node-content">
                                        <h4>{position.position_title || 'Unknown Position'}</h4>
                                        <p>{position.unit_name || 'Unknown Unit'}</p>
                                        <span className="node-date">{formatDate(position.assignment_date)}</span>
                                        {position.is_primary && <div className="primary-indicator">Primary Role</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <TrendingUp size={48} />
                        <p>No role progression data available</p>
                    </div>
                )}
            </div>

            {/* Training & Certifications */}
            <div className="section-card">
                <h3 className="section-title">
                    <Book size={20} />
                    Training & Certifications Timeline
                </h3>
                {userCertificates.length > 0 ? (
                    <div className="certifications-timeline">
                        {userCertificates.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date)).map(cert => (
                            <div key={cert.id} className="cert-timeline-item">
                                <div className="cert-badge">
                                    {cert.certificate_badge ? (
                                        <img src={cert.certificate_badge} alt={cert.certificate_name} />
                                    ) : (
                                        <Award size={24} />
                                    )}
                                </div>
                                <div className="cert-details">
                                    <h5>{cert.certificate_name || 'Unknown Certification'}</h5>
                                    <p>{cert.certificate?.description}</p>
                                    <div className="cert-meta">
                                        <span>
                                            <Calendar size={14} />
                                            Issued: {formatDate(cert.issue_date)}
                                        </span>
                                        <span>
                                            <UserCheck size={14} />
                                            Issuer: {cert.issuer_username || 'Unknown'}
                                        </span>
                                        {cert.expiry_date && (
                                            <span className="expiry">
                                                <Clock size={14} />
                                                Expires: {formatDate(cert.expiry_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`cert-status ${cert.is_active ? 'active' : 'inactive'}`}>
                                    {cert.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Award size={48} />
                        <p>No certifications earned yet</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRankProgression = () => (
        <div className="tab-content rank-progression">
            <div className="section-card">
                <h3 className="section-title">
                    <Star size={20} />
                    Rank Progression
                </h3>
                <div className="current-rank">
                    <div className="rank-insignia">
                        {profileData.current_rank?.insignia_image_url ? (
                            <img src={profileData.current_rank.insignia_image_url} alt={profileData.current_rank.name} />
                        ) : (
                            <Star size={64} />
                        )}
                    </div>
                    <div className="rank-info">
                        <h2>{profileData.current_rank?.name || 'Unranked'}</h2>
                        <p>{profileData.current_rank?.abbreviation}</p>
                        <p className="rank-description">{profileData.current_rank?.description}</p>
                    </div>
                </div>

                {/* TODO: Add rank history when endpoint is available */}
                <div className="rank-timeline">
                    <h4>Promotion History</h4>
                    <div className="empty-state">
                        <BarChart3 size={48} />
                        <p>Rank progression history coming soon</p>
                    </div>
                </div>
            </div>

            {/* Commission Progress */}
            <div className="section-card">
                <h3 className="section-title">
                    <Target size={20} />
                    Commission Progress
                </h3>
                <div className="commission-info">
                    <div className="commission-stage">
                        <h4>Current Stage</h4>
                        <div className="stage-badge">
                            {profileData.commission_stage?.badge_image_url ? (
                                <img src={profileData.commission_stage.badge_image_url} alt={profileData.commission_stage.name} />
                            ) : (
                                <Bookmark size={32} />
                            )}
                            <span>{profileData.commission_stage?.name || 'Recruit'}</span>
                        </div>
                    </div>
                    <div className="commission-details">
                        <p>{profileData.commission_stage?.description}</p>
                        {profileData.commission_stage?.requirements && (
                            <div className="requirements">
                                <h5>Requirements:</h5>
                                <p>{profileData.commission_stage.requirements}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Career Track */}
                <div className="career-track">
                    <h4>Career Track</h4>
                    <div className="track-badges">
                        {profileData.officer_candidate && (
                            <div className="track-badge officer">
                                <Shield size={20} />
                                Officer Candidate
                            </div>
                        )}
                        {profileData.warrant_officer_candidate && (
                            <div className="track-badge warrant">
                                <Zap size={20} />
                                Warrant Officer Candidate
                            </div>
                        )}
                        {!profileData.officer_candidate && !profileData.warrant_officer_candidate && (
                            <div className="track-badge enlisted">
                                <Users size={20} />
                                Enlisted
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRecentOperations = () => (
        <div className="tab-content recent-operations">
            <div className="section-card">
                <h3 className="section-title">
                    <Activity size={20} />
                    Recent Operations
                </h3>
                {userEvents.length > 0 ? (
                    <div className="operations-list">
                        {userEvents.sort((a, b) => new Date(b.start_time) - new Date(a.start_time)).slice(0, 20).map(event => (
                            <div key={event.id} className="operation-item">
                                <div className="op-header">
                                    <h4>{event.title}</h4>
                                    <span className={`op-type ${event.event_type?.toLowerCase().replace(' ', '-')}`}>
                                        {event.event_type}
                                    </span>
                                </div>
                                <p className="op-description">{event.description}</p>
                                <div className="op-details">
                                    <span>
                                        <Calendar size={14} />
                                        {formatDate(event.start_time)}
                                    </span>
                                    <span>
                                        <MapPin size={14} />
                                        {event.location}
                                    </span>
                                    <span>
                                        <Users size={14} />
                                        {event.host_unit?.abbreviation || 'Unknown Unit'}
                                    </span>
                                </div>
                                <div className="op-attendance">
                                    <span className={`attendance-status ${event.attendance_status || 'unknown'}`}>
                                        {event.attendance_status === 'Attending' && <CheckCircle size={16} />}
                                        {event.attendance_status === 'Declined' && <XCircle size={16} />}
                                        {event.attendance_status || 'No Response'}
                                    </span>
                                    {event.performance_rating && (
                                        <div className="performance-rating">
                                            Performance: {event.performance_rating}/5
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Activity size={48} />
                        <p>No operations participated in yet</p>
                    </div>
                )}
            </div>

            {/* Operations Statistics */}
            <div className="section-card">
                <h3 className="section-title">
                    <BarChart3 size={20} />
                    Operations Statistics
                </h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Activity size={24} />
                        </div>
                        <div className="stat-value">{userEvents.length}</div>
                        <div className="stat-label">Total Operations</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-value">{completedOps}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-value">{upcomingOps}</div>
                        <div className="stat-label">Upcoming</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Target size={24} />
                        </div>
                        <div className="stat-value">
                            {userEvents.filter(e => e.attendance_status === 'Attending').length}
                        </div>
                        <div className="stat-label">Attended</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Tab configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: User, render: renderOverview },
        { id: 'unit-history', label: 'Unit History', icon: Users, render: renderUnitHistory },
        { id: 'role-progression', label: 'Role Progression', icon: TrendingUp, render: renderRoleProgression },
        { id: 'rank-progression', label: 'Rank Progression', icon: Star, render: renderRankProgression },
        { id: 'recent-operations', label: 'Recent Operations', icon: Activity, render: renderRecentOperations }
    ];

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.render();

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="header-background">
                    <img
                        src={profileData.background_image_url || '/api/placeholder/1920/400'}
                        alt="Profile background"
                    />
                    <div className="header-overlay"></div>
                </div>

                <div className="header-content">
                    <div className="profile-avatar">
                        <img
                            src={profileData.avatar_url || '/api/placeholder/200/200'}
                            alt={profileData.username}
                        />
                        <div className="status-indicator" data-status={profileData.is_active ? 'active' : 'inactive'}></div>
                    </div>

                    <div className="profile-info">
                        <h1 className="profile-name">
                            {profileData.current_rank?.abbreviation && (
                                <span className="rank-abbr">{profileData.current_rank.abbreviation}</span>
                            )}
                            {profileData.username}
                        </h1>

                        <div className="profile-meta">
                            <div className="meta-item">
                                <Shield size={16} />
                                <span>{profileData.current_rank?.name || 'Unranked'}</span>
                            </div>
                            {profileData.primary_unit && (
                                <div className="meta-item">
                                    <Users size={16} />
                                    <span>{profileData.primary_unit.name}</span>
                                </div>
                            )}
                            {profileData.branch && (
                                <div className="meta-item">
                                    <Star size={16} />
                                    <span>{profileData.branch.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="profile-stats">
                            <div className="stat">
                                <span className="stat-value">{orgStats.days_in_service || daysInService}</span>
                                <span className="stat-label">Days in Service</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{orgStats.total_certificates || userCertificates.length}</span>
                                <span className="stat-label">Certifications</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{orgStats.completed_operations || completedOps}</span>
                                <span className="stat-label">Operations</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{orgStats.total_ships || userShips.length}</span>
                                <span className="stat-label">Ships</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="profile-content">
                {/* Sidebar Navigation */}
                <div className="profile-sidebar">
                    <nav className="profile-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={20} />
                                <span>{tab.label}</span>
                                <ChevronRight size={16} className="nav-arrow" />
                            </button>
                        ))}
                    </nav>

                    {/* Quick Info */}
                    <div className="sidebar-info">
                        <h4>Contact Information</h4>
                        <div className="info-item">
                            <Mail size={16} />
                            <span>{profileData.email || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <Globe size={16} />
                            <span>Discord: {profileData.discord_id ? `@${profileData.username}` : 'Not linked'}</span>
                        </div>
                        <div className="info-item">
                            <Clock size={16} />
                            <span>Timezone: {profileData.timezone || 'Not set'}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="profile-main">
                    {activeTabContent}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
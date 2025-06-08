import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Shield, User, Calendar, Award, Star, MapPin, Clock,
    ChevronRight, Mail, Hash, Briefcase, Ship, Trophy,
    Edit, UserPlus, ChevronUp, ChevronDown, AlertCircle,
    Building, Users, FileText, Activity, Target, School
} from 'lucide-react';
import './ProfilePage.css';

import api from "../../../services/api";
import PromotionModal from "../../modals/PromotionModal";
import UnitAssignmentModal from "../../modals/UnitAssignmentModal";
import PositionAssignmentModal from "../../modals/PositionAssignmentModal";

const UserProfile = () => {
    const { serviceNumber } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Admin modals
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);

    // Check if current user is an officer
    const isOfficer = currentUser?.current_rank?.is_officer || currentUser?.is_admin;
    const isOwnProfile = !serviceNumber || serviceNumber === currentUser?.service_number;

    useEffect(() => {
        fetchProfileData();
    }, [serviceNumber]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response;
            if (serviceNumber) {
                // First get user by service number
                const usersResponse = await api.get(`/users/?service_number=${serviceNumber}`);
                const users = usersResponse.data.results || usersResponse.data;
                if (users.length === 0) {
                    throw new Error('User not found');
                }
                const userId = users[0].id;
                response = await api.get(`/users/profile/${userId}/`);
            } else {
                // Get current user's profile
                response = await api.get('/users/profile/me/');
            }

            setProfileData(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err.response?.data?.detail || 'Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDaysInService = (joinDate) => {
        if (!joinDate) return 0;
        const days = Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24));
        return days;
    };

    const handlePromotion = async (newRankId) => {
        try {
            await api.put(`/users/${profileData.user.id}/sensitive-fields/`, {
                current_rank: newRankId
            });
            await fetchProfileData(); // Refresh data
            setShowPromotionModal(false);
        } catch (err) {
            console.error('Error promoting user:', err);
            alert('Failed to update rank');
        }
    };

    const handleUnitAssignment = async (unitId) => {
        try {
            await api.put(`/users/${profileData.user.id}/sensitive-fields/`, {
                primary_unit: unitId
            });
            await fetchProfileData();
            setShowUnitModal(false);
        } catch (err) {
            console.error('Error assigning unit:', err);
            alert('Failed to update unit assignment');
        }
    };

    const handlePositionAssignment = async (positionData) => {
        try {
            await api.post('/user-positions/', {
                user: profileData.user.id,
                position: positionData.position,
                unit: positionData.unit,
                is_primary: positionData.is_primary,
                status: 'Active'
            });
            await fetchProfileData();
            setShowPositionModal(false);
        } catch (err) {
            console.error('Error assigning position:', err);
            alert('Failed to assign position');
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <AlertCircle size={48} />
                <h2>Error Loading Profile</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Return Home</button>
            </div>
        );
    }

    if (!profileData) return null;

    const { user, positions, certificates, events, ships, statistics } = profileData;

    return (
        <div className="profile-container">
            {/* Header Section */}
            <div className="profile-header">
                <div className="profile-header-bg">
                    <img
                        src={user.background_image_url || 'https://images.unsplash.com/photo-1569163139394-de4798d0c2c6?w=1920&h=400&fit=crop'}
                        alt="Profile background"
                    />
                    <div className="profile-header-overlay"></div>
                </div>

                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        <img
                            src={user.avatar_url || '/api/placeholder/200/200'}
                            alt={user.username}
                            className="profile-avatar"
                        />
                        {user.current_rank && (
                            <img
                                src={user.current_rank.insignia_image_url}
                                alt={user.current_rank.name}
                                className="rank-insignia"
                            />
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="profile-name-section">
                            <h1>
                                {user.current_rank?.abbreviation} {user.username}
                            </h1>
                            <div className="profile-badges">
                                {user.recruit_status && (
                                    <span className="status-badge recruit">RECRUIT</span>
                                )}
                                {user.officer_candidate && (
                                    <span className="status-badge ocs">OCS</span>
                                )}
                                {user.warrant_officer_candidate && (
                                    <span className="status-badge wocs">WOCS</span>
                                )}
                                {user.is_admin && (
                                    <span className="status-badge admin">ADMIN</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-item">
                                <Hash size={16} />
                                <span>{user.service_number || 'No Service Number'}</span>
                            </div>
                            <div className="detail-item">
                                <Shield size={16} />
                                <span>{user.current_rank?.name || 'No Rank'}</span>
                            </div>
                            <div className="detail-item">
                                <Building size={16} />
                                <span>{user.primary_unit?.name || 'No Unit Assignment'}</span>
                            </div>
                            <div className="detail-item">
                                <Calendar size={16} />
                                <span>Joined {formatDate(user.join_date)}</span>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {!isOwnProfile && isOfficer && (
                            <div className="admin-actions">
                                <button
                                    className="admin-button"
                                    onClick={() => setShowPromotionModal(true)}
                                >
                                    <ChevronUp size={16} />
                                    Promote/Demote
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={() => setShowUnitModal(true)}
                                >
                                    <Building size={16} />
                                    Assign Unit
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={() => setShowPositionModal(true)}
                                >
                                    <Briefcase size={16} />
                                    Assign Position
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-value">{statistics.days_in_service}</div>
                            <div className="stat-label">Days in Service</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{statistics.completed_operations}</div>
                            <div className="stat-label">Operations</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{statistics.total_certificates}</div>
                            <div className="stat-label">Certifications</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{positions.length}</div>
                            <div className="stat-label">Positions</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-tabs">
                <button
                    className={activeTab === 'overview' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('overview')}
                >
                    <User size={18} />
                    Overview
                </button>
                <button
                    className={activeTab === 'service' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('service')}
                >
                    <Briefcase size={18} />
                    Service Record
                </button>
                <button
                    className={activeTab === 'training' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('training')}
                >
                    <Award size={18} />
                    Training & Certs
                </button>
                <button
                    className={activeTab === 'operations' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('operations')}
                >
                    <Activity size={18} />
                    Operations
                </button>
                {ships.length > 0 && (
                    <button
                        className={activeTab === 'ships' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('ships')}
                    >
                        <Ship size={18} />
                        Ships
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="profile-content">
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <div className="content-grid">
                            {/* Personal Information */}
                            <div className="info-card">
                                <h3>Personal Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Discord ID</label>
                                        <span>{user.discord_id}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <span>{user.email || 'Not provided'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Timezone</label>
                                        <span>{user.timezone || 'Not set'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Last Active</label>
                                        <span>{formatDateTime(user.last_login)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Current Assignment */}
                            <div className="info-card">
                                <h3>Current Assignment</h3>
                                {user.primary_unit ? (
                                    <div className="unit-assignment">
                                        <div className="unit-header">
                                            {user.primary_unit.emblem_url && (
                                                <img
                                                    src={user.primary_unit.emblem_url}
                                                    alt={user.primary_unit.name}
                                                    className="unit-emblem"
                                                />
                                            )}
                                            <div>
                                                <h4>{user.primary_unit.name}</h4>
                                                <p>{user.primary_unit.unit_type}</p>
                                            </div>
                                        </div>
                                        {user.primary_unit.motto && (
                                            <p className="unit-motto">"{user.primary_unit.motto}"</p>
                                        )}
                                        <p className="unit-description">{user.primary_unit.description}</p>
                                    </div>
                                ) : (
                                    <p className="no-data">No unit assignment</p>
                                )}
                            </div>

                            {/* Branch Information */}
                            {user.branch && (
                                <div className="info-card">
                                    <h3>Branch</h3>
                                    <div className="branch-info">
                                        {user.branch.logo_url && (
                                            <img
                                                src={user.branch.logo_url}
                                                alt={user.branch.name}
                                                className="branch-logo"
                                            />
                                        )}
                                        <div>
                                            <h4>{user.branch.name}</h4>
                                            <p>{user.branch.abbreviation}</p>
                                            {user.branch.description && (
                                                <p className="branch-description">{user.branch.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Onboarding Status */}
                            <div className="info-card">
                                <h3>Career Progression</h3>
                                <div className="progression-info">
                                    <div className="info-item">
                                        <label>Onboarding Status</label>
                                        <span className={`status-tag ${user.onboarding_status?.toLowerCase().replace(' ', '-')}`}>
                                            {user.onboarding_status || 'Not Started'}
                                        </span>
                                    </div>
                                    {user.commission_stage && (
                                        <div className="commission-stage">
                                            <label>Commission Stage</label>
                                            <div className="stage-info">
                                                {user.commission_stage.badge_image_url && (
                                                    <img
                                                        src={user.commission_stage.badge_image_url}
                                                        alt={user.commission_stage.name}
                                                        className="stage-badge"
                                                    />
                                                )}
                                                <div>
                                                    <h5>{user.commission_stage.name}</h5>
                                                    <p>{user.commission_stage.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {user.mentor && (
                                        <div className="mentor-info">
                                            <label>Mentor</label>
                                            <div className="mentor-details">
                                                <img
                                                    src={user.mentor.avatar_url || '/api/placeholder/40/40'}
                                                    alt={user.mentor.username}
                                                    className="mentor-avatar"
                                                />
                                                <span>
                                                    {user.mentor.rank?.abbreviation} {user.mentor.username}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <div className="info-card full-width">
                                    <h3>Biography</h3>
                                    <p className="bio-text">{user.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'service' && (
                    <div className="tab-content">
                        <div className="service-record">
                            <h3>Position History</h3>
                            {positions.length > 0 ? (
                                <div className="positions-timeline">
                                    {positions.map((pos, index) => (
                                        <div key={pos.id} className={`timeline-item ${pos.is_primary ? 'primary' : ''}`}>
                                            <div className="timeline-marker">
                                                <div className="marker-dot"></div>
                                                {index < positions.length - 1 && <div className="marker-line"></div>}
                                            </div>
                                            <div className="timeline-content">
                                                <div className="position-header">
                                                    <h4>{pos.position.title}</h4>
                                                    {pos.is_primary && <span className="primary-badge">PRIMARY</span>}
                                                    <span className={`status-badge ${pos.status.toLowerCase()}`}>{pos.status}</span>
                                                </div>
                                                <div className="position-details">
                                                    <span><Building size={14} /> {pos.unit.name}</span>
                                                    <span><Calendar size={14} /> {formatDate(pos.assignment_date)}</span>
                                                </div>
                                                {pos.position.is_command_position && (
                                                    <span className="command-badge">Command Position</span>
                                                )}
                                                {pos.position.is_staff_position && (
                                                    <span className="staff-badge">Staff Position</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No position history</p>
                            )}

                            {/* Service Milestones */}
                            <h3>Service Milestones</h3>
                            <div className="milestones-grid">
                                <div className="milestone-card">
                                    <Calendar size={24} />
                                    <h5>Application Date</h5>
                                    <p>{formatDate(user.application_date)}</p>
                                </div>
                                <div className="milestone-card">
                                    <School size={24} />
                                    <h5>BIT Completion</h5>
                                    <p>{formatDate(user.bit_completion_date)}</p>
                                </div>
                                <div className="milestone-card">
                                    <Shield size={24} />
                                    <h5>Branch Induction</h5>
                                    <p>{formatDate(user.branch_induction_date)}</p>
                                </div>
                                <div className="milestone-card">
                                    <Building size={24} />
                                    <h5>Unit Assignment</h5>
                                    <p>{formatDate(user.unit_assignment_date)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div className="tab-content">
                        <div className="training-section">
                            <h3>Certifications ({statistics.active_certificates} Active)</h3>
                            {certificates.length > 0 ? (
                                <div className="certificates-grid">
                                    {certificates.map(cert => (
                                        <div key={cert.id} className={`certificate-card ${!cert.is_active ? 'inactive' : ''}`}>
                                            {cert.certificate_badge && (
                                                <img
                                                    src={cert.certificate_badge}
                                                    alt={cert.certificate_name}
                                                    className="cert-badge"
                                                />
                                            )}
                                            <div className="cert-info">
                                                <h4>{cert.certificate_name}</h4>
                                                <p className="cert-code">{cert.certificate_code}</p>
                                                <div className="cert-details">
                                                    <span><Calendar size={14} /> Issued: {formatDate(cert.issue_date)}</span>
                                                    {cert.expiry_date && (
                                                        <span className={new Date(cert.expiry_date) < new Date() ? 'expired' : ''}>
                                                            <Clock size={14} /> Expires: {formatDate(cert.expiry_date)}
                                                        </span>
                                                    )}
                                                </div>
                                                {cert.issuer_username && (
                                                    <p className="cert-issuer">Issued by: {cert.issuer_username}</p>
                                                )}
                                                {cert.training_event_title && (
                                                    <p className="cert-event">Event: {cert.training_event_title}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No certifications earned</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="tab-content">
                        <div className="operations-section">
                            <div className="ops-stats">
                                <div className="stat-box">
                                    <Trophy size={24} />
                                    <div>
                                        <div className="stat-number">{statistics.completed_operations}</div>
                                        <div className="stat-label">Completed</div>
                                    </div>
                                </div>
                                <div className="stat-box">
                                    <Target size={24} />
                                    <div>
                                        <div className="stat-number">{statistics.upcoming_operations}</div>
                                        <div className="stat-label">Upcoming</div>
                                    </div>
                                </div>
                            </div>

                            <h3>Operation History</h3>
                            {events.length > 0 ? (
                                <div className="operations-list">
                                    {events.map(event => (
                                        <div key={event.id} className="operation-item">
                                            <div className="op-header">
                                                <h4>{event.title}</h4>
                                                <span className={`op-type ${event.event_type.toLowerCase()}`}>
                                                    {event.event_type}
                                                </span>
                                            </div>
                                            <p className="op-description">{event.description}</p>
                                            <div className="op-details">
                                                <span><Calendar size={14} /> {formatDateTime(event.start_time)}</span>
                                                <span><MapPin size={14} /> {event.location}</span>
                                                {event.host_unit && (
                                                    <span><Building size={14} /> {event.host_unit.name}</span>
                                                )}
                                            </div>
                                            <div className="op-attendance">
                                                <span className={`attendance-status ${event.attendance_status.toLowerCase()}`}>
                                                    {event.attendance_status}
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
                                <p className="no-data">No operations participated</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'ships' && ships.length > 0 && (
                    <div className="tab-content">
                        <div className="ships-section">
                            <h3>Assigned Ships</h3>
                            <div className="ships-grid">
                                {ships.map(ship => (
                                    <div key={ship.id} className="ship-card">
                                        <div className="ship-header">
                                            <Ship size={24} />
                                            <h4>{ship.name}</h4>
                                        </div>
                                        <div className="ship-details">
                                            <div className="detail-row">
                                                <label>Class:</label>
                                                <span>{ship.ship_class}</span>
                                            </div>
                                            <div className="detail-row">
                                                <label>Hull Number:</label>
                                                <span>{ship.hull_number}</span>
                                            </div>
                                            <div className="detail-row">
                                                <label>Status:</label>
                                                <span className={`status-tag ${ship.status.toLowerCase()}`}>
                                                    {ship.status}
                                                </span>
                                            </div>
                                            {ship.assigned_unit_name && (
                                                <div className="detail-row">
                                                    <label>Unit:</label>
                                                    <span>{ship.assigned_unit_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Modals */}
            {showPromotionModal && (
                <PromotionModal
                    user={user}
                    onClose={() => setShowPromotionModal(false)}
                    onPromote={handlePromotion}
                />
            )}

            {showUnitModal && (
                <UnitAssignmentModal
                    user={user}
                    onClose={() => setShowUnitModal(false)}
                    onAssign={handleUnitAssignment}
                />
            )}

            {showPositionModal && (
                <PositionAssignmentModal
                    user={user}
                    onClose={() => setShowPositionModal(false)}
                    onAssign={handlePositionAssignment}
                />
            )}
        </div>
    );
};

export default UserProfile;
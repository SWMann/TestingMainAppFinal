import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Shield, User, Calendar, Award, Star, MapPin, Clock,
    ChevronRight, Mail, Hash, Briefcase, Ship, Trophy,
    Edit, UserPlus, ChevronUp, ChevronDown, AlertCircle,
    Building, Users, FileText, Activity, Target, School,
    Rocket, Globe, Zap, Navigation, TrendingUp, History
} from 'lucide-react';
import './ProfilePage.css';

import api from "../../../services/api";
import PromotionModal from "../../modals/PromotionModal";
import UnitAssignmentModal from "../../modals/UnitAssignmentModal";
import PositionAssignmentModal from "../../modals/PositionAssignmentModal";
import { ForcePromotionModal, WaiverCreationModal, PromotionHistoryModal } from "../../modals/PromotionAdminModals";
import PromotionProgress from "../../common/PromotionProgess";

const UserProfile = () => {
    const { serviceNumber } = useParams(); // This can be a UUID, service number, or undefined
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [ranks, setRanks] = useState([]);

    // Admin modals
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const [showForcePromotionModal, setShowForcePromotionModal] = useState(false);
    const [showPromotionHistoryModal, setShowPromotionHistoryModal] = useState(false);
    const [promotionProgress, setPromotionProgress] = useState(null);
    const [nextRankForPromotion, setNextRankForPromotion] = useState(null);

    // Helper function to check if a string is a UUID
    const isUUID = (str) => {
        if (!str) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    // Check if current user is an officer
    const isOfficer = currentUser?.current_rank?.is_officer || currentUser?.is_admin;

    // Determine if viewing own profile (will be updated after data loads)
    const [isOwnProfile, setIsOwnProfile] = useState(true);

    useEffect(() => {
        // Update isOwnProfile when profile data loads
        if (profileData && currentUser) {
            setIsOwnProfile(profileData.user.id === currentUser.id);
        }
    }, [profileData, currentUser]);

    useEffect(() => {
        fetchProfileData();
        fetchRanks();
    }, [serviceNumber]);

    useEffect(() => {
        // Fetch promotion progress if viewing another user and is admin
        if (profileData && !isOwnProfile && isOfficer) {
            fetchPromotionProgress();
        }
    }, [profileData, isOwnProfile, isOfficer]);

    const fetchRanks = async () => {
        try {
            const response = await api.get('/ranks/');
            setRanks(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching ranks:', err);
        }
    };

    const fetchPromotionProgress = async () => {
        try {
            const response = await api.get(`/promotions/progress/${profileData.user.id}/`);
            setPromotionProgress(response.data);
        } catch (err) {
            console.error('Error fetching promotion progress:', err);
        }
    };

    const fetchProfileData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (!serviceNumber) {
                // No parameter provided - fetch current user's profile
                console.log('Fetching current user profile');
                response = await api.get('/users/profile/me/');
            } else if (isUUID(serviceNumber)) {
                // Parameter is a UUID - fetch profile directly
                console.log('Fetching profile by UUID:', serviceNumber);
                response = await api.get(`/users/profile/${serviceNumber}/`);
            } else {
                // Parameter is a service number - need to search first
                console.log('Searching for user by service number:', serviceNumber);
                const searchResponse = await api.get('/users/', {
                    params: { service_number: serviceNumber }
                });

                const users = searchResponse.data.results || searchResponse.data;

                if (!Array.isArray(users) || users.length === 0) {
                    throw new Error(`No pilot found with service number: ${serviceNumber}`);
                }

                // Get the first matching user's ID
                const userId = users[0].id;
                console.log('Found user with ID:', userId);

                // Now fetch their profile
                response = await api.get(`/users/profile/${userId}/`);
            }

            console.log('Profile data received:', response.data);
            setProfileData(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);

            if (err.response?.status === 404) {
                setError('Pilot profile not found');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Failed to load profile data');
            }
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

    const handlePromotion = async (promotionData) => {
        // If promotionData is just a rank ID (from old modal), convert it
        if (typeof promotionData === 'string') {
            try {
                await api.put(`/users/${profileData.user.id}/sensitive-fields/`, {
                    current_rank: promotionData
                });
                await fetchProfileData();
                setShowPromotionModal(false);
            } catch (err) {
                console.error('Error promoting user:', err);
                alert('Failed to update rank');
            }
        } else {
            // New promotion system - refresh data after successful promotion
            await fetchProfileData();
            await fetchPromotionProgress();
            setShowForcePromotionModal(false);
            // Show success message or notification
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
            await api.post(`/units/positions/${positionData.position}/assign/`, {
                user_id: profileData.user.id,
                status: 'active',
                assignment_type: positionData.is_primary ? 'primary' : 'secondary'
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
                <p>ACCESSING PERSONNEL DATABASE...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <AlertCircle size={48} />
                <h2>ERROR ACCESSING PROFILE</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>RETURN TO COMMAND</button>
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
                        src={user.background_image_url || 'https://media.robertsspaceindustries.com/i2gtmrav2ffcr/source.jpg'}
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
                                src={user.current_rank.insignia_display_url || user.current_rank.insignia_image || user.current_rank.insignia_image_url}
                                alt={`${user.current_rank.name} insignia`}
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
                                    <span className="status-badge admin">FLEET ADMIN</span>
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
                                <Globe size={16} />
                                <span>{user.primary_unit?.name || 'No Squadron Assignment'}</span>
                            </div>
                            <div className="detail-item">
                                <Calendar size={16} />
                                <span>Enlisted {formatDate(user.join_date)}</span>
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
                                    QUICK RANK CHANGE
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={() => setShowForcePromotionModal(true)}
                                >
                                    <TrendingUp size={16} />
                                    PROMOTE
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={() => setShowPromotionHistoryModal(true)}
                                >
                                    <History size={16} />
                                    HISTORY
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={() => setShowUnitModal(true)}
                                >
                                    <Globe size={16} />
                                    ASSIGN SQUADRON
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={() => setShowPositionModal(true)}
                                >
                                    <Briefcase size={16} />
                                    ASSIGN POSITION
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-value">{statistics.days_in_service}</div>
                            <div className="stat-label">Days Active</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{statistics.completed_operations}</div>
                            <div className="stat-label">Missions</div>
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
                    OVERVIEW
                </button>
                <button
                    className={activeTab === 'service' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('service')}
                >
                    <Briefcase size={18} />
                    SERVICE RECORD
                </button>
                <button
                    className={activeTab === 'training' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('training')}
                >
                    <Award size={18} />
                    CERTIFICATIONS
                </button>
                <button
                    className={activeTab === 'promotion' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('promotion')}
                >
                    <TrendingUp size={18} />
                    PROMOTION
                </button>
                <button
                    className={activeTab === 'operations' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('operations')}
                >
                    <Rocket size={18} />
                    MISSIONS
                </button>
                {ships.length > 0 && (
                    <button
                        className={activeTab === 'ships' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('ships')}
                    >
                        <Ship size={18} />
                        FLEET
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
                                <h3>PILOT INFORMATION</h3>
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
                                <h3>SQUADRON ASSIGNMENT</h3>
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
                                    <p className="no-data">No squadron assignment</p>
                                )}
                            </div>

                            {/* MOS Information */}
                            <div className="info-card">
                                <h3>SPECIALIZATION</h3>
                                {user.primary_mos || user.secondary_mos?.length > 0 ? (
                                    <div className="mos-assignment">
                                        {user.primary_mos && (
                                            <div className="primary-mos">
                                                <h4>PRIMARY SPECIALIZATION</h4>
                                                <div className="mos-display">
                                                    <div className="mos-badge">
                                                        <span className="mos-code">{user.primary_mos.code}</span>
                                                    </div>
                                                    <div className="mos-details">
                                                        <h5>{user.primary_mos.title}</h5>
                                                        <p className="mos-category">{user.primary_mos.category?.replace(/_/g, ' ')}</p>
                                                        {user.mos_skill_level && (
                                                            <p className="skill-level">Skill Level: {user.mos_skill_level}</p>
                                                        )}
                                                        {user.mos_qualified_date && (
                                                            <p className="qualified-date">
                                                                Qualified: {formatDate(user.mos_qualified_date)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user.secondary_mos?.length > 0 && (
                                            <div className="secondary-mos">
                                                <h4>ADDITIONAL QUALIFICATIONS</h4>
                                                <div className="secondary-mos-list">
                                                    {user.secondary_mos.map(mos => (
                                                        <div key={mos.id} className="secondary-mos-item">
                                                            <span className="mos-code-small">{mos.code}</span>
                                                            <span>{mos.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="no-data">No specialization assigned</p>
                                )}
                            </div>

                            {/* Branch Information */}
                            {user.branch && (
                                <div className="info-card">
                                    <h3>DIVISION</h3>
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
                                <h3>CAREER PROGRESSION</h3>
                                <div className="progression-info">
                                    <div className="info-item">
                                        <label>Training Status</label>
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
                                            <label>Flight Instructor</label>
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
                                    <h3>PILOT BIOGRAPHY</h3>
                                    <p className="bio-text">{user.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'service' && (
                    <div className="tab-content">
                        <div className="service-record">
                            <h3>POSITION HISTORY</h3>
                            {positions.length > 0 ? (
                                <div className="positions-timeline">
                                    {positions.map((pos, index) => (
                                        <div key={pos.id} className={`timeline-item ${pos.assignment_type === 'primary' ? 'primary' : ''}`}>
                                            <div className="timeline-marker">
                                                <div className="marker-dot"></div>
                                                {index < positions.length - 1 && <div className="marker-line"></div>}
                                            </div>
                                            <div className="timeline-content">
                                                <div className="position-header">
                                                    <h4>{pos.position_details?.display_title || 'Unknown Position'}</h4>
                                                    {pos.assignment_type === 'primary' && <span className="primary-badge">PRIMARY</span>}
                                                    <span className={`status-badge ${pos.status.toLowerCase()}`}>{pos.status}</span>
                                                </div>
                                                <div className="position-details">
                                                    <span><Globe size={14} /> {pos.unit_details?.name || 'Unknown Unit'}</span>
                                                    <span><Calendar size={14} /> {formatDate(pos.assignment_date)}</span>
                                                </div>
                                                {pos.position_details?.role?.is_command_role && (
                                                    <span className="command-badge">Command Position</span>
                                                )}
                                                {pos.position_details?.role?.is_staff_role && (
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
                            <h3>SERVICE MILESTONES</h3>
                            <div className="milestones-grid">
                                <div className="milestone-card">
                                    <Calendar size={24} />
                                    <h5>Application Date</h5>
                                    <p>{formatDate(user.application_date)}</p>
                                </div>
                                <div className="milestone-card">
                                    <School size={24} />
                                    <h5>Academy Completion</h5>
                                    <p>{formatDate(user.bit_completion_date)}</p>
                                </div>
                                <div className="milestone-card">
                                    <Shield size={24} />
                                    <h5>Division Induction</h5>
                                    <p>{formatDate(user.branch_induction_date)}</p>
                                </div>
                                <div className="milestone-card">
                                    <Globe size={24} />
                                    <h5>Squadron Assignment</h5>
                                    <p>{formatDate(user.unit_assignment_date)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div className="tab-content">
                        <div className="training-section">
                            <h3>FLIGHT CERTIFICATIONS ({statistics.active_certificates} Active)</h3>
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
                                                    <p className="cert-issuer">Certified by: {cert.issuer_username}</p>
                                                )}
                                                {cert.training_event_title && (
                                                    <p className="cert-event">Training: {cert.training_event_title}</p>
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

                {activeTab === 'promotion' && (
                    <div className="tab-content">
                        <PromotionProgress
                            userId={isOwnProfile ? null : user.id}
                            isAdmin={isOfficer && !isOwnProfile}
                            onPromote={(rankId) => {
                                // Set the next rank for the force promotion modal
                                const nextRank = ranks?.find(r => r.id === rankId);
                                if (nextRank) {
                                    setNextRankForPromotion(nextRank);
                                    setShowForcePromotionModal(true);
                                }
                            }}
                        />
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
                                        <div className="stat-label">Scheduled</div>
                                    </div>
                                </div>
                            </div>

                            <h3>MISSION LOG</h3>
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
                                                <span><Navigation size={14} /> {event.location}</span>
                                                {event.host_unit && (
                                                    <span><Globe size={14} /> {event.host_unit.name}</span>
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
                                <p className="no-data">No missions participated</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'ships' && ships.length > 0 && (
                    <div className="tab-content">
                        <div className="ships-section">
                            <h3>ASSIGNED VESSELS</h3>
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
                                                <label>Registry:</label>
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
                                                    <label>Squadron:</label>
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

            {showForcePromotionModal && (
                <ForcePromotionModal
                    user={user}
                    currentRank={user.current_rank}
                    nextRank={nextRankForPromotion || promotionProgress?.next_rank_details}
                    promotionProgress={promotionProgress}
                    onClose={() => setShowForcePromotionModal(false)}
                    onPromote={handlePromotion}
                />
            )}

            {showPromotionHistoryModal && (
                <PromotionHistoryModal
                    user={user}
                    onClose={() => setShowPromotionHistoryModal(false)}
                />
            )}
        </div>
    );
};

export default UserProfile;
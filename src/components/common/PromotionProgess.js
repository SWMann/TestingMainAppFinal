import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Award, Clock, CheckCircle, XCircle,
    AlertCircle, Target, Calendar, Shield, FileText,
    Users, Briefcase, Star, ChevronRight, Crown
} from 'lucide-react';
import './PromotionProgress.css';
import api from "../../services/api";
import { WaiverCreationModal } from "../modals/PromotionAdminModals";

const PromotionProgress = ({ userId, isAdmin, onPromote, currentUser }) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRequirements, setExpandedRequirements] = useState({});
    const [showWaiverModal, setShowWaiverModal] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [userRankHistory, setUserRankHistory] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchPromotionProgress();
            fetchProfileData();
            fetchRankHistory();
        } else {
            setLoading(false);
            setError('No user ID provided');
        }
    }, [userId]);

    const fetchPromotionProgress = async () => {
        if (!userId) {
            console.warn('No userId provided to fetchPromotionProgress');
            return;
        }

        try {
            setLoading(true);
            const endpoint = `/promotions/progress/${userId}/`;
            const response = await api.get(endpoint);
            setProgress(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching promotion progress:', err);
            setError('Failed to load promotion progress');
        } finally {
            setLoading(false);
        }
    };

    const fetchRankHistory = async () => {
        if (!userId) return;

        try {
            const response = await api.get(`/users/${userId}/rank-progression/`);
            console.log('Rank history received:', response.data);
            setUserRankHistory(response.data);
        } catch (error) {
            console.error('Error fetching rank history:', error);
        }
    };

    const fetchProfileData = async () => {
        if (!userId) {
            console.warn('No userId provided to fetchProfileData');
            return;
        }

        try {
            const response = await api.get(`/users/${userId}/`);
            console.log('Profile data received:', response.data);
            setProfileData(response.data);

            // Debug: Check rank data structure
            console.log('[Profile Debug] User rank data:', {
                current_rank: response.data.user?.current_rank,
                rank: response.data.user?.rank,
                user_fields: Object.keys(response.data.user || {}),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setError('Failed to load profile data');
        }
    };

    const toggleRequirement = (reqId) => {
        setExpandedRequirements(prev => ({
            ...prev,
            [reqId]: !prev[reqId]
        }));
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'time_based': Clock,
            'position_based': Briefcase,
            'qualification_based': Award,
            'deployment_based': Target,
            'performance_based': Star,
            'administrative': FileText
        };
        return icons[category] || Shield;
    };

    const formatRequirementValue = (requirement) => {
        const { requirement_type, current_value, required_value } = requirement;

        if (requirement_type.includes('time')) {
            const current = parseInt(current_value) || 0;
            const required = parseInt(required_value) || 0;
            const remaining = Math.max(0, required - current);

            if (remaining === 0) return 'Requirement met';

            if (remaining < 30) return `${remaining} days remaining`;
            if (remaining < 365) return `${Math.floor(remaining / 30)} months remaining`;
            return `${Math.floor(remaining / 365)} years remaining`;
        }

        return `${current_value} / ${required_value}`;
    };

    const getProgressBarColor = (percentage) => {
        if (percentage === 100) return '#00ff88';
        if (percentage >= 75) return '#42c8f4';
        if (percentage >= 50) return '#ffaa00';
        return '#ff3333';
    };

    // Handle various error and loading states
    if (!userId) {
        return (
            <div className="promotion-error">
                <AlertCircle size={24} />
                <p>No user ID provided</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="promotion-loading">
                <div className="loading-spinner"></div>
                <p>ANALYZING PROMOTION ELIGIBILITY...</p>
            </div>
        );
    }

    if (error || !progress) {
        return (
            <div className="promotion-error">
                <AlertCircle size={24} />
                <p>{error || 'No promotion data available'}</p>
            </div>
        );
    }

    if (!progress.next_rank_details) {
        return (
            <div className="promotion-complete">
                <Crown size={48} />
                <h3>MAXIMUM RANK ACHIEVED</h3>
                <p>You have reached the highest available rank</p>
            </div>
        );
    }

    // Destructure progress data
    const {
        next_rank_details,
        overall_eligible,
        eligibility_percentage,
        requirements_summary,
        detailed_requirements,
        time_estimates,
        board_eligible,
        board_scheduled_date
    } = progress;

    // Get current rank from user data or profile data
    const current_rank = currentUser?.current_rank || profileData?.current_rank || userRankHistory?.current_rank || progress.current_rank;

    // Group requirements by category
    const requirementsByCategory = {};
    detailed_requirements?.forEach(req => {
        const category = req.category;
        if (!requirementsByCategory[category]) {
            requirementsByCategory[category] = [];
        }
        requirementsByCategory[category].push(req);
    });

    // Get user data from profile
    const user = profileData?.user || profileData || {};
    const positions = profileData?.positions || [];
    const certificates = profileData?.certificates || [];
    const events = profileData?.events || [];
    const ships = profileData?.ships || [];
    const statistics = profileData?.statistics || {};

    return (
        <div className="promotion-progress-container">
            {/* Header Section */}
            <div className="promotion-header">
                <div className="next-rank-info">
                    <div className="rank-progression">
                        <div className="current-rank">
                            <span className="label">Current</span>
                            {current_rank && (
                                <img
                                    src={current_rank.insignia_display_url || current_rank.insignia_image_url || current_rank.insignia_image}
                                    alt="Current rank"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <div className="rank-details">
                                <h3>{current_rank?.abbreviation || 'N/A'}</h3>
                                <p>{current_rank?.name || 'No Rank'}</p>
                            </div>
                        </div>
                        <ChevronRight size={24} className="progression-arrow" />
                        <div className="next-rank">
                            <span className="label">Next</span>
                            {next_rank_details?.insignia_display_url && (
                                <img
                                    src={next_rank_details.insignia_display_url}
                                    alt={next_rank_details.name}
                                />
                            )}
                            <div className="rank-details">
                                <h3>{next_rank_details?.abbreviation || 'N/A'}</h3>
                                <p>{next_rank_details?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="overall-progress">
                    <div className="progress-stats">
                        <div className="stat">
                            <span className="value">{requirements_summary?.met || 0}</span>
                            <span className="label">Met</span>
                        </div>
                        <div className="stat">
                            <span className="value">{requirements_summary?.pending || 0}</span>
                            <span className="label">Pending</span>
                        </div>
                        <div className="stat">
                            <span className="value">{requirements_summary?.waived || 0}</span>
                            <span className="label">Waived</span>
                        </div>
                    </div>

                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${eligibility_percentage || 0}%`,
                                    backgroundColor: getProgressBarColor(eligibility_percentage || 0)
                                }}
                            />
                        </div>
                        <span className="progress-percentage">{Math.round(eligibility_percentage || 0)}%</span>
                    </div>

                    {overall_eligible && (
                        <div className="eligible-badge">
                            <CheckCircle size={20} />
                            ELIGIBLE FOR PROMOTION
                        </div>
                    )}
                </div>
            </div>

            {/* Time Estimates */}
            {time_estimates && !overall_eligible && (
                <div className="time-estimates">
                    <Calendar size={20} />
                    <div className="estimate-content">
                        {time_estimates.days_until_eligible ? (
                            <>
                                <p>Estimated eligibility: <strong>{time_estimates.estimated_eligibility_date}</strong></p>
                                <p className="blocking-req">
                                    Blocked by: {time_estimates.blocking_requirements?.[0]?.requirement}
                                </p>
                            </>
                        ) : (
                            <p>Complete all non-time based requirements to determine eligibility date</p>
                        )}
                    </div>
                </div>
            )}

            {/* Board Status */}
            {board_eligible && (
                <div className="board-status">
                    <Users size={20} />
                    <div className="board-content">
                        {board_scheduled_date ? (
                            <p>Promotion board scheduled: <strong>{new Date(board_scheduled_date).toLocaleDateString()}</strong></p>
                        ) : (
                            <p>Eligible for promotion board review</p>
                        )}
                    </div>
                </div>
            )}

            {/* Requirements by Category */}
            <div className="requirements-section">
                <h3>PROMOTION REQUIREMENTS</h3>

                {Object.entries(requirementsByCategory).map(([category, requirements]) => {
                    const Icon = getCategoryIcon(category);
                    const categoryMet = requirements.every(req => req.is_met);

                    return (
                        <div key={category} className="requirement-category">
                            <div
                                className={`category-header ${categoryMet ? 'complete' : ''}`}
                                onClick={() => toggleRequirement(category)}
                            >
                                <Icon size={20} />
                                <h4>{category.replace(/_/g, ' ').toUpperCase()}</h4>
                                <div className="category-status">
                                    {categoryMet ? (
                                        <CheckCircle size={18} className="complete-icon" />
                                    ) : (
                                        <span className="pending-count">
                                            {requirements.filter(r => !r.is_met).length} pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            {expandedRequirements[category] && (
                                <div className="category-requirements">
                                    {requirements.map(req => (
                                        <div
                                            key={req.requirement_id}
                                            className={`requirement-item ${req.is_met ? 'met' : ''} ${req.is_waived ? 'waived' : ''}`}
                                        >
                                            <div className="requirement-status">
                                                {req.is_met ? (
                                                    <CheckCircle size={16} />
                                                ) : (
                                                    <XCircle size={16} />
                                                )}
                                            </div>

                                            <div className="requirement-details">
                                                <p className="requirement-text">{req.display_text}</p>

                                                {!req.is_met && (
                                                    <div className="requirement-progress">
                                                        <span className="current-value">
                                                            {formatRequirementValue(req)}
                                                        </span>

                                                        {req.progress_percentage < 100 && (
                                                            <div className="mini-progress-bar">
                                                                <div
                                                                    className="mini-progress-fill"
                                                                    style={{
                                                                        width: `${req.progress_percentage}%`,
                                                                        backgroundColor: getProgressBarColor(req.progress_percentage)
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {req.is_waived && (
                                                    <span className="waiver-badge">WAIVED</span>
                                                )}

                                                {req.details && (
                                                    <div className="requirement-extra-details">
                                                        {req.details.certification && (
                                                            <p>Required: {req.details.certification.name}</p>
                                                        )}
                                                        {req.details.position && (
                                                            <p>Position: {req.details.position.role}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {req.waiverable && isAdmin && !req.is_met && !req.is_waived && (
                                                    <button
                                                        className="waiver-button"
                                                        onClick={() => {
                                                            setSelectedRequirement(req);
                                                            setShowWaiverModal(true);
                                                        }}
                                                    >
                                                        <FileText size={14} />
                                                        WAIVE
                                                    </button>
                                                )}
                                            </div>

                                            {!req.is_mandatory && (
                                                <span className="optional-badge">OPTIONAL</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Admin Actions */}
            {isAdmin && overall_eligible && onPromote && next_rank_details?.id && (
                <div className="admin-promotion-actions">
                    <button
                        className="promote-button"
                        onClick={() => onPromote(next_rank_details.id)}
                        disabled={!next_rank_details.id}
                    >
                        <TrendingUp size={18} />
                        PROMOTE TO {next_rank_details.abbreviation || 'NEXT RANK'}
                    </button>
                </div>
            )}

            {/* Waiver Modal */}
            {showWaiverModal && selectedRequirement && (
                <WaiverCreationModal
                    user={{ id: userId }}
                    requirement={selectedRequirement}
                    onClose={() => {
                        setShowWaiverModal(false);
                        setSelectedRequirement(null);
                    }}
                    onWaiver={() => {
                        // Refresh promotion progress after waiver
                        fetchPromotionProgress();
                    }}
                />
            )}
        </div>
    );
};

export default PromotionProgress;
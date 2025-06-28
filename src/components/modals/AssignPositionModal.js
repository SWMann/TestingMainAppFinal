import React, { useState, useEffect } from 'react';
import {
    X, UserCheck, Search, AlertCircle, Calendar, Award,
    Check, XCircle, Clock, Shield, ChevronRight, AlertTriangle,
    Info
} from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

export const AssignPositionModal = ({ position, onClose, onAssign }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [eligibleUsers, setEligibleUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [forceAssign, setForceAssign] = useState(false);
    const [userRequirements, setUserRequirements] = useState({});
    const [checkingRequirements, setCheckingRequirements] = useState(false);
    const [positionMOSRequirements, setPositionMOSRequirements] = useState(null);

    useEffect(() => {
        fetchEligibleUsers();
        fetchPositionMOSRequirements();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            checkUserRequirements(selectedUser.id);
        }
    }, [selectedUser]);

    const fetchPositionMOSRequirements = async () => {
        try {
            const response = await api.get(`/positions/${position.id}/`);
            setPositionMOSRequirements({
                required_mos: response.data.required_mos || [],
                preferred_mos: response.data.preferred_mos || []
            });
        } catch (error) {
            console.error('Error fetching position MOS requirements:', error);
        }
    };

    const fetchEligibleUsers = async () => {
        try {
            // Fetch eligible users for this position's role
            const eligibleResponse = await api.get(`/roles/${position.role}/eligible-users/`);
            setEligibleUsers(eligibleResponse.data.eligible_users || []);

            // Also fetch all users for comparison
            const allResponse = await api.get('/users/', {
                params: { is_active: true }
            });
            setAllUsers(allResponse.data.results || allResponse.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to just fetching all users
            try {
                const response = await api.get('/users/', {
                    params: { is_active: true }
                });
                setAllUsers(response.data.results || response.data);
                setEligibleUsers([]);
            } catch (fallbackError) {
                console.error('Error fetching all users:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const checkUserRequirements = async (userId) => {
        setCheckingRequirements(true);
        try {
            const response = await api.get(`/positions/${position.id}/requirement_check/`, {
                params: { user_id: userId }
            });
            setUserRequirements(response.data);
        } catch (error) {
            console.error('Error checking requirements:', error);
            setUserRequirements({});
        } finally {
            setCheckingRequirements(false);
        }
    };

    const checkMOSRequirement = (user) => {
        if (!positionMOSRequirements || positionMOSRequirements.required_mos.length === 0) {
            return { meets: true, message: 'No MOS requirements' };
        }

        const userMOSIds = [
            user.primary_mos?.id || user.primary_mos,
            ...(user.secondary_mos?.map(mos => mos.id || mos) || [])
        ].filter(Boolean);

        const hasRequiredMOS = positionMOSRequirements.required_mos.some(requiredMOS =>
            userMOSIds.includes(requiredMOS.id || requiredMOS)
        );

        if (!hasRequiredMOS) {
            const requiredMOSCodes = positionMOSRequirements.required_mos
                .map(mos => mos.code || 'Unknown')
                .join(', ');
            return {
                meets: false,
                message: `Requires one of: ${requiredMOSCodes}`,
                required: requiredMOSCodes,
                userHas: user.primary_mos?.code || 'None'
            };
        }

        return { meets: true, message: 'MOS requirement met' };
    };

    const displayedUsers = showAllUsers ? allUsers : eligibleUsers;

    const filteredUsers = displayedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.discord_id?.includes(searchTerm) ||
        user.service_number?.includes(searchTerm)
    );

    const isUserEligible = (user) => {
        return eligibleUsers.some(eligible => eligible.id === user.id);
    };

    const handleSubmit = async () => {
        if (selectedUser) {
            try {
                await onAssign(position.id, selectedUser.id, forceAssign);
                onClose();
            } catch (error) {
                // Handle error response that includes requirement failures
                if (error.response?.data?.requirement_failures) {
                    // The modal will stay open and show the requirement failures
                    setUserRequirements({
                        meets_all_requirements: false,
                        requirement_checks: error.response.data.requirement_failures.map(failure => ({
                            requirement: failure.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            required: failure.required_value,
                            user_has: failure.user_value,
                            meets: false,
                            message: failure.message
                        }))
                    });
                    // Automatically enable force option when requirements fail
                    setForceAssign(true);
                }
            }
        }
    };

    const RequirementCheck = ({ check }) => {
        const Icon = check.meets ? Check : XCircle;
        const className = check.meets ? 'requirement-met' : 'requirement-not-met';

        return (
            <div className={`requirement-check ${className}`}>
                <Icon size={16} />
                <div className="requirement-details">
                    <div className="requirement-name">{check.requirement}</div>
                    <div className="requirement-values">
                        <span className="user-value">Has: {check.user_has}</span>
                        <span className="separator">•</span>
                        <span className="required-value">Needs: {check.required}</span>
                    </div>
                    {check.message && (
                        <div className="requirement-message">{check.message}</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-header">
                    <h2>
                        <UserCheck size={24} />
                        Assign Position: {position.display_title || position.role_name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="position-details-box">
                        <h4>Position Details</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="label">Unit:</span>
                                <span>{position.unit_name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Role:</span>
                                <span className={`category-badge ${position.role_category}`}>
                                    {position.role_name}
                                </span>
                            </div>
                            {position.role_details?.min_rank && (
                                <div className="detail-item">
                                    <span className="label">Required Rank:</span>
                                    <span>
                                        {position.role_details.min_rank_details?.abbreviation}
                                        {position.role_details.max_rank && ` - ${position.role_details.max_rank_details?.abbreviation}`}
                                    </span>
                                </div>
                            )}
                            {position.role_details?.min_time_in_service > 0 && (
                                <div className="detail-item">
                                    <span className="label">Time in Service:</span>
                                    <span>{position.role_details.min_time_in_service} days minimum</span>
                                </div>
                            )}
                            {positionMOSRequirements?.required_mos.length > 0 && (
                                <div className="detail-item">
                                    <span className="label">Required MOS:</span>
                                    <span>
                                        {positionMOSRequirements.required_mos
                                            .map(mos => mos.code || 'Unknown')
                                            .join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="user-filter-section">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={showAllUsers}
                                    onChange={(e) => setShowAllUsers(e.target.checked)}
                                />
                                Show all users (including ineligible)
                            </label>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <div className="assignment-content">
                            <div className="users-section">
                                <h4>Select User</h4>
                                {filteredUsers.length === 0 ? (
                                    <div className="empty-state">
                                        <AlertCircle size={24} />
                                        <p>
                                            {showAllUsers
                                                ? "No users found matching your search"
                                                : "No eligible users found for this position"}
                                        </p>
                                        {!showAllUsers && (
                                            <button
                                                className="btn secondary"
                                                onClick={() => setShowAllUsers(true)}
                                            >
                                                Show All Users
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="users-list">
                                        {filteredUsers.map(user => {
                                            const eligible = isUserEligible(user);
                                            const mosCheck = checkMOSRequirement(user);

                                            return (
                                                <div
                                                    key={user.id}
                                                    className={`user-option ${selectedUser?.id === user.id ? 'selected' : ''} ${!eligible && showAllUsers ? 'ineligible' : ''}`}
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <img
                                                        src={user.avatar_url || '/default-avatar.png'}
                                                        alt={user.username}
                                                        className="user-avatar"
                                                    />
                                                    <div className="user-info">
                                                        <div className="user-name">
                                                            {user.current_rank?.abbreviation} {user.username}
                                                        </div>
                                                        <div className="user-meta">
                                                            {user.primary_unit?.name || 'No unit assigned'}
                                                            {user.service_number && ` • ${user.service_number}`}
                                                        </div>
                                                        {user.primary_mos && (
                                                            <div className="user-mos">
                                                                <Award size={12} />
                                                                {user.primary_mos.code} - {user.primary_mos.title}
                                                            </div>
                                                        )}
                                                        {user.commission_stage && (
                                                            <div className="user-stage">
                                                                <Award size={12} />
                                                                {user.commission_stage.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="user-status">
                                                        {eligible && mosCheck.meets ? (
                                                            <span className="eligible-badge">
                                                                <Check size={14} />
                                                                Eligible
                                                            </span>
                                                        ) : (
                                                            <span className="ineligible-badge">
                                                                <Info size={14} />
                                                                {!mosCheck.meets ? 'MOS Mismatch' : 'Check Requirements'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {selectedUser && (
                                <div className="requirements-section">
                                    <h4>
                                        <Shield size={18} />
                                        Requirement Check for {selectedUser.username}
                                    </h4>

                                    {checkingRequirements ? (
                                        <div className="checking-requirements">
                                            <div className="spinner small"></div>
                                            <p>Checking requirements...</p>
                                        </div>
                                    ) : (
                                        <div className="requirements-list">
                                            {/* MOS Requirement Check */}
                                            {positionMOSRequirements && positionMOSRequirements.required_mos.length > 0 && (
                                                <RequirementCheck
                                                    check={{
                                                        requirement: 'MOS Requirement',
                                                        required: positionMOSRequirements.required_mos
                                                            .map(mos => mos.code || 'Unknown')
                                                            .join(', '),
                                                        user_has: selectedUser.primary_mos?.code || 'None',
                                                        meets: checkMOSRequirement(selectedUser).meets,
                                                        message: checkMOSRequirement(selectedUser).message
                                                    }}
                                                />
                                            )}

                                            {/* Other requirement checks */}
                                            {userRequirements.requirement_checks?.map((check, index) => (
                                                <RequirementCheck key={index} check={check} />
                                            ))}

                                            {userRequirements.requirement_checks && (
                                                <>
                                                    {!userRequirements.meets_all_requirements && (
                                                        <div className="requirements-summary warning">
                                                            <AlertTriangle size={18} />
                                                            <p>
                                                                This user does not meet all requirements for this position.
                                                                You can force the assignment if needed.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {userRequirements.meets_all_requirements && checkMOSRequirement(selectedUser).meets && (
                                                        <div className="requirements-summary success">
                                                            <Check size={18} />
                                                            <p>This user meets all requirements for this position.</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {(!userRequirements.meets_all_requirements || !checkMOSRequirement(selectedUser).meets) && (
                                        <div className="force-assignment-section">
                                            <label className="force-assignment-label">
                                                <input
                                                    type="checkbox"
                                                    checked={forceAssign}
                                                    onChange={(e) => setForceAssign(e.target.checked)}
                                                />
                                                <div className="force-assignment-content">
                                                    <span className="force-title">Force Assignment</span>
                                                    <span className="force-description">
                                                        Override requirement checks and assign anyway. This action will be logged.
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`btn ${forceAssign ? 'danger' : 'primary'}`}
                        onClick={handleSubmit}
                        disabled={!selectedUser || (checkingRequirements)}
                    >
                        {forceAssign ? (
                            <>
                                <AlertTriangle size={16} />
                                Force Assign to Position
                            </>
                        ) : (
                            'Assign to Position'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
import React, { useState, useEffect } from 'react';
import {
    X, UserCheck, Search, AlertCircle, Calendar, Award
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

    useEffect(() => {
        fetchEligibleUsers();
    }, []);

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

    const displayedUsers = showAllUsers ? allUsers : eligibleUsers;

    const filteredUsers = displayedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.discord_id?.includes(searchTerm) ||
        user.service_number?.includes(searchTerm)
    );

    const isUserEligible = (user) => {
        return eligibleUsers.some(eligible => eligible.id === user.id);
    };

    const getRankComparison = (user) => {
        const userRankTier = user.current_rank?.tier || 0;
        const minTier = position.role_details?.min_rank?.tier || 0;
        const maxTier = position.role_details?.max_rank?.tier || 999;

        if (userRankTier < minTier) {
            return { status: 'below', message: 'Rank below minimum' };
        } else if (userRankTier > maxTier) {
            return { status: 'above', message: 'Rank above maximum' };
        }
        return { status: 'eligible', message: 'Rank eligible' };
    };

    const handleSubmit = () => {
        if (selectedUser) {
            onAssign(position.id, selectedUser.id);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
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
                    ) : filteredUsers.length === 0 ? (
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
                                const rankComparison = getRankComparison(user);

                                return (
                                    <div
                                        key={user.id}
                                        className={`user-option ${selectedUser?.id === user.id ? 'selected' : ''} ${!eligible && showAllUsers ? 'ineligible' : ''}`}
                                        onClick={() => eligible || showAllUsers ? setSelectedUser(user) : null}
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
                                            {user.commission_stage && (
                                                <div className="user-stage">
                                                    <Award size={12} />
                                                    {user.commission_stage.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="user-status">
                                            {eligible ? (
                                                <span className="eligible-badge">Eligible</span>
                                            ) : (
                                                <>
                                                    <span className={`rank-status ${rankComparison.status}`}>
                                                        {rankComparison.message}
                                                    </span>
                                                    {user.join_date && (
                                                        <span className="service-time">
                                                            <Calendar size={12} />
                                                            {Math.floor((new Date() - new Date(user.join_date)) / (1000 * 60 * 60 * 24))} days
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedUser && !isUserEligible(selectedUser) && (
                        <div className="warning-message">
                            <AlertCircle size={16} />
                            <p>
                                Warning: {selectedUser.username} does not meet all requirements for this position.
                                Assignment will proceed but may require justification.
                            </p>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn primary"
                        onClick={handleSubmit}
                        disabled={!selectedUser}
                    >
                        Assign to Position
                    </button>
                </div>
            </div>
        </div>
    );
};
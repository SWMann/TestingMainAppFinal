// src/components/pages/ORBAT/AssignmentModal.js
import React, { useState, useEffect } from 'react';
import {
    X, Search, UserPlus, User, Award, Calendar, Clock,
    CheckCircle, XCircle, AlertCircle, Filter, ChevronDown
} from 'lucide-react';
import api from '../../../services/api';

const AssignmentModal = ({ position, onClose, onSuccess }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [eligibleUsers, setEligibleUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Assignment form data
    const [assignmentData, setAssignmentData] = useState({
        assignment_type: 'primary',
        status: 'active',
        effective_date: new Date().toISOString().split('T')[0],
        order_number: '',
        notes: ''
    });

    // Filters
    const [filters, setFilters] = useState({
        onlyEligible: true,
        branch: '',
        rank: '',
        unit: ''
    });

    useEffect(() => {
        fetchEligibleUsers();
    }, [position]);

    const fetchEligibleUsers = async () => {
        setLoading(true);
        try {
            // Simulated API call - replace with actual endpoint
            const response = await api.get(`/roles/${position.role_info?.id}/eligible_users/`);
            setEligibleUsers(response.data.eligible_users || []);
        } catch (err) {
            console.error('Error fetching eligible users:', err);
            setError('Failed to load eligible users');

            // Fallback to all users
            try {
                const allUsersResponse = await api.get('/users/');
                setEligibleUsers(allUsersResponse.data.results || []);
            } catch (fallbackErr) {
                console.error('Error fetching all users:', fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAssignment = async () => {
        if (!selectedUser) return;

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                user_id: selectedUser.id,
                ...assignmentData
            };

            await api.post(`/positions/${position.id}/assign/`, payload);
            onSuccess();
        } catch (err) {
            console.error('Error assigning user:', err);
            setError(err.response?.data?.error || 'Failed to assign user');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = eligibleUsers.filter(user => {
        // Search filter
        if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !user.service_number?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Other filters can be added here
        return true;
    });

    const checkUserEligibility = (user) => {
        const issues = [];

        // Check rank requirements
        if (position.role_info?.min_rank && user.current_rank?.tier < position.role_info.min_rank.tier) {
            issues.push('Rank below minimum requirement');
        }

        // Add more eligibility checks as needed

        return {
            isEligible: issues.length === 0,
            issues
        };
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container assignment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <UserPlus size={24} />
                        Assign Personnel to Position
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Position Summary */}
                <div className="position-summary">
                    <h3>{position.display_title}</h3>
                    <p>{position.unit_info?.name} ({position.unit_info?.abbreviation})</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Modal Content */}
                <div className="modal-content">
                    <div className="assignment-layout">
                        {/* User Selection Panel */}
                        <div className="user-selection-panel">
                            <div className="panel-header">
                                <h3>Select Personnel</h3>
                                <button
                                    className="filter-toggle"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter size={16} />
                                    Filters
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="search-container">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by name or service number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div className="filters-section">
                                    <label className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={filters.onlyEligible}
                                            onChange={(e) => setFilters({...filters, onlyEligible: e.target.checked})}
                                        />
                                        Show only eligible personnel
                                    </label>
                                </div>
                            )}

                            {/* User List */}
                            <div className="user-list">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner" />
                                        <p>Loading personnel...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="empty-state">
                                        <User size={32} />
                                        <p>No personnel found</p>
                                    </div>
                                ) : (
                                    filteredUsers.map(user => {
                                        const eligibility = checkUserEligibility(user);
                                        return (
                                            <div
                                                key={user.id}
                                                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''} ${!eligibility.isEligible ? 'ineligible' : ''}`}
                                                onClick={() => eligibility.isEligible && setSelectedUser(user)}
                                            >
                                                <div className="user-avatar">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" />
                                                    ) : (
                                                        <User size={24} />
                                                    )}
                                                </div>
                                                <div className="user-info">
                                                    <h4>
                                                        {user.current_rank?.abbreviation} {user.username}
                                                    </h4>
                                                    <p>{user.service_number}</p>
                                                    {user.primary_unit && (
                                                        <span className="user-unit">
                                                            {user.primary_unit.abbreviation}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="eligibility-indicator">
                                                    {eligibility.isEligible ? (
                                                        <CheckCircle size={20} color="#39FF14" />
                                                    ) : (
                                                        <XCircle size={20} color="#FF4444" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Assignment Details Panel */}
                        <div className="assignment-details-panel">
                            <h3>Assignment Details</h3>

                            {selectedUser ? (
                                <>
                                    {/* Selected User Card */}
                                    <div className="selected-user-card">
                                        <div className="user-header">
                                            <div className="user-avatar-large">
                                                {selectedUser.avatar_url ? (
                                                    <img src={selectedUser.avatar_url} alt="" />
                                                ) : (
                                                    <User size={40} />
                                                )}
                                            </div>
                                            <div>
                                                <h4>
                                                    {selectedUser.current_rank?.abbreviation} {selectedUser.username}
                                                </h4>
                                                <p>{selectedUser.service_number}</p>
                                            </div>
                                        </div>

                                        <div className="user-details">
                                            <div className="detail-item">
                                                <Award size={16} />
                                                <span>Current Rank: {selectedUser.current_rank?.name || 'None'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Calendar size={16} />
                                                <span>Join Date: {new Date(selectedUser.join_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span>Time in Service: {Math.floor((Date.now() - new Date(selectedUser.join_date)) / (1000 * 60 * 60 * 24))} days</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignment Form */}
                                    <div className="assignment-form">
                                        <div className="form-group">
                                            <label>Assignment Type</label>
                                            <select
                                                value={assignmentData.assignment_type}
                                                onChange={(e) => setAssignmentData({
                                                    ...assignmentData,
                                                    assignment_type: e.target.value
                                                })}
                                            >
                                                <option value="primary">Primary Assignment</option>
                                                <option value="secondary">Secondary Assignment</option>
                                                <option value="acting">Acting Assignment</option>
                                                <option value="assistant">Assistant</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Effective Date</label>
                                            <input
                                                type="date"
                                                value={assignmentData.effective_date}
                                                onChange={(e) => setAssignmentData({
                                                    ...assignmentData,
                                                    effective_date: e.target.value
                                                })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Order Number (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., ORD-2024-001"
                                                value={assignmentData.order_number}
                                                onChange={(e) => setAssignmentData({
                                                    ...assignmentData,
                                                    order_number: e.target.value
                                                })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Notes (Optional)</label>
                                            <textarea
                                                placeholder="Additional notes about this assignment..."
                                                value={assignmentData.notes}
                                                onChange={(e) => setAssignmentData({
                                                    ...assignmentData,
                                                    notes: e.target.value
                                                })}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="no-selection">
                                    <User size={48} />
                                    <p>Select a user from the list to proceed with assignment</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleAssignment}
                        disabled={!selectedUser || submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="spinner" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Assign to Position
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;
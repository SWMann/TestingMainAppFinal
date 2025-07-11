import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Plus, Edit, Trash2, Shield, Building,
    ChevronUp, ChevronDown, MoreVertical, Mail, Calendar, Clock,
    Award, Briefcase, X, Check, AlertCircle
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import PromotionModal from "../../../modals/PromotionModal";
import UnitAssignmentModal from "../../../modals/UnitAssignmentModal";
import PositionAssignmentModal from "../../../modals/PositionAssignmentModal";
import EditUserDetailsModal from "../../../modals/EditUserDetailsModal";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [ranks, setRanks] = useState({}); // Store ranks as a map for easy lookup
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('username');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        // Fetch both users and ranks when component mounts
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch both users and ranks in parallel
            const [usersResponse, ranksResponse] = await Promise.all([
                api.get('/users/'),
                api.get('/ranks/')
            ]);

            // Process users
            setUsers(usersResponse.data.results || usersResponse.data);

            // Create a map of ranks for easy lookup by ID
            const ranksMap = {};
            const ranksData = ranksResponse.data.results || ranksResponse.data;
            ranksData.forEach(rank => {
                ranksMap[rank.id] = rank;
            });
            setRanks(ranksMap);

            console.log('Ranks loaded:', ranksMap); // Debug log
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/`);
            setSelectedUser(response.data);

            // Also fetch additional details
            const [positionsRes, certificatesRes] = await Promise.all([
                api.get(`/users/${userId}/positions/`),
                api.get(`/users/${userId}/certificates/`)
            ]);

            setSelectedUser(prev => ({
                ...prev,
                positions: positionsRes.data,
                certificates: certificatesRes.data
            }));

            setShowUserDetails(true);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handlePromote = async (newRankId, reason) => {
        try {
            console.log('Promoting user:', selectedUser.id, 'to rank:', newRankId, 'reason:', reason);

            await api.put(`/users/${selectedUser.id}/sensitive-fields/`, {
                current_rank: newRankId
            });

            // Refresh user data
            await fetchUsers();
            await fetchUserDetails(selectedUser.id);
            setShowPromotionModal(false);

            // Show success notification
            showNotification('User rank updated successfully', 'success');
        } catch (error) {
            console.error('Error updating rank:', error);
            showNotification('Failed to update rank', 'error');
        }
    };

    const handleUnitAssignment = async (unitId) => {
        try {
            await api.put(`/users/${selectedUser.id}/sensitive-fields/`, {
                primary_unit: unitId
            });

            // Refresh user data
            await fetchUsers();
            await fetchUserDetails(selectedUser.id);
            setShowUnitModal(false);

            showNotification('Unit assignment updated successfully', 'success');
        } catch (error) {
            console.error('Error assigning unit:', error);
            showNotification('Failed to assign unit', 'error');
        }
    };

    const handlePositionAssignment = async (positionData) => {
        try {
            await api.post('/user-positions/', {
                user: selectedUser.id,
                position: positionData.position,
                unit: positionData.unit,
                is_primary: positionData.is_primary
            });

            await fetchUserDetails(selectedUser.id);
            setShowPositionModal(false);

            showNotification('Position assigned successfully', 'success');
        } catch (error) {
            console.error('Error assigning position:', error);
            showNotification('Failed to assign position', 'error');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/users/${userId}/`, {
                is_active: !currentStatus
            });

            await fetchUsers();
            showNotification(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        } catch (error) {
            console.error('Error toggling user status:', error);
            showNotification('Failed to update user status', 'error');
        }
    };

    const handleToggleAdmin = async (userId, currentAdminStatus) => {
        try {
            await api.patch(`/users/${userId}/`, {
                is_admin: !currentAdminStatus
            });

            await fetchUsers();
            showNotification(`Admin privileges ${!currentAdminStatus ? 'granted' : 'revoked'} successfully`, 'success');
        } catch (error) {
            console.error('Error toggling admin status:', error);
            showNotification('Failed to update admin status', 'error');
        }
    };

    const handleEditUserDetails = async (formData) => {
        try {
            // First, update the main user fields that are allowed
            const mainUserFields = {
                username: formData.username,
                email: formData.email || '',
                bio: formData.bio || '',
                timezone: formData.timezone || '',
                discord_notifications: formData.discord_notifications,
                email_notifications: formData.email_notifications,
                service_number: formData.service_number || '',
                onboarding_status: formData.onboarding_status || ''
            };

            // Update main user fields
            await api.patch(`/users/${selectedUser.id}/`, mainUserFields);

            // Update sensitive fields through the sensitive-fields endpoint
            const sensitiveFields = {
                recruit_status: formData.recruit_status,
                officer_candidate: formData.officer_candidate,
                warrant_officer_candidate: formData.warrant_officer_candidate
            };

            await api.put(`/users/${selectedUser.id}/sensitive-fields/`, sensitiveFields);

            // Handle admin fields separately using individual calls (matching existing toggle pattern)
            if (formData.is_active !== selectedUser.is_active) {
                await api.patch(`/users/${selectedUser.id}/`, { is_active: formData.is_active });
            }

            if (formData.is_staff !== selectedUser.is_staff) {
                await api.patch(`/users/${selectedUser.id}/`, { is_staff: formData.is_staff });
            }

            if (formData.is_admin !== selectedUser.is_admin) {
                await api.patch(`/users/${selectedUser.id}/`, { is_admin: formData.is_admin });
            }

            // Refresh user data
            await fetchUsers();
            await fetchUserDetails(selectedUser.id);
            setShowEditDetailsModal(false);

            showNotification('User details updated successfully', 'success');
        } catch (error) {
            console.error('Error updating user details:', error);
            showNotification('Failed to update some user details', 'error');
            // Don't throw the error so the modal can close
        }
    };

    const showNotification = (message, type) => {
        // Implementation for showing notifications
        console.log(`${type}: ${message}`);
    };

    // Helper function to get rank data
    const getUserRank = (user) => {
        if (!user.current_rank) return null;

        // If current_rank is just an ID, look it up in our ranks map
        if (typeof user.current_rank === 'number' || typeof user.current_rank === 'string') {
            return ranks[user.current_rank] || null;
        }

        // If it's already an object, return it
        return user.current_rank;
    };

    // Filter and sort users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.discord_id.includes(searchTerm);

        if (filterBy === 'all') return matchesSearch;
        if (filterBy === 'active') return matchesSearch && user.is_active;
        if (filterBy === 'inactive') return matchesSearch && !user.is_active;
        if (filterBy === 'admin') return matchesSearch && user.is_admin;
        if (filterBy === 'recruit') return matchesSearch && user.recruit_status;

        return matchesSearch;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        switch (sortBy) {
            case 'username':
                return a.username.localeCompare(b.username);
            case 'rank':
                const rankA = getUserRank(a);
                const rankB = getUserRank(b);
                return (rankA?.tier || 0) - (rankB?.tier || 0);
            case 'unit':
                return (a.primary_unit?.name || '').localeCompare(b.primary_unit?.name || '');
            case 'joined':
                return new Date(b.join_date) - new Date(a.join_date);
            default:
                return 0;
        }
    });

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <Users size={24} />
                        <h2>User Management</h2>
                        <span className="count-badge">{users.length} total</span>
                    </div>
                    <div className="section-actions">
                        <button className="action-btn primary">
                            <Plus size={18} />
                            Add User
                        </button>
                    </div>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                            <option value="all">All Users</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="admin">Admins</option>
                            <option value="recruit">Recruits</option>
                        </select>
                    </div>

                    <div className="sort-group">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="username">Sort by Name</option>
                            <option value="rank">Sort by Rank</option>
                            <option value="unit">Sort by Unit</option>
                            <option value="joined">Sort by Join Date</option>
                        </select>
                    </div>
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : sortedUsers.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} />
                            <h3>No users found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>User</th>
                                <th>Rank</th>
                                <th>Unit</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedUsers.map(user => {
                                const userRank = getUserRank(user);

                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <img
                                                    src={user.avatar_url || '/default-avatar.png'}
                                                    alt={user.username}
                                                    className="user-avatar"
                                                />
                                                <div>
                                                    <div className="user-name">{user.username}</div>
                                                    <div className="user-discord">Discord: {user.discord_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {userRank ? (
                                                <div className="rank-cell">
                                                    {userRank.insignia_image_url && (
                                                        <img
                                                            src={userRank.insignia_image_url}
                                                            alt={userRank.name}
                                                            className="rank-insignia"
                                                        />
                                                    )}
                                                    <span>
                                                        {userRank.abbreviation || userRank.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="no-data">No rank</span>
                                            )}
                                        </td>
                                        <td>
                                            {user.primary_unit ? (
                                                <span className="unit-name">{user.primary_unit.name}</span>
                                            ) : (
                                                <span className="no-data">No unit</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="status-badges">
                                                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                {user.is_admin && (
                                                    <span className="status-badge admin">Admin</span>
                                                )}
                                                {user.recruit_status && (
                                                    <span className="status-badge recruit">Recruit</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {new Date(user.join_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => fetchUserDetails(user.id)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className="dropdown-container">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeDropdown === user.id && (
                                                        <div className="dropdown-menu">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowEditDetailsModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Edit size={16} />
                                                                Edit Details
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Opening promotion modal for user:', user);
                                                                    setSelectedUser(user);
                                                                    setShowPromotionModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <ChevronUp size={16} />
                                                                Promote/Demote
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowUnitModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Building size={16} />
                                                                Assign Unit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowPositionModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Briefcase size={16} />
                                                                Assign Position
                                                            </button>
                                                            <div className="dropdown-divider"></div>
                                                            <button
                                                                onClick={() => {
                                                                    handleToggleStatus(user.id, user.is_active);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                {user.is_active ? <X size={16} /> : <Check size={16} />}
                                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleToggleAdmin(user.id, user.is_admin);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className={user.is_admin ? 'danger' : ''}
                                                            >
                                                                <Shield size={16} />
                                                                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* User Details Panel */}
            {showUserDetails && selectedUser && (
                <UserDetailsPanel
                    user={selectedUser}
                    ranks={ranks}
                    onClose={() => {
                        setShowUserDetails(false);
                        setSelectedUser(null);
                    }}
                    onPromote={() => setShowPromotionModal(true)}
                    onAssignUnit={() => setShowUnitModal(true)}
                    onAssignPosition={() => setShowPositionModal(true)}
                    onEditDetails={() => setShowEditDetailsModal(true)}
                />
            )}

            {/* Modals */}
            {showPromotionModal && selectedUser && (
                <PromotionModal
                    user={{
                        ...selectedUser,
                        current_rank: selectedUser.current_rank || null
                    }}
                    ranks={ranks}
                    onClose={() => setShowPromotionModal(false)}
                    onPromote={handlePromote}
                />
            )}

            {showUnitModal && selectedUser && (
                <UnitAssignmentModal
                    user={selectedUser}
                    onClose={() => setShowUnitModal(false)}
                    onAssign={handleUnitAssignment}
                />
            )}

            {showPositionModal && selectedUser && (
                <PositionAssignmentModal
                    user={selectedUser}
                    onClose={() => setShowPositionModal(false)}
                    onAssign={handlePositionAssignment}
                />
            )}

            {showEditDetailsModal && selectedUser && (
                <EditUserDetailsModal
                    user={selectedUser}
                    onClose={() => setShowEditDetailsModal(false)}
                    onSave={handleEditUserDetails}
                />
            )}
        </div>
    );
};

// User Details Panel Component (updated to use ranks map)
const UserDetailsPanel = ({ user, ranks, onClose, onPromote, onAssignUnit, onAssignPosition, onEditDetails }) => {
    const getUserRank = () => {
        if (!user.current_rank) return null;

        if (typeof user.current_rank === 'number' || typeof user.current_rank === 'string') {
            return ranks[user.current_rank] || null;
        }

        return user.current_rank;
    };

    const userRank = getUserRank();

    return (
        <div className="details-panel">
            <div className="panel-header">
                <h3>User Details</h3>
                <div className="panel-header-actions">
                    <button className="icon-btn" onClick={onEditDetails} title="Edit Details">
                        <Edit size={18} />
                    </button>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="panel-content">
                <div className="user-profile-section">
                    <img
                        src={user.avatar_url || '/default-avatar.png'}
                        alt={user.username}
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h2>{user.username}</h2>
                        <p>Service #: {user.service_number || 'Not assigned'}</p>
                        <div className="profile-badges">
                            {user.is_admin && <span className="badge admin">Admin</span>}
                            {user.is_active ? (
                                <span className="badge active">Active</span>
                            ) : (
                                <span className="badge inactive">Inactive</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="detail-sections">
                    <div className="detail-section">
                        <h4>Basic Information</h4>
                        <div className="detail-row">
                            <span className="label">Discord ID:</span>
                            <span className="value">{user.discord_id}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Email:</span>
                            <span className="value">{user.email || 'Not provided'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Join Date:</span>
                            <span className="value">{new Date(user.join_date).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Last Login:</span>
                            <span className="value">
                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                            </span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Military Information</h4>
                        <div className="detail-row">
                            <span className="label">Current Rank:</span>
                            <span className="value">
                                {userRank ? (
                                    <div className="rank-cell">
                                        {(userRank.insignia_display_url || userRank.insignia_image_url) && (
                                            <img
                                                src={userRank.insignia_display_url || userRank.insignia_image_url}
                                                alt={userRank.name}
                                                className="rank-insignia"
                                            />
                                        )}
                                        <span>
                                                        {userRank.abbreviation || userRank.name}
                                                    </span>
                                    </div>
                                ) : (
                                    <span className="no-data">No rank</span>
                                )}
                            </span>
                            <button className="inline-action-btn" onClick={onPromote}>
                                <ChevronUp size={14} />
                                Change
                            </button>
                        </div>
                        <div className="detail-row">
                            <span className="label">Primary Unit:</span>
                            <span className="value">
                                {user.primary_unit ? user.primary_unit.name : 'No unit assigned'}
                            </span>
                            <button className="inline-action-btn" onClick={onAssignUnit}>
                                <Building size={14} />
                                Assign
                            </button>
                        </div>
                        <div className="detail-row">
                            <span className="label">Branch:</span>
                            <span className="value">
                                {user.branch ? user.branch.name : 'No branch assigned'}
                            </span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Positions</h4>
                        {user.positions && user.positions.length > 0 ? (
                            <div className="positions-list">
                                {user.positions.map(pos => (
                                    <div key={pos.id} className="position-item">
                                        <div>
                                            <strong>{pos.position.title}</strong>
                                            <span className="unit-name">{pos.unit.name}</span>
                                        </div>
                                        {pos.is_primary && <span className="primary-badge">Primary</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">No positions assigned</p>
                        )}
                        <button className="section-action-btn" onClick={onAssignPosition}>
                            <Plus size={16} />
                            Assign Position
                        </button>
                    </div>

                    <div className="detail-section">
                        <h4>Certificates</h4>
                        {user.certificates && user.certificates.length > 0 ? (
                            <div className="certificates-grid">
                                {user.certificates.map(cert => (
                                    <div key={cert.id} className="certificate-item">
                                        {cert.certificate.badge_image_url && (
                                            <img src={cert.certificate.badge_image_url} alt="" />
                                        )}
                                        <span>{cert.certificate.abbreviation}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">No certificates earned</p>
                        )}
                    </div>

                    <div className="detail-section">
                        <h4>Onboarding Status</h4>
                        <div className="detail-row">
                            <span className="label">Status:</span>
                            <span className="value">{user.onboarding_status || 'Not started'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Commission Stage:</span>
                            <span className="value">
                                {user.commission_stage ? user.commission_stage.name : 'None'}
                            </span>
                        </div>
                        <div className="checkbox-group">
                            <label>
                                <input type="checkbox" checked={user.recruit_status} readOnly />
                                Recruit Status
                            </label>
                            <label>
                                <input type="checkbox" checked={user.officer_candidate} readOnly />
                                Officer Candidate
                            </label>
                            <label>
                                <input type="checkbox" checked={user.warrant_officer_candidate} readOnly />
                                Warrant Officer Candidate
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
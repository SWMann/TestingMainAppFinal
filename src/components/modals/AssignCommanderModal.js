import React, { useState, useEffect } from 'react';
import {
    X, Shield, Building, FileText, MapPin, Calendar, Flag,
    User, Search, Briefcase, Plus, Trash2, GitBranch
} from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

// AssignCommanderModal.js
export const AssignCommanderModal = ({ unit, onClose, onAssign }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetchEligibleUsers();
    }, []);

    const fetchEligibleUsers = async () => {
        try {
            const response = await api.get('/users/', {
                params: { is_active: true }
            });
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.discord_id.includes(searchTerm)
    );

    const handleSubmit = () => {
        if (selectedUser && unit.commander_position) {
            onAssign(selectedUser.id, unit.commander_position);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>
                        <User size={24} />
                        Assign Commander to {unit.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <div className="users-list">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`user-option ${selectedUser?.id === user.id ? 'selected' : ''}`}
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
                                            Discord: {user.discord_id}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                        Assign Commander
                    </button>
                </div>
            </div>
        </div>
    );
};

// src/components/modals/IssueCertificateModal.js
import React, { useState, useEffect } from 'react';
import { X, Award, Search, User, Calendar, AlertCircle , FileText} from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const IssueCertificateModal = ({ certificate, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        training_event_id: '',
        certificate_file_url: '',
        expiry_days: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setSearching(true);
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setSearching(false);
        }
    };

    const filterUsers = () => {
        if (!searchTerm) {
            setFilteredUsers(users.slice(0, 10));
        } else {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.service_number?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered.slice(0, 10));
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({ ...prev, user_id: user.id }));
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.user_id) {
            newErrors.user_id = 'Please select a user';
        }
        if (formData.expiry_days && isNaN(parseInt(formData.expiry_days))) {
            newErrors.expiry_days = 'Must be a number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const data = {
                user_id: formData.user_id,
                training_event_id: formData.training_event_id || null,
                certificate_file_url: formData.certificate_file_url || '',
                expiry_days: formData.expiry_days ? parseInt(formData.expiry_days) : null
            };

            await api.post(`/certificates/${certificate.id}/issue/`, data);
            onSuccess();
        } catch (err) {
            console.error('Error issuing certificate:', err);
            if (err.response?.data?.detail) {
                setErrors({ submit: err.response.data.detail });
            } else {
                setErrors({ submit: 'Failed to issue certificate. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (days) => {
        if (!days) return certificate.expiration_period ? `${certificate.expiration_period} days` : 'No expiration';
        return `${days} days`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Award size={20} />
                        Issue Certificate
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Certificate Info */}
                    <div className="certificate-info">
                        <div className="cert-details">
                            {certificate.badge_image_url && (
                                <img src={certificate.badge_image_url} alt={certificate.name} className="cert-badge-preview" />
                            )}
                            <div>
                                <h3>{certificate.name}</h3>
                                <p className="cert-abbr-preview">{certificate.abbreviation}</p>
                                <p className="cert-branch-preview">{certificate.branch_name}</p>
                            </div>
                        </div>
                    </div>

                    {/* User Selection */}
                    <div className="form-group">
                        <label>Select User*</label>
                        {selectedUser ? (
                            <div className="selected-user">
                                <div className="user-info">
                                    {selectedUser.avatar_url && (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.username} className="user-avatar-small" />
                                    )}
                                    <div>
                                        <div className="user-name">{selectedUser.username}</div>
                                        <div className="user-meta">
                                            {selectedUser.service_number && `${selectedUser.service_number} • `}
                                            {selectedUser.current_rank?.abbreviation || 'No Rank'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setFormData(prev => ({ ...prev, user_id: '' }));
                                    }}
                                    className="btn secondary small"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="search-input">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by username or service number..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                {showDropdown && (
                                    <div className="user-dropdown">
                                        {searching ? (
                                            <div className="loading-state">
                                                <div className="spinner small"></div>
                                                <p>Loading users...</p>
                                            </div>
                                        ) : filteredUsers.length > 0 ? (
                                            <>
                                                {filteredUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="user-option"
                                                        onClick={() => handleUserSelect(user)}
                                                    >
                                                        {user.avatar_url && (
                                                            <img src={user.avatar_url} alt={user.username} className="user-avatar-small" />
                                                        )}
                                                        <div className="user-option-info">
                                                            <div className="user-name">{user.username}</div>
                                                            <div className="user-meta">
                                                                {user.service_number && `${user.service_number} • `}
                                                                {user.current_rank?.abbreviation || 'No Rank'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {filteredUsers.length === 10 && (
                                                    <div className="user-option-more">
                                                        Continue typing to see more results...
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No users found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.user_id && <span className="error-message">{errors.user_id}</span>}
                    </div>

                    {/* Certificate File URL */}
                    <div className="form-group">
                        <label>
                            Certificate File URL
                            <span className="field-hint">Optional - Link to certificate document</span>
                        </label>
                        <div className="input-with-icon">
                            <FileText size={18} />
                            <input
                                type="text"
                                name="certificate_file_url"
                                value={formData.certificate_file_url}
                                onChange={handleChange}
                                placeholder="https://example.com/cert.pdf"
                            />
                        </div>
                    </div>

                    {/* Expiry Override */}
                    <div className="form-group">
                        <label>
                            Expiration Override
                            <span className="field-hint">
                                Leave empty to use default ({formatDate()})
                            </span>
                        </label>
                        <div className="input-with-icon">
                            <Calendar size={18} />
                            <input
                                type="text"
                                name="expiry_days"
                                value={formData.expiry_days}
                                onChange={handleChange}
                                placeholder="Days until expiration"
                                className={errors.expiry_days ? 'error' : ''}
                            />
                        </div>
                        {errors.expiry_days && <span className="error-message">{errors.expiry_days}</span>}
                    </div>

                    {/* Requirements Reminder */}
                    {certificate.requirements && (
                        <div className="requirements-reminder">
                            <h4>
                                <AlertCircle size={16} />
                                Certificate Requirements
                            </h4>
                            <p>{certificate.requirements}</p>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="error-message">{errors.submit}</div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading || !selectedUser}>
                            {loading ? 'Issuing...' : 'Issue Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueCertificateModal;
// src/components/modals/RevokeCertificateModal.js
import React, { useState, useEffect } from 'react';
import { X, XCircle, Search, User, Calendar, AlertTriangle, Award, Clock } from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const RevokeCertificateModal = ({ certificate, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [holders, setHolders] = useState([]);
    const [selectedHolder, setSelectedHolder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        user_id: '',
        revocation_reason: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCertificateHolders();
    }, []);

    const fetchCertificateHolders = async () => {
        try {
            setSearching(true);
            const response = await api.get(`/certificates/${certificate.id}/holders/`);
            // Combine primary and secondary holders
            const allHolders = [
                ...(response.data.primary || []),
                ...(response.data.secondary || [])
            ];
            setHolders(allHolders);
        } catch (err) {
            console.error('Error fetching certificate holders:', err);
            // Fallback to fetching all users and filtering client-side
            try {
                const usersResponse = await api.get('/users/');
                const users = usersResponse.data.results || usersResponse.data;
                setHolders(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        } finally {
            setSearching(false);
        }
    };

    const filteredHolders = holders.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.service_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserSelect = (user) => {
        setSelectedHolder(user);
        setFormData(prev => ({ ...prev, user_id: user.id }));
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
        if (!formData.revocation_reason.trim()) {
            newErrors.revocation_reason = 'Revocation reason is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await api.post(`/certificates/${certificate.id}/revoke/`, {
                user_id: formData.user_id,
                revocation_reason: formData.revocation_reason
            });
            onSuccess();
        } catch (err) {
            console.error('Error revoking certificate:', err);
            if (err.response?.data?.detail) {
                setErrors({ submit: err.response.data.detail });
            } else {
                setErrors({ submit: 'Failed to revoke certificate. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <XCircle size={20} />
                        Revoke Certificate
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
                        <label>Select Certificate Holder*</label>
                        {selectedHolder ? (
                            <div className="revoke-target">
                                <div className="user-info">
                                    {selectedHolder.avatar_url && (
                                        <img src={selectedHolder.avatar_url} alt={selectedHolder.username} className="user-avatar-small" />
                                    )}
                                    <div>
                                        <div className="user-name">{selectedHolder.username}</div>
                                        <div className="user-meta">
                                            {selectedHolder.service_number && `${selectedHolder.service_number} • `}
                                            {selectedHolder.current_rank?.abbreviation || 'No Rank'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedHolder(null);
                                        setFormData(prev => ({ ...prev, user_id: '' }));
                                    }}
                                    className="btn secondary small"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="search-box" style={{ marginBottom: '1rem' }}>
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search certificate holders..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searching ? (
                                    <div className="loading-state">
                                        <div className="spinner small"></div>
                                        <p>Loading certificate holders...</p>
                                    </div>
                                ) : (
                                    <div className="users-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {filteredHolders.length > 0 ? (
                                            filteredHolders.map(user => (
                                                <div
                                                    key={user.id}
                                                    className={`user-option ${selectedHolder?.id === user.id ? 'selected' : ''}`}
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
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                <p>No certificate holders found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.user_id && <span className="error-message">{errors.user_id}</span>}
                    </div>

                    {/* Selected User's Certificate Info */}
                    {selectedHolder && (
                        <div className="cert-info-box">
                            <h4>Certificate Information</h4>
                            <div className="cert-info-summary">
                                <div className="info-row">
                                    <div className="info-icon">
                                        <Award size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Certificate</div>
                                        <div className="value">{certificate.name}</div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Holder</div>
                                        <div className="value">{selectedHolder.username}</div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Issue Date</div>
                                        <div className="value">Check Records</div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Status</div>
                                        <div className="value">Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revocation Reason */}
                    <div className="form-group">
                        <label>Revocation Reason*</label>
                        <textarea
                            name="revocation_reason"
                            value={formData.revocation_reason}
                            onChange={handleChange}
                            rows={4}
                            className={errors.revocation_reason ? 'error' : ''}
                            placeholder="Provide a detailed reason for revoking this certificate..."
                        />
                        {errors.revocation_reason && <span className="error-message">{errors.revocation_reason}</span>}
                    </div>

                    {/* Warning */}
                    <div className="revoke-impact">
                        <h4>
                            <AlertTriangle size={16} />
                            Impact of Revocation
                        </h4>
                        <ul>
                            <li>The certificate will be marked as revoked in the user's record</li>
                            <li>The user will lose any privileges associated with this certificate</li>
                            <li>This action will be logged and cannot be undone</li>
                            <li>The user may need to re-qualify to regain this certificate</li>
                        </ul>
                    </div>

                    {errors.submit && (
                        <div className="error-message">{errors.submit}</div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button danger" disabled={loading || !selectedHolder}>
                            {loading ? 'Revoking...' : 'Revoke Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RevokeCertificateModal;
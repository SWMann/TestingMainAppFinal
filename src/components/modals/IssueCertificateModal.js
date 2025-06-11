import React, { useState, useEffect } from 'react';
import { X, Award, User, Calendar, Upload, Clock, Search } from 'lucide-react';
import api from '../../../../services/api';
import '../Modal.css';

const IssueCertificateModal = ({ certificate, onClose, onIssue }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        training_event_id: '',
        certificate_file_url: '',
        expiry_days: ''
    });

    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Filter users based on search term
        if (searchTerm.trim()) {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.discord_id.includes(searchTerm) ||
                user.service_number?.includes(searchTerm)
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const fetchInitialData = async () => {
        setLoadingData(true);
        try {
            const [usersRes, eventsRes] = await Promise.all([
                api.get('/users/?is_active=true'),
                api.get('/events/?event_type=Training&status=Scheduled,In Progress')
            ]);

            setUsers(usersRes.data.results || usersRes.data);
            setEvents(eventsRes.data.results || eventsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleUserSelect = (userId) => {
        setFormData(prev => ({ ...prev, user_id: userId }));
        setSearchTerm('');
        if (errors.user_id) {
            setErrors(prev => ({ ...prev, user_id: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.user_id) {
            newErrors.user_id = 'Please select a user';
        }

        if (formData.expiry_days && (isNaN(formData.expiry_days) || formData.expiry_days < 0)) {
            newErrors.expiry_days = 'Expiry days must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Prepare data for submission
        const submitData = {
            user_id: formData.user_id,
            certificate_id: certificate.id,
            training_event_id: formData.training_event_id || null,
            certificate_file_url: formData.certificate_file_url || null,
            expiry_days: formData.expiry_days ? parseInt(formData.expiry_days) : null
        };

        try {
            await onIssue(submitData);
        } catch (error) {
            console.error('Error issuing certificate:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u.id === formData.user_id);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Award size={24} />
                        <h2>Issue Certificate</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="certificate-info">
                            <div className="cert-details">
                                {certificate.badge_image_url && (
                                    <img
                                        src={certificate.badge_image_url}
                                        alt={certificate.name}
                                        className="cert-badge-preview"
                                    />
                                )}
                                <div>
                                    <h3>{certificate.name}</h3>
                                    <p className="cert-abbr-preview">{certificate.abbreviation}</p>
                                    <p className="cert-branch-preview">{certificate.branch_name}</p>
                                </div>
                            </div>
                        </div>

                        {loadingData ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading users...</p>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="user_search">
                                        Select User <span className="required">*</span>
                                    </label>
                                    {selectedUser ? (
                                        <div className="selected-user">
                                            <div className="user-info">
                                                <img
                                                    src={selectedUser.avatar_url || '/default-avatar.png'}
                                                    alt={selectedUser.username}
                                                    className="user-avatar-small"
                                                />
                                                <div>
                                                    <div className="user-name">{selectedUser.username}</div>
                                                    <div className="user-meta">
                                                        {selectedUser.current_rank?.abbreviation} •
                                                        {selectedUser.primary_unit?.abbreviation || 'No unit'}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn secondary small"
                                                onClick={() => setFormData(prev => ({ ...prev, user_id: '' }))}
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="search-input">
                                                <Search size={18} />
                                                <input
                                                    type="text"
                                                    id="user_search"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search by username, Discord ID, or service number..."
                                                    className={errors.user_id ? 'error' : ''}
                                                />
                                            </div>
                                            {errors.user_id && <span className="error-message">{errors.user_id}</span>}

                                            {searchTerm && filteredUsers.length > 0 && (
                                                <div className="user-dropdown">
                                                    {filteredUsers.slice(0, 5).map(user => (
                                                        <div
                                                            key={user.id}
                                                            className="user-option"
                                                            onClick={() => handleUserSelect(user.id)}
                                                        >
                                                            <img
                                                                src={user.avatar_url || '/default-avatar.png'}
                                                                alt={user.username}
                                                                className="user-avatar-small"
                                                            />
                                                            <div className="user-option-info">
                                                                <div className="user-name">{user.username}</div>
                                                                <div className="user-meta">
                                                                    {user.current_rank?.abbreviation} •
                                                                    {user.primary_unit?.abbreviation || 'No unit'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {filteredUsers.length > 5 && (
                                                        <div className="user-option-more">
                                                            +{filteredUsers.length - 5} more results
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="training_event_id">
                                        Training Event (Optional)
                                    </label>
                                    <select
                                        id="training_event_id"
                                        name="training_event_id"
                                        value={formData.training_event_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">No specific event</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>
                                                {event.title} - {new Date(event.start_time).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="field-help">
                                        Link this certificate to a specific training event
                                    </span>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="certificate_file_url">
                                            Certificate File URL (Optional)
                                        </label>
                                        <div className="input-with-icon">
                                            <Upload size={18} />
                                            <input
                                                type="url"
                                                id="certificate_file_url"
                                                name="certificate_file_url"
                                                value={formData.certificate_file_url}
                                                onChange={handleChange}
                                                placeholder="https://example.com/certificate.pdf"
                                            />
                                        </div>
                                        <span className="field-help">
                                            Link to the generated certificate document
                                        </span>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="expiry_days">
                                            Custom Expiry (days)
                                        </label>
                                        <div className="input-with-icon">
                                            <Clock size={18} />
                                            <input
                                                type="number"
                                                id="expiry_days"
                                                name="expiry_days"
                                                value={formData.expiry_days}
                                                onChange={handleChange}
                                                className={errors.expiry_days ? 'error' : ''}
                                                placeholder={certificate.expiration_period ?
                                                    `Default: ${certificate.expiration_period} days` :
                                                    'No expiration'
                                                }
                                                min="0"
                                            />
                                        </div>
                                        {errors.expiry_days && <span className="error-message">{errors.expiry_days}</span>}
                                    </div>
                                </div>

                                {certificate.requirements && (
                                    <div className="requirements-reminder">
                                        <h4>Certificate Requirements</h4>
                                        <p>{certificate.requirements}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={loading || loadingData}
                        >
                            {loading ? 'Issuing...' : 'Issue Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueCertificateModal;
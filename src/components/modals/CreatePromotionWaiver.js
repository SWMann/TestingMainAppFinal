import React, { useState, useEffect } from 'react';
import { X, FileCheck, AlertCircle, User, Calendar } from 'lucide-react';
import './AdminModals.css';

const CreatePromotionWaiverModal = ({
                                        users,
                                        requirements,
                                        onClose,
                                        onCreate
                                    }) => {
    const [formData, setFormData] = useState({
        user: '',
        requirement: '',
        reason: '',
        expiry_date: ''
    });
    const [errors, setErrors] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRequirements, setUserRequirements] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Update selected user when user changes
        if (formData.user && users) {
            const user = users.find(u => u.id === formData.user);
            setSelectedUser(user);

            // Filter requirements based on user's next rank
            if (user && user.next_rank && requirements) {
                const filtered = requirements.filter(req =>
                    req.rank === user.next_rank.id && req.waiverable
                );
                setUserRequirements(filtered);
            } else {
                setUserRequirements([]);
            }
        } else {
            setSelectedUser(null);
            setUserRequirements([]);
        }
    }, [formData.user, users, requirements]);

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

        // Clear requirement when user changes
        if (name === 'user') {
            setFormData(prev => ({ ...prev, requirement: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.user) {
            newErrors.user = 'User is required';
        }

        if (!formData.requirement) {
            newErrors.requirement = 'Requirement is required';
        }

        if (!formData.reason.trim()) {
            newErrors.reason = 'Reason is required';
        } else if (formData.reason.trim().length < 20) {
            newErrors.reason = 'Reason must be at least 20 characters';
        }

        // Validate expiry date if provided
        if (formData.expiry_date) {
            const expiryDate = new Date(formData.expiry_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (expiryDate <= today) {
                newErrors.expiry_date = 'Expiry date must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            try {
                await onCreate(formData);
            } finally {
                setLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const getRequirementCategory = (requirement) => {
        if (!requirement || !requirement.requirement_type_details) return '';

        const category = requirement.requirement_type_details.category;
        const categoryLabels = {
            'time_based': 'Time-Based',
            'position_based': 'Position-Based',
            'qualification_based': 'Qualification-Based',
            'deployment_based': 'Deployment-Based',
            'performance_based': 'Performance-Based',
            'administrative': 'Administrative'
        };

        return categoryLabels[category] || category;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileCheck size={20} />
                        Create Promotion Waiver
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>User*</label>
                        <select
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            className={errors.user ? 'error' : ''}
                            disabled={loading}
                        >
                            <option value="">Select User...</option>
                            {users?.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} - {user.current_rank?.abbreviation || 'No Rank'}
                                    {user.next_rank && ` → ${user.next_rank.abbreviation}`}
                                </option>
                            ))}
                        </select>
                        {errors.user && <span className="error-message">{errors.user}</span>}
                    </div>

                    {selectedUser && (
                        <div className="user-info-box">
                            <h4>User Information</h4>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Current Rank:</span>
                                    <span className="value">
                                        {selectedUser.current_rank?.name || 'None'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Next Rank:</span>
                                    <span className="value">
                                        {selectedUser.next_rank?.name || 'None'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Service Number:</span>
                                    <span className="value">
                                        {selectedUser.service_number || 'Not assigned'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Unit:</span>
                                    <span className="value">
                                        {selectedUser.primary_unit?.name || 'No unit'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Requirement to Waive*</label>
                        {selectedUser ? (
                            userRequirements.length > 0 ? (
                                <select
                                    name="requirement"
                                    value={formData.requirement}
                                    onChange={handleChange}
                                    className={errors.requirement ? 'error' : ''}
                                    disabled={loading}
                                >
                                    <option value="">Select Requirement...</option>
                                    {userRequirements.map(req => (
                                        <option key={req.id} value={req.id}>
                                            {req.display_text} ({getRequirementCategory(req)})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="no-requirements-message">
                                    <AlertCircle size={16} />
                                    <span>No waiverable requirements for this user's next rank</span>
                                </div>
                            )
                        ) : (
                            <select disabled>
                                <option>Select a user first...</option>
                            </select>
                        )}
                        {errors.requirement && <span className="error-message">{errors.requirement}</span>}
                    </div>

                    <div className="form-group">
                        <label>Reason for Waiver*</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Provide a detailed justification for this waiver..."
                            className={errors.reason ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.reason && <span className="error-message">{errors.reason}</span>}
                        <span className="field-help">
                            Minimum 20 characters. Be specific about why this requirement should be waived.
                        </span>
                    </div>

                    <div className="form-group">
                        <label>Expiry Date (Optional)</label>
                        <input
                            type="date"
                            name="expiry_date"
                            value={formData.expiry_date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={errors.expiry_date ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.expiry_date && <span className="error-message">{errors.expiry_date}</span>}
                        <span className="field-help">
                            Leave blank for permanent waiver, or set a date when the waiver expires
                        </span>
                    </div>

                    <div className="waiver-warning">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Important:</strong> Waivers should only be granted in exceptional
                            circumstances. This action will be logged and may require justification
                            during audits.
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading || userRequirements.length === 0}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner small" />
                                    Creating...
                                </>
                            ) : (
                                'Create Waiver'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePromotionWaiverModal;
import React, { useState } from 'react';
import { X, Award, FileText, Clock, Shield } from 'lucide-react';
import '../AdminModals.css';

const CreateCertificateModal = ({ branches, ranks, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        description: '',
        requirements: '',
        branch: '',
        badge_image_url: '',
        is_required_for_promotion: false,
        min_rank_requirement: '',
        expiration_period: '',
        authorized_trainers: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTrainersChange = (e) => {
        const value = e.target.value;
        // Split by comma and clean up
        const trainers = value.split(',').map(t => t.trim()).filter(t => t);
        setFormData(prev => ({ ...prev, authorized_trainers: trainers }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Certificate name is required';
        }

        if (!formData.abbreviation.trim()) {
            newErrors.abbreviation = 'Abbreviation is required';
        }

        if (!formData.branch) {
            newErrors.branch = 'Branch is required';
        }

        if (formData.expiration_period && (isNaN(formData.expiration_period) || formData.expiration_period < 0)) {
            newErrors.expiration_period = 'Expiration period must be a positive number';
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
            ...formData,
            branch: parseInt(formData.branch),
            min_rank_requirement: formData.min_rank_requirement || null,
            expiration_period: formData.expiration_period ? parseInt(formData.expiration_period) : null,
            authorized_trainers: formData.authorized_trainers.length > 0 ? formData.authorized_trainers : null
        };

        try {
            await onCreate(submitData);
        } catch (error) {
            console.error('Error creating certificate:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Award size={24} />
                        <h2>Create Training Certificate</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">
                                    Certificate Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="e.g., Basic Rifle Marksmanship"
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="abbreviation">
                                    Abbreviation <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="abbreviation"
                                    name="abbreviation"
                                    value={formData.abbreviation}
                                    onChange={handleChange}
                                    className={errors.abbreviation ? 'error' : ''}
                                    placeholder="e.g., BRM"
                                />
                                {errors.abbreviation && <span className="error-message">{errors.abbreviation}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describe what this certificate represents..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="requirements">Requirements</label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows="3"
                                placeholder="List the requirements to earn this certificate..."
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="branch">
                                    Branch <span className="required">*</span>
                                </label>
                                <select
                                    id="branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className={errors.branch ? 'error' : ''}
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.branch && <span className="error-message">{errors.branch}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="min_rank_requirement">
                                    Minimum Rank Requirement
                                </label>
                                <select
                                    id="min_rank_requirement"
                                    name="min_rank_requirement"
                                    value={formData.min_rank_requirement}
                                    onChange={handleChange}
                                >
                                    <option value="">No minimum rank</option>
                                    {ranks.filter(rank => formData.branch && rank.branch === parseInt(formData.branch))
                                        .sort((a, b) => a.tier - b.tier)
                                        .map(rank => (
                                            <option key={rank.id} value={rank.id}>
                                                {rank.abbreviation} - {rank.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="badge_image_url">Badge Image URL</label>
                                <input
                                    type="url"
                                    id="badge_image_url"
                                    name="badge_image_url"
                                    value={formData.badge_image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/badge.png"
                                />
                                <span className="field-help">URL to the certificate badge image</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="expiration_period">
                                    Expiration Period (days)
                                </label>
                                <div className="input-with-icon">
                                    <Clock size={18} />
                                    <input
                                        type="number"
                                        id="expiration_period"
                                        name="expiration_period"
                                        value={formData.expiration_period}
                                        onChange={handleChange}
                                        className={errors.expiration_period ? 'error' : ''}
                                        placeholder="Leave empty for no expiration"
                                        min="0"
                                    />
                                </div>
                                {errors.expiration_period && <span className="error-message">{errors.expiration_period}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="authorized_trainers">
                                Authorized Trainer Positions
                            </label>
                            <input
                                type="text"
                                id="authorized_trainers"
                                name="authorized_trainers"
                                value={formData.authorized_trainers.join(', ')}
                                onChange={handleTrainersChange}
                                placeholder="e.g., Training Officer, Squad Leader (comma-separated)"
                            />
                            <span className="field-help">
                                Positions authorized to issue this certificate (leave empty for admin-only)
                            </span>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_required_for_promotion"
                                    checked={formData.is_required_for_promotion}
                                    onChange={handleChange}
                                />
                                Required for Promotion
                            </label>
                            <span className="field-help">
                                Check if this certificate is required for rank promotions
                            </span>
                        </div>

                        {formData.badge_image_url && (
                            <div className="preview-section">
                                <h4>Badge Preview</h4>
                                <div className="badge-preview">
                                    <img
                                        src={formData.badge_image_url}
                                        alt="Certificate badge preview"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <p style={{ display: 'none', color: '#ef4444' }}>
                                        Failed to load badge image
                                    </p>
                                </div>
                            </div>
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
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCertificateModal;
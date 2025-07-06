// src/components/modals/CreateCertificateModal.js
import React, { useState, useEffect } from 'react';
import { X, Award, Plus } from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const CreateCertificateModal = ({ branches, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [ranks, setRanks] = useState([]);
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

    useEffect(() => {
        if (formData.branch) {
            fetchRanks(formData.branch);
        }
    }, [formData.branch]);

    const fetchRanks = async (branchId) => {
        try {
            const response = await api.get(`/ranks/?branch=${branchId}`);
            setRanks(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching ranks:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        if (formData.expiration_period && isNaN(parseInt(formData.expiration_period))) {
            newErrors.expiration_period = 'Must be a number';
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
                ...formData,
                expiration_period: formData.expiration_period ? parseInt(formData.expiration_period) : null,
                min_rank_requirement: formData.min_rank_requirement || null
            };

            await api.post('/certificates/', data);
            onSuccess();
        } catch (err) {
            console.error('Error creating certificate:', err);
            setErrors({ submit: 'Failed to create certificate. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Award size={20} />
                        Create Training Certificate
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Certificate Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                                placeholder="e.g., Airborne Qualification"
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label>Abbreviation*</label>
                            <input
                                type="text"
                                name="abbreviation"
                                value={formData.abbreviation}
                                onChange={handleChange}
                                className={errors.abbreviation ? 'error' : ''}
                                placeholder="e.g., ABN"
                            />
                            {errors.abbreviation && <span className="error-message">{errors.abbreviation}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Branch*</label>
                        <select
                            name="branch"
                            value={formData.branch}
                            onChange={handleChange}
                            className={errors.branch ? 'error' : ''}
                        >
                            <option value="">Select branch...</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        {errors.branch && <span className="error-message">{errors.branch}</span>}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe what this certificate represents..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Requirements</label>
                        <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows={3}
                            placeholder="List the requirements to earn this certificate..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Minimum Rank Requirement</label>
                            <select
                                name="min_rank_requirement"
                                value={formData.min_rank_requirement}
                                onChange={handleChange}
                            >
                                <option value="">No requirement</option>
                                {ranks.map(rank => (
                                    <option key={rank.id} value={rank.id}>
                                        {rank.abbreviation} - {rank.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>
                                Expiration Period
                                <span className="field-hint">Days until expiration (leave empty for no expiration)</span>
                            </label>
                            <input
                                type="text"
                                name="expiration_period"
                                value={formData.expiration_period}
                                onChange={handleChange}
                                placeholder="e.g., 365"
                                className={errors.expiration_period ? 'error' : ''}
                            />
                            {errors.expiration_period && <span className="error-message">{errors.expiration_period}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Badge Image URL</label>
                        <input
                            type="text"
                            name="badge_image_url"
                            value={formData.badge_image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/badge.png"
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="is_required_for_promotion"
                                checked={formData.is_required_for_promotion}
                                onChange={handleChange}
                            />
                            Required for promotion
                        </label>
                    </div>

                    {errors.submit && (
                        <div className="error-message">{errors.submit}</div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCertificateModal;
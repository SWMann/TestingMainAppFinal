import React, { useState, useEffect } from 'react';
import { X, Shield, Upload, AlertCircle } from 'lucide-react';
import './AdminModals.css';

const EditRankModal = ({ rank, branches, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        branch: '',
        tier: 1,
        description: '',
        insignia_image_url: '',
        min_time_in_service: 0,
        min_time_in_grade: 0,
        color_code: '#4a5d23',
        is_officer: false,
        is_enlisted: false,
        is_warrant: false
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (rank) {
            setFormData({
                name: rank.name || '',
                abbreviation: rank.abbreviation || '',
                branch: rank.branch || '',
                tier: rank.tier || 1,
                description: rank.description || '',
                insignia_image_url: rank.insignia_image_url || '',
                min_time_in_service: rank.min_time_in_service || 0,
                min_time_in_grade: rank.min_time_in_grade || 0,
                color_code: rank.color_code || '#4a5d23',
                is_officer: rank.is_officer || false,
                is_enlisted: rank.is_enlisted || false,
                is_warrant: rank.is_warrant || false
            });
        }
    }, [rank]);

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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Rank name is required';
        }

        if (!formData.abbreviation.trim()) {
            newErrors.abbreviation = 'Abbreviation is required';
        }

        if (!formData.branch) {
            newErrors.branch = 'Branch is required';
        }

        if (formData.tier < 1) {
            newErrors.tier = 'Tier must be at least 1';
        }

        if (!formData.is_officer && !formData.is_enlisted && !formData.is_warrant) {
            newErrors.type = 'Must select at least one rank type';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onUpdate(rank.id, formData);
        }
    };

    const handleTypeChange = (type) => {
        // When selecting a type, deselect others
        setFormData(prev => ({
            ...prev,
            is_officer: type === 'officer',
            is_enlisted: type === 'enlisted',
            is_warrant: type === 'warrant'
        }));
    };

    const hasChanges = () => {
        return Object.keys(formData).some(key => {
            return formData[key] !== rank[key];
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Shield size={20} />
                        Edit Rank - {rank.name}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Current Rank Display */}
                    <div className="current-rank-info">
                        <h4>Current Rank Information</h4>
                        <div className="rank-display">
                            {rank.insignia_image_url && (
                                <img
                                    src={rank.insignia_image_url}
                                    alt={rank.name}
                                    className="rank-insignia-modal"
                                />
                            )}
                            <div>
                                <div className="rank-name">{rank.name}</div>
                                <div className="rank-abbr">{rank.abbreviation} - Tier {rank.tier}</div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Rank Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Sergeant Major"
                                className={errors.name ? 'error' : ''}
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
                                placeholder="e.g., SGM"
                                className={errors.abbreviation ? 'error' : ''}
                            />
                            {errors.abbreviation && <span className="error-message">{errors.abbreviation}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Branch*</label>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className={errors.branch ? 'error' : ''}
                            >
                                <option value="">Select Branch...</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            {errors.branch && <span className="error-message">{errors.branch}</span>}
                        </div>

                        <div className="form-group">
                            <label>Tier Level*</label>
                            <input
                                type="number"
                                name="tier"
                                value={formData.tier}
                                onChange={handleChange}
                                min="1"
                                className={errors.tier ? 'error' : ''}
                            />
                            {errors.tier && <span className="error-message">{errors.tier}</span>}
                            <span className="field-help">Higher tier = higher rank</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Rank Type*</label>
                        <div className="rank-type-selector">
                            <button
                                type="button"
                                className={`type-btn ${formData.is_officer ? 'active' : ''}`}
                                onClick={() => handleTypeChange('officer')}
                            >
                                Officer
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.is_warrant ? 'active' : ''}`}
                                onClick={() => handleTypeChange('warrant')}
                            >
                                Warrant Officer
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${formData.is_enlisted ? 'active' : ''}`}
                                onClick={() => handleTypeChange('enlisted')}
                            >
                                Enlisted
                            </button>
                        </div>
                        {errors.type && <span className="error-message">{errors.type}</span>}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of this rank..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Min. Time in Service (days)</label>
                            <input
                                type="number"
                                name="min_time_in_service"
                                value={formData.min_time_in_service}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="field-help">Days required in service</span>
                        </div>

                        <div className="form-group">
                            <label>Min. Time in Grade (days)</label>
                            <input
                                type="number"
                                name="min_time_in_grade"
                                value={formData.min_time_in_grade}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="field-help">Days required at current rank</span>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Insignia Image URL</label>
                            <input
                                type="url"
                                name="insignia_image_url"
                                value={formData.insignia_image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/insignia.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>Color Code</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    name="color_code"
                                    value={formData.color_code}
                                    onChange={handleChange}
                                    className="color-picker"
                                />
                                <input
                                    type="text"
                                    value={formData.color_code}
                                    onChange={(e) => handleChange({
                                        target: { name: 'color_code', value: e.target.value }
                                    })}
                                    placeholder="#4a5d23"
                                />
                            </div>
                        </div>
                    </div>

                    {formData.insignia_image_url && (
                        <div className="insignia-preview">
                            <h4>Insignia Preview</h4>
                            <img
                                src={formData.insignia_image_url}
                                alt="Rank insignia preview"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {hasChanges() && (
                        <div className="warning-message">
                            <AlertCircle size={16} />
                            You have unsaved changes
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!hasChanges()}
                        >
                            Update Rank
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRankModal;
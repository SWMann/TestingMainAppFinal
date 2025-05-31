import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, Info } from 'lucide-react';
import api from '../../../services/api';

const CreateViewModal = ({ branches, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: true,
        is_default: false,
        filter_branches: [],
        filter_unit_types: [],
        show_inactive_units: false,
        settings: {
            showMemberCount: true,
            showCommander: true,
            autoLayout: true,
            theme: 'default'
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const unitTypes = [
        'Fleet', 'Squadron', 'Division', 'Battalion',
        'Company', 'Platoon', 'Special'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSettingsChange = (setting, value) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [setting]: value
            }
        }));
    };

    const handleBranchFilter = (branchId) => {
        const current = formData.filter_branches;
        const updated = current.includes(branchId)
            ? current.filter(id => id !== branchId)
            : [...current, branchId];

        handleInputChange('filter_branches', updated);
    };

    const handleUnitTypeFilter = (unitType) => {
        const current = formData.filter_unit_types;
        const updated = current.includes(unitType)
            ? current.filter(type => type !== unitType)
            : [...current, unitType];

        handleInputChange('filter_unit_types', updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                is_public: formData.is_public,
                is_default: formData.is_default,
                filter_branches: formData.filter_branches,
                filter_unit_types: formData.filter_unit_types,
                show_inactive_units: formData.show_inactive_units,
                settings: formData.settings
            };

            const response = await api.post('/org-charts/', payload);
            onSuccess(response.data);
        } catch (err) {
            console.error('Error creating view:', err);
            setError(err.response?.data?.message || 'Failed to create view');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container create-view-modal">
                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h2 className="modal-title">Create New Organization Chart View</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="modal-close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Modal Content */}
                    <div className="modal-content">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3 className="section-title">Basic Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">View Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., Full Organization, Command Structure"
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe what this view shows..."
                                    rows={3}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_public}
                                            onChange={(e) => handleInputChange('is_public', e.target.checked)}
                                        />
                                        <Eye size={16} />
                                        Public View
                                    </label>
                                    <small className="form-help">Allow all members to see this view</small>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => handleInputChange('is_default', e.target.checked)}
                                        />
                                        <Info size={16} />
                                        Default View
                                    </label>
                                    <small className="form-help">Load this view by default</small>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="form-section">
                            <h3 className="section-title">Unit Filters</h3>

                            {/* Branch Filters */}
                            <div className="form-group">
                                <label>Filter by Branches</label>
                                <div className="checkbox-grid">
                                    {branches.map(branch => (
                                        <label key={branch.id} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={formData.filter_branches.includes(branch.id)}
                                                onChange={() => handleBranchFilter(branch.id)}
                                            />
                                            <span
                                                className="branch-indicator"
                                                style={{ backgroundColor: branch.color_code }}
                                            />
                                            {branch.name}
                                        </label>
                                    ))}
                                </div>
                                <small className="form-help">Leave empty to show all branches</small>
                            </div>

                            {/* Unit Type Filters */}
                            <div className="form-group">
                                <label>Filter by Unit Types</label>
                                <div className="checkbox-grid">
                                    {unitTypes.map(type => (
                                        <label key={type} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={formData.filter_unit_types.includes(type)}
                                                onChange={() => handleUnitTypeFilter(type)}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                                <small className="form-help">Leave empty to show all unit types</small>
                            </div>

                            {/* Show Inactive Units */}
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.show_inactive_units}
                                        onChange={(e) => handleInputChange('show_inactive_units', e.target.checked)}
                                    />
                                    <EyeOff size={16} />
                                    Show Inactive Units
                                </label>
                                <small className="form-help">Include units marked as inactive</small>
                            </div>
                        </div>

                        {/* Display Settings */}
                        <div className="form-section">
                            <h3 className="section-title">Display Settings</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.showMemberCount}
                                            onChange={(e) => handleSettingsChange('showMemberCount', e.target.checked)}
                                        />
                                        Show Member Count
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.showCommander}
                                            onChange={(e) => handleSettingsChange('showCommander', e.target.checked)}
                                        />
                                        Show Commander
                                    </label>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.settings.autoLayout}
                                            onChange={(e) => handleSettingsChange('autoLayout', e.target.checked)}
                                        />
                                        Auto-arrange Layout
                                    </label>
                                    <small className="form-help">Automatically position units hierarchically</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !formData.name.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Create View
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateViewModal;
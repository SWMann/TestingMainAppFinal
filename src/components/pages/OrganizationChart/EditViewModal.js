import React, { useState } from 'react';
import { X, Save, Trash2, Eye, EyeOff, Info, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';

const EditViewModal = ({ view, branches, onClose, onSuccess, onDelete }) => {
    const [formData, setFormData] = useState({
        name: view.name || '',
        description: view.description || '',
        is_public: view.is_public ?? true,
        is_default: view.is_default ?? false,
        filter_branches: view.filter_branches || [],
        filter_unit_types: view.filter_unit_types || [],
        show_inactive_units: view.show_inactive_units ?? false,
        settings: {
            showMemberCount: view.settings?.showMemberCount ?? true,
            showCommander: view.settings?.showCommander ?? true,
            autoLayout: view.settings?.autoLayout ?? true,
            theme: view.settings?.theme || 'default',
            ...view.settings
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

            const response = await api.put(`/org-charts/${view.id}/`, payload);
            onSuccess(response.data);
        } catch (err) {
            console.error('Error updating view:', err);
            setError(err.response?.data?.message || 'Failed to update view');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await api.delete(`/org-charts/${view.id}/`);
            onDelete();
        } catch (err) {
            console.error('Error deleting view:', err);
            setError(err.response?.data?.message || 'Failed to delete view');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container edit-view-modal">
                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h2 className="modal-title">Edit Organization Chart View</h2>
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

                        {/* View Stats */}
                        <div className="form-section">
                            <h3 className="section-title">View Information</h3>
                            <div className="view-stats">
                                <div className="stat-item">
                                    <label>Created:</label>
                                    <span>{new Date(view.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Last Updated:</label>
                                    <span>{new Date(view.updated_at).toLocaleDateString()}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Creator:</label>
                                    <span>{view.created_by?.username || 'Unknown'}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Nodes:</label>
                                    <span>{view.nodes?.length || 0} units</span>
                                </div>
                                <div className="stat-item">
                                    <label>Connections:</label>
                                    <span>{view.edges?.length || 0} links</span>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="form-section danger-section">
                            <h3 className="section-title danger-title">
                                <AlertTriangle size={20} />
                                Danger Zone
                            </h3>
                            <div className="danger-content">
                                <p>Deleting this view will permanently remove it and all its layout data. This action cannot be undone.</p>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="btn btn-danger"
                                    disabled={isDeleting}
                                >
                                    <Trash2 size={16} />
                                    Delete View
                                </button>
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
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-container confirm-modal">
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="modal-content">
                            <div className="confirm-content">
                                <AlertTriangle size={48} className="warning-icon" />
                                <p>Are you sure you want to delete "<strong>{view.name}</strong>"?</p>
                                <p>This action cannot be undone and will permanently remove all layout data.</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-secondary"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="spinner" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete View
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditViewModal;
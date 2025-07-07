import React, { useState } from 'react';
import { X, Folder, Link } from 'lucide-react';
import '../modals/AdminModals.css';

const CreateStandardSubGroupModal = ({ groups, selectedGroup, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        standard_group: selectedGroup?.id || '',
        icon_url: '',
        order_index: 0,
        is_active: true
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                name === 'order_index' ? parseInt(value) || 0 : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Subgroup name is required';
        }

        if (!formData.standard_group) {
            newErrors.standard_group = 'Parent group is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onCreate(formData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Folder size={20} />
                        Create Subgroup
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Parent Group*</label>
                        <select
                            name="standard_group"
                            value={formData.standard_group}
                            onChange={handleChange}
                            className={errors.standard_group ? 'error' : ''}
                        >
                            <option value="">Select Parent Group...</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name} {group.branch_name && `(${group.branch_name})`}
                                </option>
                            ))}
                        </select>
                        {errors.standard_group && <span className="error-message">{errors.standard_group}</span>}
                    </div>

                    <div className="form-group">
                        <label>Subgroup Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Basic Combat Procedures"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of this subgroup..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Order Index</label>
                            <input
                                type="number"
                                name="order_index"
                                value={formData.order_index}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="field-help">Display order (lower = first)</span>
                        </div>

                        <div className="form-group">
                            <label>Icon URL</label>
                            <div className="input-with-icon">
                                <Link size={18} />
                                <input
                                    type="url"
                                    name="icon_url"
                                    value={formData.icon_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/icon.png"
                                />
                            </div>
                            <span className="field-help">Optional icon for the subgroup</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <span>Active</span>
                        </label>
                        <span className="field-help">Inactive subgroups are hidden from users</span>
                    </div>

                    {/* Preview Section */}
                    {formData.icon_url && (
                        <div className="preview-section">
                            <h4>Icon Preview</h4>
                            <img
                                src={formData.icon_url}
                                alt="Icon preview"
                                className="preview-icon"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div className="preview-error" style={{ display: 'none' }}>
                                Failed to load icon
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create Subgroup
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStandardSubGroupModal;
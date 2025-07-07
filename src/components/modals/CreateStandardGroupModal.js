import React, { useState } from 'react';
import { X, FolderOpen, Upload, Link } from 'lucide-react';
import '../modals/AdminModals.css';

const CreateStandardGroupModal = ({ branches, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        branch: '',
        icon_url: '',
        banner_image_url: '',
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
            newErrors.name = 'Group name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onCreate({
                ...formData,
                branch: formData.branch || null
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FolderOpen size={20} />
                        Create Standard Group
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Group Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Infantry Operations"
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
                            placeholder="Brief description of this standard group..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Branch</label>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                            >
                                <option value="">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <span className="field-help">Optional: Assign to specific branch</span>
                        </div>

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
                        <span className="field-help">Small icon for the group (optional)</span>
                    </div>

                    <div className="form-group">
                        <label>Banner Image URL</label>
                        <div className="input-with-icon">
                            <Upload size={18} />
                            <input
                                type="url"
                                name="banner_image_url"
                                value={formData.banner_image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/banner.jpg"
                            />
                        </div>
                        <span className="field-help">Large banner image for the group page (optional)</span>
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
                        <span className="field-help">Inactive groups are hidden from users</span>
                    </div>

                    {/* Preview Section */}
                    {(formData.icon_url || formData.banner_image_url) && (
                        <div className="preview-section">
                            <h4>Preview</h4>
                            <div className="preview-grid">
                                {formData.icon_url && (
                                    <div className="preview-item">
                                        <span className="preview-label">Icon:</span>
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
                                {formData.banner_image_url && (
                                    <div className="preview-item">
                                        <span className="preview-label">Banner:</span>
                                        <img
                                            src={formData.banner_image_url}
                                            alt="Banner preview"
                                            className="preview-banner"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div className="preview-error" style={{ display: 'none' }}>
                                            Failed to load banner
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStandardGroupModal;
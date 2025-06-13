import React, { useState } from 'react';
import {
    X, Briefcase, Star, Users, Hash, Tag
} from 'lucide-react';
import './AdminModals.css';

export const EditPositionModal = ({ position, units, roles, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        role: position.role || '',
        unit: position.unit || '',
        identifier: position.identifier || '',
        title: position.title || '',
        parent_position: position.parent_position || '',
        override_min_rank: position.override_min_rank?.id || position.override_min_rank || '',
        override_max_rank: position.override_max_rank?.id || position.override_max_rank || '',
        additional_requirements: position.additional_requirements || '',
        notes: position.notes || '',
        is_active: position.is_active !== false,
        is_vacant: position.is_vacant !== false
    });

    const selectedRole = formData.role ? roles.find(r => r.id === formData.role) : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            role: formData.role || null,  // Keep as string/UUID
            unit: formData.unit || null,  // Keep as string/UUID
            identifier: formData.identifier || null,
            title: formData.title || null,
            parent_position: formData.parent_position || null,  // Keep as string/UUID
            override_min_rank: formData.override_min_rank || null,  // Keep as string/UUID
            override_max_rank: formData.override_max_rank || null,  // Keep as string/UUID
            additional_requirements: formData.additional_requirements || null,
            notes: formData.notes || null,
            is_active: formData.is_active,
            is_vacant: formData.is_vacant
        };
        onUpdate(submitData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>
                        <Briefcase size={24} />
                        Edit Position: {position.display_title || position.role_name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="role">
                            <Tag size={16} />
                            Role Template *
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name} ({role.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedRole && (
                        <div className="role-info-box">
                            <h4>Role Information</h4>
                            <p>{selectedRole.description}</p>
                            <div className="role-details">
                                <div className="detail-item">
                                    <span className="label">Category:</span>
                                    <span className={`category-badge ${selectedRole.category}`}>
                                        {selectedRole.category}
                                    </span>
                                </div>
                                {selectedRole.min_rank && (
                                    <div className="detail-item">
                                        <span className="label">Min Rank:</span>
                                        <span>{selectedRole.min_rank_details?.abbreviation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="unit">Assigned Unit *</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name} ({unit.abbreviation})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="identifier">
                                Identifier
                                <span className="field-hint">For multiple positions (e.g., "1st", "Alpha")</span>
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                placeholder="e.g., 1st, Alpha, Senior"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="title">
                                Custom Title
                                <span className="field-hint">Override default title</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Senior Company Commander"
                            />
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            Position is Active
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="is_vacant"
                                checked={formData.is_vacant}
                                onChange={handleChange}
                            />
                            Position is Vacant
                        </label>
                    </div>

                    <details className="advanced-section">
                        <summary>Advanced Options</summary>

                        <div className="form-group">
                            <label htmlFor="additional_requirements">Additional Requirements</label>
                            <textarea
                                id="additional_requirements"
                                name="additional_requirements"
                                value={formData.additional_requirements}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Any position-specific requirements..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Internal notes about this position..."
                            />
                        </div>
                    </details>

                    {position.current_holder && (
                        <div className="current-holder-info">
                            <h4>Current Assignment</h4>
                            <div className="holder-details">
                                <span>Assigned to: {position.current_holder.rank} {position.current_holder.username}</span>
                                <p className="hint-text">To change assignment, use the Assign/Vacate buttons in the position list.</p>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            Update Position
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
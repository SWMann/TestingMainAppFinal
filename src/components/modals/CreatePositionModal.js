import React, { useState } from 'react';
import {
    X, Briefcase, Star, Users, Hash, Tag
} from 'lucide-react';
import './AdminModals.css';

export const CreatePositionModal = ({ units, roles, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        role: '',
        unit: '',
        identifier: '',
        title: '',
        parent_position: '',
        override_min_rank: '',
        override_max_rank: '',
        additional_requirements: '',
        notes: '',
        is_active: true
    });

    const [selectedRole, setSelectedRole] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            role: parseInt(formData.role),
            unit: parseInt(formData.unit),
            identifier: formData.identifier || null,
            title: formData.title || null,
            parent_position: formData.parent_position ? parseInt(formData.parent_position) : null,
            override_min_rank: formData.override_min_rank ? parseInt(formData.override_min_rank) : null,
            override_max_rank: formData.override_max_rank ? parseInt(formData.override_max_rank) : null,
            additional_requirements: formData.additional_requirements || null,
            notes: formData.notes || null,
            is_active: formData.is_active
        };
        onCreate(submitData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Update selected role when role changes
        if (name === 'role' && value) {
            const role = roles.find(r => r.id === parseInt(value));
            setSelectedRole(role);
        }
    };

    // Get the selected unit to filter positions for parent_position
    const selectedUnit = formData.unit ? units.find(u => u.id === parseInt(formData.unit)) : null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>
                        <Briefcase size={24} />
                        Create New Position
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
                                <div className="detail-item">
                                    <span className="label">Default Slots:</span>
                                    <span>{selectedRole.default_slots_per_unit}</span>
                                </div>
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

                    {selectedUnit && (
                        <div className="form-group">
                            <label htmlFor="parent_position">Parent Position</label>
                            <select
                                id="parent_position"
                                name="parent_position"
                                value={formData.parent_position}
                                onChange={handleChange}
                            >
                                <option value="">None (Top Level)</option>
                                {/* In a real implementation, you'd fetch positions for the selected unit */}
                            </select>
                        </div>
                    )}

                    <details className="advanced-section">
                        <summary>Advanced Options</summary>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="override_min_rank">Override Min Rank</label>
                                <select
                                    id="override_min_rank"
                                    name="override_min_rank"
                                    value={formData.override_min_rank}
                                    onChange={handleChange}
                                >
                                    <option value="">Use role default</option>
                                    {/* You'd need to pass ranks or fetch them */}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="override_max_rank">Override Max Rank</label>
                                <select
                                    id="override_max_rank"
                                    name="override_max_rank"
                                    value={formData.override_max_rank}
                                    onChange={handleChange}
                                >
                                    <option value="">Use role default</option>
                                    {/* You'd need to pass ranks or fetch them */}
                                </select>
                            </div>
                        </div>

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
                        </div>
                    </details>

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            Create Position
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
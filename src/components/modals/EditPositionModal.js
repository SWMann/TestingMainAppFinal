import React, { useState, useEffect } from 'react';
import {
    X, Briefcase, Star, Users, Hash, Tag, Award
} from 'lucide-react';
import api from "../../services/api";
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
        is_vacant: position.is_vacant !== false,
        required_mos: position.required_mos?.map(mos => mos.id || mos) || [],
        preferred_mos: position.preferred_mos?.map(mos => mos.id || mos) || []
    });

    const [availableMOS, setAvailableMOS] = useState([]);
    const [loadingMOS, setLoadingMOS] = useState(false);

    const selectedRole = formData.role ? roles.find(r => r.id === formData.role) : null;

    useEffect(() => {
        fetchAvailableMOS();
    }, []);

    const fetchAvailableMOS = async () => {
        setLoadingMOS(true);
        try {
            const response = await api.get('/units/mos/', {
                params: { is_active: true }
            });
            setAvailableMOS(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching MOS:', error);
        } finally {
            setLoadingMOS(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            role: formData.role || null,
            unit: formData.unit || null,
            identifier: formData.identifier || null,
            title: formData.title || null,
            parent_position: formData.parent_position || null,
            override_min_rank: formData.override_min_rank || null,
            override_max_rank: formData.override_max_rank || null,
            additional_requirements: formData.additional_requirements || null,
            notes: formData.notes || null,
            is_active: formData.is_active,
            is_vacant: formData.is_vacant,
            required_mos: formData.required_mos,
            preferred_mos: formData.preferred_mos
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

    const handleMOSToggle = (mosId, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(mosId)
                ? prev[field].filter(id => id !== mosId)
                : [...prev[field], mosId]
        }));
    };

    // Group MOS by category
    const mosByCategory = availableMOS.reduce((acc, mos) => {
        if (!acc[mos.category]) {
            acc[mos.category] = [];
        }
        acc[mos.category].push(mos);
        return acc;
    }, {});

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
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

                    {/* MOS Requirements Section */}
                    <div className="form-section">
                        <h3>
                            <Award size={16} />
                            MOS Requirements
                        </h3>

                        {loadingMOS ? (
                            <div className="loading-state">
                                <div className="spinner small"></div>
                                <p>Loading MOS options...</p>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Required MOS</label>
                                    <p className="field-hint">Select MOS that are required for this position</p>
                                    {Object.entries(mosByCategory).map(([category, mosList]) => (
                                        <div key={category} className="mos-category-group">
                                            <h5>{category.replace(/_/g, ' ').toUpperCase()}</h5>
                                            <div className="checkbox-grid">
                                                {mosList.map(mos => (
                                                    <label key={mos.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.required_mos.includes(mos.id)}
                                                            onChange={() => handleMOSToggle(mos.id, 'required_mos')}
                                                        />
                                                        <span>{mos.code} - {mos.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>Preferred MOS</label>
                                    <p className="field-hint">Select MOS that are preferred but not required</p>
                                    {Object.entries(mosByCategory).map(([category, mosList]) => (
                                        <div key={category} className="mos-category-group">
                                            <h5>{category.replace(/_/g, ' ').toUpperCase()}</h5>
                                            <div className="checkbox-grid">
                                                {mosList.filter(mos => !formData.required_mos.includes(mos.id)).map(mos => (
                                                    <label key={mos.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.preferred_mos.includes(mos.id)}
                                                            onChange={() => handleMOSToggle(mos.id, 'preferred_mos')}
                                                        />
                                                        <span>{mos.code} - {mos.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
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
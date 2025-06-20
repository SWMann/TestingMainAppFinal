// src/components/modals/CreateEditTemplateModal.js

import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, Save, AlertCircle,
    Users, Shield, Building, GitBranch, Package,
    ChevronDown, ChevronUp, Loader
} from 'lucide-react';
import api from '../../services/api';
import './CreateEditTemplateModal.css';

export const CreateEditTemplateModal = ({ template, onClose, onSave }) => {
    const isEditMode = !!template;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        template_type: 'squad',
        applicable_unit_types: [],
        template_positions: []
    });

    const [availableRoles, setAvailableRoles] = useState([]);
    const [availableUnitTypes, setAvailableUnitTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedPositions, setExpandedPositions] = useState({});

    useEffect(() => {
        fetchInitialData();
        if (template) {
            // Transform template positions to include proper IDs
            const transformedPositions = (template.template_positions || []).map((pos, index) => ({
                ...pos,
                id: pos.id || `existing_${index}_${Date.now()}`
            }));

            setFormData({
                name: template.name || '',
                description: template.description || '',
                template_type: template.template_type || 'squad',
                applicable_unit_types: template.applicable_unit_types || [],
                template_positions: transformedPositions
            });

            // Expand first few positions by default in edit mode
            const initialExpanded = {};
            transformedPositions.slice(0, 3).forEach(pos => {
                initialExpanded[pos.id] = true;
            });
            setExpandedPositions(initialExpanded);
        }
    }, [template]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Try multiple possible endpoints for roles
            let rolesData = [];
            let unitTypesData = [];

            try {
                // Try the primary endpoint
                const rolesResponse = await api.get('/personnel/roles/');
                rolesData = rolesResponse.data.results || rolesResponse.data || [];
            } catch (error) {
                console.error('Error fetching from /personnel/roles/, trying alternate endpoints...', error);

                // Try alternate endpoints
                try {
                    const altResponse = await api.get('/api/personnel/roles/');
                    rolesData = altResponse.data.results || altResponse.data || [];
                } catch (altError) {
                    try {
                        const altResponse2 = await api.get('/roles/');
                        rolesData = altResponse2.data.results || altResponse2.data || [];
                    } catch (altError2) {
                        console.error('Could not fetch roles from any endpoint');
                        // Provide some default roles as fallback
                        rolesData = [
                            { id: 1, name: 'Squad Leader', abbreviation: 'SL' },
                            { id: 2, name: 'Team Leader', abbreviation: 'TL' },
                            { id: 3, name: 'Rifleman', abbreviation: 'R' },
                            { id: 4, name: 'Automatic Rifleman', abbreviation: 'AR' },
                            { id: 5, name: 'Grenadier', abbreviation: 'GR' },
                            { id: 6, name: 'Medic', abbreviation: 'M' },
                        ];
                    }
                }
            }

            try {
                const unitTypesResponse = await api.get('/units/unit-types/');
                unitTypesData = unitTypesResponse.data.results || unitTypesResponse.data || [];
            } catch (error) {
                console.error('Error fetching unit types:', error);
                // Provide default unit types
                unitTypesData = [
                    { id: 1, name: 'Infantry' },
                    { id: 2, name: 'Mechanized' },
                    { id: 3, name: 'Armored' },
                    { id: 4, name: 'Artillery' },
                    { id: 5, name: 'Support' }
                ];
            }

            console.log('Loaded roles:', rolesData);
            console.log('Loaded unit types:', unitTypesData);

            setAvailableRoles(rolesData);
            setAvailableUnitTypes(unitTypesData);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleUnitTypeToggle = (unitType) => {
        setFormData(prev => ({
            ...prev,
            applicable_unit_types: prev.applicable_unit_types.includes(unitType)
                ? prev.applicable_unit_types.filter(ut => ut !== unitType)
                : [...prev.applicable_unit_types, unitType]
        }));
    };

    const addPosition = () => {
        const newPosition = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
            role: availableRoles[0]?.id || '',
            naming_pattern: '{unit_name} {role_name}',
            identifier_pattern: '',
            quantity: 1,
            parent_template_position: null,
            display_order: formData.template_positions.length,
            override_min_rank: null,
            override_max_rank: null,
            additional_config: {}
        };

        setFormData(prev => ({
            ...prev,
            template_positions: [...prev.template_positions, newPosition]
        }));

        // Expand the new position
        setExpandedPositions(prev => ({
            ...prev,
            [newPosition.id]: true
        }));
    };

    const updatePosition = (positionId, field, value) => {
        setFormData(prev => ({
            ...prev,
            template_positions: prev.template_positions.map(pos =>
                pos.id === positionId ? { ...pos, [field]: value } : pos
            )
        }));
    };

    const removePosition = (positionId) => {
        setFormData(prev => ({
            ...prev,
            template_positions: prev.template_positions.filter(pos => pos.id !== positionId)
        }));
    };

    const togglePositionExpanded = (positionId) => {
        setExpandedPositions(prev => ({
            ...prev,
            [positionId]: !prev[positionId]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Template name is required';
        }

        if (!formData.template_type) {
            newErrors.template_type = 'Template type is required';
        }

        if (formData.template_positions.length === 0) {
            newErrors.positions = 'At least one position is required';
        }

        formData.template_positions.forEach((pos, index) => {
            if (!pos.role) {
                newErrors[`position_${index}_role`] = 'Role is required';
            }
            if (pos.quantity < 1) {
                newErrors[`position_${index}_quantity`] = 'Quantity must be at least 1';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                template_positions: formData.template_positions.map(pos => ({
                    role: pos.role,
                    quantity: pos.quantity,
                    is_leadership: pos.is_leadership,
                    is_required: pos.is_required,
                    notes: pos.notes
                }))
            };

            if (isEditMode) {
                await api.put(`/units/position-templates/${template.id}/`, payload);
            } else {
                await api.post('/units/position-templates/', payload);
            }

            onSave();
        } catch (error) {
            console.error('Error saving template:', error);
            setErrors({
                submit: error.response?.data?.detail || 'Failed to save template'
            });
        } finally {
            setSaving(false);
        }
    };

    const getTemplateTypeIcon = (type) => {
        const icons = {
            'squad': <Users size={16} />,
            'platoon': <Shield size={16} />,
            'company': <Building size={16} />,
            'battalion': <GitBranch size={16} />,
            'custom': <Package size={16} />
        };
        return icons[type] || <Package size={16} />;
    };

    const templateTypes = [
        { value: 'squad', label: 'Squad', icon: <Users size={16} /> },
        { value: 'platoon', label: 'Platoon', icon: <Shield size={16} /> },
        { value: 'company', label: 'Company', icon: <Building size={16} /> },
        { value: 'battalion', label: 'Battalion', icon: <GitBranch size={16} /> },
        { value: 'custom', label: 'Custom', icon: <Package size={16} /> }
    ];

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="loading-state">
                        <Loader className="spinner" size={32} />
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-header">
                    <h2>
                        {getTemplateTypeIcon(formData.template_type)}
                        {isEditMode ? `Edit Template: ${template.name}` : 'Create Position Template'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    {errors.submit && (
                        <div className="error-banner">
                            <AlertCircle size={16} />
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <label htmlFor="name">Template Name *</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g., Standard Infantry Squad"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && (
                                <div className="field-error">{errors.name}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the purpose and structure of this template..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Template Type *</label>
                            <div className="template-type-selector">
                                {templateTypes.map(type => (
                                    <button
                                        key={type.value}
                                        className={`type-option ${formData.template_type === type.value ? 'selected' : ''}`}
                                        onClick={() => handleInputChange('template_type', type.value)}
                                    >
                                        {type.icon}
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.template_type && (
                                <div className="field-error">{errors.template_type}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Applicable Unit Types</label>
                            {availableUnitTypes.length === 0 ? (
                                <div style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    color: '#999',
                                    background: '#1a1a1a',
                                    borderRadius: '0.375rem'
                                }}>
                                    No unit types available
                                </div>
                            ) : (
                                <div className="unit-types-grid">
                                    {availableUnitTypes.map(unitType => (
                                        <label key={unitType.id || unitType} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.applicable_unit_types.includes(unitType.name || unitType)}
                                                onChange={() => handleUnitTypeToggle(unitType.name || unitType)}
                                            />
                                            <span>{unitType.name || unitType}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h3>Positions</h3>
                            <button className="btn secondary small" onClick={addPosition}>
                                <Plus size={16} />
                                Add Position
                            </button>
                        </div>

                        {errors.positions && (
                            <div className="field-error">{errors.positions}</div>
                        )}

                        <div className="positions-list">
                            {formData.template_positions.map((position, index) => (
                                <div key={position.id} className="position-item">
                                    <div className="position-header">
                                        <div className="position-summary">
                                            <span className="position-role">
                                                {availableRoles.find(r => r.id === position.role)?.name || 'Select Role'}
                                            </span>
                                            <span className="position-quantity">×{position.quantity}</span>
                                        </div>
                                        <div className="position-actions">
                                            <button
                                                className="icon-btn"
                                                onClick={() => togglePositionExpanded(position.id)}
                                            >
                                                {expandedPositions[position.id] ?
                                                    <ChevronUp size={16} /> :
                                                    <ChevronDown size={16} />
                                                }
                                            </button>
                                            <button
                                                className="icon-btn danger"
                                                onClick={() => removePosition(position.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedPositions[position.id] && (
                                        <div className="position-details">
                                            <div className="form-row">
                                                <div className="form-group flex-2">
                                                    <label>Role *</label>
                                                    <select
                                                        value={position.role}
                                                        onChange={(e) => updatePosition(position.id, 'role', e.target.value)}
                                                        className={errors[`position_${index}_role`] ? 'error' : ''}
                                                    >
                                                        <option value="">Select a role</option>
                                                        {availableRoles.map(role => (
                                                            <option key={role.id} value={role.id}>
                                                                {role.name} ({role.abbreviation})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors[`position_${index}_role`] && (
                                                        <div className="field-error">{errors[`position_${index}_role`]}</div>
                                                    )}
                                                </div>

                                                <div className="form-group flex-1">
                                                    <label>Quantity *</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={position.quantity}
                                                        onChange={(e) => updatePosition(position.id, 'quantity', parseInt(e.target.value) || 1)}
                                                        className={errors[`position_${index}_quantity`] ? 'error' : ''}
                                                    />
                                                    {errors[`position_${index}_quantity`] && (
                                                        <div className="field-error">{errors[`position_${index}_quantity`]}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={position.is_leadership}
                                                        onChange={(e) => updatePosition(position.id, 'is_leadership', e.target.checked)}
                                                    />
                                                    <span>Leadership Position</span>
                                                </label>

                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={position.is_required}
                                                        onChange={(e) => updatePosition(position.id, 'is_required', e.target.checked)}
                                                    />
                                                    <span>Required Position</span>
                                                </label>
                                            </div>

                                            <div className="form-group">
                                                <label>Notes</label>
                                                <input
                                                    type="text"
                                                    value={position.notes}
                                                    onChange={(e) => updatePosition(position.id, 'notes', e.target.value)}
                                                    placeholder="Additional notes about this position..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {formData.template_positions.length === 0 && (
                            <div className="empty-positions">
                                <Users size={32} />
                                <p>No positions added yet</p>
                                <button className="btn secondary" onClick={addPosition}>
                                    <Plus size={16} />
                                    Add First Position
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button
                        className="btn primary"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader className="spinner small" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {isEditMode ? 'Update Template' : 'Create Template'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
// src/components/modals/RecruitmentModals.js
import React, { useState, useEffect } from 'react';
import {
    X, Users, Target, AlertCircle, Briefcase, Shield,
    Hash, Plus, Minus, Save, Info, TrendingUp
} from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

// Create Recruitment Slot Modal
export const CreateRecruitmentSlotModal = ({ unit, units, roles, onClose, onCreate }) => {

    const [formData, setFormData] = useState({
        unit: unit?.id || '',
        role: '',
        career_track: 'enlisted',
        total_slots: 1,
        filled_slots: 0,
        reserved_slots: 0,
        is_active: true,
        notes: ''
    });

    const [selectedRole, setSelectedRole] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.role) {
            alert('Please select a role');
            return;
        }

        if (!formData.unit) {
            alert('Please select a unit');
            return;
        }
        onCreate(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setFormData(prev => ({ ...prev, role: roleId }));

        const role = roles.find(r => r.id === roleId);
        setSelectedRole(role);

        // Auto-set career track based on role
        if (role?.typical_rank) {
            if (role.typical_rank.is_officer) {
                setFormData(prev => ({ ...prev, career_track: 'officer' }));
            } else if (role.typical_rank.is_warrant) {
                setFormData(prev => ({ ...prev, career_track: 'warrant' }));
            } else {
                setFormData(prev => ({ ...prev, career_track: 'enlisted' }));
            }
        }
    };

    const availableSlots = formData.total_slots - formData.filled_slots - formData.reserved_slots;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>
                        <Users size={24} />
                        Create Recruitment Slot {unit && `for ${unit.name}`}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {!unit && (
                        <div className="form-group">
                            <label htmlFor="unit">Unit *</label>
                            <select
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Unit</option>
                                {units && units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name} {unit.abbreviation && `(${unit.abbreviation})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="role">Role *</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleRoleChange}
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
                        <div className="form-group">
                            <label htmlFor="career_track">Career Track *</label>
                            <select
                                id="career_track"
                                name="career_track"
                                value={formData.career_track}
                                onChange={handleChange}
                                required
                            >
                                <option value="enlisted">Enlisted</option>
                                <option value="officer">Officer</option>
                                <option value="warrant">Warrant Officer</option>
                            </select>
                        </div>
                    </div>

                    {selectedRole && (
                        <div className="role-info-box">
                            <h4>
                                <Info size={16} />
                                Role Information
                            </h4>
                            <div className="role-details">
                                <div className="detail-item">
                                    <span className="label">Category:</span>
                                    <span className={`category-badge ${selectedRole.category}`}>
                                        {selectedRole.category}
                                    </span>
                                </div>
                                {selectedRole.typical_rank && (
                                    <div className="detail-item">
                                        <span className="label">Typical Rank:</span>
                                        <span>{selectedRole.typical_rank.abbreviation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="slot-configuration">
                        <h4>Slot Configuration</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="total_slots">
                                    <Target size={16} />
                                    Total Slots
                                </label>
                                <input
                                    type="number"
                                    id="total_slots"
                                    name="total_slots"
                                    value={formData.total_slots}
                                    onChange={handleChange}
                                    min="1"
                                    max="99"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="filled_slots">
                                    <Users size={16} />
                                    Filled Slots
                                </label>
                                <input
                                    type="number"
                                    id="filled_slots"
                                    name="filled_slots"
                                    value={formData.filled_slots}
                                    onChange={handleChange}
                                    min="0"
                                    max={formData.total_slots}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reserved_slots">
                                    <Shield size={16} />
                                    Reserved Slots
                                </label>
                                <input
                                    type="number"
                                    id="reserved_slots"
                                    name="reserved_slots"
                                    value={formData.reserved_slots}
                                    onChange={handleChange}
                                    min="0"
                                    max={formData.total_slots - formData.filled_slots}
                                />
                            </div>
                        </div>

                        <div className="slot-summary">
                            <div className="summary-item">
                                <span className="label">Available Slots:</span>
                                <span className={`value ${availableSlots > 0 ? 'positive' : 'zero'}`}>
                                    {availableSlots}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Fill Rate:</span>
                                <span className="value">
                                    {formData.total_slots > 0
                                        ? Math.round((formData.filled_slots / formData.total_slots) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any special requirements or notes..."
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
                            Slot is Active
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            <Plus size={16} />
                            Create Slot
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Recruitment Slot Modal
export const EditRecruitmentSlotModal = ({ slot, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        total_slots: slot.total_slots || 1,
        filled_slots: slot.filled_slots || 0,
        reserved_slots: slot.reserved_slots || 0,
        is_active: slot.is_active !== undefined ? slot.is_active : true,
        notes: slot.notes || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(slot.id, formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const availableSlots = formData.total_slots - formData.filled_slots - formData.reserved_slots;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>
                        <Users size={24} />
                        Edit Recruitment Slot
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="slot-info">
                        <h4>Slot Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Unit:</span>
                                <span className="value">{slot.unit_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Role:</span>
                                <span className="value">{slot.role_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Career Track:</span>
                                <span className="value">{slot.career_track}</span>
                            </div>
                        </div>
                    </div>

                    <div className="slot-configuration">
                        <h4>Slot Configuration</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="total_slots">
                                    <Target size={16} />
                                    Total Slots
                                </label>
                                <input
                                    type="number"
                                    id="total_slots"
                                    name="total_slots"
                                    value={formData.total_slots}
                                    onChange={handleChange}
                                    min="1"
                                    max="99"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="filled_slots">
                                    <Users size={16} />
                                    Filled Slots
                                </label>
                                <input
                                    type="number"
                                    id="filled_slots"
                                    name="filled_slots"
                                    value={formData.filled_slots}
                                    onChange={handleChange}
                                    min="0"
                                    max={formData.total_slots}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reserved_slots">
                                    <Shield size={16} />
                                    Reserved Slots
                                </label>
                                <input
                                    type="number"
                                    id="reserved_slots"
                                    name="reserved_slots"
                                    value={formData.reserved_slots}
                                    onChange={handleChange}
                                    min="0"
                                    max={formData.total_slots - formData.filled_slots}
                                />
                            </div>
                        </div>

                        <div className="slot-summary">
                            <div className="summary-item">
                                <span className="label">Available Slots:</span>
                                <span className={`value ${availableSlots > 0 ? 'positive' : 'zero'}`}>
                                    {availableSlots}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Fill Rate:</span>
                                <span className="value">
                                    {formData.total_slots > 0
                                        ? Math.round((formData.filled_slots / formData.total_slots) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any special requirements or notes..."
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
                            Slot is Active
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            <Save size={16} />
                            Update Slot
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Unit Recruitment Status Modal
export const UnitRecruitmentStatusModal = ({ unit, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        recruitment_status: unit.recruitment_status || 'open',
        max_personnel: unit.max_personnel || 0,
        target_personnel: unit.target_personnel || 0,
        recruitment_notes: unit.recruitment_notes || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(unit.id, formData);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'success';
            case 'limited': return 'warning';
            case 'closed': return 'danger';
            case 'frozen': return 'info';
            default: return 'default';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>
                        <Target size={24} />
                        Unit Recruitment Status - {unit.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="recruitment_status">Recruitment Status *</label>
                        <select
                            id="recruitment_status"
                            name="recruitment_status"
                            value={formData.recruitment_status}
                            onChange={handleChange}
                            required
                        >
                            <option value="open">Open for Recruitment</option>
                            <option value="limited">Limited Recruitment</option>
                            <option value="closed">Closed to Recruitment</option>
                            <option value="frozen">Temporarily Frozen</option>
                        </select>
                        <div className={`status-description ${getStatusColor(formData.recruitment_status)}`}>
                            {formData.recruitment_status === 'open' &&
                                'Unit is actively recruiting for all positions'}
                            {formData.recruitment_status === 'limited' &&
                                'Unit is recruiting for specific positions only'}
                            {formData.recruitment_status === 'closed' &&
                                'Unit is not accepting new applications'}
                            {formData.recruitment_status === 'frozen' &&
                                'Recruitment temporarily suspended'}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="max_personnel">
                                <Hash size={16} />
                                Maximum Personnel
                            </label>
                            <input
                                type="number"
                                id="max_personnel"
                                name="max_personnel"
                                value={formData.max_personnel}
                                onChange={handleChange}
                                min="0"
                                max="999"
                            />
                            <span className="field-hint">
                                Maximum authorized personnel for this unit
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="target_personnel">
                                <Target size={16} />
                                Target Personnel
                            </label>
                            <input
                                type="number"
                                id="target_personnel"
                                name="target_personnel"
                                value={formData.target_personnel}
                                onChange={handleChange}
                                min="0"
                                max="999"
                            />
                            <span className="field-hint">
                                Ideal personnel strength
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="recruitment_notes">
                            <Info size={16} />
                            Recruitment Notes
                        </label>
                        <textarea
                            id="recruitment_notes"
                            name="recruitment_notes"
                            value={formData.recruitment_notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Special requirements, restrictions, or notes about recruitment..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            <Save size={16} />
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
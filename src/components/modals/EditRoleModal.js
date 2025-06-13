import React, { useState, useEffect } from 'react';
import {
    X, Tag, Star, Users, Shield, Award, Hash
} from 'lucide-react';
import './AdminModals.css';

export const EditRoleModal = ({ role, branches, ranks, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        description: '',
        category: '',
        is_command_role: false,
        is_staff_role: false,
        is_nco_role: false,
        is_specialist_role: false,
        parent_role: '',
        min_rank: '',
        max_rank: '',
        typical_rank: '',
        allowed_branches: [],
        allowed_unit_types: [],
        min_time_in_service: 0,
        min_time_in_grade: 0,
        min_operations_count: 0,
        responsibilities: '',
        authorities: '',
        icon_url: '',
        badge_url: '',
        color_code: '',
        default_slots_per_unit: 1,
        max_slots_per_unit: 1,
        sort_order: 100,
        is_active: true
    });

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name || '',
                abbreviation: role.abbreviation || '',
                description: role.description || '',
                category: role.category || '',
                is_command_role: role.is_command_role || false,
                is_staff_role: role.is_staff_role || false,
                is_nco_role: role.is_nco_role || false,
                is_specialist_role: role.is_specialist_role || false,
                parent_role: role.parent_role || '',
                min_rank: role.min_rank || '',
                max_rank: role.max_rank || '',
                typical_rank: role.typical_rank || '',
                allowed_branches: role.allowed_branches?.map(b => b.id || b) || [],
                allowed_unit_types: role.allowed_unit_types || [],
                min_time_in_service: role.min_time_in_service || 0,
                min_time_in_grade: role.min_time_in_grade || 0,
                min_operations_count: role.min_operations_count || 0,
                responsibilities: role.responsibilities || '',
                authorities: role.authorities || '',
                icon_url: role.icon_url || '',
                badge_url: role.badge_url || '',
                color_code: role.color_code || '',
                default_slots_per_unit: role.default_slots_per_unit || 1,
                max_slots_per_unit: role.max_slots_per_unit || 1,
                sort_order: role.sort_order || 100,
                is_active: role.is_active !== undefined ? role.is_active : true
            });
        }
    }, [role]);

    const unitTypes = [
        'Corps', 'Division', 'Brigade', 'Regiment',
        'Battalion', 'Company', 'Platoon', 'Squad',
        'Team', 'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            parent_role: formData.parent_role || null,
            min_rank: formData.min_rank || null,
            max_rank: formData.max_rank || null,
            typical_rank: formData.typical_rank || null,
            allowed_branches: formData.allowed_branches, // Keep as array of strings/UUIDs
            min_time_in_service: parseInt(formData.min_time_in_service),
            min_time_in_grade: parseInt(formData.min_time_in_grade),
            min_operations_count: parseInt(formData.min_operations_count),
            default_slots_per_unit: parseInt(formData.default_slots_per_unit),
            max_slots_per_unit: parseInt(formData.max_slots_per_unit),
            sort_order: parseInt(formData.sort_order)
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

    const handleBranchToggle = (branchId) => {
        setFormData(prev => ({
            ...prev,
            allowed_branches: prev.allowed_branches.includes(branchId)
                ? prev.allowed_branches.filter(id => id !== branchId)
                : [...prev.allowed_branches, branchId]
        }));
    };

    const handleUnitTypeToggle = (unitType) => {
        setFormData(prev => ({
            ...prev,
            allowed_unit_types: prev.allowed_unit_types.includes(unitType)
                ? prev.allowed_unit_types.filter(type => type !== unitType)
                : [...prev.allowed_unit_types, unitType]
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-header">
                    <h2>
                        <Tag size={24} />
                        Edit Role: {role?.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Role Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Company Commander"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="abbreviation">Abbreviation</label>
                                <input
                                    type="text"
                                    id="abbreviation"
                                    name="abbreviation"
                                    value={formData.abbreviation}
                                    onChange={handleChange}
                                    placeholder="e.g., CO"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="command">Command</option>
                                <option value="staff">Staff</option>
                                <option value="nco">Non-Commissioned Officer</option>
                                <option value="specialist">Specialist</option>
                                <option value="trooper">Trooper</option>
                                <option value="support">Support</option>
                                <option value="medical">Medical</option>
                                <option value="logistics">Logistics</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="communications">Communications</option>
                                <option value="aviation">Aviation</option>
                                <option value="armor">Armor</option>
                                <option value="infantry">Infantry</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Brief description of the role..."
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <h4>Role Type</h4>
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_command_role"
                                    checked={formData.is_command_role}
                                    onChange={handleChange}
                                />
                                <Star size={16} />
                                Command Role
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_staff_role"
                                    checked={formData.is_staff_role}
                                    onChange={handleChange}
                                />
                                <Users size={16} />
                                Staff Role
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_nco_role"
                                    checked={formData.is_nco_role}
                                    onChange={handleChange}
                                />
                                <Shield size={16} />
                                NCO Role
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_specialist_role"
                                    checked={formData.is_specialist_role}
                                    onChange={handleChange}
                                />
                                <Award size={16} />
                                Specialist Role
                            </label>
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                Active Role
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Rank Requirements</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="min_rank">Minimum Rank</label>
                                <select
                                    id="min_rank"
                                    name="min_rank"
                                    value={formData.min_rank}
                                    onChange={handleChange}
                                >
                                    <option value="">No minimum</option>
                                    {ranks.map(rank => (
                                        <option key={rank.id} value={rank.id}>
                                            {rank.abbreviation} - {rank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="max_rank">Maximum Rank</label>
                                <select
                                    id="max_rank"
                                    name="max_rank"
                                    value={formData.max_rank}
                                    onChange={handleChange}
                                >
                                    <option value="">No maximum</option>
                                    {ranks.map(rank => (
                                        <option key={rank.id} value={rank.id}>
                                            {rank.abbreviation} - {rank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="typical_rank">Typical Rank</label>
                                <select
                                    id="typical_rank"
                                    name="typical_rank"
                                    value={formData.typical_rank}
                                    onChange={handleChange}
                                >
                                    <option value="">Not specified</option>
                                    {ranks.map(rank => (
                                        <option key={rank.id} value={rank.id}>
                                            {rank.abbreviation} - {rank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Service Requirements</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="min_time_in_service">
                                    Min Time in Service (days)
                                </label>
                                <input
                                    type="number"
                                    id="min_time_in_service"
                                    name="min_time_in_service"
                                    value={formData.min_time_in_service}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="min_time_in_grade">
                                    Min Time in Grade (days)
                                </label>
                                <input
                                    type="number"
                                    id="min_time_in_grade"
                                    name="min_time_in_grade"
                                    value={formData.min_time_in_grade}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="min_operations_count">
                                    Min Operations Count
                                </label>
                                <input
                                    type="number"
                                    id="min_operations_count"
                                    name="min_operations_count"
                                    value={formData.min_operations_count}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Restrictions</h3>

                        <div className="form-group">
                            <label>Allowed Branches (leave empty for all)</label>
                            <div className="checkbox-grid">
                                {branches.map(branch => (
                                    <label key={branch.id} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.allowed_branches.includes(branch.id)}
                                            onChange={() => handleBranchToggle(branch.id)}
                                        />
                                        {branch.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Allowed Unit Types (leave empty for all)</label>
                            <div className="checkbox-grid">
                                {unitTypes.map(type => (
                                    <label key={type} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.allowed_unit_types.includes(type)}
                                            onChange={() => handleUnitTypeToggle(type)}
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Role Details</h3>

                        <div className="form-group">
                            <label htmlFor="responsibilities">Responsibilities</label>
                            <textarea
                                id="responsibilities"
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Key responsibilities of this role..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="authorities">Authorities</label>
                            <textarea
                                id="authorities"
                                name="authorities"
                                value={formData.authorities}
                                onChange={handleChange}
                                rows="3"
                                placeholder="What this role is authorized to do..."
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Slot Configuration</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="default_slots_per_unit">
                                    <Hash size={16} />
                                    Default Slots per Unit
                                </label>
                                <input
                                    type="number"
                                    id="default_slots_per_unit"
                                    name="default_slots_per_unit"
                                    value={formData.default_slots_per_unit}
                                    onChange={handleChange}
                                    min="1"
                                    max="99"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="max_slots_per_unit">
                                    <Hash size={16} />
                                    Maximum Slots per Unit
                                </label>
                                <input
                                    type="number"
                                    id="max_slots_per_unit"
                                    name="max_slots_per_unit"
                                    value={formData.max_slots_per_unit}
                                    onChange={handleChange}
                                    min="1"
                                    max="99"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="sort_order">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    id="sort_order"
                                    name="sort_order"
                                    value={formData.sort_order}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            Update Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
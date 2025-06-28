import React, { useState } from 'react';
import { X, Briefcase, FileText, Shield, Clock, MapPin, Edit } from 'lucide-react';
import './AdminModals.css';

const EditMOSModal = ({ mos, branches, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        code: mos.code || '',
        title: mos.title || '',
        branch: mos.branch || '',
        category: mos.category || 'combat_arms',
        description: mos.description || '',
        is_active: mos.is_active !== undefined ? mos.is_active : true,
        is_entry_level: mos.is_entry_level !== undefined ? mos.is_entry_level : true,
        min_asvab_score: mos.min_asvab_score || 0,
        security_clearance_required: mos.security_clearance_required || 'none',
        physical_demand_rating: mos.physical_demand_rating || 'moderate',
        ait_weeks: mos.ait_weeks || 0,
        ait_location: mos.ait_location || '',
        requires_reclassification: mos.requires_reclassification || false
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.code.trim()) {
            newErrors.code = 'MOS code is required';
        }
        if (!formData.title.trim()) {
            newErrors.title = 'MOS title is required';
        }
        if (!formData.branch) {
            newErrors.branch = 'Branch is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onUpdate(mos.id, formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Edit size={20} />
                        Edit MOS: {mos.code}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Current MOS Info */}
                    {(mos.holders_count > 0 || mos.positions_count > 0) && (
                        <div className="info-message">
                            <Briefcase size={18} />
                            <div>
                                <strong>This MOS is currently in use</strong>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                    {mos.holders_count > 0 && `${mos.holders_count} personnel have this MOS`}
                                    {mos.holders_count > 0 && mos.positions_count > 0 && ' • '}
                                    {mos.positions_count > 0 && `${mos.positions_count} positions require this MOS`}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="form-section">
                        <h3>
                            <FileText size={18} />
                            Basic Information
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>MOS Code*</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g., 11B"
                                    className={errors.code ? 'error' : ''}
                                />
                                {errors.code && <span className="error-message">{errors.code}</span>}
                                <span className="field-help">Unique MOS identifier</span>
                            </div>

                            <div className="form-group">
                                <label>Branch*</label>
                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className={errors.branch ? 'error' : ''}
                                >
                                    <option value="">Select Branch...</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.branch && <span className="error-message">{errors.branch}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>MOS Title*</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Infantry"
                                className={errors.title ? 'error' : ''}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label>Category*</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="combat_arms">Combat Arms</option>
                                <option value="combat_support">Combat Support</option>
                                <option value="combat_service_support">Combat Service Support</option>
                                <option value="special_operations">Special Operations</option>
                                <option value="aviation">Aviation</option>
                                <option value="medical">Medical</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="signal">Signal/Communications</option>
                                <option value="logistics">Logistics</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="administration">Administration</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Brief description of the MOS..."
                            />
                        </div>

                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span>Active</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_entry_level"
                                    checked={formData.is_entry_level}
                                    onChange={handleChange}
                                />
                                <span>Entry Level</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="requires_reclassification"
                                    checked={formData.requires_reclassification}
                                    onChange={handleChange}
                                />
                                <span>Requires Reclassification</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>
                            <Shield size={18} />
                            Requirements
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Minimum ASVAB Score</label>
                                <input
                                    type="number"
                                    name="min_asvab_score"
                                    value={formData.min_asvab_score}
                                    onChange={handleChange}
                                    min="0"
                                    max="99"
                                />
                                <span className="field-help">0 = No requirement</span>
                            </div>

                            <div className="form-group">
                                <label>Security Clearance</label>
                                <select
                                    name="security_clearance_required"
                                    value={formData.security_clearance_required}
                                    onChange={handleChange}
                                >
                                    <option value="none">None</option>
                                    <option value="secret">Secret</option>
                                    <option value="top_secret">Top Secret</option>
                                    <option value="ts_sci">TS/SCI</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Physical Demand Rating</label>
                            <select
                                name="physical_demand_rating"
                                value={formData.physical_demand_rating}
                                onChange={handleChange}
                            >
                                <option value="light">Light</option>
                                <option value="moderate">Moderate</option>
                                <option value="heavy">Heavy</option>
                                <option value="very_heavy">Very Heavy</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>
                            <Clock size={18} />
                            Training Information
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>AIT Duration (weeks)</label>
                                <input
                                    type="number"
                                    name="ait_weeks"
                                    value={formData.ait_weeks}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <span className="field-help">Length of Advanced Individual Training</span>
                            </div>

                            <div className="form-group">
                                <label>AIT Location</label>
                                <div className="input-with-icon">
                                    <MapPin size={16} />
                                    <input
                                        type="text"
                                        name="ait_location"
                                        value={formData.ait_location}
                                        onChange={handleChange}
                                        placeholder="e.g., Fort Benning, GA"
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Update MOS
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMOSModal;
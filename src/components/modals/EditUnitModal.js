import React, { useState, useEffect } from 'react';
import {
    X, Shield, Building, FileText, MapPin, Calendar, Flag,
    User, Search, Briefcase, Plus, Trash2, GitBranch, Award
} from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

export const EditUnitModal = ({ unit, branches, units, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: unit.name || '',
        abbreviation: unit.abbreviation || '',
        branch: unit.branch || '',
        parent_unit: unit.parent_unit || '',
        unit_type: unit.unit_type || '',
        description: unit.description || '',
        emblem_url: unit.emblem_url || '',
        banner_image_url: unit.banner_image_url || '',
        motto: unit.motto || '',
        location: unit.location || '',
        established_date: unit.established_date || '',
        is_active: unit.is_active !== undefined ? unit.is_active : true,
        authorized_mos: unit.authorized_mos?.map(mos => mos.id || mos) || [],
        primary_mos: unit.primary_mos?.map(mos => mos.id || mos) || [],
        mos_training_capability: unit.mos_training_capability?.map(mos => mos.id || mos) || []
    });

    const [availableMOS, setAvailableMOS] = useState([]);
    const [loadingMOS, setLoadingMOS] = useState(false);

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

        // Validate branch is selected
        if (!formData.branch) {
            alert('Please select a branch');
            return;
        }

        const submitData = {
            ...formData,
            branch: formData.branch, // Keep as string UUID
            parent_unit: formData.parent_unit || null, // Keep as string UUID or null
            authorized_mos: formData.authorized_mos,
            primary_mos: formData.primary_mos,
            mos_training_capability: formData.mos_training_capability
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
                        <Shield size={24} />
                        Edit Unit: {unit.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Unit Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 1st Infantry Division"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="abbreviation">Abbreviation *</label>
                            <input
                                type="text"
                                id="abbreviation"
                                name="abbreviation"
                                value={formData.abbreviation}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 1ID"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="branch">Branch *</label>
                            <select
                                id="branch"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="unit_type">Unit Type</label>
                            <select
                                id="unit_type"
                                name="unit_type"
                                value={formData.unit_type}
                                onChange={handleChange}
                            >
                                <option value="">Select Type</option>
                                <optgroup label="Navy Units">
                                    <option value="navy_expeditionary_force">Expeditionary Force</option>
                                    <option value="navy_fleet">Fleet</option>
                                    <option value="navy_battle_group">Battle Group</option>
                                    <option value="navy_task_force">Task Force</option>
                                    <option value="navy_squadron">Squadron</option>
                                    <option value="navy_division">Division</option>
                                    <option value="navy_flight">Flight</option>
                                    <option value="navy_vessel">Individual Vessel</option>
                                </optgroup>
                                <optgroup label="Naval Aviation">
                                    <option value="aviation_air_wing">Air Wing</option>
                                    <option value="aviation_air_group">Air Group</option>
                                    <option value="aviation_squadron">Squadron</option>
                                    <option value="aviation_division">Division</option>
                                    <option value="aviation_flight">Flight</option>
                                    <option value="aviation_element">Element/Section</option>
                                </optgroup>
                                <optgroup label="Ground Forces">
                                    <option value="ground_corps">Corps</option>
                                    <option value="ground_division">Division</option>
                                    <option value="ground_brigade">Brigade/Regiment</option>
                                    <option value="ground_battalion">Battalion</option>
                                    <option value="ground_company">Company</option>
                                    <option value="ground_platoon">Platoon</option>
                                    <option value="ground_squad">Squad</option>
                                    <option value="ground_fire_team">Fire Team</option>
                                </optgroup>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="parent_unit">Parent Unit</label>
                        <select
                            id="parent_unit"
                            name="parent_unit"
                            value={formData.parent_unit}
                            onChange={handleChange}
                        >
                            <option value="">None (Top Level Unit)</option>
                            {units.filter(u => u.id !== unit.id).map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.abbreviation})
                                </option>
                            ))}
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
                            placeholder="Enter unit description..."
                        />
                    </div>

                    {/* MOS Configuration Section */}
                    <div className="form-section">
                        <h3>
                            <Award size={16} />
                            MOS Configuration
                        </h3>

                        {loadingMOS ? (
                            <div className="loading-state">
                                <div className="spinner small"></div>
                                <p>Loading MOS options...</p>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Authorized MOS</label>
                                    <p className="field-hint">Select MOS that are authorized for this unit</p>
                                    {Object.entries(mosByCategory).map(([category, mosList]) => (
                                        <div key={category} className="mos-category-group">
                                            <h5>{category.replace(/_/g, ' ').toUpperCase()}</h5>
                                            <div className="checkbox-grid">
                                                {mosList.map(mos => (
                                                    <label key={mos.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.authorized_mos.includes(mos.id)}
                                                            onChange={() => handleMOSToggle(mos.id, 'authorized_mos')}
                                                        />
                                                        <span>{mos.code} - {mos.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>Primary MOS</label>
                                    <p className="field-hint">Select the primary MOS for this unit type</p>
                                    {Object.entries(mosByCategory).map(([category, mosList]) => (
                                        <div key={category} className="mos-category-group">
                                            <h5>{category.replace(/_/g, ' ').toUpperCase()}</h5>
                                            <div className="checkbox-grid">
                                                {mosList.filter(mos => formData.authorized_mos.includes(mos.id)).map(mos => (
                                                    <label key={mos.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.primary_mos.includes(mos.id)}
                                                            onChange={() => handleMOSToggle(mos.id, 'primary_mos')}
                                                        />
                                                        <span>{mos.code} - {mos.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>MOS Training Capability</label>
                                    <p className="field-hint">Select MOS this unit can provide training for</p>
                                    {Object.entries(mosByCategory).map(([category, mosList]) => (
                                        <div key={category} className="mos-category-group">
                                            <h5>{category.replace(/_/g, ' ').toUpperCase()}</h5>
                                            <div className="checkbox-grid">
                                                {mosList.map(mos => (
                                                    <label key={mos.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.mos_training_capability.includes(mos.id)}
                                                            onChange={() => handleMOSToggle(mos.id, 'mos_training_capability')}
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

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="motto">
                                <Flag size={16} />
                                Motto
                            </label>
                            <input
                                type="text"
                                id="motto"
                                name="motto"
                                value={formData.motto}
                                onChange={handleChange}
                                placeholder="e.g., No Mission Too Difficult"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">
                                <MapPin size={16} />
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Fort Bragg, NC"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="emblem_url">Emblem URL</label>
                            <input
                                type="url"
                                id="emblem_url"
                                name="emblem_url"
                                value={formData.emblem_url}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="established_date">
                                <Calendar size={16} />
                                Established Date
                            </label>
                            <input
                                type="date"
                                id="established_date"
                                name="established_date"
                                value={formData.established_date}
                                onChange={handleChange}
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
                            Unit is Active
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary">
                            Update Unit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
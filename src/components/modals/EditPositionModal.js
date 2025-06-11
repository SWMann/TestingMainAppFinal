import React, { useState } from 'react';
import {
    X, Briefcase, Star, Users, Hash
} from 'lucide-react';
import './AdminModals.css';

export const EditPositionModal = ({ position, units, ranks, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: position.title || '',
        abbreviation: position.abbreviation || '',
        unit: position.unit || '',
        parent_position: position.parent_position || '',
        description: position.description || '',
        min_rank: position.min_rank?.id || '',
        max_rank: position.max_rank?.id || '',
        is_command_position: position.is_command_position || false,
        is_staff_position: position.is_staff_position || false,
        responsibilities: position.responsibilities || '',
        max_slots: position.max_slots || 1
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            unit: parseInt(formData.unit),
            parent_position: formData.parent_position ? parseInt(formData.parent_position) : null,
            min_rank: formData.min_rank ? parseInt(formData.min_rank) : null,
            max_rank: formData.max_rank ? parseInt(formData.max_rank) : null,
            max_slots: parseInt(formData.max_slots)
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
                        Edit Position: {position.title}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Position Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
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
                            />
                        </div>
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

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
                    </div>

                    <div className="form-group">
                        <label htmlFor="responsibilities">Responsibilities</label>
                        <textarea
                            id="responsibilities"
                            name="responsibilities"
                            value={formData.responsibilities}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="max_slots">
                                <Hash size={16} />
                                Maximum Slots
                            </label>
                            <input
                                type="number"
                                id="max_slots"
                                name="max_slots"
                                value={formData.max_slots}
                                onChange={handleChange}
                                min="1"
                                max="99"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_command_position"
                                    checked={formData.is_command_position}
                                    onChange={handleChange}
                                />
                                <Star size={16} />
                                Command Position
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_staff_position"
                                    checked={formData.is_staff_position}
                                    onChange={handleChange}
                                />
                                <Users size={16} />
                                Staff Position
                            </label>
                        </div>
                    </div>

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
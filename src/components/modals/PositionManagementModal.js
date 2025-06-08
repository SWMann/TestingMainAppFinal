import React, { useState, useEffect } from 'react';
import {
    X, Shield, Building, FileText, MapPin, Calendar, Flag,
    User, Search, Briefcase, Plus, Trash2, GitBranch
} from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

// PositionManagementModal.js
export const PositionManagementModal = ({ unit, onClose, onUpdate }) => {
    const [positions, setPositions] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        abbreviation: '',
        description: '',
        is_command_position: false,
        is_staff_position: false,
        max_slots: 1
    });
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const response = await api.get(`/units/${unit.id}/positions/`);
            setPositions(response.data);
        } catch (error) {
            console.error('Error fetching positions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePosition = async (e) => {
        e.preventDefault();
        try {
            await api.post('/positions/', {
                ...formData,
                unit: unit.id
            });
            await fetchPositions();
            setShowCreateForm(false);
            setFormData({
                title: '',
                abbreviation: '',
                description: '',
                is_command_position: false,
                is_staff_position: false,
                max_slots: 1
            });
            onUpdate();
        } catch (error) {
            console.error('Error creating position:', error);
        }
    };

    const handleDeletePosition = async (positionId) => {
        if (!window.confirm('Are you sure you want to delete this position?')) {
            return;
        }

        try {
            await api.delete(`/positions/${positionId}/`);
            await fetchPositions();
            onUpdate();
        } catch (error) {
            console.error('Error deleting position:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-header">
                    <h2>
                        <Briefcase size={24} />
                        Manage Positions - {unit.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="section-header">
                        <h3>Current Positions ({positions.length})</h3>
                        <button
                            className="btn primary small"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            <Plus size={16} />
                            Add Position
                        </button>
                    </div>

                    {showCreateForm && (
                        <form onSubmit={handleCreatePosition} className="position-form">
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
                                        placeholder="e.g., Executive Officer"
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
                                        placeholder="e.g., XO"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Position responsibilities..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="max_slots">Max Slots</label>
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
                                        Command Position
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_staff_position"
                                            checked={formData.is_staff_position}
                                            onChange={handleChange}
                                        />
                                        Staff Position
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn secondary" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn primary">
                                    Create Position
                                </button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading positions...</p>
                        </div>
                    ) : positions.length === 0 ? (
                        <div className="empty-state">
                            <Briefcase size={48} />
                            <p>No positions defined for this unit</p>
                        </div>
                    ) : (
                        <div className="positions-grid">
                            {positions.map(position => (
                                <div key={position.id} className="position-card">
                                    <div className="position-header">
                                        <h4>{position.title}</h4>
                                        {position.abbreviation && (
                                            <span className="abbreviation">({position.abbreviation})</span>
                                        )}
                                    </div>
                                    {position.description && (
                                        <p className="position-description">{position.description}</p>
                                    )}
                                    <div className="position-meta">
                                        <div className="position-badges">
                                            {position.is_command_position && (
                                                <span className="badge command">Command</span>
                                            )}
                                            {position.is_staff_position && (
                                                <span className="badge staff">Staff</span>
                                            )}
                                            <span className="badge slots">
                                                {position.max_slots} slot{position.max_slots !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <button
                                            className="icon-btn danger"
                                            onClick={() => handleDeletePosition(position.id)}
                                            title="Delete Position"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

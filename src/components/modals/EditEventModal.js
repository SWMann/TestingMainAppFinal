import React, { useState, useEffect } from 'react';
import {
    X, Calendar, MapPin, Clock, Users, Flag, AlertCircle,
    FileText, ExternalLink, Building
} from 'lucide-react';
import './AdminModals.css';

const EditEventModal = ({ event, units, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'Training',
        start_time: '',
        end_time: '',
        location: '',
        coordinates: '',
        host_unit: '',
        image_url: '',
        max_participants: '',
        is_mandatory: false,
        is_public: true,
        briefing_url: '',
        status: 'Scheduled'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (event) {
            // Format datetime for input fields
            const formatDateTime = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                return date.toISOString().slice(0, 16);
            };

            setFormData({
                title: event.title || '',
                description: event.description || '',
                event_type: event.event_type || 'Training',
                start_time: formatDateTime(event.start_time),
                end_time: formatDateTime(event.end_time),
                location: event.location || '',
                coordinates: event.coordinates || '',
                host_unit: event.host_unit || '',
                image_url: event.image_url || '',
                max_participants: event.max_participants || '',
                is_mandatory: event.is_mandatory || false,
                is_public: event.is_public !== undefined ? event.is_public : true,
                briefing_url: event.briefing_url || '',
                status: event.status || 'Scheduled'
            });
        }
    }, [event]);

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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Event title is required';
        }

        if (!formData.start_time) {
            newErrors.start_time = 'Start time is required';
        }

        if (!formData.end_time) {
            newErrors.end_time = 'End time is required';
        }

        if (formData.start_time && formData.end_time) {
            const start = new Date(formData.start_time);
            const end = new Date(formData.end_time);
            if (end <= start) {
                newErrors.end_time = 'End time must be after start time';
            }
        }

        if (!formData.host_unit) {
            newErrors.host_unit = 'Host unit is required';
        }

        if (formData.max_participants && parseInt(formData.max_participants) < 1) {
            newErrors.max_participants = 'Must be at least 1';
        }

        if (formData.image_url && formData.image_url.length > 200) {
            newErrors.image_url = 'URL must be less than 200 characters';
        }

        if (formData.briefing_url && formData.briefing_url.length > 200) {
            newErrors.briefing_url = 'URL must be less than 200 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const submitData = {
                ...formData,
                host_unit: formData.host_unit, // Keep as UUID string
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
            };
            onUpdate(event.id, submitData);
        }
    };

    const hasChanges = () => {
        return Object.keys(formData).some(key => {
            if (key === 'start_time' || key === 'end_time') {
                // Compare dates properly
                const originalDate = event[key] ? new Date(event[key]).toISOString() : '';
                const formDate = formData[key] ? new Date(formData[key]).toISOString() : '';
                return originalDate !== formDate;
            }
            return formData[key] !== event[key];
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Calendar size={20} />
                        Edit Event - {event.title}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Event Title*</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Operation Thunder Training"
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Type*</label>
                            <select
                                name="event_type"
                                value={formData.event_type}
                                onChange={handleChange}
                            >
                                <option value="Operation">Operation</option>
                                <option value="Training">Training</option>
                                <option value="Ceremony">Ceremony</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Social">Social</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Host Unit*</label>
                            <select
                                name="host_unit"
                                value={formData.host_unit}
                                onChange={handleChange}
                                className={errors.host_unit ? 'error' : ''}
                            >
                                <option value="">Select Unit...</option>
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name} ({unit.abbreviation})
                                    </option>
                                ))}
                            </select>
                            {errors.host_unit && <span className="error-message">{errors.host_unit}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Postponed">Postponed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Provide event details, objectives, and any special instructions..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <Clock size={16} />
                                Start Time*
                            </label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                className={errors.start_time ? 'error' : ''}
                            />
                            {errors.start_time && <span className="error-message">{errors.start_time}</span>}
                        </div>

                        <div className="form-group">
                            <label>
                                <Clock size={16} />
                                End Time*
                            </label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                min={formData.start_time}
                                className={errors.end_time ? 'error' : ''}
                            />
                            {errors.end_time && <span className="error-message">{errors.end_time}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <MapPin size={16} />
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Training Ground Alpha"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <MapPin size={16} />
                                Coordinates
                            </label>
                            <input
                                type="text"
                                name="coordinates"
                                value={formData.coordinates}
                                onChange={handleChange}
                                placeholder="e.g., 123456 (for in-game)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <Users size={16} />
                                Max Participants
                            </label>
                            <input
                                type="number"
                                name="max_participants"
                                value={formData.max_participants}
                                onChange={handleChange}
                                min="1"
                                placeholder="Leave empty for unlimited"
                                className={errors.max_participants ? 'error' : ''}
                            />
                            {errors.max_participants && <span className="error-message">{errors.max_participants}</span>}
                        </div>

                        <div className="form-group">
                            <label>
                                <ExternalLink size={16} />
                                Briefing URL
                            </label>
                            <input
                                type="url"
                                name="briefing_url"
                                value={formData.briefing_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={errors.briefing_url ? 'error' : ''}
                            />
                            {errors.briefing_url && <span className="error-message">{errors.briefing_url}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FileText size={16} />
                            Event Image URL
                        </label>
                        <input
                            type="url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                            className={errors.image_url ? 'error' : ''}
                        />
                        {errors.image_url && <span className="error-message">{errors.image_url}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_mandatory"
                                    checked={formData.is_mandatory}
                                    onChange={handleChange}
                                />
                                <Flag size={16} />
                                Mandatory Event
                            </label>
                            <span className="field-help">All unit members must attend</span>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleChange}
                                />
                                <Building size={16} />
                                Public Event
                            </label>
                            <span className="field-help">Visible to all members</span>
                        </div>
                    </div>

                    {formData.image_url && (
                        <div className="image-preview">
                            <h4>Event Image Preview</h4>
                            <img
                                src={formData.image_url}
                                alt="Event preview"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {hasChanges() && (
                        <div className="warning-message">
                            <AlertCircle size={16} />
                            You have unsaved changes
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!hasChanges()}
                        >
                            Update Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEventModal;
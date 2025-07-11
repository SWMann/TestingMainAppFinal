// src/components/modals/InterviewScheduleModal.js
import React, { useState } from 'react';
import {
    X, Calendar, Clock, User, MessageSquare,
    MapPin, Video, Phone, AlertCircle, Send
} from 'lucide-react';
import './AdminModals.css';

const InterviewScheduleModal = ({ application, onClose, onSchedule }) => {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        type: 'discord', // discord, in-game, other
        location: '',
        duration: '30',
        interviewers: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.time) {
            alert('Please select both date and time for the interview');
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and time
            const interviewDateTime = new Date(`${formData.date}T${formData.time}`);

            await onSchedule(interviewDateTime.toISOString(), {
                type: formData.type,
                location: formData.location,
                duration: parseInt(formData.duration),
                interviewers: formData.interviewers,
                notes: formData.notes
            });

            onClose();
        } catch (error) {
            console.error('Error scheduling interview:', error);
            alert('Failed to schedule interview');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>SCHEDULE INTERVIEW</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-form">
                        {/* Applicant Info */}
                        <div className="form-section" style={{ marginBottom: '2rem' }}>
                            <h3>
                                <User size={20} />
                                CANDIDATE INFORMATION
                            </h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="label">Name:</span>
                                    <span className="value">{application.username}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Discord ID:</span>
                                    <span className="value">{application.discord_id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Preferred Branch:</span>
                                    <span className="value">{application.preferred_branch_name || 'None'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Form */}
                        <div className="schedule-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <Calendar size={16} />
                                        INTERVIEW DATE
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        min={today}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Clock size={16} />
                                        TIME (UTC)
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <MessageSquare size={16} />
                                        INTERVIEW TYPE
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="discord">Discord Voice</option>
                                        <option value="in-game">In-Game (Star Citizen)</option>
                                        <option value="text">Discord Text</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Clock size={16} />
                                        DURATION (MINUTES)
                                    </label>
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">1 hour</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    <MapPin size={16} />
                                    LOCATION / CHANNEL
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., #recruitment-voice, Port Olisar, etc."
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <User size={16} />
                                    ADDITIONAL INTERVIEWERS
                                </label>
                                <input
                                    type="text"
                                    name="interviewers"
                                    value={formData.interviewers}
                                    onChange={handleInputChange}
                                    placeholder="Comma-separated usernames (optional)"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <MessageSquare size={16} />
                                    INTERVIEW NOTES
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any special instructions or topics to cover..."
                                    rows={4}
                                    className="form-textarea"
                                />
                            </div>

                            <div className="warning-message" style={{ marginTop: '1rem' }}>
                                <AlertCircle size={16} />
                                <span>The applicant will be notified via Discord with the interview details</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            <Send size={18} />
                            {isSubmitting ? 'SCHEDULING...' : 'SCHEDULE INTERVIEW'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterviewScheduleModal;
// src/components/modals/MentorAssignmentModal.js
import React, { useState, useEffect } from 'react';
import {
    X, User, UserPlus, Search, Shield, Star,
    Award, Calendar, MessageSquare, CheckCircle,
    AlertCircle, TrendingUp, Users
} from 'lucide-react';
import './AdminModals.css';
import api from '../../services/api';

const MentorAssignmentModal = ({ recruit, onClose, onAssign }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [assignmentNotes, setAssignmentNotes] = useState('');
    const [availableMentors, setAvailableMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAvailableMentors();
    }, []);

    const fetchAvailableMentors = async () => {
        setIsLoading(true);
        try {
            // Fetch users who can be mentors (e.g., NCOs and above)
            const response = await api.get('/users/', {
                params: {
                    is_mentor_eligible: true,
                    is_active: true,
                    ordering: '-mentor_rating'
                }
            });

            // Filter out current mentors of this recruit if any
            const mentors = response.data.results || response.data;
            setAvailableMentors(mentors);
        } catch (error) {
            console.error('Error fetching mentors:', error);
            setAvailableMentors([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedMentor) {
            alert('Please select a mentor');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/onboarding/mentor-assignments/', {
                recruit: recruit.id,
                mentor: selectedMentor.id,
                assignment_notes: assignmentNotes
            });

            await onAssign();
            onClose();
        } catch (error) {
            console.error('Error assigning mentor:', error);
            alert('Failed to assign mentor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMentors = availableMentors.filter(mentor =>
        mentor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.discord_username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMentorStats = (mentor) => {
        return {
            mentees: mentor.current_mentees_count || 0,
            completed: mentor.completed_mentorships || 0,
            rating: mentor.mentor_rating || 0,
            specialties: mentor.mentor_specialties || []
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>ASSIGN MENTOR</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-form">
                    {/* Recruit Info */}
                    <div className="recruit-info">
                        <div className="info-header">
                            <User size={20} />
                            <span>RECRUIT INFORMATION</span>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Name:</span>
                                <span className="value">{recruit.username}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Discord:</span>
                                <span className="value">{recruit.discord_id}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Approved:</span>
                                <span className="value">{formatDate(recruit.review_date)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">MOS:</span>
                                <span className="value">
                                    {recruit.mos_priority_1_details?.code || 'Not assigned'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mentor Search */}
                    <div className="mentor-search">
                        <div className="search-input">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search mentors by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Available Mentors */}
                    <div className="mentors-section">
                        <h3>
                            <Users size={18} />
                            AVAILABLE MENTORS
                        </h3>

                        {isLoading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading available mentors...</p>
                            </div>
                        ) : filteredMentors.length === 0 ? (
                            <div className="empty-state">
                                <UserPlus size={48} />
                                <p>No available mentors found</p>
                            </div>
                        ) : (
                            <div className="mentors-list">
                                {filteredMentors.map(mentor => {
                                    const stats = getMentorStats(mentor);
                                    const isSelected = selectedMentor?.id === mentor.id;

                                    return (
                                        <div
                                            key={mentor.id}
                                            className={`mentor-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setSelectedMentor(mentor)}
                                        >
                                            <div className="mentor-header">
                                                <div className="mentor-info">
                                                    <h4>{mentor.username}</h4>
                                                    <div className="mentor-meta">
                                                        <span className="rank">
                                                            <Shield size={14} />
                                                            {mentor.rank_display}
                                                        </span>
                                                        <span className="unit">
                                                            {mentor.primary_unit_name}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle className="selected-icon" size={24} />
                                                )}
                                            </div>

                                            <div className="mentor-stats">
                                                <div className="stat">
                                                    <Users size={16} />
                                                    <span>{stats.mentees} active</span>
                                                </div>
                                                <div className="stat">
                                                    <TrendingUp size={16} />
                                                    <span>{stats.completed} completed</span>
                                                </div>
                                                <div className="stat">
                                                    <Star size={16} />
                                                    <span>{stats.rating}/5 rating</span>
                                                </div>
                                            </div>

                                            {stats.specialties.length > 0 && (
                                                <div className="mentor-specialties">
                                                    {stats.specialties.map((spec, idx) => (
                                                        <span key={idx} className="specialty-tag">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Assignment Notes */}
                    <div className="assignment-notes">
                        <label>
                            <MessageSquare size={16} />
                            ASSIGNMENT NOTES
                        </label>
                        <textarea
                            placeholder="Any special instructions or areas of focus for the mentorship..."
                            value={assignmentNotes}
                            onChange={(e) => setAssignmentNotes(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="assignment-notice">
                        <AlertCircle size={16} />
                        <span>Both the mentor and recruit will be notified of this assignment via Discord</span>
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="cancel-button"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        CANCEL
                    </button>
                    <button
                        className="submit-button"
                        onClick={handleAssign}
                        disabled={!selectedMentor || isSubmitting}
                    >
                        <UserPlus size={18} />
                        {isSubmitting ? 'ASSIGNING...' : 'ASSIGN MENTOR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MentorAssignmentModal;
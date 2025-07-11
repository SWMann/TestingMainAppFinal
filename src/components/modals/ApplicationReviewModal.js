// src/components/modals/ApplicationReviewModal.js
import React, { useState } from 'react';
import {
    X, User, Mail, Calendar, Globe, Shield, FileText,
    ChevronRight, CheckCircle, XCircle, MessageSquare,
    Star, Briefcase, AlertCircle, Clock, Hash
} from 'lucide-react';
import './ApplicationReviewModal.css';

const ApplicationReviewModal = ({ application, onClose, onAction }) => {
    const [reviewNotes, setReviewNotes] = useState('');
    const [selectedAction, setSelectedAction] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (action) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSelectedAction(action);

        try {
            await onAction(application.id, action, {
                notes: reviewNotes,
                reviewDate: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        } finally {
            setIsSubmitting(false);
            setSelectedAction(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'warning',
            'Interviewing': 'info',
            'Approved': 'success',
            'Rejected': 'error'
        };
        return colors[status] || 'default';
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container application-review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>APPLICATION REVIEW</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* Applicant Header */}
                    <div className="applicant-header">
                        <div className="applicant-info">
                            <h3>{application.username}</h3>
                            <div className="applicant-details">
                                <span className="detail-item">
                                    <Hash size={14} />
                                    {application.discord_id}
                                </span>
                                {application.email && (
                                    <span className="detail-item">
                                        <Mail size={14} />
                                        {application.email}
                                    </span>
                                )}
                                <span className="detail-item">
                                    <Calendar size={14} />
                                    Applied {formatDate(application.submission_date)}
                                </span>
                            </div>
                        </div>
                        <div className={`status-indicator ${getStatusColor(application.status)}`}>
                            {application.status}
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="review-sections">
                        {/* Preferences Section */}
                        <div className="review-section">
                            <h4>
                                <Globe size={18} />
                                UNIT PREFERENCES
                            </h4>
                            <div className="preference-grid">
                                <div className="preference-item">
                                    <label>Preferred Branch</label>
                                    <span>{application.preferred_branch_name || 'No preference'}</span>
                                </div>
                                <div className="preference-item">
                                    <label>Preferred Unit</label>
                                    <span>{application.preferred_unit_name || 'No preference'}</span>
                                </div>
                                {application.referrer_username && (
                                    <div className="preference-item">
                                        <label>Referred By</label>
                                        <span className="referrer">{application.referrer_username}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MOS Preferences */}
                        <div className="review-section">
                            <h4>
                                <Briefcase size={18} />
                                MOS PREFERENCES
                            </h4>
                            <div className="mos-preferences">
                                {application.mos_priority_1_details ? (
                                    <>
                                        <div className="mos-item primary">
                                            <span className="mos-priority">1st Choice:</span>
                                            <div className="mos-details">
                                                <span className="mos-code">{application.mos_priority_1_details.code}</span>
                                                <span className="mos-title">{application.mos_priority_1_details.title}</span>
                                            </div>
                                        </div>
                                        {application.mos_priority_2_details && (
                                            <div className="mos-item">
                                                <span className="mos-priority">2nd Choice:</span>
                                                <div className="mos-details">
                                                    <span className="mos-code">{application.mos_priority_2_details.code}</span>
                                                    <span className="mos-title">{application.mos_priority_2_details.title}</span>
                                                </div>
                                            </div>
                                        )}
                                        {application.mos_priority_3_details && (
                                            <div className="mos-item">
                                                <span className="mos-priority">3rd Choice:</span>
                                                <div className="mos-details">
                                                    <span className="mos-code">{application.mos_priority_3_details.code}</span>
                                                    <span className="mos-title">{application.mos_priority_3_details.title}</span>
                                                </div>
                                            </div>
                                        )}
                                        {application.mos_waiver_requested && (
                                            <div className="waiver-notice">
                                                <AlertCircle size={16} />
                                                <span>MOS Waiver Requested</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-mos">No MOS preferences specified</div>
                                )}
                            </div>
                        </div>

                        {/* Motivation Section */}
                        <div className="review-section">
                            <h4>
                                <FileText size={18} />
                                MOTIVATION
                            </h4>
                            <div className="motivation-text">
                                {application.motivation || 'No motivation statement provided'}
                            </div>
                        </div>

                        {/* Experience Section */}
                        {application.experience && (
                            <div className="review-section">
                                <h4>
                                    <Star size={18} />
                                    EXPERIENCE
                                </h4>
                                <div className="experience-text">
                                    {application.experience}
                                </div>
                            </div>
                        )}

                        {/* MOS Waiver Reason */}
                        {application.mos_waiver_reason && (
                            <div className="review-section">
                                <h4>
                                    <AlertCircle size={18} />
                                    MOS WAIVER REASON
                                </h4>
                                <div className="waiver-text">
                                    {application.mos_waiver_reason}
                                </div>
                            </div>
                        )}

                        {/* Previous Review Notes */}
                        {application.reviewer_notes && (
                            <div className="review-section previous-notes">
                                <h4>
                                    <MessageSquare size={18} />
                                    PREVIOUS REVIEW NOTES
                                </h4>
                                <div className="previous-notes-content">
                                    <div className="note-header">
                                        <span>By {application.reviewer_username || 'Unknown'}</span>
                                        <span>{formatDate(application.review_date)}</span>
                                    </div>
                                    <div className="note-text">
                                        {application.reviewer_notes}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Review Notes */}
                        <div className="review-section">
                            <h4>
                                <MessageSquare size={18} />
                                REVIEW NOTES
                            </h4>
                            <textarea
                                className="review-notes-input"
                                placeholder="Enter your review notes here..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Interview Information */}
                        {application.interview_date && (
                            <div className="review-section interview-info">
                                <h4>
                                    <Clock size={18} />
                                    INTERVIEW SCHEDULED
                                </h4>
                                <div className="interview-date">
                                    {formatDate(application.interview_date)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="action-buttons">
                        {application.status === 'Pending' && (
                            <>
                                <button
                                    className="action-button schedule"
                                    onClick={() => handleSubmit('schedule_interview')}
                                    disabled={isSubmitting}
                                >
                                    <MessageSquare size={18} />
                                    {selectedAction === 'schedule_interview' ? 'SCHEDULING...' : 'SCHEDULE INTERVIEW'}
                                </button>
                                <button
                                    className="action-button approve"
                                    onClick={() => handleSubmit('approve')}
                                    disabled={isSubmitting}
                                >
                                    <CheckCircle size={18} />
                                    {selectedAction === 'approve' ? 'APPROVING...' : 'APPROVE'}
                                </button>
                                <button
                                    className="action-button reject"
                                    onClick={() => handleSubmit('reject')}
                                    disabled={isSubmitting}
                                >
                                    <XCircle size={18} />
                                    {selectedAction === 'reject' ? 'REJECTING...' : 'REJECT'}
                                </button>
                            </>
                        )}
                        {application.status === 'Interviewing' && (
                            <>
                                <button
                                    className="action-button approve"
                                    onClick={() => handleSubmit('approve')}
                                    disabled={isSubmitting}
                                >
                                    <CheckCircle size={18} />
                                    {selectedAction === 'approve' ? 'APPROVING...' : 'APPROVE AFTER INTERVIEW'}
                                </button>
                                <button
                                    className="action-button reject"
                                    onClick={() => handleSubmit('reject')}
                                    disabled={isSubmitting}
                                >
                                    <XCircle size={18} />
                                    {selectedAction === 'reject' ? 'REJECTING...' : 'REJECT AFTER INTERVIEW'}
                                </button>
                            </>
                        )}
                    </div>
                    <button className="cancel-button" onClick={onClose} disabled={isSubmitting}>
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationReviewModal;
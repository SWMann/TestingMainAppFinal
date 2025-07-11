// src/components/modals/BulkActionsModal.js
import React, { useState } from 'react';
import {
    X, Users, CheckCircle, XCircle, MessageSquare,
    AlertTriangle, Calendar, Send, Archive, Mail,
    FileText, Shield, Zap
} from 'lucide-react';
import './AdminModals.css';

const BulkActionsModal = ({ selectedCount, onClose, onAction }) => {
    const [selectedAction, setSelectedAction] = useState('');
    const [actionData, setActionData] = useState({
        status: '',
        notes: '',
        interviewDate: '',
        emailTemplate: '',
        customMessage: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmAction, setConfirmAction] = useState(false);

    const bulkActions = [
        {
            id: 'update_status',
            name: 'Update Status',
            icon: Shield,
            description: 'Change application status for all selected',
            requiresData: ['status', 'notes'],
            variant: 'info'
        },
        {
            id: 'schedule_interviews',
            name: 'Schedule Interviews',
            icon: Calendar,
            description: 'Schedule interviews for selected applicants',
            requiresData: ['interviewDate', 'notes'],
            variant: 'warning'
        },
        {
            id: 'approve_all',
            name: 'Approve All',
            icon: CheckCircle,
            description: 'Approve all selected applications',
            requiresData: ['notes'],
            variant: 'success'
        },
        {
            id: 'reject_all',
            name: 'Reject All',
            icon: XCircle,
            description: 'Reject all selected applications',
            requiresData: ['notes'],
            variant: 'danger'
        },
        {
            id: 'send_email',
            name: 'Send Email',
            icon: Mail,
            description: 'Send email to selected applicants',
            requiresData: ['emailTemplate', 'customMessage'],
            variant: 'info'
        },
        {
            id: 'archive',
            name: 'Archive',
            icon: Archive,
            description: 'Archive selected applications',
            requiresData: ['notes'],
            variant: 'secondary'
        }
    ];

    const handleActionSelect = (action) => {
        setSelectedAction(action.id);
        setConfirmAction(false);
    };

    const handleInputChange = (field, value) => {
        setActionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!selectedAction) {
            alert('Please select an action');
            return;
        }

        if (!confirmAction) {
            setConfirmAction(true);
            return;
        }

        setIsSubmitting(true);

        try {
            await onAction(selectedAction, actionData);
            onClose();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            alert('Failed to perform bulk action');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderActionForm = () => {
        const action = bulkActions.find(a => a.id === selectedAction);
        if (!action) return null;

        return (
            <div className="action-form">
                <div className="action-header">
                    <div className="action-icon">
                        <action.icon size={24} />
                    </div>
                    <div>
                        <h4>{action.name}</h4>
                        <p>{action.description}</p>
                    </div>
                </div>

                <div className="form-fields">
                    {action.requiresData.includes('status') && (
                        <div className="form-group">
                            <label>NEW STATUS</label>
                            <select
                                value={actionData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select status...</option>
                                <option value="Pending">Pending</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    )}

                    {action.requiresData.includes('interviewDate') && (
                        <div className="form-group">
                            <label>INTERVIEW DATE & TIME</label>
                            <input
                                type="datetime-local"
                                value={actionData.interviewDate}
                                onChange={(e) => handleInputChange('interviewDate', e.target.value)}
                                className="form-input"
                            />
                        </div>
                    )}

                    {action.requiresData.includes('emailTemplate') && (
                        <div className="form-group">
                            <label>EMAIL TEMPLATE</label>
                            <select
                                value={actionData.emailTemplate}
                                onChange={(e) => handleInputChange('emailTemplate', e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select template...</option>
                                <option value="welcome">Welcome Message</option>
                                <option value="interview_invite">Interview Invitation</option>
                                <option value="approval">Approval Notification</option>
                                <option value="rejection">Rejection Notice</option>
                                <option value="custom">Custom Message</option>
                            </select>
                        </div>
                    )}

                    {action.requiresData.includes('customMessage') && actionData.emailTemplate === 'custom' && (
                        <div className="form-group">
                            <label>CUSTOM MESSAGE</label>
                            <textarea
                                value={actionData.customMessage}
                                onChange={(e) => handleInputChange('customMessage', e.target.value)}
                                placeholder="Enter your custom message..."
                                rows={5}
                                className="form-textarea"
                            />
                        </div>
                    )}

                    {action.requiresData.includes('notes') && (
                        <div className="form-group">
                            <label>ACTION NOTES</label>
                            <textarea
                                value={actionData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Enter notes for this bulk action..."
                                rows={3}
                                className="form-textarea"
                            />
                        </div>
                    )}
                </div>

                {confirmAction && (
                    <div className="confirm-warning">
                        <AlertTriangle size={20} />
                        <div>
                            <h5>CONFIRM BULK ACTION</h5>
                            <p>
                                This action will affect {selectedCount} applications.
                                This operation cannot be undone. Are you sure?
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Users size={24} />
                        BULK ACTIONS
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-form">
                    <div className="selection-info">
                        <div className="selection-count">
                            <span className="count">{selectedCount}</span>
                            <span className="label">Applications Selected</span>
                        </div>
                    </div>

                    <div className="actions-grid">
                        {bulkActions.map(action => {
                            const Icon = action.icon;
                            const isSelected = selectedAction === action.id;

                            return (
                                <button
                                    key={action.id}
                                    className={`action-card ${action.variant} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleActionSelect(action)}
                                >
                                    <Icon size={24} />
                                    <span className="action-name">{action.name}</span>
                                    {isSelected && <CheckCircle className="selected-indicator" size={16} />}
                                </button>
                            );
                        })}
                    </div>

                    {selectedAction && renderActionForm()}
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="footer-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Zap size={16} style={{ color: 'var(--warning-color)' }} />
                        <span>Actions are processed immediately and cannot be undone</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            CANCEL
                        </button>
                        <button
                            className={`submit-button ${confirmAction ? 'danger' : ''}`}
                            onClick={handleSubmit}
                            disabled={!selectedAction || isSubmitting}
                        >
                            <Send size={18} />
                            {isSubmitting ? 'PROCESSING...' :
                                confirmAction ? 'CONFIRM & EXECUTE' : 'EXECUTE ACTION'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsModal;
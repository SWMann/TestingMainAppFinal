import React from 'react';
import {
    X, FileText, Shield, Calendar, User, Edit, Download,
    CheckCircle, XCircle, Clock, FileCheck
} from 'lucide-react';
import './AdminModals.css';

const ViewOpordModal = ({ opord, onClose, onEdit }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Draft': return FileText;
            case 'Pending': return Clock;
            case 'Approved': return CheckCircle;
            case 'Rejected': return XCircle;
            default: return FileText;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'draft';
            case 'Pending': return 'pending';
            case 'Approved': return 'approved';
            case 'Rejected': return 'rejected';
            default: return '';
        }
    };

    const getClassificationColor = (classification) => {
        switch (classification) {
            case 'Top Secret': return 'top-secret';
            case 'Secret': return 'secret';
            case 'Confidential': return 'confidential';
            case 'Unclassified': return 'unclassified';
            default: return '';
        }
    };

    const exportOpord = () => {
        const content = `
OPERATION ORDER ${opord.operation_name}
Classification: ${opord.classification}
Version: ${opord.version}
Created: ${new Date(opord.created_at).toLocaleDateString()}
Creator: ${opord.creator_username}
Status: ${opord.approval_status}
${opord.approved_by_username ? `Approved by: ${opord.approved_by_username}` : ''}

1. SITUATION
${opord.situation || 'N/A'}

2. MISSION
${opord.mission || 'N/A'}

3. EXECUTION
${opord.execution || 'N/A'}

4. SERVICE SUPPORT
${opord.service_support || 'N/A'}

5. COMMAND AND SIGNAL
${opord.command_signal || 'N/A'}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OPORD_${opord.operation_name.replace(/[^a-z0-9]/gi, '_')}_v${opord.version}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const StatusIcon = getStatusIcon(opord.approval_status);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileText size={20} />
                        Operation Order Details
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-form">
                    {/* OPORD Header */}
                    <div className="opord-header">
                        <div className="opord-title-section">
                            <h3>{opord.operation_name}</h3>
                            <div className="opord-meta">
                                <span className={`status-badge ${getStatusColor(opord.approval_status)}`}>
                                    <StatusIcon size={14} />
                                    {opord.approval_status}
                                </span>
                                <span className={`classification-badge ${getClassificationColor(opord.classification)}`}>
                                    <Shield size={14} />
                                    {opord.classification}
                                </span>
                                <span className="version-badge">
                                    Version {opord.version}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* OPORD Info */}
                    <div className="opord-info-grid">
                        <div className="info-item">
                            <span className="label">
                                <User size={16} />
                                Created By:
                            </span>
                            <span className="value">
                                {opord.creator_avatar && (
                                    <img
                                        src={opord.creator_avatar}
                                        alt={opord.creator_username}
                                        className="user-avatar-small"
                                    />
                                )}
                                {opord.creator_username}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">
                                <Calendar size={16} />
                                Created:
                            </span>
                            <span className="value">
                                {new Date(opord.created_at).toLocaleString()}
                            </span>
                        </div>
                        {opord.approved_by_username && (
                            <div className="info-item">
                                <span className="label">
                                    <FileCheck size={16} />
                                    Approved By:
                                </span>
                                <span className="value">{opord.approved_by_username}</span>
                            </div>
                        )}
                        {opord.event_title && (
                            <div className="info-item">
                                <span className="label">
                                    <Calendar size={16} />
                                    Linked Event:
                                </span>
                                <span className="value">{opord.event_title}</span>
                            </div>
                        )}
                    </div>

                    {/* OPORD Content */}
                    <div className="opord-content">
                        <div className="opord-section">
                            <h3>1. SITUATION</h3>
                            <div className="section-content">
                                {opord.situation ? (
                                    <p>{opord.situation}</p>
                                ) : (
                                    <p className="no-data">No situation information provided</p>
                                )}
                            </div>
                        </div>

                        <div className="opord-section">
                            <h3>2. MISSION</h3>
                            <div className="section-content">
                                {opord.mission ? (
                                    <p className="mission-statement">{opord.mission}</p>
                                ) : (
                                    <p className="no-data">No mission statement provided</p>
                                )}
                            </div>
                        </div>

                        <div className="opord-section">
                            <h3>3. EXECUTION</h3>
                            <div className="section-content">
                                {opord.execution ? (
                                    <p>{opord.execution}</p>
                                ) : (
                                    <p className="no-data">No execution details provided</p>
                                )}
                            </div>
                        </div>

                        <div className="opord-section">
                            <h3>4. SERVICE SUPPORT</h3>
                            <div className="section-content">
                                {opord.service_support ? (
                                    <p>{opord.service_support}</p>
                                ) : (
                                    <p className="no-data">No service support information provided</p>
                                )}
                            </div>
                        </div>

                        <div className="opord-section">
                            <h3>5. COMMAND AND SIGNAL</h3>
                            <div className="section-content">
                                {opord.command_signal ? (
                                    <p>{opord.command_signal}</p>
                                ) : (
                                    <p className="no-data">No command and signal information provided</p>
                                )}
                            </div>
                        </div>

                        {opord.attachments && opord.attachments.length > 0 && (
                            <div className="opord-section">
                                <h3>ATTACHMENTS</h3>
                                <div className="attachments-list">
                                    {opord.attachments.map((attachment, index) => (
                                        <div key={index} className="attachment-item">
                                            <FileText size={16} />
                                            <span>{attachment.name || `Attachment ${index + 1}`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="submit-button secondary"
                            onClick={exportOpord}
                        >
                            <Download size={16} />
                            Export
                        </button>
                        {(opord.approval_status === 'Draft' || opord.approval_status === 'Rejected') && (
                            <button
                                type="button"
                                className="submit-button"
                                onClick={onEdit}
                            >
                                <Edit size={16} />
                                Edit OPORD
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOpordModal;
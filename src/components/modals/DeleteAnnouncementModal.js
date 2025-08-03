// src/components/modals/DeleteAnnouncementModal.js
import React, { useState } from 'react';
import {
    X, Trash2, AlertTriangle, AlertCircle, Pin
} from 'lucide-react';
import api from '../../services/api';
import './AnnouncementModals.css';

const DeleteAnnouncementModal = ({ announcement, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            await api.delete(`/announcements/${announcement.id}/`);
            onSuccess();
        } catch (err) {
            console.error('Error deleting announcement:', err);
            setError(err.response?.data?.detail || 'Failed to delete announcement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-delete" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header modal-header-danger">
                    <div className="modal-title">
                        <AlertTriangle size={24} />
                        <h2>DELETE ANNOUNCEMENT</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="delete-warning">
                        <div className="warning-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <div className="warning-text">
                            <p className="warning-title">WARNING: PERMANENT DELETION</p>
                            <p className="warning-message">
                                This action cannot be undone. All data associated with this announcement will be permanently removed from the fleet database.
                            </p>
                        </div>
                    </div>

                    <div className="announcement-preview">
                        <h3 className="preview-label">ANNOUNCEMENT TO BE DELETED:</h3>
                        <div className="preview-content">
                            <h4 className="preview-title">{announcement.title}</h4>
                            <p className="preview-text">
                                {announcement.content.length > 200
                                    ? announcement.content.substring(0, 200) + '...'
                                    : announcement.content}
                            </p>
                            {announcement.is_pinned && (
                                <div className="preview-badge">
                                    <Pin size={14} />
                                    PINNED
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="form-error">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-danger"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    DELETING...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    CONFIRM DELETION
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAnnouncementModal;
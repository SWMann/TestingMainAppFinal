// src/components/modals/CreateAnnouncementModal.js
import React, { useState } from 'react';
import {
    X, Megaphone, Type, FileText, Pin, Send, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import './AnnouncementModals.css';

const CreateAnnouncementModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_pinned: false,
        is_published: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/announcements/', formData);
            onSuccess();
        } catch (err) {
            console.error('Error creating announcement:', err);
            setError(err.response?.data?.detail || 'Failed to create announcement');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Megaphone size={24} />
                        <h2>NEW FLEET ANNOUNCEMENT</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="title">
                                <Type size={16} />
                                ANNOUNCEMENT TITLE
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter announcement title..."
                                className="form-input"
                                maxLength={200}
                                required
                            />
                            <span className="char-count">{formData.title.length}/200</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">
                                <FileText size={16} />
                                ANNOUNCEMENT CONTENT
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Enter announcement content..."
                                className="form-textarea"
                                rows={10}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_pinned"
                                    checked={formData.is_pinned}
                                    onChange={handleChange}
                                />
                                <span className="checkbox-custom"></span>
                                <Pin size={16} />
                                Pin this announcement
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_published"
                                    checked={formData.is_published}
                                    onChange={handleChange}
                                />
                                <span className="checkbox-custom"></span>
                                Publish immediately
                            </label>
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
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    TRANSMITTING...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    BROADCAST ANNOUNCEMENT
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAnnouncementModal;
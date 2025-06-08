import React, { useState, useEffect } from 'react';
import {
    X, FileText, Search, Link, Calendar, User, Shield, CheckCircle
} from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";

const LinkOpordModal = ({ event, onClose, onLink }) => {
    const [opords, setOpords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOpord, setSelectedOpord] = useState(null);

    useEffect(() => {
        fetchOpords();
    }, []);

    const fetchOpords = async () => {
        setLoading(true);
        try {
            const response = await api.get('/operations/', {
                params: {
                    approval_status: 'Approved'
                }
            });
            setOpords(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching OPORDs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedOpord) {
            onLink(event.id, selectedOpord.id);
        }
    };

    const filteredOpords = opords.filter(opord =>
        opord.operation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opord.creator_username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getClassificationColor = (classification) => {
        switch (classification) {
            case 'Top Secret': return 'top-secret';
            case 'Secret': return 'secret';
            case 'Confidential': return 'confidential';
            case 'Unclassified': return 'unclassified';
            default: return '';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Link size={20} />
                        Link OPORD to Event
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="current-event-info">
                        <h4>Linking OPORD to:</h4>
                        <div className="event-summary">
                            <div className="event-title">{event.title}</div>
                            <div className="event-meta">
                                <Calendar size={14} />
                                {new Date(event.start_time).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {event.operation_order && (
                        <div className="warning-message">
                            <FileText size={16} />
                            This event already has an OPORD linked. Selecting a new one will replace it.
                        </div>
                    )}

                    <div className="form-group">
                        <label>Search OPORDs</label>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by operation name or creator..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Select OPORD</label>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading OPORDs...</p>
                            </div>
                        ) : filteredOpords.length === 0 ? (
                            <div className="empty-state">
                                <FileText size={48} />
                                <p>No approved OPORDs found</p>
                            </div>
                        ) : (
                            <div className="opord-list">
                                {filteredOpords.map(opord => (
                                    <div
                                        key={opord.id}
                                        className={`opord-option ${selectedOpord?.id === opord.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedOpord(opord)}
                                    >
                                        <div className="opord-header">
                                            <h5>{opord.operation_name}</h5>
                                            <span className={`classification-badge ${getClassificationColor(opord.classification)}`}>
                                                {opord.classification}
                                            </span>
                                        </div>
                                        <div className="opord-details">
                                            <div className="opord-meta">
                                                <User size={14} />
                                                {opord.creator_username}
                                            </div>
                                            <div className="opord-meta">
                                                <Calendar size={14} />
                                                {new Date(opord.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="opord-meta">
                                                v{opord.version}
                                            </div>
                                        </div>
                                        {opord.event_title && opord.id !== event.operation_order && (
                                            <div className="opord-warning">
                                                <Shield size={14} />
                                                Already linked to: {opord.event_title}
                                            </div>
                                        )}
                                        {selectedOpord?.id === opord.id && (
                                            <div className="selected-indicator">
                                                <CheckCircle size={20} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedOpord && (
                        <div className="selected-opord-preview">
                            <h4>Selected OPORD</h4>
                            <div className="preview-content">
                                <div className="preview-title">{selectedOpord.operation_name}</div>
                                <div className="preview-meta">
                                    <span>Version {selectedOpord.version}</span>
                                    <span className={`classification-badge ${getClassificationColor(selectedOpord.classification)}`}>
                                        {selectedOpord.classification}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!selectedOpord}
                        >
                            Link OPORD
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LinkOpordModal;
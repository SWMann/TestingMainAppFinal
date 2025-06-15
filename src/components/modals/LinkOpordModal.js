import React, { useState, useEffect } from 'react';
import {
    X, FileText, Link, Search, Shield
} from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";

const LinkOpordModal = ({ event, onClose, onLink }) => {
    const [opords, setOpords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOpord, setSelectedOpord] = useState(event.operation_order || '');

    useEffect(() => {
        fetchOpords();
    }, []);

    const fetchOpords = async () => {
        setLoading(true);
        try {
            const response = await api.get('/operation-orders/');
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
            onLink(event.id, selectedOpord);
        }
    };

    const filteredOpords = opords.filter(opord =>
        opord.operation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opord.classification.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getClassificationColor = (classification) => {
        switch (classification) {
            case 'Top Secret': return 'top-secret';
            case 'Secret': return 'secret';
            case 'Confidential': return 'confidential';
            default: return 'unclassified';
        }
    };

    const getApprovalColor = (status) => {
        switch (status) {
            case 'Approved': return 'approved';
            case 'Pending': return 'pending';
            case 'Draft': return 'draft';
            case 'Rejected': return 'rejected';
            default: return '';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Link size={20} />
                        Link Operation Order
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="current-event-info">
                        <h4>Event: {event.title}</h4>
                        {event.operation_order_name && (
                            <p className="current-opord">
                                Currently linked to: <strong>{event.operation_order_name}</strong>
                            </p>
                        )}
                    </div>

                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search OPORDs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="opord-list">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading OPORDs...</p>
                            </div>
                        ) : filteredOpords.length === 0 ? (
                            <div className="empty-state">
                                <FileText size={32} />
                                <p>No OPORDs found</p>
                            </div>
                        ) : (
                            <div className="opord-options">
                                <label className="opord-option">
                                    <input
                                        type="radio"
                                        name="opord"
                                        value=""
                                        checked={selectedOpord === ''}
                                        onChange={(e) => setSelectedOpord(e.target.value)}
                                    />
                                    <div className="opord-content">
                                        <span className="opord-name">No OPORD</span>
                                        <span className="opord-description">Remove OPORD link</span>
                                    </div>
                                </label>

                                {filteredOpords.map(opord => (
                                    <label key={opord.id} className="opord-option">
                                        <input
                                            type="radio"
                                            name="opord"
                                            value={opord.id}
                                            checked={selectedOpord === opord.id}
                                            onChange={(e) => setSelectedOpord(e.target.value)}
                                        />
                                        <div className="opord-content">
                                            <div className="opord-header">
                                                <span className="opord-name">{opord.operation_name}</span>
                                                <div className="opord-badges">
                                                    <span className={`classification-badge ${getClassificationColor(opord.classification)}`}>
                                                        <Shield size={12} />
                                                        {opord.classification}
                                                    </span>
                                                    <span className={`status-badge ${getApprovalColor(opord.approval_status)}`}>
                                                        {opord.approval_status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="opord-meta">
                                                <span>Version {opord.version}</span>
                                                <span>•</span>
                                                <span>Created {new Date(opord.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {opord.mission && (
                                                <p className="opord-mission">{opord.mission.substring(0, 100)}...</p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={selectedOpord === event.operation_order}
                        >
                            <Link size={16} />
                            Link OPORD
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LinkOpordModal;
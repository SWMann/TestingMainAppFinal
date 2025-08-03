import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, FileCheck, Clock } from 'lucide-react';
import './PromotionAdminModals.css';
import api from "../../services/api";

// Force Promotion Modal
export const ForcePromotionModal = ({ user, currentRank, nextRank, onClose, onPromote, promotionProgress }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [promotionOrder, setPromotionOrder] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState(null);

    const handlePromote = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await api.post('/promotions/promote/', {
                user_id: user.id,
                new_rank_id: nextRank.id,
                promotion_order: promotionOrder,
                notes: notes,
                force: !promotionProgress?.overall_eligible
            });

            onPromote(response.data);
            onClose();
        } catch (err) {
            console.error('Promotion error:', err);
            setError(err.response?.data?.error || 'Failed to process promotion');
        } finally {
            setIsProcessing(false);
        }
    };

    const missingRequirements = promotionProgress?.detailed_requirements?.filter(req => !req.is_met) || [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>PROMOTE {user.username.toUpperCase()}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="promotion-overview">
                        <div className="rank-transition">
                            <div className="from-rank">
                                <span>From</span>
                                <h3>{currentRank?.abbreviation || 'No Rank'}</h3>
                                <p>{currentRank?.name || 'Unranked'}</p>
                            </div>
                            <TrendingUp size={24} className="transition-icon" />
                            <div className="to-rank">
                                <span>To</span>
                                <h3>{nextRank.abbreviation}</h3>
                                <p>{nextRank.name}</p>
                            </div>
                        </div>
                    </div>

                    {!promotionProgress?.overall_eligible && (
                        <div className="warning-section">
                            <div className="warning-header">
                                <AlertTriangle size={20} />
                                <h4>MISSING REQUIREMENTS</h4>
                            </div>
                            <p className="warning-text">
                                This user does not meet all promotion requirements.
                                This will be recorded as a forced promotion.
                            </p>
                            {missingRequirements.length > 0 && (
                                <ul className="missing-requirements">
                                    {missingRequirements.slice(0, 5).map(req => (
                                        <li key={req.requirement_id}>
                                            {req.display_text} ({req.current_value}/{req.required_value})
                                        </li>
                                    ))}
                                    {missingRequirements.length > 5 && (
                                        <li>...and {missingRequirements.length - 5} more</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="promotion-form">
                        <div className="form-group">
                            <label>Promotion Order Number (Optional)</label>
                            <input
                                type="text"
                                value={promotionOrder}
                                onChange={(e) => setPromotionOrder(e.target.value)}
                                placeholder="e.g., GO-2025-0234"
                            />
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Reason for promotion, special circumstances, etc."
                                rows={4}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="cancel-button" onClick={onClose}>
                        CANCEL
                    </button>
                    <button
                        className="confirm-button"
                        onClick={handlePromote}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'PROCESSING...' : 'CONFIRM PROMOTION'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Waiver Creation Modal
export const WaiverCreationModal = ({ user, requirement, onClose, onWaiver }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [reason, setReason] = useState('');
    const [expiryDays, setExpiryDays] = useState('');
    const [error, setError] = useState(null);

    const handleCreateWaiver = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for the waiver');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const data = {
                user: user.id,
                requirement: requirement.requirement_id,
                reason: reason
            };

            if (expiryDays) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
                data.expiry_date = expiryDate.toISOString();
            }

            const response = await api.post('/promotions/waivers/', data);
            onWaiver(response.data);
            onClose();
        } catch (err) {
            console.error('Waiver creation error:', err);
            setError(err.response?.data?.error || 'Failed to create waiver');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="waiver-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>CREATE REQUIREMENT WAIVER</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="waiver-details">
                        <div className="detail-row">
                            <label>Pilot:</label>
                            <span>{user.username}</span>
                        </div>
                        <div className="detail-row">
                            <label>Requirement:</label>
                            <span>{requirement.display_text}</span>
                        </div>
                        <div className="detail-row">
                            <label>Current Progress:</label>
                            <span className="progress-text">
                                {requirement.current_value} / {requirement.required_value}
                            </span>
                        </div>
                    </div>

                    <div className="waiver-form">
                        <div className="form-group">
                            <label>Waiver Reason <span className="required">*</span></label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain why this requirement should be waived..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Expiry Period (Optional)</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(e.target.value)}
                                    placeholder="Leave blank for permanent"
                                    min="1"
                                />
                                <span className="suffix">days</span>
                            </div>
                            <p className="field-help">
                                If set, the waiver will expire after the specified number of days
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="cancel-button" onClick={onClose}>
                        CANCEL
                    </button>
                    <button
                        className="confirm-button"
                        onClick={handleCreateWaiver}
                        disabled={isProcessing || !reason.trim()}
                    >
                        {isProcessing ? 'CREATING...' : 'CREATE WAIVER'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Promotion History Modal
export const PromotionHistoryModal = ({ user, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromotionHistory();
    }, [user.id]);

    const fetchPromotionHistory = async () => {
        try {
            const response = await api.get('/promotions/rank-history/', {
                params: { user: user.id }
            });
            setHistory(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching promotion history:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (days) => {
        if (days < 30) return `${days} days`;
        if (days < 365) return `${Math.floor(days / 30)} months`;
        const years = Math.floor(days / 365);
        const months = Math.floor((days % 365) / 30);
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>PROMOTION HISTORY - {user.username.toUpperCase()}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading promotion history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="empty-state">
                            <FileCheck size={48} />
                            <p>No promotion history available</p>
                        </div>
                    ) : (
                        <div className="history-timeline">
                            {history.map((record, index) => (
                                <div key={record.id} className="history-item">
                                    <div className="timeline-marker">
                                        <div className="marker-dot"></div>
                                        {index < history.length - 1 && <div className="marker-line"></div>}
                                    </div>

                                    <div className="history-content">
                                        <div className="rank-info">
                                            <h4>{record.rank_details.abbreviation}</h4>
                                            <p>{record.rank_details.name}</p>
                                        </div>

                                        <div className="history-details">
                                            <div className="detail">
                                                <Clock size={14} />
                                                <span>
                                                    {new Date(record.date_assigned).toLocaleDateString()} -
                                                    {record.date_ended ?
                                                        new Date(record.date_ended).toLocaleDateString() :
                                                        'Present'
                                                    }
                                                </span>
                                            </div>

                                            {record.duration_days !== undefined && (
                                                <div className="detail">
                                                    <span className="duration">
                                                        Duration: {formatDuration(record.duration_days)}
                                                    </span>
                                                </div>
                                            )}

                                            {record.promoted_by_username && (
                                                <div className="detail">
                                                    <span>Promoted by: {record.promoted_by_username}</span>
                                                </div>
                                            )}

                                            {record.promotion_order && (
                                                <div className="detail">
                                                    <span>Order: {record.promotion_order}</span>
                                                </div>
                                            )}

                                            {record.notes && (
                                                <div className="notes">
                                                    <p>{record.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
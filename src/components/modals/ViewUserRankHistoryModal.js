import React, { useState, useEffect } from 'react';
import { X, History, Calendar, User, Award, ChevronRight, Edit } from 'lucide-react';
import './AdminModals.css';

const ViewUserRankHistoryModal = ({
                                      user,
                                      rankHistory,
                                      onClose,
                                      onAddEntry,
                                      onEditEntry
                                  }) => {
    const [sortedHistory, setSortedHistory] = useState([]);

    useEffect(() => {
        if (rankHistory) {
            // Sort by date assigned, most recent first
            const sorted = [...rankHistory].sort((a, b) =>
                new Date(b.date_assigned) - new Date(a.date_assigned)
            );
            setSortedHistory(sorted);
        }
    }, [rankHistory]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
        }
    };

    const getRankTypeColor = (rank) => {
        if (rank.is_officer) return 'officer';
        if (rank.is_warrant) return 'warrant';
        return 'enlisted';
    };

    const getRankTypeLabel = (rank) => {
        if (rank.is_officer) return 'Officer';
        if (rank.is_warrant) return 'Warrant Officer';
        return 'Enlisted';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <History size={20} />
                        Rank History - {user?.username}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-form">
                    {user && (
                        <div className="user-summary">
                            <div className="user-avatar-section">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="user-avatar-large"
                                    />
                                ) : (
                                    <div className="user-avatar-placeholder-large">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="user-details">
                                <h3>{user.username}</h3>
                                <div className="user-meta-info">
                                    <span>Service Number: {user.service_number || 'Not assigned'}</span>
                                    <span>•</span>
                                    <span>Current Rank: {user.current_rank?.name || 'None'}</span>
                                    <span>•</span>
                                    <span>Joined: {formatDate(user.join_date)}</span>
                                </div>
                            </div>
                            <button
                                className="btn primary small"
                                onClick={() => onAddEntry(user)}
                            >
                                <Award size={16} />
                                Add Rank Entry
                            </button>
                        </div>
                    )}

                    <div className="rank-history-timeline">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.map((entry, index) => (
                                <div key={entry.id} className="rank-history-entry">
                                    <div className="timeline-marker">
                                        <div className={`rank-badge ${getRankTypeColor(entry.rank_details)}`}>
                                            {entry.rank_details.tier}
                                        </div>
                                        {index < sortedHistory.length - 1 && (
                                            <div className="timeline-line" />
                                        )}
                                    </div>

                                    <div className="rank-entry-content">
                                        <div className="rank-entry-header">
                                            <div className="rank-info">
                                                {entry.rank_details.insignia_display_url && (
                                                    <img
                                                        src={entry.rank_details.insignia_display_url}
                                                        alt={entry.rank_details.name}
                                                        className="rank-insignia-small"
                                                    />
                                                )}
                                                <div>
                                                    <h4>{entry.rank_details.name}</h4>
                                                    <span className="rank-abbr">
                                                        {entry.rank_details.abbreviation} • {getRankTypeLabel(entry.rank_details)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="edit-entry-btn"
                                                onClick={() => onEditEntry(entry)}
                                                title="Edit this entry"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>

                                        <div className="rank-entry-details">
                                            <div className="detail-row">
                                                <Calendar size={14} />
                                                <span className="detail-label">Assigned:</span>
                                                <span className="detail-value">{formatDate(entry.date_assigned)}</span>
                                                {entry.date_ended && (
                                                    <>
                                                        <ChevronRight size={14} />
                                                        <span className="detail-label">Ended:</span>
                                                        <span className="detail-value">{formatDate(entry.date_ended)}</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="detail-row">
                                                <User size={14} />
                                                <span className="detail-label">Duration:</span>
                                                <span className="detail-value">
                                                    {formatDuration(entry.date_assigned, entry.date_ended)}
                                                    {!entry.date_ended && ' (Current)'}
                                                </span>
                                            </div>

                                            {entry.promoted_by_username && (
                                                <div className="detail-row">
                                                    <Award size={14} />
                                                    <span className="detail-label">Promoted by:</span>
                                                    <span className="detail-value">{entry.promoted_by_username}</span>
                                                </div>
                                            )}

                                            {entry.promotion_order && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Order #:</span>
                                                    <span className="detail-value">{entry.promotion_order}</span>
                                                </div>
                                            )}

                                            {entry.notes && (
                                                <div className="entry-notes">
                                                    <span className="detail-label">Notes:</span>
                                                    <p>{entry.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <History size={48} />
                                <h4>No Rank History</h4>
                                <p>This user has no recorded rank history</p>
                                <button
                                    className="btn primary"
                                    onClick={() => onAddEntry(user)}
                                >
                                    <Award size={16} />
                                    Add First Rank Entry
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="rank-history-summary">
                        <h4>Career Summary</h4>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">Total Promotions:</span>
                                <span className="summary-value">{sortedHistory.length - 1}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Time in Service:</span>
                                <span className="summary-value">
                                    {user && formatDuration(user.join_date, null)}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Current Rank Since:</span>
                                <span className="summary-value">
                                    {sortedHistory.length > 0 && !sortedHistory[0].date_ended
                                        ? formatDate(sortedHistory[0].date_assigned)
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="cancel-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewUserRankHistoryModal;
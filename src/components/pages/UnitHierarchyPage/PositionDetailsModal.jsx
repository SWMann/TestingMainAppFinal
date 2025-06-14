// src/components/UnitHierarchy/Modals/PositionDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    User,
    Shield,
    Calendar,
    Clock,
    ChevronRight,
    ExternalLink,
    Award
} from 'lucide-react';
import { positionService } from './positionService';
import { formatDate, formatRelativeTime } from './dateUtils';

const PositionDetailsModal = ({ positionId, onClose }) => {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        loadPositionDetails();
    }, [positionId]);

    const loadPositionDetails = async () => {
        try {
            setLoading(true);
            const response = await positionService.getPosition(positionId);
            setPosition(response.data);
        } catch (error) {
            console.error('Failed to load position details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
        onClose();
    };

    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content position-details-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-loading">
                        <div className="spinner"></div>
                        <p>Loading position details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!position) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content position-details-modal" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="header-content">
                        <div className="position-header-info">
                            <h2>{position.display_title}</h2>
                            <div className="position-meta">
                                <span className="unit-name">{position.unit.name}</span>
                                <span className="separator">•</span>
                                <span className="role-category">{position.role.category}</span>
                            </div>
                        </div>
                        {position.unit.emblem_url && (
                            <img
                                src={position.unit.emblem_url}
                                alt={position.unit.name}
                                className="unit-emblem-small"
                            />
                        )}
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="modal-tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'requirements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requirements')}
                    >
                        Requirements
                    </button>
                    <button
                        className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {activeTab === 'overview' && (
                        <div className="tab-content overview-tab">
                            {/* Current Assignment */}
                            {position.current_assignments && position.current_assignments.length > 0 ? (
                                <section className="detail-section">
                                    <h3>Current Assignment</h3>
                                    {position.current_assignments.map(assignment => (
                                        <div key={assignment.id} className="assignment-card current">
                                            <div className="assignment-user">
                                                {assignment.user_details.avatar_url ? (
                                                    <img
                                                        src={assignment.user_details.avatar_url}
                                                        alt={assignment.user_details.username}
                                                        className="user-avatar"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        <User size={24} />
                                                    </div>
                                                )}
                                                <div className="user-info">
                                                    <button
                                                        className="user-link"
                                                        onClick={() => handleUserClick(assignment.user_details.id)}
                                                    >
                            <span className="user-rank">
                              {assignment.user_details.rank?.abbreviation}
                            </span>
                                                        <span className="user-name">
                              {assignment.user_details.username}
                            </span>
                                                        <ExternalLink size={14} />
                                                    </button>
                                                    <span className="service-number">
                            {assignment.user_details.service_number}
                          </span>
                                                </div>
                                            </div>
                                            <div className="assignment-details">
                                                <div className="detail-item">
                                                    <Calendar size={14} />
                                                    <span>Assigned {formatDate(assignment.assignment_date)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <Clock size={14} />
                                                    <span>{formatRelativeTime(assignment.assignment_date)}</span>
                                                </div>
                                                {assignment.assignment_type !== 'primary' && (
                                                    <div className="assignment-type">
                                                        {assignment.assignment_type}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            ) : (
                                <section className="detail-section">
                                    <h3>Current Status</h3>
                                    <div className="vacant-notice">
                                        <Shield size={48} />
                                        <h4>Position Vacant</h4>
                                        <p>This position is currently unassigned</p>
                                    </div>
                                </section>
                            )}

                            {/* Position Details */}
                            <section className="detail-section">
                                <h3>Position Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Role</label>
                                        <value>{position.role.name}</value>
                                    </div>
                                    <div className="info-item">
                                        <label>Category</label>
                                        <value className="capitalize">{position.role.category}</value>
                                    </div>
                                    {position.identifier && (
                                        <div className="info-item">
                                            <label>Identifier</label>
                                            <value>{position.identifier}</value>
                                        </div>
                                    )}
                                    {position.role.typical_rank && (
                                        <div className="info-item">
                                            <label>Typical Rank</label>
                                            <value>{position.role.typical_rank.name}</value>
                                        </div>
                                    )}
                                </div>

                                {position.role.description && (
                                    <div className="description-section">
                                        <label>Description</label>
                                        <p>{position.role.description}</p>
                                    </div>
                                )}

                                {position.role.responsibilities && (
                                    <div className="description-section">
                                        <label>Responsibilities</label>
                                        <p>{position.role.responsibilities}</p>
                                    </div>
                                )}
                            </section>

                            {/* Chain of Command */}
                            {(position.parent_position_details || position.subordinate_positions) && (
                                <section className="detail-section">
                                    <h3>Chain of Command</h3>
                                    <div className="chain-of-command">
                                        {position.parent_position_details && (
                                            <div className="chain-item reports-to">
                                                <label>Reports To</label>
                                                <div className="position-link">
                                                    <ChevronRight size={16} />
                                                    <span>{position.parent_position_details.display_title}</span>
                                                    <span className="unit-label">
                            ({position.parent_position_details.unit})
                          </span>
                                                </div>
                                            </div>
                                        )}

                                        {position.subordinate_positions && position.subordinate_positions.length > 0 && (
                                            <div className="chain-item subordinates">
                                                <label>Subordinate Positions</label>
                                                <div className="subordinates-list">
                                                    {position.subordinate_positions.map(sub => (
                                                        <div key={sub.id} className="position-link">
                                                            <ChevronRight size={16} />
                                                            <span>{sub.display_title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {activeTab === 'requirements' && (
                        <div className="tab-content requirements-tab">
                            <section className="detail-section">
                                <h3>Position Requirements</h3>

                                {/* Rank Requirements */}
                                <div className="requirement-group">
                                    <h4>Rank Requirements</h4>
                                    <div className="requirements-list">
                                        {position.effective_requirements.min_rank && (
                                            <div className="requirement-item">
                                                <Award size={16} />
                                                <span>Minimum Rank: {position.effective_requirements.min_rank.name}</span>
                                            </div>
                                        )}
                                        {position.effective_requirements.max_rank && (
                                            <div className="requirement-item">
                                                <Award size={16} />
                                                <span>Maximum Rank: {position.effective_requirements.max_rank.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Service Requirements */}
                                <div className="requirement-group">
                                    <h4>Service Requirements</h4>
                                    <div className="requirements-list">
                                        {position.effective_requirements.min_time_in_service > 0 && (
                                            <div className="requirement-item">
                                                <Clock size={16} />
                                                <span>
                          Minimum {position.effective_requirements.min_time_in_service} days in service
                        </span>
                                            </div>
                                        )}
                                        {position.effective_requirements.min_time_in_grade > 0 && (
                                            <div className="requirement-item">
                                                <Clock size={16} />
                                                <span>
                          Minimum {position.effective_requirements.min_time_in_grade} days in current rank
                        </span>
                                            </div>
                                        )}
                                        {position.effective_requirements.min_operations_count > 0 && (
                                            <div className="requirement-item">
                                                <Shield size={16} />
                                                <span>
                          Minimum {position.effective_requirements.min_operations_count} operations completed
                        </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Requirements */}
                                {position.effective_requirements.additional_requirements && (
                                    <div className="requirement-group">
                                        <h4>Additional Requirements</h4>
                                        <p className="additional-requirements">
                                            {position.effective_requirements.additional_requirements}
                                        </p>
                                    </div>
                                )}

                                {/* Authorities */}
                                {position.role.authorities && (
                                    <div className="requirement-group">
                                        <h4>Position Authorities</h4>
                                        <p className="authorities-text">
                                            {position.role.authorities}
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="tab-content history-tab">
                            <section className="detail-section">
                                <h3>Assignment History</h3>
                                {position.assignment_history && position.assignment_history.length > 0 ? (
                                    <div className="history-timeline">
                                        {position.assignment_history.map((assignment, index) => (
                                            <div
                                                key={assignment.id}
                                                className={`history-item ${index === 0 && assignment.status === 'active' ? 'current' : ''}`}
                                            >
                                                <div className="timeline-marker"></div>
                                                <div className="history-content">
                                                    <div className="history-header">
                                                        <button
                                                            className="user-link"
                                                            onClick={() => handleUserClick(assignment.user_details.id)}
                                                        >
                              <span className="user-rank">
                                {assignment.user_details.rank?.abbreviation}
                              </span>
                                                            <span className="user-name">
                                {assignment.user_details.username}
                              </span>
                                                        </button>
                                                        <span className={`status-badge ${assignment.status}`}>
                              {assignment.status}
                            </span>
                                                    </div>

                                                    <div className="history-details">
                                                        <div className="date-range">
                                                            <span>{formatDate(assignment.assignment_date)}</span>
                                                            {assignment.end_date && (
                                                                <>
                                                                    <span> - </span>
                                                                    <span>{formatDate(assignment.end_date)}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {assignment.assigned_by_details && (
                                                            <div className="assigned-by">
                                                                Assigned by {assignment.assigned_by_details.username}
                                                            </div>
                                                        )}

                                                        {assignment.order_number && (
                                                            <div className="order-number">
                                                                Order #{assignment.order_number}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-history">
                                        <Clock size={48} />
                                        <p>No assignment history available</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PositionDetailsModal;
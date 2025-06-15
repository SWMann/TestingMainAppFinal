// src/components/pages/ORBAT/PositionDetailModal.js
import React, { useState, useEffect } from 'react';
import {
    X, User, Shield, Award, Calendar, Clock, FileText,
    ChevronRight, UserPlus, History, AlertCircle,
    Briefcase, Target, Link2, Crown, Star, Users
} from 'lucide-react';
import api from '../../../services/api';

const PositionDetailModal = ({ position, onClose, onAssign }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [positionHistory, setPositionHistory] = useState([]);
    const [requirements, setRequirements] = useState(null);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchPositionHistory();
        }
    }, [activeTab]);

    const fetchPositionHistory = async () => {
        setLoading(true);
        try {
            // Simulated API call - replace with actual endpoint
            const response = await api.get(`/positions/${position.id}/history/`);
            setPositionHistory(response.data);
        } catch (err) {
            console.error('Error fetching position history:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPositionTypeIcon = () => {
        const icons = {
            command: <Crown size={20} />,
            staff: <Briefcase size={20} />,
            nco: <Shield size={20} />,
            specialist: <Star size={20} />,
            standard: <Users size={20} />
        };
        return icons[position.position_type] || icons.standard;
    };

    const getPositionTypeColor = () => {
        const colors = {
            command: '#FF4444',
            staff: '#4FCBF8',
            nco: '#39FF14',
            specialist: '#845ef7',
            standard: '#8B92A0'
        };
        return colors[position.position_type] || colors.standard;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container position-detail-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header" style={{ borderBottom: `3px solid ${getPositionTypeColor()}` }}>
                    <div className="modal-title-section">
                        <div className="position-type-badge" style={{ backgroundColor: getPositionTypeColor() }}>
                            {getPositionTypeIcon()}
                        </div>
                        <div>
                            <h2 className="modal-title">{position.display_title}</h2>
                            <p className="modal-subtitle">
                                {position.unit_info?.name} ({position.unit_info?.abbreviation})
                            </p>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="modal-tabs">
                    <button
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        <FileText size={16} />
                        Details
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'requirements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requirements')}
                    >
                        <Target size={16} />
                        Requirements
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={16} />
                        History
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'relationships' ? 'active' : ''}`}
                        onClick={() => setActiveTab('relationships')}
                    >
                        <Link2 size={16} />
                        Relationships
                    </button>
                </div>

                {/* Modal Content */}
                <div className="modal-content">
                    {activeTab === 'details' && (
                        <div className="tab-content details-tab">
                            {/* Current Assignment */}
                            <div className="detail-section">
                                <h3 className="section-title">Current Assignment</h3>
                                {position.is_vacant ? (
                                    <div className="vacant-notice">
                                        <AlertCircle size={20} />
                                        <div>
                                            <p className="vacant-title">Position Vacant</p>
                                            <p className="vacant-subtitle">This position is currently unassigned</p>
                                        </div>
                                    </div>
                                ) : position.current_holder && (
                                    <div className="current-holder-card">
                                        <div className="holder-avatar">
                                            {position.current_holder.avatar_url ? (
                                                <img src={position.current_holder.avatar_url} alt="" />
                                            ) : (
                                                <User size={32} />
                                            )}
                                        </div>
                                        <div className="holder-info">
                                            <h4>
                                                {position.current_holder.rank?.abbreviation} {position.current_holder.username}
                                            </h4>
                                            <p className="service-number">{position.current_holder.service_number}</p>
                                            <div className="holder-meta">
                                                <span>
                                                    <Calendar size={14} />
                                                    Assigned: {new Date().toLocaleDateString()}
                                                </span>
                                                <span>
                                                    <Clock size={14} />
                                                    Time in Position: 45 days
                                                </span>
                                            </div>
                                        </div>
                                        <button className="view-profile-btn">
                                            View Profile
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Position Information */}
                            <div className="detail-section">
                                <h3 className="section-title">Position Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Role Category</label>
                                        <value>{position.role_info?.category || 'Standard'}</value>
                                    </div>
                                    <div className="info-item">
                                        <label>Position Type</label>
                                        <value style={{ color: getPositionTypeColor() }}>
                                            {position.position_type?.toUpperCase() || 'STANDARD'}
                                        </value>
                                    </div>
                                    <div className="info-item">
                                        <label>Unit Type</label>
                                        <value>{position.unit_info?.unit_type || 'Unknown'}</value>
                                    </div>
                                    <div className="info-item">
                                        <label>Display Order</label>
                                        <value>{position.display_order || 0}</value>
                                    </div>
                                </div>

                                {position.role_info && (
                                    <div className="role-badges">
                                        {position.role_info.is_command_role && (
                                            <span className="role-badge command">
                                                <Crown size={14} />
                                                Command Role
                                            </span>
                                        )}
                                        {position.role_info.is_staff_role && (
                                            <span className="role-badge staff">
                                                <Briefcase size={14} />
                                                Staff Role
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Responsibilities */}
                            <div className="detail-section">
                                <h3 className="section-title">Responsibilities</h3>
                                <div className="responsibilities-list">
                                    <ul>
                                        <li>Lead and manage unit operations</li>
                                        <li>Coordinate with higher headquarters</li>
                                        <li>Ensure unit readiness and training</li>
                                        <li>Maintain personnel accountability</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requirements' && (
                        <div className="tab-content requirements-tab">
                            <div className="requirements-section">
                                <h3 className="section-title">
                                    <Award size={20} />
                                    Rank Requirements
                                </h3>
                                <div className="requirement-items">
                                    <div className="requirement-item">
                                        <label>Minimum Rank</label>
                                        <value>E-5 (Sergeant)</value>
                                    </div>
                                    <div className="requirement-item">
                                        <label>Maximum Rank</label>
                                        <value>E-7 (Sergeant First Class)</value>
                                    </div>
                                    <div className="requirement-item">
                                        <label>Typical Rank</label>
                                        <value>E-6 (Staff Sergeant)</value>
                                    </div>
                                </div>
                            </div>

                            <div className="requirements-section">
                                <h3 className="section-title">
                                    <Clock size={20} />
                                    Service Requirements
                                </h3>
                                <div className="requirement-items">
                                    <div className="requirement-item">
                                        <label>Time in Service</label>
                                        <value>180 days minimum</value>
                                    </div>
                                    <div className="requirement-item">
                                        <label>Time in Grade</label>
                                        <value>90 days minimum</value>
                                    </div>
                                    <div className="requirement-item">
                                        <label>Operations Count</label>
                                        <value>10 operations minimum</value>
                                    </div>
                                </div>
                            </div>

                            <div className="requirements-section">
                                <h3 className="section-title">
                                    <FileText size={20} />
                                    Certifications
                                </h3>
                                <div className="certification-list">
                                    <div className="cert-item required">
                                        <span className="cert-badge">Required</span>
                                        <span>Basic Leadership Course</span>
                                    </div>
                                    <div className="cert-item required">
                                        <span className="cert-badge">Required</span>
                                        <span>Unit Operations Certificate</span>
                                    </div>
                                    <div className="cert-item desired">
                                        <span className="cert-badge">Desired</span>
                                        <span>Advanced Tactics Training</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="tab-content history-tab">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner" />
                                    <p>Loading position history...</p>
                                </div>
                            ) : (
                                <div className="history-timeline">
                                    <div className="timeline-item current">
                                        <div className="timeline-marker" />
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h4>SGT John Smith</h4>
                                                <span className="timeline-date">Present</span>
                                            </div>
                                            <p className="timeline-duration">45 days • Active</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker" />
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h4>CPL Jane Doe</h4>
                                                <span className="timeline-date">Jan 2024 - May 2024</span>
                                            </div>
                                            <p className="timeline-duration">120 days • Promoted</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker" />
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h4>Position Created</h4>
                                                <span className="timeline-date">Dec 2023</span>
                                            </div>
                                            <p className="timeline-duration">Initial establishment</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'relationships' && (
                        <div className="tab-content relationships-tab">
                            <div className="relationship-section">
                                <h3 className="section-title">Reports To</h3>
                                <div className="relationship-card">
                                    <div className="relationship-icon">
                                        <Crown size={20} />
                                    </div>
                                    <div className="relationship-info">
                                        <h4>Company Commander</h4>
                                        <p>Alpha Company, 1st Battalion</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relationship-section">
                                <h3 className="section-title">Subordinate Positions</h3>
                                <div className="subordinate-list">
                                    <div className="relationship-card">
                                        <div className="relationship-icon">
                                            <Users size={20} />
                                        </div>
                                        <div className="relationship-info">
                                            <h4>Squad Leader (x3)</h4>
                                            <p>Direct reports</p>
                                        </div>
                                    </div>
                                    <div className="relationship-card">
                                        <div className="relationship-icon">
                                            <Shield size={20} />
                                        </div>
                                        <div className="relationship-info">
                                            <h4>Weapons Specialist</h4>
                                            <p>Direct report</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {position.is_vacant && (
                        <button className="btn btn-primary" onClick={onAssign}>
                            <UserPlus size={16} />
                            Assign Personnel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PositionDetailModal;
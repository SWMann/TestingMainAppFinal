// src/components/UnitHierarchy/Modals/UnitDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Users,
    Shield,
    Calendar,
    MapPin,
    Award,
    ChevronRight,
    Briefcase,
    Flag
} from 'lucide-react';
import { unitService } from './unitService';
import { formatDate } from './dateUtils';

const UnitDetailsModal = ({ unitId, onClose }) => {
    const [unit, setUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        loadUnitDetails();
    }, [unitId]);

    const loadUnitDetails = async () => {
        try {
            setLoading(true);
            const response = await unitService.getUnit(unitId);
            setUnit(response.data);
        } catch (error) {
            console.error('Failed to load unit details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
        onClose();
    };

    const handlePositionClick = (positionId) => {
        // Could open position modal or navigate
    };

    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content unit-details-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-loading">
                        <div className="spinner"></div>
                        <p>Loading unit details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!unit) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content unit-details-modal large" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header unit-header">
                    <div className="header-content">
                        <div className="unit-header-info">
                            <div className="unit-title-section">
                                {unit.emblem_url && (
                                    <img
                                        src={unit.emblem_url}
                                        alt={unit.name}
                                        className="unit-emblem-large"
                                    />
                                )}
                                <div>
                                    <h2>{unit.name}</h2>
                                    <div className="unit-meta">
                                        <span className="unit-abbreviation">{unit.abbreviation}</span>
                                        <span className="separator">•</span>
                                        <span className="unit-type">{unit.unit_type}</span>
                                        <span className="separator">•</span>
                                        <span className="branch-name" style={{ color: unit.branch.color_code }}>
                      {unit.branch.name}
                    </span>
                                    </div>
                                    {unit.motto && (
                                        <div className="unit-motto">"{unit.motto}"</div>
                                    )}
                                </div>
                            </div>
                        </div>
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
                        className={`tab ${activeTab === 'personnel' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personnel')}
                    >
                        Personnel ({unit.personnel?.length || 0})
                    </button>
                    <button
                        className={`tab ${activeTab === 'positions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('positions')}
                    >
                        Positions ({unit.positions?.length || 0})
                    </button>
                    <button
                        className={`tab ${activeTab === 'subunits' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subunits')}
                    >
                        Subunits ({unit.subunits?.length || 0})
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {activeTab === 'overview' && (
                        <div className="tab-content overview-tab">
                            {/* Unit Statistics */}
                            <section className="detail-section">
                                <h3>Unit Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <Users size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>{unit.statistics.personnel_count}</h4>
                                            <p>Total Personnel</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>{unit.statistics.filled_positions}/{unit.statistics.total_positions}</h4>
                                            <p>Positions Filled</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <Award size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>{unit.statistics.fill_rate}%</h4>
                                            <p>Fill Rate</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <Flag size={24} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>{unit.subunits?.length || 0}</h4>
                                            <p>Subunits</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Unit Information */}
                            <section className="detail-section">
                                <h3>Unit Information</h3>
                                <div className="info-grid">
                                    {unit.parent_unit_details && (
                                        <div className="info-item">
                                            <label>Parent Unit</label>
                                            <value>{unit.parent_unit_details.name}</value>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <label>Branch</label>
                                        <value style={{ color: unit.branch.color_code }}>
                                            {unit.branch.name}
                                        </value>
                                    </div>
                                    {unit.established_date && (
                                        <div className="info-item">
                                            <label>Established</label>
                                            <value>{formatDate(unit.established_date)}</value>
                                        </div>
                                    )}
                                    {unit.location && (
                                        <div className="info-item">
                                            <label>Location</label>
                                            <value>
                                                <MapPin size={14} style={{ marginRight: 4 }} />
                                                {unit.location}
                                            </value>
                                        </div>
                                    )}
                                </div>

                                {unit.description && (
                                    <div className="description-section">
                                        <label>Description</label>
                                        <p>{unit.description}</p>
                                    </div>
                                )}
                            </section>

                            {/* Command Structure */}
                            <section className="detail-section">
                                <h3>Command Structure</h3>
                                {unit.positions?.filter(p => p.role_category === 'command').map(position => (
                                    <div key={position.id} className="command-position">
                                        <div className="position-info">
                                            <Shield size={20} className="command-icon" />
                                            <div>
                                                <h4>{position.display_title}</h4>
                                                {position.current_holder ? (
                                                    <button
                                                        className="user-link inline"
                                                        onClick={() => handleUserClick(position.current_holder.id)}
                                                    >
                            <span className="user-rank">
                              {position.current_holder.rank}
                            </span>
                                                        <span className="user-name">
                              {position.current_holder.username}
                            </span>
                                                    </button>
                                                ) : (
                                                    <span className="vacant-text">Position Vacant</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    )}

                    {activeTab === 'personnel' && (
                        <div className="tab-content personnel-tab">
                            <section className="detail-section">
                                <h3>Unit Personnel</h3>
                                {unit.personnel && unit.personnel.length > 0 ? (
                                    <div className="personnel-list">
                                        {unit.personnel.map(member => (
                                            <div key={member.id} className="personnel-item">
                                                <button
                                                    className="user-link full"
                                                    onClick={() => handleUserClick(member.id)}
                                                >
                                                    <div className="user-avatar-section">
                                                        {member.avatar_url ? (
                                                            <img
                                                                src={member.avatar_url}
                                                                alt={member.username}
                                                                className="user-avatar"
                                                            />
                                                        ) : (
                                                            <div className="avatar-placeholder">
                                                                <Users size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="user-info">
                                                        <div className="user-main">
                                                            <span className="user-rank">{member.rank}</span>
                                                            <span className="user-name">{member.username}</span>
                                                        </div>
                                                        <div className="user-position">{member.position}</div>
                                                    </div>
                                                    <div className="user-meta">
                                                        <span className="assignment-type">{member.assignment_type}</span>
                                                        <span className="assignment-date">
                              Since {formatDate(member.assignment_date)}
                            </span>
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Users size={48} />
                                        <p>No personnel assigned to this unit</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'positions' && (
                        <div className="tab-content positions-tab">
                            <section className="detail-section">
                                <h3>Unit Positions</h3>
                                {unit.positions && unit.positions.length > 0 ? (
                                    <div className="positions-grid">
                                        {['command', 'staff', 'nco', 'specialist', 'trooper'].map(category => {
                                            const categoryPositions = unit.positions.filter(p => p.role_category === category);
                                            if (categoryPositions.length === 0) return null;

                                            return (
                                                <div key={category} className="position-category">
                                                    <h4 className="category-title">{category}</h4>
                                                    <div className="positions-list">
                                                        {categoryPositions.map(position => (
                                                            <div
                                                                key={position.id}
                                                                className={`position-card ${position.is_vacant ? 'vacant' : ''}`}
                                                            >
                                                                <div className="position-header">
                                                                    <span className="position-title">{position.display_title}</span>
                                                                    {position.is_vacant && <span className="vacant-badge">Vacant</span>}
                                                                </div>
                                                                {position.current_holder && (
                                                                    <button
                                                                        className="user-link compact"
                                                                        onClick={() => handleUserClick(position.current_holder.id)}
                                                                    >
                                                                        <span className="user-rank">{position.current_holder.rank}</span>
                                                                        <span className="user-name">{position.current_holder.username}</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Briefcase size={48} />
                                        <p>No positions defined for this unit</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'subunits' && (
                        <div className="tab-content subunits-tab">
                            <section className="detail-section">
                                <h3>Subordinate Units</h3>
                                {unit.subunits && unit.subunits.length > 0 ? (
                                    <div className="subunits-grid">
                                        {unit.subunits.map(subunit => (
                                            <div key={subunit.id} className="subunit-card">
                                                <div className="subunit-header">
                                                    {subunit.emblem_url && (
                                                        <img
                                                            src={subunit.emblem_url}
                                                            alt={subunit.name}
                                                            className="subunit-emblem"
                                                        />
                                                    )}
                                                    <div className="subunit-info">
                                                        <h4>{subunit.abbreviation}</h4>
                                                        <p>{subunit.name}</p>
                                                        <span className="unit-type">{subunit.unit_type}</span>
                                                    </div>
                                                </div>
                                                <div className="subunit-stats">
                                                    <div className="stat">
                                                        <Users size={14} />
                                                        <span>{subunit.personnel_count} Personnel</span>
                                                    </div>
                                                    {subunit.commander && (
                                                        <div className="commander">
                                                            <Shield size={14} />
                                                            <span>{subunit.commander.rank} {subunit.commander.username}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Flag size={48} />
                                        <p>No subordinate units</p>
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

export default UnitDetailsModal;
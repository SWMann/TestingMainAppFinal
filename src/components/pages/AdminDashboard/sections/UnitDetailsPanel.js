import React, { useState } from 'react';
import {
    X, Edit, User, ChevronRight, MapPin, Calendar,
    Users, Briefcase, Shield, Star, Tag
} from 'lucide-react';

export const UnitDetailsPanel = ({ unit, onClose, onEdit, onAssignCommander, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="details-panel">
            <div className="panel-header">
                <h3>Unit Details</h3>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="panel-content">
                <div className="unit-profile-section">
                    {unit.emblem_url && (
                        <img
                            src={unit.emblem_url}
                            alt={unit.name}
                            className="profile-emblem"
                        />
                    )}
                    <div className="profile-info">
                        <h2>{unit.name}</h2>
                        <p className="unit-abbreviation">{unit.abbreviation}</p>
                        {unit.motto && (
                            <p className="unit-motto">"{unit.motto}"</p>
                        )}
                        <div className="profile-badges">
                            <span className="badge">{unit.branch_name}</span>
                            <span className="badge">{unit.unit_type}</span>
                            {unit.is_active ? (
                                <span className="badge active">Active</span>
                            ) : (
                                <span className="badge inactive">Inactive</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="detail-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        Members ({unit.members?.length || 0})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('positions')}
                    >
                        Positions ({unit.positions?.length || 0})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        Events ({unit.events?.length || 0})
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="detail-sections">
                            <div className="detail-section">
                                <h4>Basic Information</h4>
                                <div className="detail-row">
                                    <span className="label">Type:</span>
                                    <span className="value">{unit.unit_type || 'Not specified'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Branch:</span>
                                    <span className="value">{unit.branch_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Parent Unit:</span>
                                    <span className="value">{unit.parent_unit_name || 'None (Top Level)'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Location:</span>
                                    <span className="value">
                                        {unit.location ? (
                                            <>
                                                <MapPin size={14} />
                                                {unit.location}
                                            </>
                                        ) : (
                                            'Not specified'
                                        )}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Established:</span>
                                    <span className="value">
                                        {unit.established_date ? (
                                            <>
                                                <Calendar size={14} />
                                                {new Date(unit.established_date).toLocaleDateString()}
                                            </>
                                        ) : (
                                            'Not specified'
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Leadership</h4>
                                <div className="detail-row">
                                    <span className="label">Commander:</span>
                                    <span className="value">
                                        {unit.commander ? (
                                            <div className="commander-display">
                                                <img src={unit.commander.avatar_url || '/default-avatar.png'} alt="" />
                                                <span>{unit.commander.rank} {unit.commander.username}</span>
                                            </div>
                                        ) : (
                                            'No commander assigned'
                                        )}
                                    </span>
                                    <button className="inline-action-btn" onClick={onAssignCommander}>
                                        <User size={14} />
                                        {unit.commander ? 'Change' : 'Assign'}
                                    </button>
                                </div>
                            </div>

                            {unit.description && (
                                <div className="detail-section">
                                    <h4>Description</h4>
                                    <p className="description-text">{unit.description}</p>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>Statistics</h4>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-value">{unit.personnel_count || 0}</span>
                                        <span className="stat-label">Personnel</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{unit.positions?.filter(p => !p.is_vacant).length || 0}</span>
                                        <span className="stat-label">Filled Positions</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{unit.positions?.filter(p => p.is_vacant).length || 0}</span>
                                        <span className="stat-label">Vacant Positions</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">
                                            {unit.positions?.length > 0
                                                ? Math.round((unit.positions.filter(p => !p.is_vacant).length / unit.positions.length) * 100)
                                                : 0}%
                                        </span>
                                        <span className="stat-label">Fill Rate</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Actions</h4>
                                <div className="section-actions">
                                    <button className="section-action-btn" onClick={onEdit}>
                                        <Edit size={16} />
                                        Edit Unit
                                    </button>
                                    <button className="section-action-btn" onClick={onRefresh}>
                                        <ChevronRight size={16} />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="members-section">
                            {unit.members && unit.members.length > 0 ? (
                                <div className="members-list">
                                    {unit.members.map(member => (
                                        <div key={member.id} className="member-item">
                                            <img
                                                src={member.avatar_url || '/default-avatar.png'}
                                                alt={member.username}
                                                className="member-avatar"
                                            />
                                            <div className="member-info">
                                                <div className="member-name">
                                                    {member.rank?.abbreviation} {member.username}
                                                </div>
                                                <div className="member-position">
                                                    {member.position || member.role}
                                                </div>
                                            </div>
                                            <div className="member-meta">
                                                {member.assignment_type === 'primary' && (
                                                    <span className="primary-badge">Primary</span>
                                                )}
                                                <span className="status-text">{member.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Users size={48} />
                                    <p>No members assigned to this unit</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'positions' && (
                        <div className="positions-section">
                            {unit.positions && unit.positions.length > 0 ? (
                                <div className="positions-list">
                                    {unit.positions.map(position => (
                                        <div key={position.id} className="position-item">
                                            <div className="position-header">
                                                <h5>{position.display_title || position.role_name}</h5>
                                                {position.identifier && (
                                                    <span className="identifier">({position.identifier})</span>
                                                )}
                                            </div>
                                            <div className="position-details">
                                                <div className="position-info">
                                                    <span className={`role-category ${position.role_category}`}>
                                                        <Tag size={14} />
                                                        {position.role_category}
                                                    </span>
                                                    {position.current_holder ? (
                                                        <span className="holder">
                                                            <User size={14} />
                                                            {position.current_holder.rank} {position.current_holder.username}
                                                        </span>
                                                    ) : (
                                                        <span className="vacant">
                                                            <User size={14} />
                                                            Vacant
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="position-badges">
                                                    {position.role_details?.is_command_role && (
                                                        <span className="badge command">
                                                            <Star size={14} />
                                                            Command
                                                        </span>
                                                    )}
                                                    {position.role_details?.is_staff_role && (
                                                        <span className="badge staff">
                                                            <Users size={14} />
                                                            Staff
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Briefcase size={48} />
                                    <p>No positions defined for this unit</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="events-section">
                            {unit.events && unit.events.length > 0 ? (
                                <div className="events-list">
                                    {unit.events.map(event => (
                                        <div key={event.id} className="event-item">
                                            <div className="event-date">
                                                <Calendar size={16} />
                                                {new Date(event.start_time).toLocaleDateString()}
                                            </div>
                                            <div className="event-info">
                                                <h5>{event.title}</h5>
                                                <p>{event.event_type}</p>
                                            </div>
                                            <span className={`status-badge ${event.status.toLowerCase()}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Calendar size={48} />
                                    <p>No events scheduled for this unit</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
import React, { useState, useEffect } from 'react';
import {
    Shield, Search, Filter, Plus, Edit, Trash2, Building, Users,
    ChevronRight, MoreVertical, Calendar, MapPin, User,
    GitBranch, Briefcase, X, Check, AlertCircle, Eye,
    ChevronDown, ChevronUp, Flag, Award, FileText
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import {CreateUnitModal} from "../../../modals/CreateUnitModal";
import {EditUnitModal} from "../../../modals/EditUnitModal";
import {AssignCommanderModal} from "../../../modals/AssignCommanderModal";
import {PositionManagementModal} from "../../../modals/PositionManagementModal";
import {UnitHierarchyModal} from "../../../modals/UnitHierarchyModal";

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showUnitDetails, setShowUnitDetails] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCommanderModal, setShowCommanderModal] = useState(false);
    const [showPositionsModal, setShowPositionsModal] = useState(false);
    const [showHierarchyModal, setShowHierarchyModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState(new Set());

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [unitsResponse, branchesResponse] = await Promise.all([
                api.get('/units/'),
                api.get('/branches/')
            ]);

            setUnits(unitsResponse.data.results || unitsResponse.data);
            setBranches(branchesResponse.data.results || branchesResponse.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showNotification('Failed to load units', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnitDetails = async (unitId) => {
        try {
            const [unitRes, membersRes, positionsRes, eventsRes] = await Promise.all([
                api.get(`/units/${unitId}/`),
                api.get(`/units/${unitId}/members/`),
                api.get(`/units/${unitId}/positions/`),
                api.get(`/units/${unitId}/events/`)
            ]);

            setSelectedUnit({
                ...unitRes.data,
                members: membersRes.data,
                positions: positionsRes.data,
                events: eventsRes.data
            });

            setShowUnitDetails(true);
        } catch (error) {
            console.error('Error fetching unit details:', error);
            showNotification('Failed to load unit details', 'error');
        }
    };

    const handleCreateUnit = async (unitData) => {
        try {
            await api.post('/units/', unitData);
            await fetchInitialData();
            setShowCreateModal(false);
            showNotification('Unit created successfully', 'success');
        } catch (error) {
            console.error('Error creating unit:', error);
            showNotification('Failed to create unit', 'error');
        }
    };

    const handleUpdateUnit = async (unitData) => {
        try {
            await api.put(`/units/${selectedUnit.id}/`, unitData);
            await fetchInitialData();
            await fetchUnitDetails(selectedUnit.id);
            setShowEditModal(false);
            showNotification('Unit updated successfully', 'success');
        } catch (error) {
            console.error('Error updating unit:', error);
            showNotification('Failed to update unit', 'error');
        }
    };

    const handleAssignCommander = async (userId, positionId) => {
        try {
            await api.post('/user-positions/', {
                user: userId,
                position: positionId,
                unit: selectedUnit.id,
                is_primary: true
            });

            await fetchUnitDetails(selectedUnit.id);
            setShowCommanderModal(false);
            showNotification('Commander assigned successfully', 'success');
        } catch (error) {
            console.error('Error assigning commander:', error);
            showNotification('Failed to assign commander', 'error');
        }
    };

    const handleToggleActive = async (unitId, currentStatus) => {
        try {
            await api.patch(`/units/${unitId}/`, {
                is_active: !currentStatus
            });

            await fetchInitialData();
            showNotification(`Unit ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        } catch (error) {
            console.error('Error toggling unit status:', error);
            showNotification('Failed to update unit status', 'error');
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/units/${unitId}/`);
            await fetchInitialData();
            setShowUnitDetails(false);
            setSelectedUnit(null);
            showNotification('Unit deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting unit:', error);
            showNotification('Failed to delete unit. It may have associated data.', 'error');
        }
    };

    const toggleUnitExpansion = (unitId) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unitId)) {
            newExpanded.delete(unitId);
        } else {
            newExpanded.add(unitId);
        }
        setExpandedUnits(newExpanded);
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
    };

    // Filter and sort units
    const filteredUnits = units.filter(unit => {
        const matchesSearch =
            unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.unit_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterBy === 'all' ||
            (filterBy === 'active' && unit.is_active) ||
            (filterBy === 'inactive' && !unit.is_active);

        const matchesBranch =
            filterBranch === 'all' ||
            unit.branch === parseInt(filterBranch);

        return matchesSearch && matchesStatus && matchesBranch;
    });

    const sortedUnits = [...filteredUnits].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'branch':
                return (a.branch_name || '').localeCompare(b.branch_name || '');
            case 'type':
                return (a.unit_type || '').localeCompare(b.unit_type || '');
            case 'established':
                return new Date(b.established_date || 0) - new Date(a.established_date || 0);
            default:
                return 0;
        }
    });

    // Build hierarchical structure
    const buildHierarchy = (units, parentId = null) => {
        return units
            .filter(unit => unit.parent_unit === parentId)
            .map(unit => ({
                ...unit,
                children: buildHierarchy(units, unit.id)
            }));
    };

    const hierarchicalUnits = buildHierarchy(sortedUnits);

    const renderUnitRow = (unit, level = 0) => {
        const hasChildren = unit.children && unit.children.length > 0;
        const isExpanded = expandedUnits.has(unit.id);

        return (
            <React.Fragment key={unit.id}>
                <tr>
                    <td>
                        <div className="unit-cell" style={{ paddingLeft: `${level * 20}px` }}>
                            {hasChildren && (
                                <button
                                    className="expand-btn"
                                    onClick={() => toggleUnitExpansion(unit.id)}
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            )}
                            <div className="unit-info">
                                {unit.emblem_url && (
                                    <img
                                        src={unit.emblem_url}
                                        alt={unit.name}
                                        className="unit-emblem"
                                    />
                                )}
                                <div>
                                    <div className="unit-name">{unit.name}</div>
                                    <div className="unit-abbreviation">{unit.abbreviation}</div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>{unit.unit_type || <span className="no-data">Not specified</span>}</td>
                    <td>
                        <span className="branch-badge">{unit.branch_name}</span>
                    </td>
                    <td>
                        {unit.commander ? (
                            <div className="commander-cell">
                                <img
                                    src={unit.commander.avatar_url || '/default-avatar.png'}
                                    alt={unit.commander.username}
                                    className="commander-avatar"
                                />
                                <span>{unit.commander.rank} {unit.commander.username}</span>
                            </div>
                        ) : (
                            <span className="no-data">No commander</span>
                        )}
                    </td>
                    <td>
                        <span className={`status-badge ${unit.is_active ? 'active' : 'inactive'}`}>
                            {unit.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <div className="action-cell">
                            <button
                                className="icon-btn"
                                onClick={() => fetchUnitDetails(unit.id)}
                                title="View Details"
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                className="icon-btn"
                                onClick={() => {
                                    setSelectedUnit(unit);
                                    setShowEditModal(true);
                                }}
                                title="Edit Unit"
                            >
                                <Edit size={16} />
                            </button>
                            <div className="dropdown-container">
                                <button
                                    className="icon-btn"
                                    onClick={() => setActiveDropdown(activeDropdown === unit.id ? null : unit.id)}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                {activeDropdown === unit.id && (
                                    <div className="dropdown-menu">
                                        <button
                                            onClick={() => {
                                                setSelectedUnit(unit);
                                                setShowCommanderModal(true);
                                                setActiveDropdown(null);
                                            }}
                                        >
                                            <User size={16} />
                                            Assign Commander
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUnit(unit);
                                                setShowPositionsModal(true);
                                                setActiveDropdown(null);
                                            }}
                                        >
                                            <Briefcase size={16} />
                                            Manage Positions
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUnit(unit);
                                                setShowHierarchyModal(true);
                                                setActiveDropdown(null);
                                            }}
                                        >
                                            <GitBranch size={16} />
                                            View Hierarchy
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            onClick={() => {
                                                handleToggleActive(unit.id, unit.is_active);
                                                setActiveDropdown(null);
                                            }}
                                        >
                                            {unit.is_active ? <X size={16} /> : <Check size={16} />}
                                            {unit.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeleteUnit(unit.id);
                                                setActiveDropdown(null);
                                            }}
                                            className="danger"
                                        >
                                            <Trash2 size={16} />
                                            Delete Unit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
                {hasChildren && isExpanded && unit.children.map(child => renderUnitRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <Shield size={24} />
                        <h2>Unit Management</h2>
                        <span className="count-badge">{units.length} total</span>
                    </div>
                    <div className="section-actions">
                        <button
                            className="action-btn secondary"
                            onClick={() => setShowHierarchyModal(true)}
                        >
                            <GitBranch size={18} />
                            View Full Hierarchy
                        </button>
                        <button
                            className="action-btn primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={18} />
                            Create Unit
                        </button>
                    </div>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search units..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                            <option value="all">All Units</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Building size={18} />
                        <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                            <option value="all">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sort-group">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="name">Sort by Name</option>
                            <option value="branch">Sort by Branch</option>
                            <option value="type">Sort by Type</option>
                            <option value="established">Sort by Established Date</option>
                        </select>
                    </div>
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading units...</p>
                        </div>
                    ) : hierarchicalUnits.length === 0 ? (
                        <div className="empty-state">
                            <Shield size={48} />
                            <h3>No units found</h3>
                            <p>Try adjusting your search or filters</p>
                            <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Create First Unit
                            </button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Unit</th>
                                <th>Type</th>
                                <th>Branch</th>
                                <th>Commander</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {hierarchicalUnits.map(unit => renderUnitRow(unit))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Unit Details Panel */}
            {showUnitDetails && selectedUnit && (
                <UnitDetailsPanel
                    unit={selectedUnit}
                    onClose={() => {
                        setShowUnitDetails(false);
                        setSelectedUnit(null);
                    }}
                    onEdit={() => setShowEditModal(true)}
                    onAssignCommander={() => setShowCommanderModal(true)}
                    onManagePositions={() => setShowPositionsModal(true)}
                    onRefresh={() => fetchUnitDetails(selectedUnit.id)}
                />
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateUnitModal
                    branches={branches}
                    units={units}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateUnit}
                />
            )}

            {showEditModal && selectedUnit && (
                <EditUnitModal
                    unit={selectedUnit}
                    branches={branches}
                    units={units}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdateUnit}
                />
            )}

            {showCommanderModal && selectedUnit && (
                <AssignCommanderModal
                    unit={selectedUnit}
                    onClose={() => setShowCommanderModal(false)}
                    onAssign={handleAssignCommander}
                />
            )}

            {showPositionsModal && selectedUnit && (
                <PositionManagementModal
                    unit={selectedUnit}
                    onClose={() => setShowPositionsModal(false)}
                    onUpdate={() => fetchUnitDetails(selectedUnit.id)}
                />
            )}

            {showHierarchyModal && (
                <UnitHierarchyModal
                    unit={selectedUnit}
                    onClose={() => setShowHierarchyModal(false)}
                />
            )}
        </div>
    );
};

// Unit Details Panel Component
const UnitDetailsPanel = ({ unit, onClose, onEdit, onAssignCommander, onManagePositions, onRefresh }) => {
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
                                <h4>Actions</h4>
                                <div className="section-actions">
                                    <button className="section-action-btn" onClick={onEdit}>
                                        <Edit size={16} />
                                        Edit Unit
                                    </button>
                                    <button className="section-action-btn" onClick={onManagePositions}>
                                        <Briefcase size={16} />
                                        Manage Positions
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
                                                <div className="member-position">{member.position}</div>
                                            </div>
                                            <div className="member-meta">
                                                {member.is_primary && <span className="primary-badge">Primary</span>}
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
                            <button className="section-action-btn" onClick={onManagePositions}>
                                <Plus size={16} />
                                Add Position
                            </button>
                            {unit.positions && unit.positions.length > 0 ? (
                                <div className="positions-list">
                                    {unit.positions.map(position => (
                                        <div key={position.id} className="position-item">
                                            <div className="position-header">
                                                <h5>{position.title}</h5>
                                                {position.abbreviation && (
                                                    <span className="abbreviation">({position.abbreviation})</span>
                                                )}
                                            </div>
                                            <div className="position-badges">
                                                {position.is_command_position && (
                                                    <span className="badge command">Command</span>
                                                )}
                                                {position.is_staff_position && (
                                                    <span className="badge staff">Staff</span>
                                                )}
                                                <span className="slots-badge">
                                                    {position.max_slots} slot{position.max_slots !== 1 ? 's' : ''}
                                                </span>
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

export default UnitManagement;
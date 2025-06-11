import React, { useState, useEffect } from 'react';
import {
    Shield, Search, Filter, Plus, Edit, Trash2, Building, Users,
    ChevronRight, MoreVertical, Calendar, MapPin, User,
    GitBranch, Briefcase, X, Check, AlertCircle, Eye,
    ChevronDown, ChevronUp, Flag, Award, FileText,
    Star, Hash, Layers, UserCheck
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import {CreateUnitModal} from "../../../modals/CreateUnitModal";
import {EditUnitModal} from "../../../modals/EditUnitModal";
import {AssignCommanderModal} from "../../../modals/AssignCommanderModal";
import {UnitHierarchyModal} from "../../../modals/UnitHierarchyModal";
import {CreatePositionModal} from "../../../modals/CreatePositionModal";
import {EditPositionModal} from "../../../modals/EditPositionModal";
import {UnitDetailsPanel} from "./UnitDetailsPanel";

const UnitManagement = () => {
    const [activeTab, setActiveTab] = useState('units');
    const [units, setUnits] = useState([]);
    const [branches, setBranches] = useState([]);
    const [positions, setPositions] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showUnitDetails, setShowUnitDetails] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCommanderModal, setShowCommanderModal] = useState(false);
    const [showHierarchyModal, setShowHierarchyModal] = useState(false);
    const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
    const [showEditPositionModal, setShowEditPositionModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState(new Set());

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [unitsResponse, branchesResponse, positionsResponse, ranksResponse] = await Promise.all([
                api.get('/units/'),
                api.get('/branches/'),
                api.get('/positions/'),
                api.get('/ranks/')
            ]);

            setUnits(unitsResponse.data.results || unitsResponse.data);
            setBranches(branchesResponse.data.results || branchesResponse.data);
            setPositions(positionsResponse.data.results || positionsResponse.data);
            setRanks(ranksResponse.data.results || ranksResponse.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showNotification('Failed to load data', 'error');
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

    const handleCreatePosition = async (positionData) => {
        try {
            await api.post('/positions/', positionData);
            await fetchInitialData();
            setShowCreatePositionModal(false);
            showNotification('Position created successfully', 'success');
        } catch (error) {
            console.error('Error creating position:', error);
            showNotification('Failed to create position', 'error');
        }
    };

    const handleUpdatePosition = async (positionData) => {
        try {
            await api.put(`/positions/${selectedPosition.id}/`, positionData);
            await fetchInitialData();
            setShowEditPositionModal(false);
            setSelectedPosition(null);
            showNotification('Position updated successfully', 'success');
        } catch (error) {
            console.error('Error updating position:', error);
            showNotification('Failed to update position', 'error');
        }
    };

    const handleDeletePosition = async (positionId) => {
        if (!window.confirm('Are you sure you want to delete this position? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/positions/${positionId}/`);
            await fetchInitialData();
            showNotification('Position deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting position:', error);
            showNotification('Failed to delete position. It may have assigned users.', 'error');
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

    // Filter positions
    const filteredPositions = positions.filter(position => {
        const matchesSearch =
            position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            position.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            position.unit_name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
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

    const renderPositionRow = (position) => {
        return (
            <tr key={position.id}>
                <td>
                    <div className="position-info">
                        <div>
                            <div className="position-title">{position.title}</div>
                            {position.abbreviation && (
                                <div className="position-abbreviation">{position.abbreviation}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td>{position.unit_name || <span className="no-data">Not assigned</span>}</td>
                <td>
                    <div className="position-badges">
                        {position.is_command_position && (
                            <span className="badge command">
                                <Star size={14} />
                                Command
                            </span>
                        )}
                        {position.is_staff_position && (
                            <span className="badge staff">
                                <Users size={14} />
                                Staff
                            </span>
                        )}
                    </div>
                </td>
                <td>
                    {position.min_rank ? (
                        <span className="rank-requirement">
                            {position.min_rank.abbreviation}
                            {position.max_rank && ` - ${position.max_rank.abbreviation}`}
                        </span>
                    ) : (
                        <span className="no-data">No requirement</span>
                    )}
                </td>
                <td>
                    <span className="slots-badge">
                        <Hash size={14} />
                        {position.max_slots} slot{position.max_slots !== 1 ? 's' : ''}
                    </span>
                </td>
                <td>
                    <div className="action-cell">
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSelectedPosition(position);
                                setShowEditPositionModal(true);
                            }}
                            title="Edit Position"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="icon-btn danger"
                            onClick={() => handleDeletePosition(position.id)}
                            title="Delete Position"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        {activeTab === 'units' ? (
                            <>
                                <Shield size={24} />
                                <h2>Unit Management</h2>
                                <span className="count-badge">{units.length} total</span>
                            </>
                        ) : (
                            <>
                                <Briefcase size={24} />
                                <h2>Position Management</h2>
                                <span className="count-badge">{positions.length} total</span>
                            </>
                        )}
                    </div>
                    <div className="section-actions">
                        {activeTab === 'units' ? (
                            <>
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
                            </>
                        ) : (
                            <button
                                className="action-btn primary"
                                onClick={() => setShowCreatePositionModal(true)}
                            >
                                <Plus size={18} />
                                Create Position
                            </button>
                        )}
                    </div>
                </div>

                <div className="section-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'units' ? 'active' : ''}`}
                        onClick={() => setActiveTab('units')}
                    >
                        <Shield size={18} />
                        Units
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('positions')}
                    >
                        <Briefcase size={18} />
                        Positions
                    </button>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {activeTab === 'units' && (
                        <>
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
                        </>
                    )}
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading {activeTab}...</p>
                        </div>
                    ) : activeTab === 'units' ? (
                        hierarchicalUnits.length === 0 ? (
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
                        )
                    ) : (
                        filteredPositions.length === 0 ? (
                            <div className="empty-state">
                                <Briefcase size={48} />
                                <h3>No positions found</h3>
                                <p>Try adjusting your search</p>
                                <button className="action-btn primary" onClick={() => setShowCreatePositionModal(true)}>
                                    <Plus size={18} />
                                    Create First Position
                                </button>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Unit</th>
                                    <th>Type</th>
                                    <th>Rank Requirements</th>
                                    <th>Slots</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPositions.map(position => renderPositionRow(position))}
                                </tbody>
                            </table>
                        )
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

            {showCreatePositionModal && (
                <CreatePositionModal
                    units={units}
                    ranks={ranks}
                    onClose={() => setShowCreatePositionModal(false)}
                    onCreate={handleCreatePosition}
                />
            )}

            {showEditPositionModal && selectedPosition && (
                <EditPositionModal
                    position={selectedPosition}
                    units={units}
                    ranks={ranks}
                    onClose={() => {
                        setShowEditPositionModal(false);
                        setSelectedPosition(null);
                    }}
                    onUpdate={handleUpdatePosition}
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

export default UnitManagement;
import React, { useState, useEffect } from 'react';
import {
    Shield, Search, Filter, Plus, Edit, Trash2, Building, Users,
    ChevronRight, MoreVertical, Calendar, MapPin, User,
    GitBranch, Briefcase, X, Check, AlertCircle, Eye,
    ChevronDown, ChevronUp, Flag, Award, FileText,
    Star, Hash, Layers, UserCheck, Tag
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import {CreateUnitModal} from "../../../modals/CreateUnitModal";
import {EditUnitModal} from "../../../modals/EditUnitModal";
import {AssignCommanderModal} from "../../../modals/AssignCommanderModal";
import {UnitHierarchyModal} from "../../../modals/UnitHierarchyModal";
import {CreatePositionModal} from "../../../modals/CreatePositionModal";
import {EditPositionModal} from "../../../modals/EditPositionModal";
import {CreateRoleModal} from "../../../modals/CreateRoleModal";
import {EditRoleModal} from "../../../modals/EditRoleModal";
import {AssignPositionModal} from "../../../modals/AssignPositionModal";
import {UnitDetailsPanel} from "./UnitDetailsPanel";

const UnitManagement = () => {
    const [activeTab, setActiveTab] = useState('units');
    const [units, setUnits] = useState([]);
    const [branches, setBranches] = useState([]);
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showUnitDetails, setShowUnitDetails] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCommanderModal, setShowCommanderModal] = useState(false);
    const [showHierarchyModal, setShowHierarchyModal] = useState(false);
    const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
    const [showEditPositionModal, setShowEditPositionModal] = useState(false);
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
    const [showEditRoleModal, setShowEditRoleModal] = useState(false);
    const [showAssignPositionModal, setShowAssignPositionModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState(new Set());

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [unitsResponse, branchesResponse, positionsResponse, rolesResponse, ranksResponse] = await Promise.all([
                api.get('/units/'),
                api.get('/branches/'),
                api.get('/positions/'),
                api.get('/roles/'),
                api.get('/ranks/')
            ]);

            setUnits(unitsResponse.data.results || unitsResponse.data);
            setBranches(branchesResponse.data.results || branchesResponse.data);
            setPositions(positionsResponse.data.results || positionsResponse.data);
            setRoles(rolesResponse.data.results || rolesResponse.data);
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

    const handleCreateRole = async (roleData) => {
        try {
            await api.post('/roles/', roleData);
            await fetchInitialData();
            setShowCreateRoleModal(false);
            showNotification('Role created successfully', 'success');
        } catch (error) {
            console.error('Error creating role:', error);
            showNotification('Failed to create role', 'error');
        }
    };

    const handleUpdateRole = async (roleData) => {
        try {
            await api.put(`/roles/${selectedRole.id}/`, roleData);
            await fetchInitialData();
            setShowEditRoleModal(false);
            setSelectedRole(null);
            showNotification('Role updated successfully', 'success');
        } catch (error) {
            console.error('Error updating role:', error);
            showNotification('Failed to update role', 'error');
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

    const handleAssignPosition = async (positionId, userId) => {
        try {
            await api.post(`/positions/${positionId}/assign/`, {
                user_id: userId,
                assignment_type: 'primary'
            });

            await fetchInitialData();
            setShowAssignPositionModal(false);
            setSelectedPosition(null);
            showNotification('User assigned to position successfully', 'success');
        } catch (error) {
            console.error('Error assigning position:', error);
            showNotification(error.response?.data?.error || 'Failed to assign position', 'error');
        }
    };

    const handleVacatePosition = async (positionId) => {
        if (!window.confirm('Are you sure you want to vacate this position?')) {
            return;
        }

        try {
            await api.post(`/positions/${positionId}/vacate/`);
            await fetchInitialData();
            showNotification('Position vacated successfully', 'success');
        } catch (error) {
            console.error('Error vacating position:', error);
            showNotification('Failed to vacate position', 'error');
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
            position.display_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            position.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            position.unit_name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Filter roles
    const filteredRoles = roles.filter(role => {
        const matchesSearch =
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            filterCategory === 'all' ||
            role.category === filterCategory;

        return matchesSearch && matchesCategory;
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
                            <div className="position-title">{position.display_title || position.role_name}</div>
                            {position.identifier && (
                                <div className="position-identifier">{position.identifier}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td>{position.unit_name || <span className="no-data">Not assigned</span>}</td>
                <td>
                    <div className="role-info">
                        <span className="role-name">{position.role_name}</span>
                        <span className={`role-category ${position.role_category}`}>
                            {position.role_category}
                        </span>
                    </div>
                </td>
                <td>
                    {position.current_holder ? (
                        <div className="holder-cell">
                            <span>{position.current_holder.rank} {position.current_holder.username}</span>
                        </div>
                    ) : (
                        <span className={`vacancy-badge ${position.is_vacant ? 'vacant' : 'filled'}`}>
                            {position.is_vacant ? 'Vacant' : 'Filled'}
                        </span>
                    )}
                </td>
                <td>
                    <div className="action-cell">
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSelectedPosition(position);
                                setShowAssignPositionModal(true);
                            }}
                            title="Assign User"
                            disabled={!position.is_vacant}
                        >
                            <UserCheck size={16} />
                        </button>
                        {!position.is_vacant && (
                            <button
                                className="icon-btn"
                                onClick={() => handleVacatePosition(position.id)}
                                title="Vacate Position"
                            >
                                <X size={16} />
                            </button>
                        )}
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

    const renderRoleRow = (role) => {
        return (
            <tr key={role.id}>
                <td>
                    <div className="role-info">
                        <div>
                            <div className="role-title">{role.name}</div>
                            {role.abbreviation && (
                                <div className="role-abbreviation">{role.abbreviation}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td>
                    <span className={`category-badge ${role.category}`}>
                        {role.category}
                    </span>
                </td>
                <td>
                    <div className="role-badges">
                        {role.is_command_role && (
                            <span className="badge command">
                                <Star size={14} />
                                Command
                            </span>
                        )}
                        {role.is_staff_role && (
                            <span className="badge staff">
                                <Users size={14} />
                                Staff
                            </span>
                        )}
                        {role.is_nco_role && (
                            <span className="badge nco">
                                <Shield size={14} />
                                NCO
                            </span>
                        )}
                        {role.is_specialist_role && (
                            <span className="badge specialist">
                                <Award size={14} />
                                Specialist
                            </span>
                        )}
                    </div>
                </td>
                <td>
                    <div className="position-count">
                        <span className="filled">{role.filled_positions_count || 0}</span>
                        <span className="separator">/</span>
                        <span className="total">{role.positions_count || 0}</span>
                    </div>
                </td>
                <td>
                    <div className="action-cell">
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSelectedRole(role);
                                setShowEditRoleModal(true);
                            }}
                            title="Edit Role"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="icon-btn"
                            onClick={() => {
                                // View positions for this role
                                setFilterBy('all');
                                setSearchTerm(role.name);
                                setActiveTab('positions');
                            }}
                            title="View Positions"
                        >
                            <Eye size={16} />
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
                        ) : activeTab === 'positions' ? (
                            <>
                                <Briefcase size={24} />
                                <h2>Position Management</h2>
                                <span className="count-badge">{positions.length} total</span>
                            </>
                        ) : (
                            <>
                                <Tag size={24} />
                                <h2>Role Management</h2>
                                <span className="count-badge">{roles.length} total</span>
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
                        ) : activeTab === 'positions' ? (
                            <button
                                className="action-btn primary"
                                onClick={() => setShowCreatePositionModal(true)}
                            >
                                <Plus size={18} />
                                Create Position
                            </button>
                        ) : (
                            <button
                                className="action-btn primary"
                                onClick={() => setShowCreateRoleModal(true)}
                            >
                                <Plus size={18} />
                                Create Role
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
                    <button
                        className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        <Tag size={18} />
                        Roles
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

                    {activeTab === 'roles' && (
                        <div className="filter-group">
                            <Tag size={18} />
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="all">All Categories</option>
                                <option value="command">Command</option>
                                <option value="staff">Staff</option>
                                <option value="nco">NCO</option>
                                <option value="specialist">Specialist</option>
                                <option value="trooper">Trooper</option>
                                <option value="support">Support</option>
                                <option value="medical">Medical</option>
                                <option value="logistics">Logistics</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="communications">Communications</option>
                                <option value="aviation">Aviation</option>
                                <option value="armor">Armor</option>
                                <option value="infantry">Infantry</option>
                            </select>
                        </div>
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
                    ) : activeTab === 'positions' ? (
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
                                    <th>Role</th>
                                    <th>Current Holder</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPositions.map(position => renderPositionRow(position))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        filteredRoles.length === 0 ? (
                            <div className="empty-state">
                                <Tag size={48} />
                                <h3>No roles found</h3>
                                <p>Try adjusting your search or filters</p>
                                <button className="action-btn primary" onClick={() => setShowCreateRoleModal(true)}>
                                    <Plus size={18} />
                                    Create First Role
                                </button>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Positions</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRoles.map(role => renderRoleRow(role))}
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
                    roles={roles}
                    onClose={() => setShowCreatePositionModal(false)}
                    onCreate={handleCreatePosition}
                />
            )}

            {showEditPositionModal && selectedPosition && (
                <EditPositionModal
                    position={selectedPosition}
                    units={units}
                    roles={roles}
                    onClose={() => {
                        setShowEditPositionModal(false);
                        setSelectedPosition(null);
                    }}
                    onUpdate={handleUpdatePosition}
                />
            )}

            {showCreateRoleModal && (
                <CreateRoleModal
                    branches={branches}
                    ranks={ranks}
                    onClose={() => setShowCreateRoleModal(false)}
                    onCreate={handleCreateRole}
                />
            )}

            {showEditRoleModal && selectedRole && (
                <EditRoleModal
                    role={selectedRole}
                    branches={branches}
                    ranks={ranks}
                    onClose={() => {
                        setShowEditRoleModal(false);
                        setSelectedRole(null);
                    }}
                    onUpdate={handleUpdateRole}
                />
            )}

            {showAssignPositionModal && selectedPosition && (
                <AssignPositionModal
                    position={selectedPosition}
                    onClose={() => {
                        setShowAssignPositionModal(false);
                        setSelectedPosition(null);
                    }}
                    onAssign={handleAssignPosition}
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
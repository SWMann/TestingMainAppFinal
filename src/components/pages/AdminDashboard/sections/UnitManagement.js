import React, { useState, useEffect } from 'react';
import {
    Shield, Search, Filter, Plus, Edit, Trash2, Building, Users,
    ChevronRight, MoreVertical, Calendar, MapPin, User,
    GitBranch, Briefcase, X, Check, AlertCircle, Eye,
    ChevronDown, ChevronUp, Flag, Award, FileText,
    Star, Hash, Layers, UserCheck, Tag, Target, TrendingUp,
    Info, Lock, Unlock, UserPlus
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
import {
    CreateRecruitmentSlotModal,
    EditRecruitmentSlotModal,
    UnitRecruitmentStatusModal
} from "../../../modals/RecruitmentModals";

const UnitManagement = () => {
    const [activeTab, setActiveTab] = useState('units');
    const [units, setUnits] = useState([]);
    const [branches, setBranches] = useState([]);
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [recruitmentSlots, setRecruitmentSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterRecruitmentStatus, setFilterRecruitmentStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
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
    const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
    const [showEditSlotModal, setShowEditSlotModal] = useState(false);
    const [showRecruitmentStatusModal, setShowRecruitmentStatusModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState(new Set());

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'recruitment') {
            fetchRecruitmentData();
        }
    }, [activeTab]);

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

    const fetchRecruitmentData = async () => {
        try {
            const [slotsResponse, unitsWithRecruitment] = await Promise.all([
                api.get('/units/recruitment/slots/'),
                api.get('/units/recruitment/units/status/')
            ]);

            setRecruitmentSlots(slotsResponse.data.results || slotsResponse.data);

            // Update units with recruitment data
            const updatedUnits = units.map(unit => {
                const recruitmentData = unitsWithRecruitment.data.find(ru => ru.id === unit.id);
                return recruitmentData ? { ...unit, ...recruitmentData } : unit;
            });
            setUnits(updatedUnits);
        } catch (error) {
            console.error('Error fetching recruitment data:', error);
            showNotification('Failed to load recruitment data', 'error');
        }
    };

    const fetchUnitDetails = async (unitId) => {
        try {
            const [unitRes, membersRes, positionsRes, eventsRes, recruitmentRes] = await Promise.all([
                api.get(`/units/${unitId}/`),
                api.get(`/units/${unitId}/members/`),
                api.get(`/units/${unitId}/positions/`),
                api.get(`/units/${unitId}/events/`),
                api.get(`/units/recruitment/units/status/?unit_id=${unitId}`)
            ]);

            setSelectedUnit({
                ...unitRes.data,
                members: membersRes.data,
                positions: positionsRes.data,
                events: eventsRes.data,
                recruitment_data: recruitmentRes.data
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

    // Recruitment handlers
    const handleCreateRecruitmentSlot = async (slotData) => {
        try {
            await api.post('/units/recruitment/slots/', slotData);
            await fetchRecruitmentData();
            setShowCreateSlotModal(false);
            showNotification('Recruitment slot created successfully', 'success');
        } catch (error) {
            console.error('Error creating recruitment slot:', error);
            showNotification(error.response?.data?.non_field_errors?.[0] || 'Failed to create recruitment slot', 'error');
        }
    };

    const handleUpdateRecruitmentSlot = async (slotId, slotData) => {
        try {
            await api.patch(`/units/recruitment/slots/${slotId}/`, slotData);
            await fetchRecruitmentData();
            setShowEditSlotModal(false);
            setSelectedSlot(null);
            showNotification('Recruitment slot updated successfully', 'success');
        } catch (error) {
            console.error('Error updating recruitment slot:', error);
            showNotification('Failed to update recruitment slot', 'error');
        }
    };

    const handleDeleteRecruitmentSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to delete this recruitment slot?')) {
            return;
        }

        try {
            await api.delete(`/units/recruitment/slots/${slotId}/`);
            await fetchRecruitmentData();
            showNotification('Recruitment slot deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting recruitment slot:', error);
            showNotification('Failed to delete recruitment slot', 'error');
        }
    };

    const handleUpdateRecruitmentStatus = async (unitId, statusData) => {
        try {
            await api.patch(`/units/recruitment/units/${unitId}/update_status/`, statusData);
            await fetchInitialData();
            await fetchRecruitmentData();
            setShowRecruitmentStatusModal(false);
            setSelectedUnit(null);
            showNotification('Recruitment status updated successfully', 'success');
        } catch (error) {
            console.error('Error updating recruitment status:', error);
            showNotification('Failed to update recruitment status', 'error');
        }
    };

    const handleInitializeSlots = async (unitId) => {
        if (!window.confirm('Initialize recruitment slots based on unit positions? This will create slots for all active positions.')) {
            return;
        }

        try {
            const response = await api.post(`/units/recruitment/units/${unitId}/initialize_slots/`);
            await fetchRecruitmentData();
            showNotification(response.data.message, 'success');
        } catch (error) {
            console.error('Error initializing slots:', error);
            showNotification('Failed to initialize recruitment slots', 'error');
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
            unit.branch === filterBranch;

        const matchesRecruitmentStatus =
            filterRecruitmentStatus === 'all' ||
            unit.recruitment_status === filterRecruitmentStatus;

        return matchesSearch && matchesStatus && matchesBranch && matchesRecruitmentStatus;
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

    // Filter recruitment slots
    const filteredSlots = recruitmentSlots.filter(slot => {
        const matchesSearch =
            slot.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slot.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slot.career_track?.toLowerCase().includes(searchTerm.toLowerCase());

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

    const renderRecruitmentRow = (unit) => {
        const totalSlots = unit.total_slots || 0;
        const totalFilled = unit.total_filled || 0;
        const totalAvailable = unit.total_available || 0;
        const fillRate = unit.fill_rate || 0;

        const getStatusBadgeClass = (status) => {
            switch (status) {
                case 'open': return 'success';
                case 'limited': return 'warning';
                case 'closed': return 'danger';
                case 'frozen': return 'info';
                default: return 'default';
            }
        };

        return (
            <tr key={unit.id}>
                <td>
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
                </td>
                <td>
                    <span className={`status-badge ${getStatusBadgeClass(unit.recruitment_status)}`}>
                        {unit.recruitment_status?.replace('_', ' ') || 'Not Set'}
                    </span>
                </td>
                <td>
                    <div className="strength-info">
                        <div className="strength-current">{unit.max_personnel || 0}</div>
                        <div className="strength-target">Target: {unit.target_personnel || 0}</div>
                    </div>
                </td>
                <td>
                    <div className="slots-info">
                        <div className="slots-summary">
                            <span className="filled">{totalFilled}</span>
                            <span className="separator">/</span>
                            <span className="total">{totalSlots}</span>
                        </div>
                        <div className="slots-available">
                            {totalAvailable > 0 ? (
                                <span className="positive">{totalAvailable} available</span>
                            ) : (
                                <span className="zero">No slots available</span>
                            )}
                        </div>
                    </div>
                </td>
                <td>
                    <div className="fill-rate">
                        <div className="fill-rate-value">{fillRate}%</div>
                        <div className="fill-rate-bar">
                            <div className="fill-rate-progress" style={{ width: `${fillRate}%` }}></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div className="action-cell">
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSelectedUnit(unit);
                                setShowRecruitmentStatusModal(true);
                            }}
                            title="Edit Recruitment Status"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSelectedUnit(unit);
                                fetchUnitRecruitmentSlots(unit.id);
                            }}
                            title="View Slots"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            className="icon-btn"
                            onClick={() => handleInitializeSlots(unit.id)}
                            title="Initialize Slots from Positions"
                        >
                            <Target size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    const fetchUnitRecruitmentSlots = async (unitId) => {
        try {
            const response = await api.get(`/units/recruitment/slots/by_unit/?unit_id=${unitId}`);
            // Handle displaying the slots - could open a modal or expand the row
            console.log('Unit recruitment slots:', response.data);
        } catch (error) {
            console.error('Error fetching unit recruitment slots:', error);
            showNotification('Failed to fetch recruitment slots', 'error');
        }
    };

    const renderRecruitmentSlotRow = (slot) => {
        const availableSlots = slot.available_slots || 0;
        const fillRate = slot.total_slots > 0
            ? Math.round((slot.filled_slots / slot.total_slots) * 100)
            : 0;

        return (
            <tr key={slot.id}>
                <td>{slot.unit_name}</td>
                <td>
                    <div className="role-info">
                        <span className="role-name">{slot.role_name}</span>
                        <span className={`role-category ${slot.role_category}`}>
                            {slot.role_category}
                        </span>
                    </div>
                </td>
                <td>
                    <span className={`career-track-badge ${slot.career_track}`}>
                        {slot.career_track}
                    </span>
                </td>
                <td>
                    <div className="slots-breakdown">
                        <div className="slot-counts">
                            <span className="total">Total: {slot.total_slots}</span>
                            <span className="filled">Filled: {slot.filled_slots}</span>
                            <span className="reserved">Reserved: {slot.reserved_slots}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span className={`available-count ${availableSlots > 0 ? 'positive' : 'zero'}`}>
                        {availableSlots}
                    </span>
                </td>
                <td>
                    <div className="fill-rate">
                        <div className="fill-rate-value">{fillRate}%</div>
                        <div className="fill-rate-bar small">
                            <div className="fill-rate-progress" style={{ width: `${fillRate}%` }}></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span className={`status-badge ${slot.is_active ? 'active' : 'inactive'}`}>
                        {slot.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div className="action-cell">
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSelectedSlot(slot);
                                setShowEditSlotModal(true);
                            }}
                            title="Edit Slot"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="icon-btn danger"
                            onClick={() => handleDeleteRecruitmentSlot(slot.id)}
                            title="Delete Slot"
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
                        ) : activeTab === 'positions' ? (
                            <>
                                <Briefcase size={24} />
                                <h2>Position Management</h2>
                                <span className="count-badge">{positions.length} total</span>
                            </>
                        ) : activeTab === 'roles' ? (
                            <>
                                <Tag size={24} />
                                <h2>Role Management</h2>
                                <span className="count-badge">{roles.length} total</span>
                            </>
                        ) : (
                            <>
                                <Target size={24} />
                                <h2>Recruitment Management</h2>
                                <span className="count-badge">{recruitmentSlots.length} slots</span>
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
                        ) : activeTab === 'roles' ? (
                            <button
                                className="action-btn primary"
                                onClick={() => setShowCreateRoleModal(true)}
                            >
                                <Plus size={18} />
                                Create Role
                            </button>
                        ) : (
                            <button
                                className="action-btn primary"
                                onClick={() => setShowCreateSlotModal(true)}
                            >
                                <Plus size={18} />
                                Create Recruitment Slot
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
                    <button
                        className={`tab-btn ${activeTab === 'recruitment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recruitment')}
                    >
                        <Target size={18} />
                        Recruitment
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

                    {activeTab === 'recruitment' && (
                        <div className="filter-group">
                            <Filter size={18} />
                            <select
                                value={filterRecruitmentStatus}
                                onChange={(e) => setFilterRecruitmentStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="limited">Limited</option>
                                <option value="closed">Closed</option>
                                <option value="frozen">Frozen</option>
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
                    ) : activeTab === 'roles' ? (
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
                    ) : (
                        // Recruitment tab
                        <>
                            <div className="recruitment-overview">
                                <div className="overview-cards">
                                    <div className="overview-card">
                                        <div className="card-icon">
                                            <Users size={24} />
                                        </div>
                                        <div className="card-content">
                                            <h4>Total Slots</h4>
                                            <p className="card-value">
                                                {recruitmentSlots.reduce((sum, slot) => sum + slot.total_slots, 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="overview-card">
                                        <div className="card-icon">
                                            <UserCheck size={24} />
                                        </div>
                                        <div className="card-content">
                                            <h4>Filled Slots</h4>
                                            <p className="card-value">
                                                {recruitmentSlots.reduce((sum, slot) => sum + slot.filled_slots, 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="overview-card">
                                        <div className="card-icon">
                                            <Shield size={24} />
                                        </div>
                                        <div className="card-content">
                                            <h4>Reserved</h4>
                                            <p className="card-value">
                                                {recruitmentSlots.reduce((sum, slot) => sum + slot.reserved_slots, 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="overview-card">
                                        <div className="card-icon">
                                            <Target size={24} />
                                        </div>
                                        <div className="card-content">
                                            <h4>Available</h4>
                                            <p className="card-value">
                                                {recruitmentSlots.reduce((sum, slot) => sum + (slot.available_slots || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="recruitment-tables">
                                <div className="table-section">
                                    <h3>Unit Recruitment Status</h3>
                                    {sortedUnits.length === 0 ? (
                                        <div className="empty-state">
                                            <Target size={48} />
                                            <h3>No units found</h3>
                                            <p>Create units first to manage recruitment</p>
                                        </div>
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                            <tr>
                                                <th>Unit</th>
                                                <th>Status</th>
                                                <th>Max/Target</th>
                                                <th>Slots</th>
                                                <th>Fill Rate</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {sortedUnits.map(unit => renderRecruitmentRow(unit))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="table-section">
                                    <h3>Recruitment Slots</h3>
                                    {filteredSlots.length === 0 ? (
                                        <div className="empty-state">
                                            <UserPlus size={48} />
                                            <h3>No recruitment slots found</h3>
                                            <p>Create recruitment slots or initialize from unit positions</p>
                                            <button className="action-btn primary" onClick={() => setShowCreateSlotModal(true)}>
                                                <Plus size={18} />
                                                Create Recruitment Slot
                                            </button>
                                        </div>
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                            <tr>
                                                <th>Unit</th>
                                                <th>Role</th>
                                                <th>Track</th>
                                                <th>Slots</th>
                                                <th>Available</th>
                                                <th>Fill Rate</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredSlots.map(slot => renderRecruitmentSlotRow(slot))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
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

            {/* Recruitment Modals */}
            {showCreateSlotModal && (
                <CreateRecruitmentSlotModal
                    unit={selectedUnit}
                    roles={roles}
                    onClose={() => setShowCreateSlotModal(false)}
                    onCreate={handleCreateRecruitmentSlot}
                />
            )}

            {showEditSlotModal && selectedSlot && (
                <EditRecruitmentSlotModal
                    slot={selectedSlot}
                    onClose={() => {
                        setShowEditSlotModal(false);
                        setSelectedSlot(null);
                    }}
                    onUpdate={handleUpdateRecruitmentSlot}
                />
            )}

            {showRecruitmentStatusModal && selectedUnit && (
                <UnitRecruitmentStatusModal
                    unit={selectedUnit}
                    onClose={() => {
                        setShowRecruitmentStatusModal(false);
                        setSelectedUnit(null);
                    }}
                    onUpdate={handleUpdateRecruitmentStatus}
                />
            )}
        </div>
    );
};

export default UnitManagement;
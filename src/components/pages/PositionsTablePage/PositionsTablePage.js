import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronDown, Users, Shield, Search,
    Filter, Download, Maximize2, User, Building,
    AlertCircle, Hash, MapPin, Calendar, Star, Target,
    Package, Plus, MoreVertical, Eye, Trash2, Rocket
} from 'lucide-react';
import './PositionsTablePage.css';
import { ApplyPositionTemplateModal } from '../../modals/ApplyPositionTemplateModal';
import { CreatePositionModal } from '../../modals/CreatePositionModal';
import api from "../../../services/api";

const PositionsTablePage = () => {
    const { user: currentUser } = useSelector(state => state.auth);
    const navigate = useNavigate();

    // State
    const [units, setUnits] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterVacancy, setFilterVacancy] = useState('all');
    const [branches, setBranches] = useState([]);
    const [currentUserPositionId, setCurrentUserPositionId] = useState(null);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [isFetchingUserPosition, setIsFetchingUserPosition] = useState(false);

    // New state for modals
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [roles, setRoles] = useState([]);

    // State for dropdown menus
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Refs for scrolling
    const tableRef = useRef(null);
    const highlightedRowRef = useRef(null);
    const dropdownRefs = useRef({});

    useEffect(() => {
        fetchData();
        fetchRoles();
    }, []);

    useEffect(() => {
        // Re-fetch user position when currentUser becomes available
        if (currentUser && currentUser.id && !currentUserPositionId && !isFetchingUserPosition && positions.length > 0) {
            console.log('CurrentUser available and positions loaded, fetching user position...');
            fetchUserPosition();
        }
    }, [currentUser, positions.length]);

    useEffect(() => {
        // Auto-scroll to highlighted position after data loads
        if (highlightedRowRef.current && !isLoading) {
            setTimeout(() => {
                highlightedRowRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 500);
        }
    }, [isLoading, currentUserPositionId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] &&
                !dropdownRefs.current[openDropdownId].contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const fetchUserPosition = async () => {
        if (!currentUser || !currentUser.id || isFetchingUserPosition) return;

        setIsFetchingUserPosition(true);
        console.log('Fetching position for user:', currentUser.id);

        try {
            // Use the correct endpoint to get user's positions
            const userPositionsResponse = await api.get(`/users/${currentUser.id}/positions/`);
            console.log('User positions response:', userPositionsResponse.data);

            const userPositions = Array.isArray(userPositionsResponse.data)
                ? userPositionsResponse.data
                : userPositionsResponse.data.results || [];

            // Find primary active position
            const primaryPosition = userPositions.find(up =>
                up.status === 'active' && up.assignment_type === 'primary'
            );

            console.log('Primary position found:', primaryPosition);

            if (primaryPosition) {
                // Handle different response structures
                const positionId = primaryPosition.position?.id || primaryPosition.position_id || primaryPosition.position;
                if (positionId) {
                    setCurrentUserPositionId(positionId);

                    // Auto-expand units to show user's position
                    const position = positions.find(p => p.id === positionId);
                    if (position) {
                        expandUnitHierarchy(position.unit, units);
                    }
                }
            } else {
                console.log('No primary active position found for user');
            }
        } catch (error) {
            console.error('Error fetching user position:', error);

            // If the endpoint fails, try alternative approach by filtering all positions
            // This is a fallback in case the user endpoint is not available
            try {
                console.log('Trying fallback: searching through all positions for current holder');

                // Find positions where current_holder matches the user
                const userPosition = positions.find(p =>
                    p.current_holder &&
                    (p.current_holder.id === currentUser.id ||
                        p.current_holder.username === currentUser.username)
                );

                if (userPosition) {
                    console.log('Found user position via fallback method:', userPosition);
                    setCurrentUserPositionId(userPosition.id);
                    expandUnitHierarchy(userPosition.unit, units);
                }
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
            }
        } finally {
            setIsFetchingUserPosition(false);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch all units
            const unitsResponse = await api.get('/units/');
            const unitsData = unitsResponse.data.results || unitsResponse.data;

            // Fetch all positions with expanded role data
            const positionsResponse = await api.get('/units/positions/', {
                params: { expand: 'role,role.typical_rank' }
            });
            const positionsData = positionsResponse.data.results || positionsResponse.data;

            // Process positions to include rank tier information
            const processedPositions = positionsData.map(position => ({
                ...position,
                // Handle both nested and flat data structures
                role_typical_rank_tier: position.role?.typical_rank?.tier ||
                    position.role_typical_rank_tier ||
                    null,
                role_is_command: position.role?.is_command_role ||
                    position.role_is_command ||
                    false,
                role_is_staff: position.role?.is_staff_role ||
                    position.role_is_staff ||
                    false
            }));

            // Fetch branches for filter
            const branchesResponse = await api.get('/units/branches/');
            const branchesData = branchesResponse.data.results || branchesResponse.data;

            setUnits(unitsData);
            setPositions(processedPositions);
            setBranches(branchesData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load fleet positions data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/units/roles/');
            setRoles(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const expandUnitHierarchy = (unitId, allUnits) => {
        const newExpanded = new Set(expandedUnits);
        let currentUnitId = unitId;

        // Expand all parent units up to root
        while (currentUnitId) {
            newExpanded.add(currentUnitId);
            const unit = allUnits.find(u => u.id === currentUnitId);
            currentUnitId = unit?.parent_unit;
        }

        setExpandedUnits(newExpanded);
    };

    const toggleUnit = (unitId) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unitId)) {
            newExpanded.delete(unitId);
            // Also collapse all child units
            collapseChildUnits(unitId, newExpanded);
        } else {
            newExpanded.add(unitId);
        }
        setExpandedUnits(newExpanded);
    };

    const collapseChildUnits = (parentId, expandedSet) => {
        const childUnits = units.filter(u => u.parent_unit === parentId);
        childUnits.forEach(child => {
            expandedSet.delete(child.id);
            collapseChildUnits(child.id, expandedSet);
        });
    };

    const expandAll = () => {
        setExpandedUnits(new Set(units.map(u => u.id)));
    };

    const collapseAll = () => {
        setExpandedUnits(new Set());
    };

    const findMyPosition = async () => {
        if (!currentUser) {
            alert('You must be logged in to find your position.');
            return;
        }

        // If we don't have the position ID yet, try to fetch it
        if (!currentUserPositionId) {
            setIsHighlighting(true);
            await fetchUserPosition();

            // Check again after fetching
            if (!currentUserPositionId) {
                setIsHighlighting(false);
                alert('You do not currently have an assigned position.\n\nIf you believe this is an error, please contact your fleet administrator.');
                return;
            }
        }

        setIsHighlighting(true);

        // Find the position and expand its unit hierarchy
        const position = positions.find(p => p.id === currentUserPositionId);
        if (position) {
            expandUnitHierarchy(position.unit, units);
        }

        // Scroll to the position after a short delay
        setTimeout(() => {
            if (highlightedRowRef.current) {
                highlightedRowRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                // Add a temporary highlight animation
                highlightedRowRef.current.classList.add('highlight-flash');
                setTimeout(() => {
                    highlightedRowRef.current?.classList.remove('highlight-flash');
                    setIsHighlighting(false);
                }, 2000);
            } else {
                setIsHighlighting(false);
                console.error('Could not find position element to scroll to');
            }
        }, 300);
    };

    // Sort positions by rank tier (higher ranks first)
    const sortPositionsByRank = (positionsList) => {
        return [...positionsList].sort((a, b) => {
            // Get rank tiers (default to 999 if no rank)
            const aTier = a.role_typical_rank_tier ?? 999;
            const bTier = b.role_typical_rank_tier ?? 999;

            // Sort by tier descending (higher tier = higher rank)
            if (aTier !== bTier) {
                return bTier - aTier;
            }

            // If same tier, sort by role category
            const categoryOrder = {
                'command': 0,
                'staff': 1,
                'nco': 2,
                'specialist': 3,
                'trooper': 4,
                'support': 5
            };

            const aCat = categoryOrder[a.role_category] ?? 99;
            const bCat = categoryOrder[b.role_category] ?? 99;

            if (aCat !== bCat) {
                return aCat - bCat;
            }

            // Finally, sort by display title
            return (a.display_title || '').localeCompare(b.display_title || '');
        });
    };

    // Helper function to count all positions in a unit and its children
    const countAllPositions = (unit) => {
        let count = filterPositions(unit.positions || []).length;
        if (unit.children) {
            unit.children.forEach(child => {
                count += countAllPositions(child);
            });
        }
        return count;
    };

    // Build hierarchical unit structure
    const buildUnitTree = () => {
        const unitMap = {};
        const rootUnits = [];

        // Create map of units
        units.forEach(unit => {
            unitMap[unit.id] = {
                ...unit,
                children: [],
                positions: positions.filter(p => p.unit === unit.id)
            };
        });

        // Build tree structure
        units.forEach(unit => {
            if (unit.parent_unit && unitMap[unit.parent_unit]) {
                unitMap[unit.parent_unit].children.push(unitMap[unit.id]);
            } else {
                rootUnits.push(unitMap[unit.id]);
            }
        });

        // Sort children units alphabetically
        const sortChildren = (unit) => {
            unit.children.sort((a, b) => a.name.localeCompare(b.name));
            unit.children.forEach(child => sortChildren(child));
        };

        rootUnits.forEach(unit => sortChildren(unit));

        return rootUnits;
    };

    // Filter positions based on search and filters
    const filterPositions = (positionsList) => {
        return positionsList.filter(position => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    position.display_title?.toLowerCase().includes(searchLower) ||
                    position.role_name?.toLowerCase().includes(searchLower) ||
                    position.current_holder?.username?.toLowerCase().includes(searchLower) ||
                    position.current_holder?.rank?.toLowerCase().includes(searchLower);

                if (!matchesSearch) return false;
            }

            // Vacancy filter
            if (filterVacancy === 'vacant' && !position.is_vacant) return false;
            if (filterVacancy === 'filled' && position.is_vacant) return false;

            return true;
        });
    };

    // Filter units based on branch
    const filterUnits = (unitsList) => {
        if (filterBranch === 'all') return unitsList;

        return unitsList.filter(unit => {
            // Check if unit or any child has matching branch
            const hasMatchingBranch = (u) => {
                if (u.branch === filterBranch) return true;
                return u.children.some(child => hasMatchingBranch(child));
            };

            return hasMatchingBranch(unit);
        });
    };

    // Handle template application
    const handleTemplateApply = (createdPositions) => {
        console.log('Positions created from template:', createdPositions);

        // Refresh the positions data
        fetchData();

        // Show success message
        showSuccessMessage(`Successfully created ${createdPositions.length} positions from template`);
    };

    // Add notification state (optional, for better UX)
    const [notification, setNotification] = useState(null);

    // Message functions
    const showSuccessMessage = (message) => {
        console.log('Success:', message);
        // For now, use alert. Later, implement a proper notification system
        alert(message);
        // Or if using notification state:
        // setNotification({ type: 'success', message });
        // setTimeout(() => setNotification(null), 5000);
    };

    const showErrorMessage = (message) => {
        console.error('Error:', message);
        alert(`Error: ${message}`);
        // Or if using notification state:
        // setNotification({ type: 'error', message });
    };

    // Fixed handleCreatePosition
    const handlePositionCreate = async (positionData) => {
        try {
            console.log('Creating position with data:', positionData);

            const response = await api.post('/units/positions/', positionData);
            console.log('Position created:', response.data);

            showSuccessMessage('Position created successfully');

            // Refresh the positions list
            await fetchData();

            // Close the modal with correct state setter
            setShowCreatePositionModal(false);
            setSelectedUnit(null);
        } catch (error) {
            console.error('Error creating position:', error);
            console.error('Error response:', error.response?.data);
            showErrorMessage(error.response?.data?.detail || 'Failed to create position');
        }
    };

    // Delete position handler
    const handleDeletePosition = async (positionId, positionTitle) => {
        if (!currentUser?.is_admin) {
            showErrorMessage('You do not have permission to delete positions');
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete the position "${positionTitle}"?\n\nThis action cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/units/positions/${positionId}/`);
            showSuccessMessage('Position deleted successfully');

            // Close dropdown
            setOpenDropdownId(null);

            // Refresh data
            await fetchData();
        } catch (error) {
            console.error('Error deleting position:', error);
            showErrorMessage(error.response?.data?.detail || 'Failed to delete position');
        }
    };

    const openTemplateModal = (unit) => {
        setSelectedUnit(unit);
        setShowTemplateModal(true);
    };

    const openCreatePositionModal = (unit) => {
        setSelectedUnit(unit);
        setShowCreatePositionModal(true);
    };

    const toggleDropdown = (positionId) => {
        setOpenDropdownId(openDropdownId === positionId ? null : positionId);
    };

    const renderUnit = (unit, level = 0) => {
        const isExpanded = expandedUnits.has(unit.id);
        const hasChildren = unit.children.length > 0;
        const filteredPositions = filterPositions(unit.positions);
        const sortedPositions = sortPositionsByRank(filteredPositions);

        // Check if unit has children OR positions to show
        const hasExpandableContent = hasChildren || sortedPositions.length > 0;

        const hasVisibleContent = sortedPositions.length > 0 ||
            unit.children.some(child => hasVisiblePositions(child));

        // Don't render if no visible content after filtering
        if (!hasVisibleContent && searchTerm) return null;

        return (
            <React.Fragment key={unit.id}>
                {/* Unit Header Row */}
                <tr className={`unit-header-row level-${level}`}>
                    <td colSpan="7">
                        <div
                            className="unit-header"
                            onClick={() => hasExpandableContent && toggleUnit(unit.id)}
                            onKeyDown={(e) => e.key === 'Enter' && hasExpandableContent && toggleUnit(unit.id)}
                            style={{ paddingLeft: `${level * 24}px` }}
                            tabIndex={hasExpandableContent ? 0 : -1}
                            role={hasExpandableContent ? "button" : undefined}
                            aria-expanded={hasExpandableContent ? isExpanded : undefined}
                            aria-label={`${unit.name} unit with ${sortedPositions.length} positions`}
                        >
                            {hasExpandableContent && (
                                <span className="expand-icon">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                            )}
                            <Building size={16} className="unit-icon" />
                            <span className="unit-name">{unit.name}</span>
                            <span className="unit-abbreviation">({unit.abbreviation})</span>
                            {unit.unit_type && (
                                <span className="unit-type">{unit.unit_type}</span>
                            )}
                            <span className="position-count">
                            {sortedPositions.length} direct positions
                                {hasChildren && !isExpanded && (
                                    <span className="total-count">
                                    ({countAllPositions(unit)} total)
                                </span>
                                )}
                        </span>
                            {/* Unit action buttons */}
                            {currentUser?.is_admin && (
                                <span className="unit-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="unit-action-btn"
                                    onClick={() => openTemplateModal(unit)}
                                    title="Apply position template"
                                >
                                    <Package size={14} />
                                </button>
                                <button
                                    className="unit-action-btn"
                                    onClick={() => openCreatePositionModal(unit)}
                                    title="Add position"
                                >
                                    <Plus size={14} />
                                </button>
                            </span>
                            )}
                        </div>
                    </td>
                </tr>

                {/* Unit's Positions - Show if expanded and has positions */}
                {isExpanded && sortedPositions.map(position => (
                    <tr
                        key={position.id}
                        className={`position-row ${position.id === currentUserPositionId ? 'highlighted' : ''} ${isHighlighting && position.id === currentUserPositionId ? 'highlighting' : ''}`}
                        ref={position.id === currentUserPositionId ? highlightedRowRef : null}
                    >
                        <td style={{ paddingLeft: `${(level + 1) * 24 + 20}px` }}>
                            <div className="position-title">
                                {position.id === currentUserPositionId && (
                                    <Star size={16} className="current-position-icon" />
                                )}
                                {position.role_is_command && (
                                    <Shield size={14} className="command-icon" title="Command Position" />
                                )}
                                {position.display_title}
                            </div>
                        </td>
                        <td>
                        <span className={`role-category ${position.role_category}`}>
                            {position.role_name}
                            {position.role_typical_rank_tier && (
                                <span className="rank-tier" title={`Rank Tier: ${position.role_typical_rank_tier}`}>
                                    T{position.role_typical_rank_tier}
                                </span>
                            )}
                        </span>
                        </td>
                        <td>
                            {position.is_vacant ? (
                                <span className="vacant-badge">VACANT</span>
                            ) : position.current_holder ? (
                                <div className="holder-info">
                                    {position.current_holder.avatar_url && (
                                        <img
                                            src={position.current_holder.avatar_url}
                                            alt={position.current_holder.username}
                                            className="holder-avatar"
                                        />
                                    )}
                                    <span className="holder-rank">
                                    {position.current_holder.rank}
                                </span>
                                    <span className="holder-name">
                                    {position.current_holder.username}
                                </span>
                                </div>
                            ) : (
                                <span className="unknown">Unknown</span>
                            )}
                        </td>
                        <td>
                            {position.current_holder?.service_number || '-'}
                        </td>
                        <td>
                            {unit.abbreviation}
                        </td>
                        <td>
                            {unit.branch_name || '-'}
                        </td>
                        <td>
                            <div className="position-actions-dropdown" ref={el => dropdownRefs.current[position.id] = el}>
                                <button
                                    className="action-dropdown-btn"
                                    onClick={() => toggleDropdown(position.id)}
                                    aria-label="Position actions"
                                >
                                    <MoreVertical size={16} />
                                </button>
                                {openDropdownId === position.id && (
                                    <div className="dropdown-menu">
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                navigate(`/positions/${position.id}`);
                                                setOpenDropdownId(null);
                                            }}
                                        >
                                            <Eye size={14} />
                                            View Position
                                        </button>
                                        {currentUser?.is_admin && (
                                            <button
                                                className="dropdown-item danger"
                                                onClick={() => handleDeletePosition(position.id, position.display_title)}
                                            >
                                                <Trash2 size={14} />
                                                Delete Position
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}

                {/* Child Units - Show if expanded and has children */}
                {isExpanded && hasChildren && unit.children
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(child => renderUnit(child, level + 1))}
            </React.Fragment>
        );
    };

    const hasVisiblePositions = (unit) => {
        const filteredPositions = filterPositions(unit.positions);
        if (filteredPositions.length > 0) return true;
        return unit.children.some(child => hasVisiblePositions(child));
    };

    const exportToCSV = () => {
        // Build CSV data
        let csv = 'Position,Role,Current Holder,Service Number,Unit,Branch,Rank Tier\n';

        const addPositionsToCSV = (unit) => {
            const sortedPositions = sortPositionsByRank(unit.positions);
            sortedPositions.forEach(position => {
                const holder = position.is_vacant ? 'VACANT' :
                    position.current_holder ?
                        `${position.current_holder.rank} ${position.current_holder.username}` :
                        'Unknown';

                const rankTier = position.role_typical_rank_tier || '-';

                csv += `"${position.display_title}","${position.role_name}","${holder}","${position.current_holder?.service_number || '-'}","${unit.abbreviation}","${unit.branch_name || '-'}","${rankTier}"\n`;
            });

            unit.children.forEach(child => addPositionsToCSV(child));
        };

        const tree = buildUnitTree();
        tree.forEach(unit => addPositionsToCSV(unit));

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleet_positions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="positions-table-loading">
                <div className="loading-spinner"></div>
                <p>ACCESSING FLEET DATABASE...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="positions-table-error">
                <AlertCircle size={48} />
                <h2>ERROR LOADING POSITIONS</h2>
                <p>{error}</p>
                <button onClick={fetchData}>TRY AGAIN</button>
            </div>
        );
    }

    // Main render
    const unitTree = buildUnitTree();
    const filteredTree = filterUnits(unitTree);

    return (
        <div className="positions-table-container">
            {/* Header */}
            <div className="positions-table-header">
                <div className="header-content">
                    <h1>
                        <Rocket size={32} />
                        FLEET POSITIONS TABLE
                    </h1>
                    <p>Complete organizational structure and crew assignments</p>
                    <p className="sort-info">Positions sorted by rank tier (highest first)</p>
                </div>

                {/* Controls */}
                <div className="table-controls">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search positions, roles, or personnel..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-controls">
                        <div className="filter-group">
                            <Filter size={20} />
                            <select
                                value={filterBranch}
                                onChange={(e) => setFilterBranch(e.target.value)}
                            >
                                <option value="all">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <Users size={20} />
                            <select
                                value={filterVacancy}
                                onChange={(e) => setFilterVacancy(e.target.value)}
                            >
                                <option value="all">All Positions</option>
                                <option value="filled">Filled Only</option>
                                <option value="vacant">Vacant Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="action-buttons">
                        {currentUser && (
                            <button
                                onClick={findMyPosition}
                                className={`btn-primary ${isHighlighting || isFetchingUserPosition ? 'highlighting' : ''} ${!currentUserPositionId ? 'no-position' : ''}`}
                                disabled={isHighlighting || isFetchingUserPosition}
                                title={!currentUserPositionId ? 'Click to find your position' : 'Find and highlight your position'}
                            >
                                <Target size={16} />
                                {isFetchingUserPosition ? 'LOADING...' : 'FIND MY POSITION'}
                            </button>
                        )}
                        <button onClick={expandAll} className="btn-secondary">
                            <Maximize2 size={16} />
                            EXPAND ALL
                        </button>
                        <button onClick={collapseAll} className="btn-secondary">
                            <ChevronDown size={16} />
                            COLLAPSE ALL
                        </button>
                        <button onClick={exportToCSV} className="btn-primary">
                            <Download size={16} />
                            EXPORT CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="positions-table-wrapper" ref={tableRef}>
                <table className="positions-table" aria-label="Fleet positions table sorted by rank tier">
                    <thead>
                    <tr>
                        <th>Position</th>
                        <th>Role</th>
                        <th>Current Holder</th>
                        <th>Service #</th>
                        <th>Unit</th>
                        <th>Branch</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTree.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="no-data">
                                No positions found matching your filters
                            </td>
                        </tr>
                    ) : (
                        filteredTree
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(unit => renderUnit(unit))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Summary Stats */}
            <div className="table-summary">
                <div className="summary-stat">
                    <Building size={16} />
                    <span>{units.length} Units</span>
                </div>
                <div className="summary-stat">
                    <Shield size={16} />
                    <span>{positions.length} Total Positions</span>
                </div>
                <div className="summary-stat">
                    <Users size={16} />
                    <span>{positions.filter(p => !p.is_vacant).length} Filled</span>
                </div>
                <div className="summary-stat">
                    <AlertCircle size={16} />
                    <span>{positions.filter(p => p.is_vacant).length} Vacant</span>
                </div>
            </div>

            {/* Modals */}
            {showTemplateModal && selectedUnit && (
                <ApplyPositionTemplateModal
                    unit={selectedUnit}
                    onClose={() => {
                        setShowTemplateModal(false);
                        setSelectedUnit(null);
                    }}
                    onApply={handleTemplateApply}
                />
            )}

            {showCreatePositionModal && selectedUnit && (
                <CreatePositionModal
                    units={[selectedUnit]}
                    roles={roles}
                    onClose={() => {
                        setShowCreatePositionModal(false);
                        setSelectedUnit(null);
                    }}
                    onCreate={handlePositionCreate}
                />
            )}
        </div>
    );
};

export default PositionsTablePage;
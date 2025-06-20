import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    ChevronRight, ChevronDown, Users, Shield, Search,
    Filter, Download, Maximize2, User, Building,
    AlertCircle, Hash, MapPin, Calendar, Star
} from 'lucide-react';
import './PositionsTablePage.css';
import api from "../../../services/api";

const PositionsTablePage = () => {
    const { user: currentUser } = useSelector(state => state.auth);

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

    // Refs for scrolling
    const tableRef = useRef(null);
    const highlightedRowRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

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

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch all units
            const unitsResponse = await api.get('/units/');
            const unitsData = unitsResponse.data.results || unitsResponse.data;

            // Fetch all positions
            const positionsResponse = await api.get('/units/positions/');
            const positionsData = positionsResponse.data.results || positionsResponse.data;

            // Fetch branches for filter
            const branchesResponse = await api.get('/units/branches/');
            const branchesData = branchesResponse.data.results || branchesResponse.data;

            // Find current user's position
            if (currentUser) {
                const userPositionsResponse = await api.get(`/users/${currentUser.id}/positions/`);
                const userPositions = userPositionsResponse.data;

                // Find primary active position
                const primaryPosition = userPositions.find(up =>
                    up.status === 'active' && up.assignment_type === 'primary'
                );

                if (primaryPosition) {
                    setCurrentUserPositionId(primaryPosition.position.id);

                    // Auto-expand units to show user's position
                    const position = positionsData.find(p => p.id === primaryPosition.position.id);
                    if (position) {
                        expandUnitHierarchy(position.unit, unitsData);
                    }
                }
            }

            setUnits(unitsData);
            setPositions(positionsData);
            setBranches(branchesData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load positions data');
        } finally {
            setIsLoading(false);
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

    const renderUnit = (unit, level = 0) => {
        const isExpanded = expandedUnits.has(unit.id);
        const hasChildren = unit.children.length > 0;
        const filteredPositions = filterPositions(unit.positions);
        const hasVisibleContent = filteredPositions.length > 0 ||
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
                            onClick={() => hasChildren && toggleUnit(unit.id)}
                            style={{ paddingLeft: `${level * 24}px` }}
                        >
                            {hasChildren && (
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
                                {filteredPositions.length} positions
                            </span>
                        </div>
                    </td>
                </tr>

                {/* Unit's Positions */}
                {isExpanded && filteredPositions.map(position => (
                    <tr
                        key={position.id}
                        className={`position-row ${position.id === currentUserPositionId ? 'highlighted' : ''}`}
                        ref={position.id === currentUserPositionId ? highlightedRowRef : null}
                    >
                        <td style={{ paddingLeft: `${(level + 1) * 24}px` }}>
                            <div className="position-title">
                                {position.id === currentUserPositionId && (
                                    <Star size={16} className="current-position-icon" />
                                )}
                                {position.display_title}
                            </div>
                        </td>
                        <td>
                            <span className={`role-category ${position.role_category}`}>
                                {position.role_name}
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
                            <div className="position-actions">
                                <button
                                    className="action-btn view"
                                    onClick={() => window.location.href = `/positions/${position.id}`}
                                >
                                    View
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}

                {/* Child Units */}
                {isExpanded && unit.children
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
        let csv = 'Position,Role,Current Holder,Service Number,Unit,Branch\n';

        const addPositionsToCSV = (unit) => {
            unit.positions.forEach(position => {
                const holder = position.is_vacant ? 'VACANT' :
                    position.current_holder ?
                        `${position.current_holder.rank} ${position.current_holder.username}` :
                        'Unknown';

                csv += `"${position.display_title}","${position.role_name}","${holder}","${position.current_holder?.service_number || '-'}","${unit.abbreviation}","${unit.branch_name || '-'}"\n`;
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
        a.download = `positions_table_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (isLoading) {
        return (
            <div className="positions-table-loading">
                <div className="loading-spinner"></div>
                <p>Loading positions data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="positions-table-error">
                <AlertCircle size={48} />
                <h2>Error Loading Positions</h2>
                <p>{error}</p>
                <button onClick={fetchData}>Try Again</button>
            </div>
        );
    }

    const unitTree = buildUnitTree();
    const filteredTree = filterUnits(unitTree);

    return (
        <div className="positions-table-container">
            {/* Header */}
            <div className="positions-table-header">
                <div className="header-content">
                    <h1>
                        <Shield size={32} />
                        Unit Positions Table
                    </h1>
                    <p>Complete organizational structure and position assignments</p>
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
                        <button onClick={expandAll} className="btn-secondary">
                            <Maximize2 size={16} />
                            Expand All
                        </button>
                        <button onClick={collapseAll} className="btn-secondary">
                            <ChevronDown size={16} />
                            Collapse All
                        </button>
                        <button onClick={exportToCSV} className="btn-primary">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="positions-table-wrapper" ref={tableRef}>
                <table className="positions-table">
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
        </div>
    );
};

export default PositionsTablePage;
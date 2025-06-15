// src/components/pages/ORBAT/ORBATPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Shield, Users, Search, Filter, Download, Maximize,
    Grid, List, Eye, AlertCircle, TrendingUp, Clock, UserCheck,
    Award, Settings, Info, Activity, Target, Command
} from 'lucide-react';
import api from '../../../services/api';
import EnhancedORBATViewer from './EnhancedORBATViewer';
import ORBATFilterPanel from './ORBATFilterPanel';
import PositionDetailModal from './PositionDetailModal';
import AssignmentModal from './AssignmentModal';
import ORBATStatisticsPanel from './ORBATStatisticsPanel';
import './ORBATPage.css';

const ORBATPage = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();

    // State Management
    const [units, setUnits] = useState([]);
    const [selectedUnitId, setSelectedUnitId] = useState(unitId || '');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orbatData, setOrbatData] = useState(null);

    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [showStatistics, setShowStatistics] = useState(true);
    const [viewMode, setViewMode] = useState('tree'); // tree, list, grid
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        branches: [],
        ranks: [],
        positionTypes: [],
        showVacant: true,
        showFilled: true,
        unitTypes: []
    });

    // Fetch initial data
    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (unitId) {
            setSelectedUnitId(unitId);
            fetchUnitDetails(unitId);
        }
    }, [unitId]);

    const fetchUnits = async () => {
        try {
            const response = await api.get('/units/orbat/units_list/');
            setUnits(response.data);

            if (!unitId && response.data.length > 0) {
                const firstUnit = response.data[0];
                setSelectedUnitId(firstUnit.id);
                fetchUnitDetails(firstUnit.id);
            }
        } catch (err) {
            console.error('Error fetching units:', err);
            setError('Failed to load units');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnitDetails = async (unitId) => {
        try {
            const response = await api.get(`/units/${unitId}/`);
            setSelectedUnit(response.data);
        } catch (err) {
            console.error('Error fetching unit details:', err);
        }
    };

    const handleUnitChange = (event) => {
        const newUnitId = event.target.value;
        setSelectedUnitId(newUnitId);
        navigate(`/units/${newUnitId}/orbat`);
        fetchUnitDetails(newUnitId);
    };

    const handlePositionSelect = (position) => {
        setSelectedPosition(position);
        setShowPositionModal(true);
    };

    const handleAssignPosition = (position) => {
        setSelectedPosition(position);
        setShowAssignmentModal(true);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting ORBAT...');
    };

    const handleFullscreen = () => {
        const elem = document.querySelector('.orbat-viewer-container');
        if (elem) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
        }
    };

    // Filter positions based on search and filters
    const filteredOrbatData = useMemo(() => {
        if (!orbatData) return null;

        let filteredNodes = [...orbatData.nodes];

        // Apply search filter
        if (searchQuery) {
            filteredNodes = filteredNodes.filter(node =>
                node.display_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (node.current_holder?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply vacancy filter
        if (!filters.showVacant) {
            filteredNodes = filteredNodes.filter(node => !node.is_vacant);
        }
        if (!filters.showFilled) {
            filteredNodes = filteredNodes.filter(node => node.is_vacant);
        }

        // Apply position type filter
        if (filters.positionTypes.length > 0) {
            filteredNodes = filteredNodes.filter(node =>
                filters.positionTypes.includes(node.position_type)
            );
        }

        return {
            ...orbatData,
            nodes: filteredNodes
        };
    }, [orbatData, searchQuery, filters]);

    return (
        <div className="orbat-page">
            {/* Header */}
            <div className="orbat-header">
                <div className="header-left">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        Back
                    </button>

                    <div className="page-title">
                        <Shield size={24} />
                        <h1>Order of Battle</h1>
                    </div>
                </div>

                <div className="header-center">
                    <div className="unit-selector-container">
                        <label className="unit-selector-label">
                            <Command size={16} />
                            Select Unit:
                        </label>
                        <select
                            value={selectedUnitId}
                            onChange={handleUnitChange}
                            disabled={loading}
                            className="unit-selector"
                        >
                            <option value="">-- Select a Unit --</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name} ({unit.abbreviation})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedUnit && (
                        <div className="unit-quick-info">
                            <span className="unit-type">{selectedUnit.unit_type}</span>
                            <span className="separator">•</span>
                            <span className="branch-name">{selectedUnit.branch?.name}</span>
                        </div>
                    )}
                </div>

                <div className="header-right">
                    <div className="search-container">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search positions or personnel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="view-controls">
                        <button
                            className={`view-button ${viewMode === 'tree' ? 'active' : ''}`}
                            onClick={() => setViewMode('tree')}
                            title="Tree View"
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <List size={16} />
                        </button>
                    </div>

                    <button
                        className={`control-button ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filters
                    </button>

                    <button
                        className={`control-button ${showStatistics ? 'active' : ''}`}
                        onClick={() => setShowStatistics(!showStatistics)}
                    >
                        <TrendingUp size={16} />
                        Stats
                    </button>

                    <button
                        className="control-button"
                        onClick={handleExport}
                        title="Export ORBAT"
                    >
                        <Download size={16} />
                    </button>

                    <button
                        className="control-button"
                        onClick={handleFullscreen}
                        title="Fullscreen"
                    >
                        <Maximize size={16} />
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="orbat-content">
                {/* Filter Panel */}
                {showFilters && (
                    <ORBATFilterPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                        orbatData={orbatData}
                    />
                )}

                {/* ORBAT Viewer */}
                <div className="orbat-viewer-container">
                    {selectedUnitId ? (
                        <EnhancedORBATViewer
                            unitId={selectedUnitId}
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                            filters={filters}
                            onPositionSelect={handlePositionSelect}
                            onDataLoad={setOrbatData}
                            filteredData={filteredOrbatData}
                        />
                    ) : (
                        <div className="no-unit-selected">
                            <Shield size={48} />
                            <h3>No Unit Selected</h3>
                            <p>Please select a unit from the dropdown to view its organizational structure</p>
                        </div>
                    )}
                </div>

                {/* Statistics Panel */}
                {showStatistics && orbatData && (
                    <ORBATStatisticsPanel
                        orbatData={filteredOrbatData || orbatData}
                        unit={selectedUnit}
                    />
                )}
            </div>

            {/* Modals */}
            {showPositionModal && selectedPosition && (
                <PositionDetailModal
                    position={selectedPosition}
                    onClose={() => setShowPositionModal(false)}
                    onAssign={() => {
                        setShowPositionModal(false);
                        handleAssignPosition(selectedPosition);
                    }}
                />
            )}

            {showAssignmentModal && selectedPosition && (
                <AssignmentModal
                    position={selectedPosition}
                    onClose={() => setShowAssignmentModal(false)}
                    onSuccess={() => {
                        setShowAssignmentModal(false);
                        // Refresh ORBAT data
                        if (selectedUnitId) {
                            window.location.reload(); // Simple refresh for now
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ORBATPage;
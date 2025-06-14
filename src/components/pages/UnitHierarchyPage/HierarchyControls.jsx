// src/components/UnitHierarchy/Controls/HierarchyControls.jsx
import React, { useState } from 'react';
import {
    Filter,
    Download,
    Maximize2,
    Minimize2,
    Settings,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    Users
} from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { hierarchyService } from './hierarchyService';
import { toast } from 'react-toastify';

const HierarchyControls = ({
                               filterConfig,
                               onFilterChange,
                               onFullscreen,
                               isFullscreen,
                               viewId,
                               isAdmin
                           }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const reactFlowInstance = useReactFlow();

    const handleExport = () => {
        // Get the current viewport
        const viewport = reactFlowInstance.getViewport();
        const nodes = reactFlowInstance.getNodes();

        // Create SVG export
        toast.info('Export feature coming soon');

        // In a full implementation, you would:
        // 1. Convert the React Flow canvas to SVG
        // 2. Download as image or PDF
    };

    const handleSavePositions = async () => {
        if (!isAdmin) return;

        setIsSaving(true);
        const nodes = reactFlowInstance.getNodes();

        const positions = nodes.reduce((acc, node) => {
            acc[node.id] = {
                x: node.position.x,
                y: node.position.y
            };
            return acc;
        }, {});

        try {
            await hierarchyService.savePositions(viewId, positions);
            toast.success('Node positions saved successfully');
        } catch (error) {
            toast.error('Failed to save positions');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFitView = () => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    };

    const handleResetView = () => {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 });
    };

    const toggleFilter = (filterKey) => {
        onFilterChange({
            ...filterConfig,
            [filterKey]: !filterConfig[filterKey]
        });
    };

    return (
        <div className="hierarchy-controls">
            {/* Main Control Buttons */}
            <div className="control-group">
                <button
                    className="control-button"
                    onClick={() => setShowFilters(!showFilters)}
                    title="Toggle Filters"
                >
                    <Filter size={16} />
                    {showFilters && <span className="button-label">Filters</span>}
                </button>

                <button
                    className="control-button"
                    onClick={handleFitView}
                    title="Fit to View"
                >
                    <Minimize2 size={16} />
                </button>

                <button
                    className="control-button"
                    onClick={handleResetView}
                    title="Reset View"
                >
                    <RefreshCw size={16} />
                </button>

                <button
                    className="control-button"
                    onClick={handleExport}
                    title="Export View"
                >
                    <Download size={16} />
                </button>

                <button
                    className="control-button"
                    onClick={onFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {isAdmin && (
                    <button
                        className={`control-button ${isSaving ? 'saving' : ''}`}
                        onClick={handleSavePositions}
                        disabled={isSaving}
                        title="Save Node Positions"
                    >
                        {isSaving ? (
                            <>
                                <div className="spinner-tiny"></div>
                                <span className="button-label">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span className="button-label">Save Layout</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-header">
                        <h3>Display Options</h3>
                        <button
                            className="close-filters"
                            onClick={() => setShowFilters(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="filter-content">
                        <div className="filter-section">
                            <h4>Visibility</h4>

                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filterConfig.showVacant}
                                    onChange={() => toggleFilter('showVacant')}
                                />
                                <Eye size={14} />
                                <span>Show Vacant Positions</span>
                            </label>

                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filterConfig.showPersonnelCount}
                                    onChange={() => toggleFilter('showPersonnelCount')}
                                />
                                <Users size={14} />
                                <span>Show Personnel Count</span>
                            </label>
                        </div>

                        <div className="filter-section">
                            <h4>Unit Types</h4>
                            <div className="unit-type-filters">
                                {['Division', 'Brigade', 'Battalion', 'Company', 'Platoon', 'Squad'].map(type => (
                                    <label key={type} className="filter-chip">
                                        <input
                                            type="checkbox"
                                            checked={filterConfig.unitTypes?.includes(type) || false}
                                            onChange={(e) => {
                                                const types = filterConfig.unitTypes || [];
                                                onFilterChange({
                                                    ...filterConfig,
                                                    unitTypes: e.target.checked
                                                        ? [...types, type]
                                                        : types.filter(t => t !== type)
                                                });
                                            }}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-actions">
                            <button
                                className="btn-text"
                                onClick={() => onFilterChange({
                                    showVacant: true,
                                    showPersonnelCount: true,
                                    unitTypes: [],
                                    branches: []
                                })}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HierarchyControls;
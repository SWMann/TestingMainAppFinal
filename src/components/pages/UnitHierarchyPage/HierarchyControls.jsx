// src/components/UnitHierarchy/Controls/HierarchyControls.jsx
import React, { useState } from 'react';
import {
    Filter,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    Users
} from 'lucide-react';

const HierarchyControls = ({
                               filterConfig,
                               onFilterChange,
                               onFullscreen,
                               isFullscreen
                           }) => {
    const [showFilters, setShowFilters] = useState(false);

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
                    onClick={onFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
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
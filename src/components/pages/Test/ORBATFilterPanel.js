// src/components/pages/ORBAT/ORBATFilterPanel.js
import React, { useState, useEffect } from 'react';
import {
    X, Filter, Eye, EyeOff, RotateCcw, ChevronDown, ChevronRight,
    Shield, Star, Users, Briefcase, Crown
} from 'lucide-react';

const ORBATFilterPanel = ({ filters, onFiltersChange, orbatData }) => {
    const [expandedSections, setExpandedSections] = useState({
        status: true,
        positionTypes: true,
        branches: false,
        ranks: false,
        units: false
    });

    // Extract unique values from ORBAT data
    const [availableFilters, setAvailableFilters] = useState({
        positionTypes: ['command', 'staff', 'nco', 'specialist', 'standard'],
        branches: [],
        ranks: [],
        unitTypes: []
    });

    useEffect(() => {
        if (orbatData && orbatData.nodes) {
            // Extract unique branches
            const branches = [...new Set(orbatData.nodes
                .map(n => n.unit_info?.branch_name)
                .filter(Boolean))];

            // Extract unique ranks
            const ranks = [...new Set(orbatData.nodes
                .map(n => n.current_holder?.rank?.abbreviation)
                .filter(Boolean))];

            // Extract unique unit types
            const unitTypes = [...new Set(orbatData.nodes
                .map(n => n.unit_info?.unit_type)
                .filter(Boolean))];

            setAvailableFilters(prev => ({
                ...prev,
                branches,
                ranks,
                unitTypes
            }));
        }
    }, [orbatData]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFilterChange = (filterType, value) => {
        const currentValues = filters[filterType] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        onFiltersChange({
            ...filters,
            [filterType]: newValues
        });
    };

    const clearAllFilters = () => {
        onFiltersChange({
            branches: [],
            ranks: [],
            positionTypes: [],
            showVacant: true,
            showFilled: true,
            unitTypes: []
        });
    };

    const hasActiveFilters =
        filters.branches.length > 0 ||
        filters.ranks.length > 0 ||
        filters.positionTypes.length > 0 ||
        filters.unitTypes.length > 0 ||
        !filters.showVacant ||
        !filters.showFilled;

    const getPositionTypeIcon = (type) => {
        const icons = {
            command: <Crown size={14} />,
            staff: <Briefcase size={14} />,
            nco: <Shield size={14} />,
            specialist: <Star size={14} />,
            standard: <Users size={14} />
        };
        return icons[type] || icons.standard;
    };

    return (
        <div className="orbat-filter-panel">
            <div className="filter-panel-header">
                <h3 className="filter-panel-title">
                    <Filter size={20} />
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="clear-filters-btn"
                        title="Clear all filters"
                    >
                        <RotateCcw size={16} />
                        Clear All
                    </button>
                )}
            </div>

            <div className="filter-panel-content">
                {/* Status Filter */}
                <div className="filter-section">
                    <div
                        className="filter-section-header"
                        onClick={() => toggleSection('status')}
                    >
                        <h4 className="filter-section-title">
                            {expandedSections.status ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            Position Status
                        </h4>
                        <span className="filter-count">
                            {(!filters.showVacant || !filters.showFilled) ? '•' : ''}
                        </span>
                    </div>

                    {expandedSections.status && (
                        <div className="filter-options">
                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.showFilled}
                                    onChange={(e) => onFiltersChange({
                                        ...filters,
                                        showFilled: e.target.checked
                                    })}
                                />
                                <Eye size={16} />
                                <span className="filter-option-label">Show Filled Positions</span>
                                <span className="filter-option-count">
                                    {orbatData ? orbatData.nodes.filter(n => !n.is_vacant).length : 0}
                                </span>
                            </label>

                            <label className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={filters.showVacant}
                                    onChange={(e) => onFiltersChange({
                                        ...filters,
                                        showVacant: e.target.checked
                                    })}
                                />
                                <EyeOff size={16} />
                                <span className="filter-option-label">Show Vacant Positions</span>
                                <span className="filter-option-count">
                                    {orbatData ? orbatData.nodes.filter(n => n.is_vacant).length : 0}
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Position Types Filter */}
                <div className="filter-section">
                    <div
                        className="filter-section-header"
                        onClick={() => toggleSection('positionTypes')}
                    >
                        <h4 className="filter-section-title">
                            {expandedSections.positionTypes ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            Position Types
                        </h4>
                        <span className="filter-count">
                            {filters.positionTypes.length > 0 && `${filters.positionTypes.length}`}
                        </span>
                    </div>

                    {expandedSections.positionTypes && (
                        <div className="filter-options">
                            {availableFilters.positionTypes.map(type => (
                                <label key={type} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={filters.positionTypes.includes(type)}
                                        onChange={() => handleFilterChange('positionTypes', type)}
                                    />
                                    {getPositionTypeIcon(type)}
                                    <span className="filter-option-label">
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </span>
                                    <span className="filter-option-count">
                                        {orbatData ? orbatData.nodes.filter(n => n.position_type === type).length : 0}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Branches Filter */}
                {availableFilters.branches.length > 0 && (
                    <div className="filter-section">
                        <div
                            className="filter-section-header"
                            onClick={() => toggleSection('branches')}
                        >
                            <h4 className="filter-section-title">
                                {expandedSections.branches ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                Branches
                            </h4>
                            <span className="filter-count">
                                {filters.branches.length > 0 && `${filters.branches.length}`}
                            </span>
                        </div>

                        {expandedSections.branches && (
                            <div className="filter-options">
                                {availableFilters.branches.map(branch => (
                                    <label key={branch} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={filters.branches.includes(branch)}
                                            onChange={() => handleFilterChange('branches', branch)}
                                        />
                                        <span className="filter-option-label">{branch}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Ranks Filter */}
                {availableFilters.ranks.length > 0 && (
                    <div className="filter-section">
                        <div
                            className="filter-section-header"
                            onClick={() => toggleSection('ranks')}
                        >
                            <h4 className="filter-section-title">
                                {expandedSections.ranks ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                Ranks
                            </h4>
                            <span className="filter-count">
                                {filters.ranks.length > 0 && `${filters.ranks.length}`}
                            </span>
                        </div>

                        {expandedSections.ranks && (
                            <div className="filter-options scrollable">
                                {availableFilters.ranks.sort().map(rank => (
                                    <label key={rank} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={filters.ranks.includes(rank)}
                                            onChange={() => handleFilterChange('ranks', rank)}
                                        />
                                        <span className="filter-option-label">{rank}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="active-filters-summary">
                        <h4>Active Filters</h4>
                        <div className="active-filter-tags">
                            {!filters.showVacant && (
                                <span className="filter-tag">Hide Vacant</span>
                            )}
                            {!filters.showFilled && (
                                <span className="filter-tag">Hide Filled</span>
                            )}
                            {filters.positionTypes.map(type => (
                                <span key={type} className="filter-tag">
                                    {type}
                                </span>
                            ))}
                            {filters.branches.map(branch => (
                                <span key={branch} className="filter-tag">
                                    {branch}
                                </span>
                            ))}
                            {filters.ranks.map(rank => (
                                <span key={rank} className="filter-tag">
                                    {rank}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ORBATFilterPanel;
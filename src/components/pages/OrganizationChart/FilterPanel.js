import React from 'react';
import { X, Filter, Eye, EyeOff, RotateCcw } from 'lucide-react';

const FilterPanel = ({
                         branches,
                         unitTypes,
                         activeFilters,
                         onFiltersChange,
                         onClose
                     }) => {
    const handleBranchToggle = (branchId) => {
        const current = activeFilters.branches;
        const updated = current.includes(branchId)
            ? current.filter(id => id !== branchId)
            : [...current, branchId];

        onFiltersChange({
            ...activeFilters,
            branches: updated
        });
    };

    const handleUnitTypeToggle = (unitType) => {
        const current = activeFilters.unitTypes;
        const updated = current.includes(unitType)
            ? current.filter(type => type !== unitType)
            : [...current, unitType];

        onFiltersChange({
            ...activeFilters,
            unitTypes: updated
        });
    };

    const handleShowInactiveToggle = () => {
        onFiltersChange({
            ...activeFilters,
            showInactive: !activeFilters.showInactive
        });
    };

    const clearAllFilters = () => {
        onFiltersChange({
            branches: [],
            unitTypes: [],
            showInactive: false
        });
    };

    const hasActiveFilters =
        activeFilters.branches.length > 0 ||
        activeFilters.unitTypes.length > 0 ||
        activeFilters.showInactive;

    return (
        <div className="filter-panel">
            <div className="filter-panel-header">
                <h3 className="filter-panel-title">
                    <Filter size={20} />
                    Filters
                </h3>
                <button
                    onClick={onClose}
                    className="filter-panel-close"
                    title="Close filters"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="filter-panel-content">
                {/* Clear All Filters */}
                {hasActiveFilters && (
                    <div className="filter-section">
                        <button
                            onClick={clearAllFilters}
                            className="btn btn-secondary btn-sm clear-filters-btn"
                        >
                            <RotateCcw size={14} />
                            Clear All Filters
                        </button>
                    </div>
                )}

                {/* Branch Filters */}
                <div className="filter-section">
                    <h4 className="filter-section-title">Branches</h4>
                    <div className="filter-options">
                        {branches.map(branch => (
                            <label key={branch.id} className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.branches.includes(branch.id)}
                                    onChange={() => handleBranchToggle(branch.id)}
                                />
                                <span
                                    className="branch-color-indicator"
                                    style={{ backgroundColor: branch.color_code }}
                                />
                                <span className="filter-option-label">
                                    {branch.name}
                                </span>
                                <span className="filter-option-abbr">
                                    {branch.abbreviation}
                                </span>
                            </label>
                        ))}
                    </div>
                    {activeFilters.branches.length === 0 && (
                        <div className="filter-help">
                            All branches shown
                        </div>
                    )}
                </div>

                {/* Unit Type Filters */}
                <div className="filter-section">
                    <h4 className="filter-section-title">Unit Types</h4>
                    <div className="filter-options">
                        {unitTypes.map(unitType => (
                            <label key={unitType} className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.unitTypes.includes(unitType)}
                                    onChange={() => handleUnitTypeToggle(unitType)}
                                />
                                <span className="filter-option-label">
                                    {unitType}
                                </span>
                            </label>
                        ))}
                    </div>
                    {activeFilters.unitTypes.length === 0 && (
                        <div className="filter-help">
                            All unit types shown
                        </div>
                    )}
                </div>

                {/* Status Filters */}
                <div className="filter-section">
                    <h4 className="filter-section-title">Status</h4>
                    <div className="filter-options">
                        <label className="filter-option">
                            <input
                                type="checkbox"
                                checked={activeFilters.showInactive}
                                onChange={handleShowInactiveToggle}
                            />
                            {activeFilters.showInactive ? (
                                <Eye size={16} />
                            ) : (
                                <EyeOff size={16} />
                            )}
                            <span className="filter-option-label">
                                Show Inactive Units
                            </span>
                        </label>
                    </div>
                    <div className="filter-help">
                        {activeFilters.showInactive
                            ? 'Showing active and inactive units'
                            : 'Showing only active units'
                        }
                    </div>
                </div>

                {/* Filter Summary */}
                {hasActiveFilters && (
                    <div className="filter-section filter-summary">
                        <h4 className="filter-section-title">Active Filters</h4>
                        <div className="filter-summary-content">
                            {activeFilters.branches.length > 0 && (
                                <div className="filter-summary-item">
                                    <strong>Branches:</strong> {activeFilters.branches.length} selected
                                </div>
                            )}
                            {activeFilters.unitTypes.length > 0 && (
                                <div className="filter-summary-item">
                                    <strong>Unit Types:</strong> {activeFilters.unitTypes.length} selected
                                </div>
                            )}
                            {activeFilters.showInactive && (
                                <div className="filter-summary-item">
                                    <strong>Status:</strong> Including inactive units
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;
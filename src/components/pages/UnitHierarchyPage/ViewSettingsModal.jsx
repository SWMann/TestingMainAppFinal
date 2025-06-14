// src/components/UnitHierarchy/Modals/ViewSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { hierarchyService } from './hierarchyService';
import { unitService } from './unitService';
import { toast } from 'react-toastify';

const ViewSettingsModal = ({ view, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        view_type: 'custom',
        is_public: true,
        is_default: false,
        show_vacant_positions: true,
        show_personnel_count: true,
        included_units: [],
        filter_config: {
            branch_ids: [],
            unit_types: []
        }
    });

    const [availableUnits, setAvailableUnits] = useState([]);
    const [availableBranches, setAvailableBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingUnits, setLoadingUnits] = useState(true);

    useEffect(() => {
        if (view) {
            setFormData({
                ...view,
                included_units: view.included_units || []
            });
        }
        loadAvailableData();
    }, [view]);

    const loadAvailableData = async () => {
        try {
            setLoadingUnits(true);
            const [unitsResponse, branchesResponse] = await Promise.all([
                unitService.getUnits(),
                unitService.getBranches()
            ]);

            setAvailableUnits(unitsResponse.data);
            setAvailableBranches(branchesResponse.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load units and branches');
        } finally {
            setLoadingUnits(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('View name is required');
            return;
        }

        try {
            setLoading(true);

            let response;
            if (view?.id) {
                response = await hierarchyService.updateView(view.id, formData);
            } else {
                response = await hierarchyService.createView(formData);
            }

            toast.success(`View ${view ? 'updated' : 'created'} successfully`);
            onSave(response.data);
            onClose();
        } catch (error) {
            console.error('Failed to save view:', error);
            toast.error(`Failed to ${view ? 'update' : 'create'} view`);
        } finally {
            setLoading(false);
        }
    };

    const handleUnitToggle = (unitId) => {
        setFormData(prev => ({
            ...prev,
            included_units: prev.included_units.includes(unitId)
                ? prev.included_units.filter(id => id !== unitId)
                : [...prev.included_units, unitId]
        }));
    };

    const handleBranchToggle = (branchId) => {
        setFormData(prev => ({
            ...prev,
            filter_config: {
                ...prev.filter_config,
                branch_ids: prev.filter_config.branch_ids.includes(branchId)
                    ? prev.filter_config.branch_ids.filter(id => id !== branchId)
                    : [...prev.filter_config.branch_ids, branchId]
            }
        }));
    };

    const selectAllUnits = () => {
        setFormData(prev => ({
            ...prev,
            included_units: availableUnits.map(unit => unit.id)
        }));
    };

    const clearAllUnits = () => {
        setFormData(prev => ({
            ...prev,
            included_units: []
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content view-settings-modal" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>{view ? 'Edit View' : 'Create New View'}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Basic Information */}
                    <section className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <label htmlFor="name">View Name *</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., 5th Battalion View"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe this view..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="view_type">View Type</label>
                            <select
                                id="view_type"
                                value={formData.view_type}
                                onChange={(e) => setFormData({ ...formData, view_type: e.target.value })}
                            >
                                <option value="full">Full Organization</option>
                                <option value="branch">Branch Specific</option>
                                <option value="custom">Custom View</option>
                                <option value="operational">Operational Structure</option>
                                <option value="administrative">Administrative Structure</option>
                            </select>
                        </div>
                    </section>

                    {/* View Settings */}
                    <section className="form-section">
                        <h3>View Settings</h3>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.is_public}
                                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                />
                                <span>Public View</span>
                                <small>Allow all users to see this view</small>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                />
                                <span>Default View</span>
                                <small>Set as the default view for all users</small>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.show_vacant_positions}
                                    onChange={(e) => setFormData({ ...formData, show_vacant_positions: e.target.checked })}
                                />
                                <span>Show Vacant Positions</span>
                                <small>Display positions without assigned personnel</small>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.show_personnel_count}
                                    onChange={(e) => setFormData({ ...formData, show_personnel_count: e.target.checked })}
                                />
                                <span>Show Personnel Count</span>
                                <small>Display personnel numbers on unit nodes</small>
                            </label>
                        </div>
                    </section>

                    {/* Unit Selection */}
                    <section className="form-section">
                        <div className="section-header">
                            <h3>Unit Selection</h3>
                            <div className="section-actions">
                                <button type="button" onClick={selectAllUnits} className="text-button">
                                    Select All
                                </button>
                                <button type="button" onClick={clearAllUnits} className="text-button">
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {loadingUnits ? (
                            <div className="loading-units">
                                <div className="spinner-small"></div>
                                <p>Loading units...</p>
                            </div>
                        ) : (
                            <div className="units-selection">
                                <div className="units-tree">
                                    {availableUnits.filter(unit => !unit.parent_unit).map(topUnit => (
                                        <UnitTreeItem
                                            key={topUnit.id}
                                            unit={topUnit}
                                            allUnits={availableUnits}
                                            selectedUnits={formData.included_units}
                                            onToggle={handleUnitToggle}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Filters */}
                    <section className="form-section">
                        <h3>Filters</h3>

                        <div className="form-group">
                            <label>Filter by Branch</label>
                            <div className="filter-options">
                                {availableBranches.map(branch => (
                                    <label key={branch.id} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={formData.filter_config.branch_ids.includes(branch.id)}
                                            onChange={() => handleBranchToggle(branch.id)}
                                        />
                                        <span style={{ color: branch.color_code }}>{branch.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Filter by Unit Type</label>
                            <div className="filter-options">
                                {['Division', 'Brigade', 'Battalion', 'Company', 'Platoon', 'Squad'].map(type => (
                                    <label key={type} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={formData.filter_config.unit_types?.includes(type) || false}
                                            onChange={(e) => {
                                                const types = formData.filter_config.unit_types || [];
                                                setFormData({
                                                    ...formData,
                                                    filter_config: {
                                                        ...formData.filter_config,
                                                        unit_types: e.target.checked
                                                            ? [...types, type]
                                                            : types.filter(t => t !== type)
                                                    }
                                                });
                                            }}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>{view ? 'Update View' : 'Create View'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Unit Tree Item Component
const UnitTreeItem = ({ unit, allUnits, selectedUnits, onToggle, level = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const subunits = allUnits.filter(u => u.parent_unit === unit.id);
    const hasSubunits = subunits.length > 0;
    const isSelected = selectedUnits.includes(unit.id);

    return (
        <div className="unit-tree-item" style={{ paddingLeft: `${level * 20}px` }}>
            <div className="unit-tree-header">
                {hasSubunits && (
                    <button
                        type="button"
                        className="expand-button"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                )}

                <label className="unit-checkbox">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(unit.id)}
                    />
                    <span className="unit-label">
            <span className="unit-abbr">{unit.abbreviation}</span>
            <span className="unit-name">{unit.name}</span>
            <span className="unit-type">{unit.unit_type}</span>
          </span>
                </label>
            </div>

            {hasSubunits && expanded && (
                <div className="unit-tree-children">
                    {subunits.map(subunit => (
                        <UnitTreeItem
                            key={subunit.id}
                            unit={subunit}
                            allUnits={allUnits}
                            selectedUnits={selectedUnits}
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewSettingsModal;
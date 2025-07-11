import React, { useState, useEffect } from 'react';
import { X, Building, ChevronRight } from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";

// Helper function to format unit type for display
const formatUnitType = (unitType) => {
    if (!unitType) return '';

    // Handle legacy format (e.g., "Corps", "Division")
    if (!unitType.includes('_')) return unitType;

    // Handle new format (e.g., "navy_fleet", "ground_division")
    const [category, ...typeParts] = unitType.split('_');
    const type = typeParts.join(' ');

    const categoryLabels = {
        'navy': 'Navy',
        'aviation': 'Naval Aviation',
        'ground': 'Ground'
    };

    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const formattedCategory = categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);

    return `${formattedCategory}: ${formattedType}`;
};

const UnitAssignmentModal = ({ user, onClose, onAssign }) => {
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(user.primary_unit?.id || null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUnits, setExpandedUnits] = useState(new Set());

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await api.get('/units/structure/');
            setUnits(response.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedUnit && selectedUnit !== user.primary_unit?.id) {
            onAssign(selectedUnit);
        }
    };

    const toggleExpand = (unitId) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unitId)) {
            newExpanded.delete(unitId);
        } else {
            newExpanded.add(unitId);
        }
        setExpandedUnits(newExpanded);
    };

    const renderUnitTree = (unit, level = 0) => {
        const hasSubunits = unit.subunits && unit.subunits.length > 0;
        const isExpanded = expandedUnits.has(unit.id);
        const matchesSearch = !searchTerm ||
            unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch && !hasSubunits) return null;

        return (
            <div key={unit.id} className="unit-tree-item">
                <div
                    className={`unit-tree-node ${selectedUnit === unit.id ? 'selected' : ''} ${unit.id === user.primary_unit?.id ? 'current' : ''}`}
                    style={{ paddingLeft: `${level * 24 + 12}px` }}
                >
                    {hasSubunits && (
                        <button
                            type="button"
                            className="expand-button"
                            onClick={() => toggleExpand(unit.id)}
                        >
                            <ChevronRight
                                size={16}
                                style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                            />
                        </button>
                    )}
                    <div
                        className="unit-tree-content"
                        onClick={() => setSelectedUnit(unit.id)}
                    >
                        {unit.emblem_url && (
                            <img
                                src={unit.emblem_url}
                                alt={unit.name}
                                className="unit-tree-emblem"
                            />
                        )}
                        <div className="unit-tree-info">
                            <div className="unit-tree-name">{unit.name}</div>
                            <div className="unit-tree-details">
                                <span>{unit.abbreviation}</span>
                                {unit.unit_type && <span>• {formatUnitType(unit.unit_type)}</span>}
                            </div>
                        </div>
                        {unit.id === user.primary_unit?.id && (
                            <span className="current-badge">CURRENT</span>
                        )}
                    </div>
                </div>
                {hasSubunits && isExpanded && (
                    <div className="unit-tree-children">
                        {unit.subunits.map(subunit => renderUnitTree(subunit, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const getSelectedUnitInfo = () => {
        const findUnit = (units, id) => {
            for (const unit of units) {
                if (unit.id === id) return unit;
                if (unit.subunits) {
                    const found = findUnit(unit.subunits, id);
                    if (found) return found;
                }
            }
            return null;
        };
        return findUnit(units, selectedUnit);
    };

    const selectedUnitInfo = getSelectedUnitInfo();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Building size={20} />
                        Assign Unit - {user.username}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="current-unit-info">
                        <h4>Current Unit</h4>
                        {user.primary_unit ? (
                            <div className="unit-display">
                                {user.primary_unit.emblem_url && (
                                    <img
                                        src={user.primary_unit.emblem_url}
                                        alt={user.primary_unit.name}
                                        className="unit-emblem-modal"
                                    />
                                )}
                                <div>
                                    <div className="unit-name">{user.primary_unit.name}</div>
                                    <div className="unit-type">{formatUnitType(user.primary_unit.unit_type)}</div>
                                </div>
                            </div>
                        ) : (
                            <p className="no-unit">No unit assigned</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Search Units</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or abbreviation..."
                            className="search-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Select New Unit</label>
                        {isLoading ? (
                            <p>Loading units...</p>
                        ) : (
                            <div className="unit-tree">
                                {units.map(unit => renderUnitTree(unit))}
                            </div>
                        )}
                    </div>

                    {selectedUnitInfo && selectedUnitInfo.id !== user.primary_unit?.id && (
                        <div className="selected-unit-preview">
                            <h4>Selected Unit</h4>
                            <div className="unit-preview">
                                {selectedUnitInfo.emblem_url && (
                                    <img
                                        src={selectedUnitInfo.emblem_url}
                                        alt={selectedUnitInfo.name}
                                        className="unit-emblem-preview"
                                    />
                                )}
                                <div className="unit-preview-info">
                                    <div className="unit-preview-name">{selectedUnitInfo.name}</div>
                                    <div className="unit-preview-type">{formatUnitType(selectedUnitInfo.unit_type)}</div>
                                    {selectedUnitInfo.motto && (
                                        <div className="unit-preview-motto">"{selectedUnitInfo.motto}"</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!selectedUnit || selectedUnit === user.primary_unit?.id}
                        >
                            Assign to Unit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnitAssignmentModal;
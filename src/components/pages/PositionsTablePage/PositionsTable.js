// Reusable PositionsTable component that can be embedded in other pages
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Building, Star, User } from 'lucide-react';
import './PositionsTable.css';

const PositionsTable = ({
                            unitId = null,          // Filter by specific unit
                            maxDepth = null,        // Limit tree depth
                            showControls = true,    // Show search/filter controls
                            highlightPositionId = null,  // Position to highlight
                            onPositionClick = null, // Callback when position clicked
                            className = ''          // Additional CSS classes
                        }) => {
    const [expandedUnits, setExpandedUnits] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [units, setUnits] = useState([]);
    const [positions, setPositions] = useState([]);

    // Simpler version focusing on core table functionality
    const toggleUnit = (unitId) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unitId)) {
            newExpanded.delete(unitId);
        } else {
            newExpanded.add(unitId);
        }
        setExpandedUnits(newExpanded);
    };

    const filterPositions = (positionsList) => {
        if (!searchTerm) return positionsList;

        const searchLower = searchTerm.toLowerCase();
        return positionsList.filter(position =>
            position.display_title?.toLowerCase().includes(searchLower) ||
            position.role_name?.toLowerCase().includes(searchLower) ||
            position.current_holder?.username?.toLowerCase().includes(searchLower)
        );
    };

    const renderUnit = (unit, level = 0) => {
        if (maxDepth && level >= maxDepth) return null;

        const isExpanded = expandedUnits.has(unit.id);
        const filteredPositions = filterPositions(unit.positions);

        return (
            <React.Fragment key={unit.id}>
                <tr className={`unit-row level-${level}`}>
                    <td colSpan="4">
                        <div
                            className="unit-header-simple"
                            onClick={() => toggleUnit(unit.id)}
                            style={{ paddingLeft: `${level * 20}px` }}
                        >
                            {unit.children?.length > 0 && (
                                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                            )}
                            <Building size={14} />
                            <span>{unit.name}</span>
                            <span className="unit-count">({filteredPositions.length})</span>
                        </div>
                    </td>
                </tr>

                {isExpanded && filteredPositions.map(position => (
                    <tr
                        key={position.id}
                        className={`position-row-simple ${position.id === highlightPositionId ? 'highlighted' : ''}`}
                        onClick={() => onPositionClick && onPositionClick(position)}
                    >
                        <td style={{ paddingLeft: `${(level + 1) * 20 + 20}px` }}>
                            {position.id === highlightPositionId && <Star size={12} />}
                            {position.display_title}
                        </td>
                        <td>{position.role_name}</td>
                        <td>
                            {position.is_vacant ? (
                                <span className="vacant">VACANT</span>
                            ) : position.current_holder ? (
                                <span>
                                    {position.current_holder.rank} {position.current_holder.username}
                                </span>
                            ) : '-'}
                        </td>
                        <td>{unit.abbreviation}</td>
                    </tr>
                ))}

                {isExpanded && unit.children?.map(child => renderUnit(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className={`positions-table-component ${className}`}>
            {showControls && (
                <div className="table-controls-simple">
                    <input
                        type="text"
                        placeholder="Search positions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            )}

            <table className="positions-table-simple">
                <thead>
                <tr>
                    <th>Position</th>
                    <th>Role</th>
                    <th>Holder</th>
                    <th>Unit</th>
                </tr>
                </thead>
                <tbody>
                {units.map(unit => renderUnit(unit))}
                </tbody>
            </table>
        </div>
    );
};

export default PositionsTable;

// CSS for the simplified component (PositionsTable.css)
const simpleTableStyles = `
.positions-table-component {
    width: 100%;
    background-color: #2d2d2d;
    border-radius: 0.5rem;
    overflow: hidden;
}

.table-controls-simple {
    padding: 1rem;
    background-color: #3a3a3a;
    border-bottom: 1px solid #404040;
}

.search-input {
    width: 100%;
    padding: 0.5rem 1rem;
    background-color: #2d2d2d;
    border: 1px solid #404040;
    border-radius: 0.25rem;
    color: #ffffff;
    font-size: 0.875rem;
}

.positions-table-simple {
    width: 100%;
    border-collapse: collapse;
}

.positions-table-simple th {
    padding: 0.75rem;
    text-align: left;
    background-color: #3a3a3a;
    color: #ffd700;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.unit-row {
    background-color: #2a2a2a;
    cursor: pointer;
}

.unit-header-simple {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    user-select: none;
}

.unit-header-simple:hover {
    background-color: #3a3a3a;
}

.unit-count {
    margin-left: auto;
    color: #999999;
    font-size: 0.75rem;
}

.position-row-simple {
    cursor: pointer;
    transition: background-color 0.2s;
}

.position-row-simple:hover {
    background-color: #3a3a3a;
}

.position-row-simple.highlighted {
    background-color: rgba(255, 215, 0, 0.1);
    border-left: 3px solid #ffd700;
}

.position-row-simple td {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #cccccc;
}

.vacant {
    color: #ef4444;
    font-weight: 600;
}
`;
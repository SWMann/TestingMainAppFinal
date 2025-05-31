import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, Crown, Shield, ChevronDown, ChevronRight } from 'lucide-react';

const UnitNode = ({ data, selected }) => {
    const { unit, showMemberCount, showCommander, expanded, style } = data;

    // Get branch color or default
    const branchColor = unit.branch?.color_code || '#4FCBF8';

    // Get unit type styling
    const getUnitTypeStyle = (unitType) => {
        const typeStyles = {
            'Fleet': { icon: '🚢', color: '#1F4287' },
            'Squadron': { icon: '✈️', color: '#4B5D46' },
            'Division': { icon: '🛡️', color: '#CF1020' },
            'Battalion': { icon: '⚔️', color: '#E4D00A' },
            'Company': { icon: '👥', color: '#382C54' },
            'Platoon': { icon: '🎯', color: '#FF6B35' },
            'Special': { icon: '⭐', color: '#39FF14' }
        };
        return typeStyles[unitType] || { icon: '📋', color: '#4FCBF8' };
    };

    const typeStyle = getUnitTypeStyle(unit.unit_type);

    return (
        <div
            className={`unit-node ${selected ? 'selected' : ''} ${!unit.is_active ? 'inactive' : ''}`}
            style={{
                borderColor: branchColor,
                ...style
            }}
        >
            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Top}
                className="unit-handle unit-handle-top"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="unit-handle unit-handle-bottom"
            />
            <Handle
                type="source"
                position={Position.Left}
                className="unit-handle unit-handle-left"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="unit-handle unit-handle-right"
            />

            {/* Node Header */}
            <div
                className="unit-node-header"
                style={{ backgroundColor: branchColor }}
            >
                <div className="unit-type-indicator">
                    <span className="unit-type-icon">{typeStyle.icon}</span>
                    <span className="unit-type-text">{unit.unit_type}</span>
                </div>

                {!unit.is_active && (
                    <div className="inactive-badge">INACTIVE</div>
                )}
            </div>

            {/* Node Content */}
            <div className="unit-node-content">
                {/* Unit Emblem and Name */}
                <div className="unit-main-info">
                    <div className="unit-emblem">
                        {unit.emblem_url ? (
                            <img src={unit.emblem_url} alt={unit.abbreviation} />
                        ) : (
                            <Shield size={32} color={branchColor} />
                        )}
                    </div>

                    <div className="unit-text-info">
                        <h3 className="unit-name">{unit.name}</h3>
                        <div className="unit-abbreviation">{unit.abbreviation}</div>
                        {unit.motto && (
                            <div className="unit-motto">"{unit.motto}"</div>
                        )}
                    </div>
                </div>

                {/* Commander Info */}
                {showCommander && unit.commander && (
                    <div className="commander-info">
                        <Crown size={14} />
                        <span>
                            {unit.commander.rank?.abbreviation} {unit.commander.username}
                        </span>
                    </div>
                )}

                {/* Stats Section */}
                <div className="unit-stats">
                    {showMemberCount && (
                        <div className="stat-item">
                            <Users size={14} />
                            <span>{unit.member_count || 0} Members</span>
                        </div>
                    )}

                    {unit.established_date && (
                        <div className="stat-item">
                            <span>Est. {new Date(unit.established_date).getFullYear()}</span>
                        </div>
                    )}
                </div>

                {/* Branch Badge */}
                {unit.branch && (
                    <div
                        className="branch-badge"
                        style={{ backgroundColor: branchColor }}
                    >
                        {unit.branch.abbreviation}
                    </div>
                )}

                {/* Expansion State Indicator */}
                {expanded !== undefined && (
                    <div className="expansion-indicator">
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                )}
            </div>

            {/* Selection Border */}
            {selected && <div className="selection-border" />}
        </div>
    );
};

export default memo(UnitNode);
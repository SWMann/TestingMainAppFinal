// src/components/UnitHierarchy/UnitNode.jsx
import React, { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import {
    ChevronUp,
    ChevronDown,
    Users,
    Star,
    Shield,
    Info
} from 'lucide-react';
import PositionDetailsModal from './PositionDetailsModal';
import UnitDetailsModal from './UnitDetailsModal';

const UnitNode = memo(({ data, isConnectable, selected }) => {
    const [showPositions, setShowPositions] = useState(true);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showUnitDetails, setShowUnitDetails] = useState(false);
    const navigate = useNavigate();

    const handleUserClick = (userId, event) => {
        event.stopPropagation();
        navigate(`/profile/${userId}`);
    };

    const handlePositionClick = (position, event) => {
        event.stopPropagation();
        setSelectedPosition(position);
    };

    const handleUnitInfoClick = (event) => {
        event.stopPropagation();
        setShowUnitDetails(true);
    };

    const getPositionIcon = (category) => {
        switch (category) {
            case 'command':
                return <Star size={14} className="position-icon command" />;
            case 'staff':
            case 'nco':
                return <Shield size={14} className="position-icon staff" />;
            default:
                return null;
        }
    };

    const commandPositions = data.positions?.filter(p => p.role_category === 'command') || [];
    const otherPositions = data.positions?.filter(p => p.role_category !== 'command') || [];

    return (
        <div className={`unit-node ${data.unit_type} ${selected ? 'selected' : ''}`}>
            {/* Unit Header */}
            <div
                className="unit-header"
                style={{ borderTopColor: data.branch_color || '#4a5d23' }}
            >
                <div className="unit-header-content">
                    <div className="unit-emblem">
                        {data.emblem_url ? (
                            <img src={data.emblem_url} alt={data.name} />
                        ) : (
                            <div className="emblem-placeholder">
                                <Shield size={32} color={data.branch_color || '#4a5d23'} />
                            </div>
                        )}
                    </div>

                    <div className="unit-info">
                        <h3 className="unit-abbreviation">{data.abbreviation}</h3>
                        <span className="unit-name">{data.name}</span>
                        <span className="unit-type">{data.unit_type}</span>
                        {data.motto && (
                            <span className="unit-motto">"{data.motto}"</span>
                        )}
                    </div>

                    <div className="unit-actions">
                        <button
                            className="unit-info-button"
                            onClick={handleUnitInfoClick}
                            title="Unit Details"
                        >
                            <Info size={16} />
                        </button>
                    </div>
                </div>

                {data.showPersonnelCount !== false && (
                    <div className="unit-stats">
                        <div className="stat-item">
                            <Users size={14} />
                            <span>{data.personnel_count || 0}</span>
                        </div>
                        {data.commander && (
                            <div
                                className="commander-info"
                                onClick={(e) => handleUserClick(data.commander.id, e)}
                            >
                                <Star size={14} className="commander-icon" />
                                <span className="commander-rank">{data.commander.rank}</span>
                                <span className="commander-name">{data.commander.username}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Positions Section */}
            {showPositions && data.positions && data.positions.length > 0 && (
                <div className="unit-positions">
                    {/* Command Positions */}
                    {commandPositions.length > 0 && (
                        <div className="positions-section command-section">
                            {commandPositions.map(position => (
                                <PositionItem
                                    key={position.id}
                                    position={position}
                                    icon={getPositionIcon(position.role_category)}
                                    showVacant={data.showVacant}
                                    onClick={handlePositionClick}
                                    onUserClick={handleUserClick}
                                />
                            ))}
                        </div>
                    )}

                    {/* Other Positions */}
                    {otherPositions.length > 0 && (
                        <div className="positions-section">
                            {otherPositions.map(position => (
                                <PositionItem
                                    key={position.id}
                                    position={position}
                                    icon={getPositionIcon(position.role_category)}
                                    showVacant={data.showVacant}
                                    onClick={handlePositionClick}
                                    onUserClick={handleUserClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            {data.positions && data.positions.length > 0 && (
                <button
                    className="toggle-positions"
                    onClick={() => setShowPositions(!showPositions)}
                >
                    {showPositions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>{showPositions ? 'Hide' : 'Show'} Positions</span>
                </button>
            )}

            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="unit-handle target"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="unit-handle source"
            />

            {/* Modals */}
            {selectedPosition && (
                <PositionDetailsModal
                    positionId={selectedPosition.id}
                    onClose={() => setSelectedPosition(null)}
                />
            )}

            {showUnitDetails && (
                <UnitDetailsModal
                    unitId={data.id}
                    onClose={() => setShowUnitDetails(false)}
                />
            )}
        </div>
    );
});

// Position Item Component
const PositionItem = ({ position, icon, showVacant, onClick, onUserClick }) => {
    const isVacant = position.is_vacant;

    if (!showVacant && isVacant) {
        return null;
    }

    const currentHolder = position.current_holder;

    return (
        <div
            className={`position-item ${position.role_category} ${isVacant ? 'vacant' : ''}`}
            onClick={(e) => onClick(position, e)}
        >
            <div className="position-header">
                {icon}
                <span className="position-title">{position.display_title}</span>
            </div>

            {currentHolder ? (
                <div
                    className="position-holder"
                    onClick={(e) => {
                        e.stopPropagation();
                        onUserClick(currentHolder.id, e);
                    }}
                >
                    <span className="holder-rank">{currentHolder.rank}</span>
                    <span className="holder-name">{currentHolder.username}</span>
                </div>
            ) : (
                <span className="vacant-label">Vacant</span>
            )}
        </div>
    );
};

UnitNode.displayName = 'UnitNode';

export default UnitNode;
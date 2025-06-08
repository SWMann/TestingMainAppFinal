import React, { useState, useEffect } from 'react';
import { X, Briefcase, Star, Users } from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

const PositionAssignmentModal = ({ user, onClose, onAssign }) => {
    const [units, setUnits] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(user.primary_unit?.id || '');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [isPrimary, setIsPrimary] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [positionsLoading, setPositionsLoading] = useState(false);

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (selectedUnit) {
            fetchPositions(selectedUnit);
        }
    }, [selectedUnit]);

    const fetchUnits = async () => {
        try {
            const response = await api.get('/units/');
            setUnits(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPositions = async (unitId) => {
        setPositionsLoading(true);
        try {
            const response = await api.get(`/units/${unitId}/positions/`);
            const positionsData = response.data;

            // Check which positions are already filled
            const positionsWithAvailability = await Promise.all(
                positionsData.map(async (position) => {
                    try {
                        const usersResponse = await api.get(`/positions/${position.id}/users/`);
                        const assignedUsers = usersResponse.data;
                        return {
                            ...position,
                            assigned_count: assignedUsers.length,
                            is_available: assignedUsers.length < position.max_slots
                        };
                    } catch (error) {
                        return {
                            ...position,
                            assigned_count: 0,
                            is_available: true
                        };
                    }
                })
            );

            setPositions(positionsWithAvailability);
        } catch (error) {
            console.error('Error fetching positions:', error);
        } finally {
            setPositionsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedUnit && selectedPosition) {
            onAssign({
                unit: selectedUnit,
                position: selectedPosition,
                is_primary: isPrimary
            });
        }
    };

    const selectedPositionData = positions.find(p => p.id === selectedPosition);
    const meetsRankRequirement = () => {
        if (!selectedPositionData || !user.current_rank) return true;

        const userRankTier = user.current_rank.tier;
        const minTier = selectedPositionData.min_rank?.tier || 0;
        const maxTier = selectedPositionData.max_rank?.tier || 999;

        return userRankTier >= minTier && userRankTier <= maxTier;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Briefcase size={20} />
                        Assign Position - {user.username}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="current-positions-info">
                        <h4>Current Positions</h4>
                        {user.positions && user.positions.length > 0 ? (
                            <div className="current-positions-list">
                                {user.positions.map(pos => (
                                    <div key={pos.id} className="current-position-item">
                                        <div className="position-info">
                                            <div className="position-title">{pos.position.title}</div>
                                            <div className="position-unit">{pos.unit.name}</div>
                                        </div>
                                        {pos.is_primary && <span className="primary-badge">PRIMARY</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-positions">No positions assigned</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Select Unit</label>
                        <select
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                            className="unit-select"
                        >
                            <option value="">Select a unit...</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name} ({unit.abbreviation})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedUnit && (
                        <div className="form-group">
                            <label>Select Position</label>
                            {positionsLoading ? (
                                <p>Loading positions...</p>
                            ) : positions.length === 0 ? (
                                <p className="no-positions">No positions available in this unit</p>
                            ) : (
                                <div className="positions-grid">
                                    {positions.map(position => (
                                        <div
                                            key={position.id}
                                            className={`position-option ${selectedPosition === position.id ? 'selected' : ''} ${!position.is_available ? 'unavailable' : ''}`}
                                            onClick={() => position.is_available && setSelectedPosition(position.id)}
                                        >
                                            <div className="position-option-header">
                                                <h5>{position.title}</h5>
                                                {position.is_command_position && (
                                                    <Star size={16} className="command-icon" />
                                                )}
                                                {position.is_staff_position && (
                                                    <Users size={16} className="staff-icon" />
                                                )}
                                            </div>
                                            <div className="position-option-details">
                                                {position.abbreviation && (
                                                    <span className="position-abbr">{position.abbreviation}</span>
                                                )}
                                                <span className="position-slots">
                                                    {position.assigned_count}/{position.max_slots} filled
                                                </span>
                                            </div>
                                            {position.min_rank && (
                                                <div className="rank-requirement">
                                                    Min: {position.min_rank.abbreviation}
                                                    {position.max_rank && ` - Max: ${position.max_rank.abbreviation}`}
                                                </div>
                                            )}
                                            {position.description && (
                                                <p className="position-description">{position.description}</p>
                                            )}
                                            {!position.is_available && (
                                                <div className="unavailable-overlay">FILLED</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedPositionData && (
                        <>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isPrimary}
                                        onChange={(e) => setIsPrimary(e.target.checked)}
                                    />
                                    Set as Primary Position
                                </label>
                            </div>

                            {!meetsRankRequirement() && (
                                <div className="warning-message">
                                    <AlertCircle size={16} />
                                    User's rank does not meet position requirements
                                </div>
                            )}

                            {selectedPositionData.responsibilities && (
                                <div className="position-responsibilities">
                                    <h4>Responsibilities</h4>
                                    <p>{selectedPositionData.responsibilities}</p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!selectedUnit || !selectedPosition || !meetsRankRequirement()}
                        >
                            Assign Position
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PositionAssignmentModal;
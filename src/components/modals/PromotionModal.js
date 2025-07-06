import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Shield, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const PromotionModal = ({ user, onClose, onPromote }) => {
    // All hooks must be called before any conditional returns
    const [ranks, setRanks] = useState([]);
    const [selectedRank, setSelectedRank] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    // Requirements state
    const [requirements, setRequirements] = useState({
        timeInGrade: false,
        trainingComplete: false,
        goodStanding: false,
        leadershipApproval: false,
        operationParticipation: false
    });

    // Acknowledgment state
    const [acknowledged, setAcknowledged] = useState(false);



    // Debug selected rank changes
    useEffect(() => {
        console.log('Selected rank changed to:', selectedRank);
    }, [selectedRank]);

    useEffect(() => {
        console.log('PromotionModal mounted with user:', user);
        console.log('User current_rank:', user?.current_rank);
        fetchRanks();
    }, [user]);

    // Set selected rank when ranks are loaded
    useEffect(() => {
        if (ranks.length > 0 && user.current_rank && selectedRank === null) {
            const currentRankId = typeof user.current_rank === 'object'
                ? user.current_rank.id
                : user.current_rank;

            console.log('Setting selected rank from useEffect:', currentRankId);
            setSelectedRank(currentRankId);
        }
    }, [ranks, user.current_rank, selectedRank]);

    // Ensure user object exists - after hooks
    if (!user) {
        console.error('PromotionModal: No user provided');
        return null;
    }
    const fetchRanks = async () => {
        try {
            setError(null);

            console.log('fetchRanks called, user:', user);
            console.log('user.current_rank:', user?.current_rank);

            // First, try to get the branch ID
            let branchId = null;

            // Check if user has branch as an object or just an ID
            if (user.branch) {
                branchId = typeof user.branch === 'object' ? user.branch.id : user.branch;
            } else if (user.current_rank && user.current_rank.branch) {
                // Fallback to rank's branch if user doesn't have branch directly
                branchId = typeof user.current_rank.branch === 'object'
                    ? user.current_rank.branch.id
                    : user.current_rank.branch;
            }

            console.log('Branch ID:', branchId);
            console.log('Current rank:', user.current_rank);
            console.log('User has current rank:', !!user.current_rank);

            let ranksData = [];

            if (branchId) {
                // Try the correct endpoint format
                try {
                    const response = await api.get(`/ranks/?branch=${branchId}`);
                    ranksData = response.data.results || response.data;
                } catch (err) {
                    console.log('Failed with query param, trying branch endpoint');
                    // Fallback to branch endpoint if the above fails
                    try {
                        const response = await api.get(`/branches/${branchId}/ranks/`);
                        ranksData = response.data.results || response.data;
                    } catch (err2) {
                        console.error('Both endpoints failed:', err2);
                        throw new Error('Failed to load ranks for this branch');
                    }
                }
            } else {
                // If no branch ID, get all ranks and filter client-side
                console.log('No branch ID found, fetching all ranks');
                const response = await api.get('/ranks/');
                const allRanks = response.data.results || response.data;

                // Filter by user's current rank's branch if available
                if (user.current_rank && user.current_rank.branch_name) {
                    ranksData = allRanks.filter(rank =>
                        rank.branch_name === user.current_rank.branch_name
                    );
                } else {
                    ranksData = allRanks;
                }
            }

            console.log('Fetched ranks:', ranksData);

            // Sort by tier
            const sortedRanks = ranksData.sort((a, b) => a.tier - b.tier);
            setRanks(sortedRanks);

            // Set selected rank based on user's current rank (only if not already set)
            if (user.current_rank && selectedRank === null) {
                // Handle case where current_rank might be just an ID or an object
                const currentRankId = typeof user.current_rank === 'object'
                    ? user.current_rank.id
                    : user.current_rank;

                console.log('Current rank data:', user.current_rank);
                console.log('Current rank ID:', currentRankId, 'Type:', typeof currentRankId);
                console.log('First fetched rank ID:', sortedRanks[0]?.id, 'Type:', typeof sortedRanks[0]?.id);

                setSelectedRank(currentRankId);

                // Verify the rank exists in our fetched ranks
                const rankExists = sortedRanks.some(r => r.id === currentRankId);

                if (!rankExists && currentRankId) {
                    console.warn('Current rank ID not found in fetched ranks');
                    console.log('Looking for:', currentRankId);
                    console.log('Available IDs:', sortedRanks.map(r => ({ id: r.id, type: typeof r.id })));
                }
            }
        } catch (error) {
            console.error('Error fetching ranks:', error);
            setError(error.message || 'Failed to load ranks');
            // Try to load all ranks as fallback
            try {
                const response = await api.get('/ranks/');
                const allRanks = response.data.results || response.data;
                const sortedRanks = allRanks.sort((a, b) => a.tier - b.tier);
                setRanks(sortedRanks);

                // Try to set selected rank again (only if not already set)
                if (user.current_rank && selectedRank === null) {
                    const currentRankId = typeof user.current_rank === 'object'
                        ? user.current_rank.id
                        : user.current_rank;
                    setSelectedRank(currentRankId);
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentRankId = user.current_rank && typeof user.current_rank === 'object'
            ? user.current_rank.id
            : user.current_rank;

        if (selectedRank && selectedRank !== currentRankId && acknowledged) {
            onPromote(selectedRank, reason);
        }
    };

    // Calculate if user meets typical requirements (mock implementation)
    const calculateRequirements = () => {
        // This would typically come from the API based on the user's data
        const timeInGrade = (user?.days_in_rank || 0) >= 30; // Example: 30 days minimum
        const trainingComplete = (user?.training_completion_rate || 0) >= 80; // Example: 80% completion
        const goodStanding = !user?.has_disciplinary_actions;
        const leadershipApproval = true; // Would come from API
        const operationParticipation = (user?.operations_attended || 0) >= 2; // Example: 2 ops minimum

        return {
            timeInGrade,
            trainingComplete,
            goodStanding,
            leadershipApproval,
            operationParticipation
        };
    };

    // Get current rank data
    const getCurrentRankData = () => {
        if (!user.current_rank) return null;

        // If current_rank is already an object with all the data
        if (typeof user.current_rank === 'object' && user.current_rank.name) {
            return user.current_rank;
        }

        // If current_rank is just an ID, find it in our ranks array
        const currentRankId = typeof user.current_rank === 'object'
            ? user.current_rank.id
            : user.current_rank;

        return ranks.find(r => r.id === currentRankId);
    };

    const currentRankData = getCurrentRankData();
    const currentRankTier = currentRankData?.tier || 0;
    const selectedRankData = ranks.find(r => r.id === selectedRank);
    const isPromotion = selectedRankData && currentRankData && selectedRankData.tier > currentRankTier;

    // Check if the selected rank is the current rank
    const isCurrentRankSelected = () => {
        if (!user.current_rank || !selectedRank) return false;

        const currentRankId = typeof user.current_rank === 'object'
            ? user.current_rank.id
            : user.current_rank;

        return selectedRank === currentRankId;
    };

    // Group ranks by type for better display
    const officerRanks = ranks.filter(r => r.is_officer);
    const warrantRanks = ranks.filter(r => r.is_warrant);
    const enlistedRanks = ranks.filter(r => r.is_enlisted);

    // Check if a rank is the user's current rank
    const isRankCurrent = (rankId) => {
        if (!user.current_rank) return false;

        const currentRankId = typeof user.current_rank === 'object'
            ? user.current_rank.id
            : user.current_rank;

        return rankId === currentRankId;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content promotion" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {isPromotion ? <ChevronUp size={20} /> : (!currentRankData ? <Shield size={20} /> : <ChevronDown size={20} />)}
                        {!currentRankData ? 'Assign Rank' : (isPromotion ? 'Promote' : 'Change Rank')} - {user.username}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form promotion-form">
                    <div className="left-column">
                        <div className="current-rank-info">
                            <h4>Current Rank</h4>
                            <div className="rank-display">
                                {currentRankData?.insignia_image_url ? (
                                    <img
                                        src={currentRankData.insignia_image_url}
                                        alt={currentRankData.name}
                                        className="rank-insignia-modal"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="rank-insignia-placeholder">
                                        <Shield size={32} />
                                    </div>
                                )}
                                <div>
                                    <div className="rank-name">{currentRankData?.name || 'No Rank Assigned'}</div>
                                    {currentRankData && (
                                        <>
                                            <div className="rank-abbr">{currentRankData.abbreviation}</div>
                                            <div className="rank-tier">Tier {currentRankData.tier}</div>
                                            {currentRankData.branch_name && (
                                                <div className="rank-branch">{currentRankData.branch_name}</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedRankData && !isCurrentRankSelected() && (
                            <div className="rank-change-preview">
                                <h4>Rank Change Summary</h4>
                                <div className="change-details">
                                    <div className="from-rank">
                                        <span className="label">From:</span>
                                        <span>{currentRankData?.name || 'No Rank'} {currentRankData ? `(Tier ${currentRankTier})` : ''}</span>
                                    </div>
                                    <div className="to-rank">
                                        <span className="label">To:</span>
                                        <span className={currentRankData ? (isPromotion ? 'promotion' : 'demotion') : 'assignment'}>
                                            {selectedRankData.name} (Tier {selectedRankData.tier})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="promotion-requirements">
                            <h4>Promotion Requirements</h4>
                            <div className="requirements-list">
                                <div className="requirement-item">
                                    <input
                                        type="checkbox"
                                        className="requirement-checkbox"
                                        checked={requirements.timeInGrade}
                                        onChange={(e) => setRequirements({...requirements, timeInGrade: e.target.checked})}
                                    />
                                    <div className="requirement-content">
                                        <label className="requirement-label">Time in Grade</label>
                                        <div className="requirement-description">
                                            Member has served sufficient time in current rank
                                        </div>
                                        <div className="requirement-status">
                                            {user?.days_in_rank !== undefined ? (
                                                <span className={user.days_in_rank >= 30 ? 'requirement-met' : 'requirement-not-met'}>
                                                    {user.days_in_rank >= 30 ? <Check size={14} /> : <AlertCircle size={14} />}
                                                    {user.days_in_rank} days in current rank
                                                </span>
                                            ) : (
                                                <span className="requirement-not-met">No data available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="requirement-item">
                                    <input
                                        type="checkbox"
                                        className="requirement-checkbox"
                                        checked={requirements.trainingComplete}
                                        onChange={(e) => setRequirements({...requirements, trainingComplete: e.target.checked})}
                                    />
                                    <div className="requirement-content">
                                        <label className="requirement-label">Training Completion</label>
                                        <div className="requirement-description">
                                            Required training courses completed for this rank
                                        </div>
                                        <div className="requirement-status">
                                            {user?.training_completion_rate !== undefined ? (
                                                <span className={user.training_completion_rate >= 80 ? 'requirement-met' : 'requirement-not-met'}>
                                                    {user.training_completion_rate >= 80 ? <Check size={14} /> : <AlertCircle size={14} />}
                                                    {user.training_completion_rate}% training completed
                                                </span>
                                            ) : (
                                                <span className="requirement-not-met">No training data</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="requirement-item">
                                    <input
                                        type="checkbox"
                                        className="requirement-checkbox"
                                        checked={requirements.goodStanding}
                                        onChange={(e) => setRequirements({...requirements, goodStanding: e.target.checked})}
                                    />
                                    <div className="requirement-content">
                                        <label className="requirement-label">Good Standing</label>
                                        <div className="requirement-description">
                                            No recent disciplinary actions or violations
                                        </div>
                                        <div className="requirement-status">
                                            <span className={!user?.has_disciplinary_actions ? 'requirement-met' : 'requirement-not-met'}>
                                                {!user?.has_disciplinary_actions ? <Check size={14} /> : <AlertCircle size={14} />}
                                                {!user?.has_disciplinary_actions ? 'Clean record' : 'Has disciplinary actions'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="requirement-item">
                                    <input
                                        type="checkbox"
                                        className="requirement-checkbox"
                                        checked={requirements.leadershipApproval}
                                        onChange={(e) => setRequirements({...requirements, leadershipApproval: e.target.checked})}
                                    />
                                    <div className="requirement-content">
                                        <label className="requirement-label">Leadership Approval</label>
                                        <div className="requirement-description">
                                            Chain of command has approved this promotion
                                        </div>
                                    </div>
                                </div>

                                <div className="requirement-item">
                                    <input
                                        type="checkbox"
                                        className="requirement-checkbox"
                                        checked={requirements.operationParticipation}
                                        onChange={(e) => setRequirements({...requirements, operationParticipation: e.target.checked})}
                                    />
                                    <div className="requirement-content">
                                        <label className="requirement-label">Operation Participation</label>
                                        <div className="requirement-description">
                                            Active participation in unit operations
                                        </div>
                                        <div className="requirement-status">
                                            {user?.operations_attended !== undefined ? (
                                                <span className={user.operations_attended >= 2 ? 'requirement-met' : 'requirement-not-met'}>
                                                    {user.operations_attended >= 2 ? <Check size={14} /> : <AlertCircle size={14} />}
                                                    {user.operations_attended} operations attended
                                                </span>
                                            ) : (
                                                <span className="requirement-not-met">No operation data</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="form-group">
                            <label>Select New Rank</label>
                            {error && (
                                <div className="error-message">{error}</div>
                            )}
                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading ranks...</p>
                                </div>
                            ) : ranks.length === 0 ? (
                                <div className="no-ranks-message">
                                    <p>No ranks available for selection.</p>
                                    <p className="help-text">This might be because no branch is assigned or ranks haven't been created.</p>
                                </div>
                            ) : (
                                <div className="ranks-container">
                                    {officerRanks.length > 0 && (
                                        <div className="rank-category">
                                            <h5>Officers</h5>
                                            <div className="ranks-grid">
                                                {officerRanks.map(rank => (
                                                    <RankOption
                                                        key={rank.id}
                                                        rank={rank}
                                                        isSelected={selectedRank === rank.id}
                                                        isCurrent={isRankCurrent(rank.id)}
                                                        currentRankTier={currentRankTier}
                                                        onClick={() => setSelectedRank(rank.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {warrantRanks.length > 0 && (
                                        <div className="rank-category">
                                            <h5>Warrant Officers</h5>
                                            <div className="ranks-grid">
                                                {warrantRanks.map(rank => (
                                                    <RankOption
                                                        key={rank.id}
                                                        rank={rank}
                                                        isSelected={selectedRank === rank.id}
                                                        isCurrent={isRankCurrent(rank.id)}
                                                        currentRankTier={currentRankTier}
                                                        onClick={() => setSelectedRank(rank.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {enlistedRanks.length > 0 && (
                                        <div className="rank-category">
                                            <h5>Enlisted</h5>
                                            <div className="ranks-grid">
                                                {enlistedRanks.map(rank => (
                                                    <RankOption
                                                        key={rank.id}
                                                        rank={rank}
                                                        isSelected={selectedRank === rank.id}
                                                        isCurrent={isRankCurrent(rank.id)}
                                                        currentRankTier={currentRankTier}
                                                        onClick={() => setSelectedRank(rank.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Reason for {!currentRankData ? 'Rank Assignment' : (isPromotion ? 'Promotion' : 'Rank Change')}</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={`Enter reason for ${!currentRankData ? 'rank assignment' : (isPromotion ? 'promotion' : 'rank change')}...`}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="acknowledgment-section full-width">
                        <div className="acknowledgment-item">
                            <input
                                type="checkbox"
                                className="acknowledgment-checkbox"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                required
                            />
                            <div className="acknowledgment-text">
                                I acknowledge that I am <strong>personally responsible</strong> for ensuring this rank change
                                is within unit specifications and reasonable. I have verified that the member meets the
                                necessary requirements for this rank and that this action is in accordance with unit
                                policies and procedures.
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions full-width">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`submit-button ${isPromotion ? 'promote' : (!currentRankData ? 'assign' : 'demote')}`}
                            disabled={!selectedRank || isCurrentRankSelected() || !acknowledged}
                        >
                            {!currentRankData ? 'Assign Rank' : (isPromotion ? 'Promote' : 'Update Rank')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Rank Option Component
const RankOption = ({ rank, isSelected, isCurrent, currentRankTier, onClick }) => {
    const hasCurrentRank = currentRankTier > 0;
    const isPromotion = hasCurrentRank && rank.tier > currentRankTier;
    const isDemotion = hasCurrentRank && rank.tier < currentRankTier;

    return (
        <div
            className={`rank-option ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
            onClick={onClick}
        >
            {(rank.insignia_display_url || rank.insignia_image_url) && (
                <img
                    src={rank.insignia_display_url || rank.insignia_image_url}
                    alt={rank.name}
                    className="rank-insignia-modal"
                />
            )}
            <div className="rank-option-info">
                <div className="rank-option-name">{rank.name}</div>
                <div className="rank-option-abbr">{rank.abbreviation}</div>
                <div className="rank-option-tier">Tier {rank.tier}</div>
            </div>
            {isPromotion && <ChevronUp size={16} className="promotion-indicator" />}
            {isDemotion && <ChevronDown size={16} className="demotion-indicator" />}
            {isCurrent && <span className="current-indicator">CURRENT</span>}
        </div>
    );
};

export default PromotionModal;
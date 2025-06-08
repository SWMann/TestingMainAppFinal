import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Shield } from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const PromotionModal = ({ user, onClose, onPromote }) => {
    const [ranks, setRanks] = useState([]);
    const [selectedRank, setSelectedRank] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    // Debug selected rank changes
    useEffect(() => {
        console.log('Selected rank changed to:', selectedRank);
    }, [selectedRank]);

    useEffect(() => {
        console.log('PromotionModal mounted with user:', user);
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

    const fetchRanks = async () => {
        try {
            setError(null);

            // First, try to get the branch ID
            let branchId = null;

            // Check if user has branch as an object or just an ID
            if (user.branch) {
                branchId = typeof user.branch === 'object' ? user.branch.id : user.branch;
            } else if (user.current_rank?.branch) {
                // Fallback to rank's branch if user doesn't have branch directly
                branchId = typeof user.current_rank.branch === 'object'
                    ? user.current_rank.branch.id
                    : user.current_rank.branch;
            }

            console.log('Branch ID:', branchId);
            console.log('Current rank:', user.current_rank);

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
                if (user.current_rank?.branch_name) {
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
        const currentRankId = typeof user.current_rank === 'object'
            ? user.current_rank.id
            : user.current_rank;

        if (selectedRank && selectedRank !== currentRankId) {
            onPromote(selectedRank, reason);
        }
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
    const isPromotion = selectedRankData && selectedRankData.tier > currentRankTier;

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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {isPromotion ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        {isPromotion ? 'Promote' : 'Change Rank'} - {user.username}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
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

                    {selectedRankData && !isCurrentRankSelected() && (
                        <div className="rank-change-preview">
                            <h4>Rank Change Summary</h4>
                            <div className="change-details">
                                <div className="from-rank">
                                    <span className="label">From:</span>
                                    <span>{currentRankData?.name || 'No Rank'} (Tier {currentRankTier})</span>
                                </div>
                                <div className="to-rank">
                                    <span className="label">To:</span>
                                    <span className={isPromotion ? 'promotion' : 'demotion'}>
                                        {selectedRankData.name} (Tier {selectedRankData.tier})
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason for {isPromotion ? 'Promotion' : 'Rank Change'}</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={`Enter reason for ${isPromotion ? 'promotion' : 'rank change'}...`}
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`submit-button ${isPromotion ? 'promote' : 'demote'}`}
                            disabled={!selectedRank || isCurrentRankSelected()}
                        >
                            {isPromotion ? 'Promote' : 'Update Rank'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Rank Option Component
const RankOption = ({ rank, isSelected, isCurrent, currentRankTier, onClick }) => {
    const isPromotion = rank.tier > currentRankTier;
    const isDemotion = rank.tier < currentRankTier;

    return (
        <div
            className={`rank-option ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
            onClick={onClick}
        >
            {rank.insignia_image_url ? (
                <img
                    src={rank.insignia_image_url}
                    alt={rank.name}
                    className="rank-option-insignia"
                    onError={(e) => e.target.style.display = 'none'}
                />
            ) : (
                <div className="rank-insignia-placeholder small">
                    <Shield size={24} />
                </div>
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
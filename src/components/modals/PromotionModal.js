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

    useEffect(() => {
        console.log('PromotionModal user:', user);
        if (user?.current_rank?.id) {
            setSelectedRank(user.current_rank.id);
        }
        fetchRanks();
    }, [user]);

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

            // Set selected rank if user has a current rank
            if (user.current_rank?.id && !selectedRank) {
                setSelectedRank(user.current_rank.id);
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
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRank && selectedRank !== user.current_rank?.id) {
            onPromote(selectedRank, reason);
        }
    };

    const currentRankTier = user.current_rank?.tier || 0;
    const selectedRankData = ranks.find(r => r.id === selectedRank);
    const isPromotion = selectedRankData && selectedRankData.tier > currentRankTier;

    // Group ranks by type for better display
    const officerRanks = ranks.filter(r => r.is_officer);
    const warrantRanks = ranks.filter(r => r.is_warrant);
    const enlistedRanks = ranks.filter(r => r.is_enlisted);

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
                            {user.current_rank?.insignia_image_url ? (
                                <img
                                    src={user.current_rank.insignia_image_url}
                                    alt={user.current_rank.name}
                                    className="rank-insignia-modal"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            ) : (
                                <div className="rank-insignia-placeholder">
                                    <Shield size={32} />
                                </div>
                            )}
                            <div>
                                <div className="rank-name">{user.current_rank?.name || 'No Rank Assigned'}</div>
                                {user.current_rank && (
                                    <>
                                        <div className="rank-abbr">{user.current_rank.abbreviation}</div>
                                        <div className="rank-tier">Tier {user.current_rank.tier}</div>
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
                                                    isCurrent={rank.id === user.current_rank?.id}
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
                                                    isCurrent={rank.id === user.current_rank?.id}
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
                                                    isCurrent={rank.id === user.current_rank?.id}
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

                    {selectedRankData && selectedRank !== user.current_rank?.id && (
                        <div className="rank-change-preview">
                            <h4>Rank Change Summary</h4>
                            <div className="change-details">
                                <div className="from-rank">
                                    <span className="label">From:</span>
                                    <span>{user.current_rank?.name || 'No Rank'} (Tier {currentRankTier})</span>
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
                            disabled={!selectedRank || selectedRank === user.current_rank?.id}
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
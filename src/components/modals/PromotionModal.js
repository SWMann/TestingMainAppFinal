import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Shield } from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const PromotionModal = ({ user, onClose, onPromote }) => {
    const [ranks, setRanks] = useState([]);
    const [selectedRank, setSelectedRank] = useState(user.current_rank?.id || null);
    const [isLoading, setIsLoading] = useState(true);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        try {
            // Get ranks for the user's branch
            if (user.branch) {
                const response = await api.get(`/branches/${user.branch.id}/ranks/`);
                const ranksData = response.data;

                // Sort by tier
                const sortedRanks = ranksData.sort((a, b) => a.tier - b.tier);
                setRanks(sortedRanks);
            }
        } catch (error) {
            console.error('Error fetching ranks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRank && selectedRank !== user.current_rank?.id) {
            onPromote(selectedRank);
        }
    };

    const currentRankTier = user.current_rank?.tier || 0;
    const selectedRankData = ranks.find(r => r.id === selectedRank);
    const isPromotion = selectedRankData && selectedRankData.tier > currentRankTier;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {isPromotion ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        {isPromotion ? 'Promote' : 'Demote'} {user.username}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="current-rank-info">
                        <h4>Current Rank</h4>
                        <div className="rank-display">
                            {user.current_rank?.insignia_image_url && (
                                <img
                                    src={user.current_rank.insignia_image_url}
                                    alt={user.current_rank.name}
                                    className="rank-insignia-modal"
                                />
                            )}
                            <div>
                                <div className="rank-name">{user.current_rank?.name || 'No Rank'}</div>
                                <div className="rank-abbr">{user.current_rank?.abbreviation}</div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Rank</label>
                        {isLoading ? (
                            <p>Loading ranks...</p>
                        ) : (
                            <div className="ranks-grid">
                                {ranks.map(rank => (
                                    <div
                                        key={rank.id}
                                        className={`rank-option ${selectedRank === rank.id ? 'selected' : ''} ${rank.id === user.current_rank?.id ? 'current' : ''}`}
                                        onClick={() => setSelectedRank(rank.id)}
                                    >
                                        {rank.insignia_image_url && (
                                            <img
                                                src={rank.insignia_image_url}
                                                alt={rank.name}
                                                className="rank-option-insignia"
                                            />
                                        )}
                                        <div className="rank-option-info">
                                            <div className="rank-option-name">{rank.name}</div>
                                            <div className="rank-option-abbr">{rank.abbreviation}</div>
                                            <div className="rank-option-type">
                                                {rank.is_officer && 'Officer'}
                                                {rank.is_enlisted && 'Enlisted'}
                                                {rank.is_warrant && 'Warrant'}
                                            </div>
                                        </div>
                                        {rank.tier > currentRankTier && <ChevronUp size={16} className="promotion-indicator" />}
                                        {rank.tier < currentRankTier && <ChevronDown size={16} className="demotion-indicator" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Reason for {isPromotion ? 'Promotion' : 'Change'}</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for rank change..."
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

export default PromotionModal;
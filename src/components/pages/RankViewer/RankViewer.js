import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, Star, Anchor, Award, Crown, Users, Hash, Calendar, Info } from 'lucide-react';
import api from '../../../services/api';
import './RankViewer.css';

const RankViewer = () => {
    const [ranks, setRanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRank, setSelectedRank] = useState(null);

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/units/ranks/');
            // Handle both paginated and non-paginated responses
            const rankData = response.data.results || response.data || [];
            // Sort ranks by tier for proper display order
            const sortedRanks = [...rankData].sort((a, b) => a.tier - b.tier);
            setRanks(sortedRanks);
        } catch (error) {
            console.error('Error fetching ranks:', error);
            setError('Failed to load rank data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Get unique branches from ranks
    const getBranches = () => {
        const branches = [...new Set(ranks.map(r => r.branch_name).filter(Boolean))];
        return branches;
    };

    const categorizeRanks = () => {
        const categories = {
            enlisted: ranks.filter(r => r.is_enlisted && r.tier <= 5),
            nco: ranks.filter(r => r.is_enlisted && r.tier >= 6 && r.tier <= 9),
            warrant: ranks.filter(r => r.is_warrant),
            companyOfficer: ranks.filter(r => r.is_officer && r.tier >= 14 && r.tier <= 17),
            fieldOfficer: ranks.filter(r => r.is_officer && r.tier >= 18 && r.tier <= 20),
            highCommand: ranks.filter(r => r.is_officer && r.tier >= 21)
        };
        return categories;
    };

    const formatTimeInService = (days) => {
        if (days === 0) return 'None';
        if (days < 365) return `${days} days`;
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        if (remainingDays === 0) return `${years} year${years > 1 ? 's' : ''}`;
        return `${years} year${years > 1 ? 's' : ''}, ${remainingDays} days`;
    };

    const categories = categorizeRanks();

    const filteredRanks = selectedCategory === 'all'
        ? ranks
        : categories[selectedCategory] || [];

    const categoryInfo = {
        enlisted: { name: 'Enlisted', icon: Users, color: '#4CAF50' },
        nco: { name: 'Non-Commissioned Officers', icon: Shield, color: '#2196F3' },
        warrant: { name: 'Warrant Officers', icon: Award, color: '#9C27B0' },
        companyOfficer: { name: 'Company Grade Officers', icon: Star, color: '#FF9800' },
        fieldOfficer: { name: 'Field Grade Officers', icon: Anchor, color: '#F44336' },
        highCommand: { name: 'High Command', icon: Crown, color: '#FFD700' }
    };

    if (loading) {
        return (
            <div className="rank-viewer-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>ACCESSING RANK DATABASE...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rank-viewer-container">
                <div className="error-state">
                    <Shield size={48} className="error-icon" />
                    <h2>DATABASE ACCESS ERROR</h2>
                    <p>{error}</p>
                    <button onClick={fetchRanks} className="retry-button">
                        RETRY CONNECTION
                    </button>
                </div>
            </div>
        );
    }

    if (!ranks || ranks.length === 0) {
        return (
            <div className="rank-viewer-container">
                <div className="error-state">
                    <Shield size={48} className="error-icon" />
                    <h2>NO RANK DATA AVAILABLE</h2>
                    <p>No ranks found in the database.</p>
                    <button onClick={fetchRanks} className="retry-button">
                        REFRESH
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rank-viewer-container">
            {/* Header */}
            <div className="rank-viewer-header">
                <div className="header-content">
                    <div className="header-title">
                        <Shield size={32} className="header-icon" />
                        <h1>UEE NAVAL RANK STRUCTURE</h1>
                    </div>
                    <p className="header-subtitle">United Empire of Earth Navy - 5th Expeditionary Group</p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                <button
                    className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                >
                    <Shield size={18} />
                    ALL RANKS
                </button>
                {Object.entries(categoryInfo).map(([key, info]) => {
                    const Icon = info.icon;
                    return (
                        <button
                            key={key}
                            className={`filter-button ${selectedCategory === key ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(key)}
                            style={{
                                '--category-color': info.color
                            }}
                        >
                            <Icon size={18} />
                            {info.name.toUpperCase()}
                        </button>
                    );
                })}
            </div>

            {/* Rank Grid */}
            <div className="rank-grid">
                {selectedCategory === 'all' ? (
                    // Show all ranks grouped by category
                    Object.entries(categories).map(([categoryKey, categoryRanks]) => {
                        if (categoryRanks.length === 0) return null;
                        const info = categoryInfo[categoryKey];
                        const Icon = info.icon;

                        return (
                            <div key={categoryKey} className="category-section">
                                <div className="category-header" style={{ '--category-color': info.color }}>
                                    <Icon size={24} />
                                    <h2>{info.name}</h2>
                                    <span className="rank-count">{categoryRanks.length} RANKS</span>
                                </div>
                                <div className="ranks-row">
                                    {categoryRanks.map(rank => (
                                        <RankCard
                                            key={rank.id}
                                            rank={rank}
                                            onClick={() => setSelectedRank(rank)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Show filtered ranks
                    <div className="filtered-ranks">
                        <div className="category-header" style={{ '--category-color': categoryInfo[selectedCategory]?.color }}>
                            {React.createElement(categoryInfo[selectedCategory]?.icon, { size: 24 })}
                            <h2>{categoryInfo[selectedCategory]?.name}</h2>
                            <span className="rank-count">{filteredRanks.length} RANKS</span>
                        </div>
                        <div className="ranks-row full-width">
                            {filteredRanks.map(rank => (
                                <RankCard
                                    key={rank.id}
                                    rank={rank}
                                    onClick={() => setSelectedRank(rank)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Rank Detail Modal */}
            {selectedRank && (
                <RankDetailModal
                    rank={selectedRank}
                    onClose={() => setSelectedRank(null)}
                    formatTimeInService={formatTimeInService}
                />
            )}
        </div>
    );
};

const RankCard = ({ rank, onClick }) => {
    // Get the best available image URL
    const insigniaUrl = rank.insignia_display_url || rank.insignia_image_url || rank.insignia_image || '/api/placeholder/100/100';

    return (
        <div
            className="rank-card"
            onClick={onClick}
            style={{ '--rank-color': rank.color_code }}
        >
            <div className="rank-insignia">
                <img
                    src={insigniaUrl}
                    alt={`${rank.name} insignia`}
                    onError={(e) => {
                        e.target.src = '/api/placeholder/100/100';
                    }}
                />
            </div>
            <div className="rank-info">
                <h3 className="rank-abbreviation">{rank.abbreviation}</h3>
                <p className="rank-name">{rank.name}</p>
                <div className="rank-tier">TIER {rank.tier}</div>
                {rank.branch_name && (
                    <div className="rank-branch">{rank.branch_name}</div>
                )}
            </div>
            <div className="rank-hover-overlay">
                <ChevronRight size={24} />
            </div>
        </div>
    );
};

const RankDetailModal = ({ rank, onClose, formatTimeInService }) => {
    const [promotionRequirements, setPromotionRequirements] = useState([]);
    const [loadingRequirements, setLoadingRequirements] = useState(false);

    useEffect(() => {
        fetchPromotionRequirements();
    }, [rank.id]);

    const fetchPromotionRequirements = async () => {
        try {
            setLoadingRequirements(true);
            const response = await api.get('/promotions/rank-requirements/', {
                params: { rank_id: rank.id }
            });
            setPromotionRequirements(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching promotion requirements:', error);
        } finally {
            setLoadingRequirements(false);
        }
    };

    // Get the best available image URL
    const insigniaUrl = rank.insignia_display_url || rank.insignia_image_url || rank.insignia_image || '/api/placeholder/150/150';

    // Group requirements by category
    const requirementsByCategory = {};
    promotionRequirements.forEach(req => {
        const category = req.requirement_type_details?.category || 'other';
        if (!requirementsByCategory[category]) {
            requirementsByCategory[category] = [];
        }
        requirementsByCategory[category].push(req);
    });

    const getCategoryName = (category) => {
        const names = {
            'time_based': 'Time Requirements',
            'position_based': 'Position Requirements',
            'qualification_based': 'Qualification Requirements',
            'deployment_based': 'Combat Requirements',
            'performance_based': 'Performance Requirements',
            'administrative': 'Administrative Requirements'
        };
        return names[category] || category.replace(/_/g, ' ').toUpperCase();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="rank-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="modal-header" style={{ '--rank-color': rank.color_code }}>
                    <div className="modal-insignia">
                        <img
                            src={insigniaUrl}
                            alt={`${rank.name} insignia`}
                            onError={(e) => {
                                e.target.src = '/api/placeholder/150/150';
                            }}
                        />
                    </div>
                    <div className="modal-title">
                        <h2>{rank.name}</h2>
                        <p className="modal-abbreviation">{rank.abbreviation}</p>
                        {rank.branch_name && (
                            <p className="modal-branch">{rank.branch_name}</p>
                        )}
                    </div>
                </div>

                <div className="modal-content">
                    <div className="detail-section">
                        <h3><Info size={18} /> RANK INFORMATION</h3>
                        <p className="rank-description">{rank.description || 'No description available'}</p>
                    </div>

                    <div className="detail-grid">
                        <div className="detail-item">
                            <Hash size={16} />
                            <span className="detail-label">TIER</span>
                            <span className="detail-value">{rank.tier}</span>
                        </div>
                        <div className="detail-item">
                            <Shield size={16} />
                            <span className="detail-label">CATEGORY</span>
                            <span className="detail-value">
                {rank.is_enlisted && rank.tier <= 5 && 'Enlisted'}
                                {rank.is_enlisted && rank.tier >= 6 && 'NCO'}
                                {rank.is_warrant && 'Warrant Officer'}
                                {rank.is_officer && rank.tier <= 17 && 'Company Officer'}
                                {rank.is_officer && rank.tier >= 18 && rank.tier <= 20 && 'Field Officer'}
                                {rank.is_officer && rank.tier >= 21 && 'High Command'}
              </span>
                        </div>
                        <div className="detail-item">
                            <Calendar size={16} />
                            <span className="detail-label">TIME IN SERVICE</span>
                            <span className="detail-value">{formatTimeInService(rank.min_time_in_service)}</span>
                        </div>
                        <div className="detail-item">
                            <Award size={16} />
                            <span className="detail-label">TIME IN GRADE</span>
                            <span className="detail-value">{formatTimeInService(rank.min_time_in_grade)}</span>
                        </div>
                    </div>

                    <div className="detail-section progression">
                        <h3><ChevronRight size={18} /> CAREER PROGRESSION</h3>
                        <div className="progression-info">
                            <p>This rank requires a minimum of {formatTimeInService(rank.min_time_in_service)} of service in the UEE Navy.</p>
                            {rank.min_time_in_grade > 0 && (
                                <p>Personnel must serve {formatTimeInService(rank.min_time_in_grade)} at their current grade before promotion eligibility.</p>
                            )}
                            {rank.branch_name && (
                                <p>This rank is part of the {rank.branch_name} structure.</p>
                            )}
                        </div>
                    </div>

                    {/* Promotion Requirements Section */}
                    {promotionRequirements.length > 0 && (
                        <div className="detail-section">
                            <h3><Target size={18} /> PROMOTION REQUIREMENTS</h3>
                            {loadingRequirements ? (
                                <p className="loading-text">Loading requirements...</p>
                            ) : (
                                <div className="requirements-list">
                                    {Object.entries(requirementsByCategory).map(([category, reqs]) => (
                                        <div key={category} className="requirement-category-group">
                                            <h4>{getCategoryName(category)}</h4>
                                            <ul className="requirement-items">
                                                {reqs.map(req => (
                                                    <li key={req.id} className={req.is_mandatory ? 'mandatory' : 'optional'}>
                                                        <span className="requirement-text">{req.display_text}</span>
                                                        {req.value_required > 0 && (
                                                            <span className="requirement-value">
                                                                ({req.value_required} {req.requirement_type_details?.evaluation_type?.includes('time') ? 'days' : 'required'})
                                                            </span>
                                                        )}
                                                        {!req.is_mandatory && <span className="optional-tag">OPTIONAL</span>}
                                                        {req.waiverable && <span className="waiverable-tag">WAIVERABLE</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankViewer;
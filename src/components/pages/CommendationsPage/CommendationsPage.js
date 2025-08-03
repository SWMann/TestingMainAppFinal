// src/components/pages/CommendationsPage/CommendationsPage.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Medal, Award, Search, Filter, ChevronRight, Plus, Eye,
    Calendar, User, Shield, Star, Clock, FileText,
    CheckCircle, AlertCircle, Users, TrendingUp, Hash,
    Sparkles, Trophy, Target, Zap
} from 'lucide-react';
import api from '../../../services/api';
import './CommendationsPage.css';
// Import the modal components
import {
    CreateCommendationModal,
    AwardCommendationModal,
    CommendationDetailsModal
} from '../../modals/CommendationModals';

const CommendationsPage = () => {
    const { user: currentUser } = useSelector(state => state.auth);
    const isAdmin = currentUser?.is_admin || currentUser?.is_staff;

    // State
    const [activeTab, setActiveTab] = useState('gallery');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Commendations State
    const [commendationTypes, setCommendationTypes] = useState([]);
    const [userCommendations, setUserCommendations] = useState([]);
    const [recentCommendations, setRecentCommendations] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState([]);

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAwardModal, setShowAwardModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCommendationType, setSelectedCommendationType] = useState(null);
    const [selectedCommendation, setSelectedCommendation] = useState(null);

    // Categories for filtering
    const categories = [
        { value: 'all', label: 'All Categories', icon: Star },
        { value: 'valor', label: 'Valor', icon: Zap },
        { value: 'achievement', label: 'Achievement', icon: Trophy },
        { value: 'service', label: 'Service', icon: Shield },
        { value: 'campaign', label: 'Campaign', icon: Target },
        { value: 'qualification', label: 'Qualification', icon: Award },
        { value: 'unit', label: 'Unit Citation', icon: Users },
        { value: 'special', label: 'Special Recognition', icon: Sparkles }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'gallery') {
            fetchCommendationTypes();
        } else if (activeTab === 'recent') {
            fetchRecentCommendations();
        }
    }, [activeTab, selectedCategory]);

    useEffect(() => {
        if (currentUser) {
            fetchUserCommendations();
        }
    }, [currentUser]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // Fetch branches for filters
            const branchesRes = await api.get('/branches/');
            setBranches(branchesRes.data.results || branchesRes.data);

            // Fetch commendation types
            await fetchCommendationTypes();
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to initialize commendations system');
        } finally {
            setLoading(false);
        }
    };

    const fetchCommendationTypes = async () => {
        try {
            let url = '/commendations/types/';
            if (selectedCategory !== 'all') {
                url += `?category=${selectedCategory}`;
            }
            const response = await api.get(url);
            setCommendationTypes(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching commendation types:', err);
        }
    };

    const fetchUserCommendations = async () => {
        try {
            const response = await api.get(`/commendations/awards/user_commendations/?user_id=${currentUser.id}`);
            setUserCommendations(response.data.commendations || []);
        } catch (err) {
            console.error('Error fetching user commendations:', err);
        }
    };

    const fetchRecentCommendations = async () => {
        try {
            const response = await api.get('/commendations/awards/recent/?days=30');
            setRecentCommendations(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching recent commendations:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.icon : Star;
    };

    // Filter commendation types
    const filteredCommendationTypes = commendationTypes.filter(type => {
        const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="commendations-loading">
                <div className="spinner"></div>
                <p>LOADING COMMENDATIONS DATABASE...</p>
            </div>
        );
    }

    return (
        <div className="commendations-container">
            {/* Header */}
            <div className="commendations-header">
                <div className="header-content">
                    <h1>FLEET COMMENDATIONS</h1>
                    <p>Recognition of valor, achievement, and distinguished service</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="commendations-tabs">
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
                        onClick={() => setActiveTab('gallery')}
                    >
                        <Medal size={18} />
                        Commendation Gallery
                    </button>
                    <button
                        className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recent')}
                    >
                        <Clock size={18} />
                        Recently Awarded
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="commendations-content">
                {/* User's Commendations Section */}
                {currentUser && userCommendations.length > 0 && (
                    <div className="user-commendations">
                        <h3>MY COMMENDATIONS</h3>
                        <div className="ribbon-rack">
                            {userCommendations.map(group => (
                                <div key={group.commendation_type.id} className="ribbon-group">
                                    <div
                                        className="ribbon-container"
                                        onClick={() => {
                                            setSelectedCommendation(group.awards[0]);
                                            setShowDetailsModal(true);
                                        }}
                                    >
                                        {group.commendation_type.ribbon_display_url ? (
                                            <img
                                                src={group.commendation_type.ribbon_display_url}
                                                alt={group.commendation_type.name}
                                                className="ribbon-image"
                                            />
                                        ) : (
                                            <div className="ribbon-placeholder">
                                                <Medal size={32} />
                                            </div>
                                        )}
                                        {group.awards.length > 1 && (
                                            <div className="award-count">{group.awards.length}</div>
                                        )}
                                    </div>
                                    <div className="ribbon-info">
                                        <span className="ribbon-name">{group.commendation_type.abbreviation}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' ? (
                    <div className="gallery-section">
                        {/* Controls */}
                        <div className="section-controls">
                            <div className="left-controls">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search commendations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="category-filter"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isAdmin && (
                                <button
                                    className="action-btn primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <Plus size={18} />
                                    CREATE COMMENDATION
                                </button>
                            )}
                        </div>

                        {/* Commendation Types Grid */}
                        <div className="commendations-grid">
                            {filteredCommendationTypes.map(type => {
                                const Icon = getCategoryIcon(type.category);
                                return (
                                    <div key={type.id} className="commendation-card">
                                        <div className="medal-section">
                                            {type.medal_display_url ? (
                                                <img
                                                    src={type.medal_display_url}
                                                    alt={type.name}
                                                    className="medal-image"
                                                />
                                            ) : (
                                                <div className="medal-placeholder">
                                                    <Medal size={64} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="commendation-info">
                                            <div className="commendation-header">
                                                <h4>{type.name}</h4>
                                                <span className="commendation-abbr">{type.abbreviation}</span>
                                            </div>

                                            <div className="category-badge">
                                                <Icon size={14} />
                                                {type.category.replace('_', ' ').toUpperCase()}
                                            </div>

                                            {type.description && (
                                                <p className="commendation-description">{type.description}</p>
                                            )}

                                            <div className="commendation-meta">
                                                <span className="meta-item">
                                                    <Hash size={14} />
                                                    {type.awards_count || 0} AWARDED
                                                </span>
                                                {type.min_rank_name && (
                                                    <span className="meta-item">
                                                        <Shield size={14} />
                                                        MIN: {type.min_rank_name}
                                                    </span>
                                                )}
                                            </div>

                                            {type.eligibility_criteria && (
                                                <div className="eligibility-section">
                                                    <h5>ELIGIBILITY</h5>
                                                    <p>{type.eligibility_criteria}</p>
                                                </div>
                                            )}

                                            <div className="commendation-actions">
                                                <button
                                                    className="action-btn small secondary"
                                                    onClick={() => {
                                                        setSelectedCommendationType(type);
                                                        setShowDetailsModal(true);
                                                    }}
                                                >
                                                    <Eye size={14} />
                                                    VIEW DETAILS
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        className="action-btn small"
                                                        onClick={() => {
                                                            setSelectedCommendationType(type);
                                                            setShowAwardModal(true);
                                                        }}
                                                    >
                                                        <Award size={14} />
                                                        AWARD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="recent-section">
                        <div className="section-header">
                            <h3>RECENTLY AWARDED COMMENDATIONS</h3>
                            <p className="section-description">
                                Commendations awarded in the last 30 days
                            </p>
                        </div>

                        <div className="recent-awards-list">
                            {recentCommendations.map(award => (
                                <div key={award.id} className="recent-award-item">
                                    <div className="award-ribbon">
                                        {award.commendation_type_details.ribbon_display_url ? (
                                            <img
                                                src={award.commendation_type_details.ribbon_display_url}
                                                alt={award.commendation_type_details.name}
                                            />
                                        ) : (
                                            <Medal size={48} />
                                        )}
                                    </div>

                                    <div className="award-details">
                                        <div className="award-header">
                                            <h4>{award.commendation_type_details.name}</h4>
                                            <span className="award-date">
                                                <Calendar size={14} />
                                                {formatDate(award.awarded_date)}
                                            </span>
                                        </div>

                                        <div className="recipient-info">
                                            <span className="recipient">
                                                <User size={14} />
                                                {award.user_rank?.abbreviation} {award.user_username}
                                            </span>
                                            {award.related_unit_name && (
                                                <span className="unit">
                                                    <Shield size={14} />
                                                    {award.related_unit_name}
                                                </span>
                                            )}
                                        </div>

                                        <p className="citation-preview">{award.short_citation}</p>

                                        <button
                                            className="view-citation-btn"
                                            onClick={() => {
                                                setSelectedCommendation(award);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            <FileText size={14} />
                                            READ FULL CITATION
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateCommendationModal
                    branches={branches}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchCommendationTypes();
                    }}
                />
            )}

            {showAwardModal && selectedCommendationType && (
                <AwardCommendationModal
                    commendationType={selectedCommendationType}
                    onClose={() => {
                        setShowAwardModal(false);
                        setSelectedCommendationType(null);
                    }}
                    onSuccess={() => {
                        setShowAwardModal(false);
                        setSelectedCommendationType(null);
                        fetchRecentCommendations();
                        fetchUserCommendations();
                    }}
                />
            )}

            {showDetailsModal && (selectedCommendation || selectedCommendationType) && (
                <CommendationDetailsModal
                    commendation={selectedCommendation}
                    commendationType={selectedCommendationType}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedCommendation(null);
                        setSelectedCommendationType(null);
                    }}
                />
            )}
        </div>
    );
};

export default CommendationsPage;
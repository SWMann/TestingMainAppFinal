import React, { useState, useEffect } from 'react';
import {
    Shield, Search, Filter, Plus, Edit, Trash2, ChevronUp,
    ChevronDown, X, AlertCircle, Check, Upload, Star
} from 'lucide-react';
import api from '../../../services/api';
import './ManagementSections.css';
import CreateRankModal from "../../../modals/CreateRankModal";
import EditRankModal from "../../../modals/EditRankModal";
import DeleteRankModal from "../../../modals/DeleteRankModal";

const RankManagement = () => {
    const [ranks, setRanks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('tier');
    const [selectedRank, setSelectedRank] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ranksRes, branchesRes] = await Promise.all([
                api.get('/ranks/'),
                api.get('/branches/')
            ]);

            setRanks(ranksRes.data.results || ranksRes.data);
            setBranches(branchesRes.data.results || branchesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load ranks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (rankData) => {
        try {
            await api.post('/ranks/', rankData);
            await fetchData();
            setShowCreateModal(false);
            showNotification('Rank created successfully', 'success');
        } catch (error) {
            console.error('Error creating rank:', error);
            showNotification('Failed to create rank', 'error');
        }
    };

    const handleUpdate = async (rankId, rankData) => {
        try {
            await api.put(`/ranks/${rankId}/`, rankData);
            await fetchData();
            setShowEditModal(false);
            setSelectedRank(null);
            showNotification('Rank updated successfully', 'success');
        } catch (error) {
            console.error('Error updating rank:', error);
            showNotification('Failed to update rank', 'error');
        }
    };

    const handleDelete = async (rankId) => {
        try {
            await api.delete(`/ranks/${rankId}/`);
            await fetchData();
            setShowDeleteModal(false);
            setSelectedRank(null);
            showNotification('Rank deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting rank:', error);
            showNotification('Failed to delete rank. It may be in use.', 'error');
        }
    };

    const showNotification = (message, type) => {
        // Implementation for showing notifications
        console.log(`${type}: ${message}`);
    };

    // Filter and sort ranks
    const filteredRanks = ranks.filter(rank => {
        const matchesSearch = rank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rank.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBranch = filterBranch === 'all' || rank.branch === filterBranch;

        let matchesType = true;
        if (filterType === 'officer') matchesType = rank.is_officer;
        else if (filterType === 'enlisted') matchesType = rank.is_enlisted;
        else if (filterType === 'warrant') matchesType = rank.is_warrant;

        return matchesSearch && matchesBranch && matchesType;
    });

    const sortedRanks = [...filteredRanks].sort((a, b) => {
        switch (sortBy) {
            case 'tier':
                if (a.branch === b.branch) {
                    return a.tier - b.tier;
                }
                return a.branch_name.localeCompare(b.branch_name);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'branch':
                return a.branch_name.localeCompare(b.branch_name);
            default:
                return 0;
        }
    });

    // Group ranks by branch for better display
    const ranksByBranch = sortedRanks.reduce((acc, rank) => {
        const branchName = rank.branch_name || 'Unknown';
        if (!acc[branchName]) {
            acc[branchName] = [];
        }
        acc[branchName].push(rank);
        return acc;
    }, {});

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <Shield size={24} />
                        <h2>Rank Management</h2>
                        <span className="count-badge">{ranks.length} ranks</span>
                    </div>
                    <div className="section-actions">
                        <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            Add Rank
                        </button>
                    </div>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search ranks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                            <option value="all">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="officer">Officers</option>
                            <option value="enlisted">Enlisted</option>
                            <option value="warrant">Warrant Officers</option>
                        </select>
                    </div>

                    <div className="sort-group">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="tier">Sort by Tier</option>
                            <option value="name">Sort by Name</option>
                            <option value="branch">Sort by Branch</option>
                        </select>
                    </div>
                </div>

                <div className="rank-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading ranks...</p>
                        </div>
                    ) : Object.keys(ranksByBranch).length === 0 ? (
                        <div className="empty-state">
                            <Shield size={48} />
                            <h3>No ranks found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="ranks-by-branch">
                            {Object.entries(ranksByBranch).map(([branchName, branchRanks]) => (
                                <div key={branchName} className="branch-section">
                                    <h3 className="branch-title">
                                        <Shield size={20} />
                                        {branchName}
                                        <span className="branch-count">{branchRanks.length} ranks</span>
                                    </h3>

                                    <div className="rank-categories">
                                        <RankCategory
                                            title="Officers"
                                            ranks={branchRanks.filter(r => r.is_officer)}
                                            onEdit={(rank) => {
                                                setSelectedRank(rank);
                                                setShowEditModal(true);
                                            }}
                                            onDelete={(rank) => {
                                                setSelectedRank(rank);
                                                setShowDeleteModal(true);
                                            }}
                                        />

                                        <RankCategory
                                            title="Warrant Officers"
                                            ranks={branchRanks.filter(r => r.is_warrant)}
                                            onEdit={(rank) => {
                                                setSelectedRank(rank);
                                                setShowEditModal(true);
                                            }}
                                            onDelete={(rank) => {
                                                setSelectedRank(rank);
                                                setShowDeleteModal(true);
                                            }}
                                        />

                                        <RankCategory
                                            title="Enlisted"
                                            ranks={branchRanks.filter(r => r.is_enlisted)}
                                            onEdit={(rank) => {
                                                setSelectedRank(rank);
                                                setShowEditModal(true);
                                            }}
                                            onDelete={(rank) => {
                                                setSelectedRank(rank);
                                                setShowDeleteModal(true);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateRankModal
                    branches={branches}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                />
            )}

            {showEditModal && selectedRank && (
                <EditRankModal
                    rank={selectedRank}
                    branches={branches}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedRank(null);
                    }}
                    onUpdate={handleUpdate}
                />
            )}

            {showDeleteModal && selectedRank && (
                <DeleteRankModal
                    rank={selectedRank}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedRank(null);
                    }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

// Rank Category Component
const RankCategory = ({ title, ranks, onEdit, onDelete }) => {
    if (ranks.length === 0) return null;

    const sortedRanks = [...ranks].sort((a, b) => b.tier - a.tier);

    return (
        <div className="rank-category">
            <h4 className="category-title">{title}</h4>
            <div className="rank-cards">
                {sortedRanks.map(rank => (
                    <div key={rank.id} className="rank-card">
                        <div className="rank-card-header">
                            {rank.insignia_image_url && (
                                <img
                                    src={rank.insignia_image_url}
                                    alt={rank.name}
                                    className="rank-insignia-large"
                                />
                            )}
                            <div className="rank-info">
                                <h5>{rank.name}</h5>
                                <span className="rank-abbr-large">{rank.abbreviation}</span>
                            </div>
                        </div>

                        <div className="rank-details">
                            <div className="detail-item">
                                <span className="detail-label">Tier:</span>
                                <span className="detail-value">{rank.tier}</span>
                            </div>
                            {rank.min_time_in_service > 0 && (
                                <div className="detail-item">
                                    <span className="detail-label">Time in Service:</span>
                                    <span className="detail-value">{rank.min_time_in_service} days</span>
                                </div>
                            )}
                            {rank.min_time_in_grade > 0 && (
                                <div className="detail-item">
                                    <span className="detail-label">Time in Grade:</span>
                                    <span className="detail-value">{rank.min_time_in_grade} days</span>
                                </div>
                            )}
                            {rank.color_code && (
                                <div className="detail-item">
                                    <span className="detail-label">Color:</span>
                                    <div className="color-preview" style={{ backgroundColor: rank.color_code }}>
                                        {rank.color_code}
                                    </div>
                                </div>
                            )}
                        </div>

                        {rank.description && (
                            <p className="rank-description">{rank.description}</p>
                        )}

                        <div className="rank-actions">
                            <button className="icon-btn" onClick={() => onEdit(rank)}>
                                <Edit size={16} />
                            </button>
                            <button className="icon-btn danger" onClick={() => onDelete(rank)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankManagement;
import React, { useState, useEffect } from 'react';
import {
    Shield, Search, Filter, Plus, Edit, Trash2, ChevronUp,
    ChevronDown, X, AlertCircle, Check, Upload, Star,
    FileText, Award, History, Clock, Settings, User, Users
} from 'lucide-react';
import api from '../../../../services/api';
import './ManagementSections.css';

// Import existing modals
import CreateRankModal from "../../../modals/CreateRankModal";
import EditRankModal from "../../../modals/EditRankModal";
import DeleteRankModal from "../../../modals/DeleteRankModal";

// Import promotion modals
import CreatePromotionRequirementTypeModal from "../../../modals/CreatePromotionRequirementTypeModal";
import EditPromotionRequirementTypeModal from "../../../modals/EditPromotionRequirementTypeModal";
import CreateRankPromotionRequirementModal from "../../../modals/CreateRankPromotionRequirementModal";
import EditRankPromotionRequirementModal from "../../../modals/EditRankPromotionRequirementModal";
import ViewUserRankHistoryModal from "../../../modals/ViewUserRankHistoryModal";
import PromotionModal from "../../../modals/PromotionModal";
import { ForcePromotionModal, WaiverCreationModal, PromotionHistoryModal } from "../../../modals/PromotionAdminModals";

const RankManagement = () => {
    // State for tabs
    const [activeTab, setActiveTab] = useState('ranks');

    // Existing rank state
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

    // Promotion requirement types state
    const [requirementTypes, setRequirementTypes] = useState([]);
    const [selectedRequirementType, setSelectedRequirementType] = useState(null);
    const [showCreateRequirementTypeModal, setShowCreateRequirementTypeModal] = useState(false);
    const [showEditRequirementTypeModal, setShowEditRequirementTypeModal] = useState(false);

    // Rank promotion requirements state
    const [promotionRequirements, setPromotionRequirements] = useState([]);
    const [selectedPromoRequirement, setSelectedPromoRequirement] = useState(null);
    const [showCreatePromoRequirementModal, setShowCreatePromoRequirementModal] = useState(false);
    const [showEditPromoRequirementModal, setShowEditPromoRequirementModal] = useState(false);

    // User rank history state
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRankHistory, setUserRankHistory] = useState([]);
    const [showRankHistoryModal, setShowRankHistoryModal] = useState(false);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [showForcePromotionModal, setShowForcePromotionModal] = useState(false);
    const [promotionProgress, setPromotionProgress] = useState(null);

    // Waivers state
    const [waivers, setWaivers] = useState([]);
    const [selectedWaiver, setSelectedWaiver] = useState(null);
    const [showWaiverModal, setShowWaiverModal] = useState(false);

    // Additional state
    const [roles, setRoles] = useState([]);
    const [certificates, setCertificates] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Always fetch ranks and branches for dropdowns
            const [ranksRes, branchesRes] = await Promise.all([
                api.get('/ranks/'),
                api.get('/branches/')
            ]);

            setRanks(ranksRes.data.results || ranksRes.data);
            setBranches(branchesRes.data.results || branchesRes.data);

            // Fetch data based on active tab
            switch (activeTab) {
                case 'requirement-types':
                    const typesRes = await api.get('/promotions/requirement-types/');
                    setRequirementTypes(typesRes.data.results || typesRes.data);
                    break;

                case 'requirements':
                    const [reqsRes, rolesRes, certsRes] = await Promise.all([
                        api.get('/promotions/requirements/'),
                        api.get('/roles/'),
                        api.get('/certificates/')
                    ]);
                    setPromotionRequirements(reqsRes.data.results || reqsRes.data);
                    setRoles(rolesRes.data.results || rolesRes.data);
                    setCertificates(certsRes.data.results || certsRes.data);
                    break;

                case 'history':
                    const usersRes = await api.get('/users/');
                    setUsers(usersRes.data.results || usersRes.data);
                    break;

                case 'waivers':
                    const waiversRes = await api.get('/promotions/waivers/');
                    setWaivers(waiversRes.data.results || waiversRes.data);
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        // Implementation for showing notifications
        console.log(`${type}: ${message}`);
        // You can integrate with a toast library here
    };

    // Existing rank handlers
    const handleCreateRank = async (rankData) => {
        try {
            await api.post('/ranks/', rankData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchData();
            setShowCreateModal(false);
            showNotification('Rank created successfully', 'success');
        } catch (error) {
            console.error('Error creating rank:', error);
            showNotification('Failed to create rank', 'error');
        }
    };

    const handleUpdateRank = async (rankId, rankData) => {
        try {
            await api.put(`/ranks/${rankId}/`, rankData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchData();
            setShowEditModal(false);
            setSelectedRank(null);
            showNotification('Rank updated successfully', 'success');
        } catch (error) {
            console.error('Error updating rank:', error);
            showNotification('Failed to update rank', 'error');
        }
    };

    const handleDeleteRank = async (rankId) => {
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

    // Promotion requirement type handlers
    const handleCreateRequirementType = async (data) => {
        try {
            await api.post('/promotions/requirement-types/', data);
            await fetchData();
            setShowCreateRequirementTypeModal(false);
            showNotification('Requirement type created successfully', 'success');
        } catch (error) {
            console.error('Error creating requirement type:', error);
            showNotification('Failed to create requirement type', 'error');
        }
    };

    const handleUpdateRequirementType = async (id, data) => {
        try {
            await api.put(`/promotions/requirement-types/${id}/`, data);
            await fetchData();
            setShowEditRequirementTypeModal(false);
            setSelectedRequirementType(null);
            showNotification('Requirement type updated successfully', 'success');
        } catch (error) {
            console.error('Error updating requirement type:', error);
            showNotification('Failed to update requirement type', 'error');
        }
    };

    const handleDeleteRequirementType = async (id) => {
        if (window.confirm('Are you sure you want to delete this requirement type?')) {
            try {
                await api.delete(`/promotions/requirement-types/${id}/`);
                await fetchData();
                showNotification('Requirement type deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting requirement type:', error);
                showNotification('Failed to delete requirement type', 'error');
            }
        }
    };

    // Rank promotion requirement handlers
    const handleCreatePromoRequirement = async (data) => {
        try {
            await api.post('/promotions/requirements/', data);
            await fetchData();
            setShowCreatePromoRequirementModal(false);
            showNotification('Promotion requirement created successfully', 'success');
        } catch (error) {
            console.error('Error creating promotion requirement:', error);
            showNotification('Failed to create promotion requirement', 'error');
        }
    };

    const handleUpdatePromoRequirement = async (id, data) => {
        try {
            await api.put(`/promotions/requirements/${id}/`, data);
            await fetchData();
            setShowEditPromoRequirementModal(false);
            setSelectedPromoRequirement(null);
            showNotification('Promotion requirement updated successfully', 'success');
        } catch (error) {
            console.error('Error updating promotion requirement:', error);
            showNotification('Failed to update promotion requirement', 'error');
        }
    };

    const handleDeletePromoRequirement = async (id) => {
        if (window.confirm('Are you sure you want to delete this promotion requirement?')) {
            try {
                await api.delete(`/promotions/requirements/${id}/`);
                await fetchData();
                showNotification('Promotion requirement deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting promotion requirement:', error);
                showNotification('Failed to delete promotion requirement', 'error');
            }
        }
    };

    // User rank history handlers
    const fetchUserRankHistory = async (userId) => {
        try {
            const response = await api.get('/promotions/rank-history/', {
                params: { user: userId }
            });
            setUserRankHistory(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching rank history:', error);
            showNotification('Failed to load rank history', 'error');
        }
    };

    const fetchPromotionProgress = async (userId) => {
        try {
            const response = await api.get(`/promotions/progress/user/${userId}/`);
            setPromotionProgress(response.data);
        } catch (error) {
            console.error('Error fetching promotion progress:', error);
        }
    };

    const handleViewRankHistory = async (user) => {
        setSelectedUser(user);
        await fetchUserRankHistory(user.id);
        setShowRankHistoryModal(true);
    };

    const handlePromoteUser = async (user) => {
        setSelectedUser(user);
        await fetchPromotionProgress(user.id);
        setShowPromotionModal(true);
    };

    const handleForcePromote = async (user) => {
        setSelectedUser(user);
        await fetchPromotionProgress(user.id);
        setShowForcePromotionModal(true);
    };

    const handlePromotion = async (userId, rankId, reason) => {
        try {
            await api.post('/promotions/promote/', {
                user_id: userId,
                new_rank_id: rankId,
                notes: reason
            });
            await fetchData();
            setShowPromotionModal(false);
            setShowForcePromotionModal(false);
            showNotification('User promoted successfully', 'success');
        } catch (error) {
            console.error('Error promoting user:', error);
            showNotification('Failed to promote user', 'error');
        }
    };

    // Waiver handlers
    const handleCreateWaiver = async (waiver) => {
        setShowWaiverModal(false);
        await fetchData();
        showNotification('Waiver created successfully', 'success');
    };

    const handleRevokeWaiver = async (waiverId) => {
        if (window.confirm('Are you sure you want to revoke this waiver?')) {
            try {
                await api.post(`/promotions/waivers/${waiverId}/revoke/`);
                await fetchData();
                showNotification('Waiver revoked successfully', 'success');
            } catch (error) {
                console.error('Error revoking waiver:', error);
                showNotification('Failed to revoke waiver', 'error');
            }
        }
    };

    // Tab configuration
    const tabs = [
        { id: 'ranks', label: 'Ranks', icon: Shield },
        { id: 'requirement-types', label: 'Requirement Types', icon: FileText },
        { id: 'requirements', label: 'Promotion Requirements', icon: Award },
        { id: 'history', label: 'Rank History', icon: History },
        { id: 'waivers', label: 'Waivers', icon: Clock }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'ranks':
                return <RanksTab
                    ranks={ranks}
                    branches={branches}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterBranch={filterBranch}
                    setFilterBranch={setFilterBranch}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onCreateRank={() => setShowCreateModal(true)}
                    onEditRank={(rank) => {
                        setSelectedRank(rank);
                        setShowEditModal(true);
                    }}
                    onDeleteRank={(rank) => {
                        setSelectedRank(rank);
                        setShowDeleteModal(true);
                    }}
                />;

            case 'requirement-types':
                return <RequirementTypesTab
                    requirementTypes={requirementTypes}
                    loading={loading}
                    onCreateType={() => setShowCreateRequirementTypeModal(true)}
                    onEditType={(type) => {
                        setSelectedRequirementType(type);
                        setShowEditRequirementTypeModal(true);
                    }}
                    onDeleteType={handleDeleteRequirementType}
                />;

            case 'requirements':
                return <PromotionRequirementsTab
                    requirements={promotionRequirements}
                    ranks={ranks}
                    loading={loading}
                    onCreateRequirement={() => setShowCreatePromoRequirementModal(true)}
                    onEditRequirement={(req) => {
                        setSelectedPromoRequirement(req);
                        setShowEditPromoRequirementModal(true);
                    }}
                    onDeleteRequirement={handleDeletePromoRequirement}
                />;

            case 'history':
                return <RankHistoryTab
                    users={users}
                    loading={loading}
                    onViewHistory={handleViewRankHistory}
                    onPromoteUser={handlePromoteUser}
                    onForcePromote={handleForcePromote}
                />;

            case 'waivers':
                return <WaiversTab
                    waivers={waivers}
                    loading={loading}
                    onRevokeWaiver={handleRevokeWaiver}
                />;

            default:
                return null;
        }
    };

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <Shield size={24} />
                        <h2>Rank & Promotion Management</h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="management-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {renderTabContent()}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateRankModal
                    branches={branches}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateRank}
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
                    onUpdate={handleUpdateRank}
                />
            )}

            {showDeleteModal && selectedRank && (
                <DeleteRankModal
                    rank={selectedRank}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedRank(null);
                    }}
                    onDelete={handleDeleteRank}
                />
            )}

            {showCreateRequirementTypeModal && (
                <CreatePromotionRequirementTypeModal
                    onClose={() => setShowCreateRequirementTypeModal(false)}
                    onCreate={handleCreateRequirementType}
                />
            )}

            {showEditRequirementTypeModal && selectedRequirementType && (
                <EditPromotionRequirementTypeModal
                    requirementType={selectedRequirementType}
                    onClose={() => {
                        setShowEditRequirementTypeModal(false);
                        setSelectedRequirementType(null);
                    }}
                    onUpdate={handleUpdateRequirementType}
                />
            )}

            {showCreatePromoRequirementModal && (
                <CreateRankPromotionRequirementModal
                    ranks={ranks}
                    requirementTypes={requirementTypes}
                    roles={roles}
                    certificates={certificates}
                    onClose={() => setShowCreatePromoRequirementModal(false)}
                    onCreate={handleCreatePromoRequirement}
                />
            )}

            {showEditPromoRequirementModal && selectedPromoRequirement && (
                <EditRankPromotionRequirementModal
                    requirement={selectedPromoRequirement}
                    ranks={ranks}
                    requirementTypes={requirementTypes}
                    roles={roles}
                    certificates={certificates}
                    onClose={() => {
                        setShowEditPromoRequirementModal(false);
                        setSelectedPromoRequirement(null);
                    }}
                    onUpdate={handleUpdatePromoRequirement}
                />
            )}

            {showRankHistoryModal && selectedUser && (
                <ViewUserRankHistoryModal
                    user={selectedUser}
                    rankHistory={userRankHistory}
                    onClose={() => {
                        setShowRankHistoryModal(false);
                        setSelectedUser(null);
                    }}
                    onAddEntry={(user) => {
                        setShowRankHistoryModal(false);
                        handlePromoteUser(user);
                    }}
                    onEditEntry={(entry) => {
                        // Handle edit rank history entry
                        console.log('Edit rank history entry:', entry);
                    }}
                />
            )}

            {showPromotionModal && selectedUser && (
                <PromotionModal
                    user={selectedUser}
                    onClose={() => {
                        setShowPromotionModal(false);
                        setSelectedUser(null);
                    }}
                    onPromote={(rankId, reason) => {
                        handlePromotion(selectedUser.id, rankId, reason);
                    }}
                />
            )}

            {showForcePromotionModal && selectedUser && (
                <ForcePromotionModal
                    user={selectedUser}
                    currentRank={selectedUser.current_rank}
                    nextRank={promotionProgress?.next_rank}
                    promotionProgress={promotionProgress}
                    onClose={() => {
                        setShowForcePromotionModal(false);
                        setSelectedUser(null);
                    }}
                    onPromote={(data) => {
                        setShowForcePromotionModal(false);
                        showNotification('User promoted successfully', 'success');
                        fetchData();
                    }}
                />
            )}

            {showWaiverModal && (
                <WaiverCreationModal
                    user={selectedUser}
                    requirement={selectedPromoRequirement}
                    onClose={() => setShowWaiverModal(false)}
                    onWaiver={handleCreateWaiver}
                />
            )}
        </div>
    );
};

// Individual Tab Components

const RanksTab = ({ ranks, branches, loading, searchTerm, setSearchTerm, filterBranch, setFilterBranch, filterType, setFilterType, sortBy, setSortBy, onCreateRank, onEditRank, onDeleteRank }) => {
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
                if (a.branch === b.branch) return a.tier - b.tier;
                return a.branch_name.localeCompare(b.branch_name);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'branch':
                return a.branch_name.localeCompare(b.branch_name);
            default:
                return 0;
        }
    });

    const ranksByBranch = sortedRanks.reduce((acc, rank) => {
        const branchName = rank.branch_name || 'Unknown';
        if (!acc[branchName]) acc[branchName] = [];
        acc[branchName].push(rank);
        return acc;
    }, {});

    return (
        <>
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

                <button className="action-btn primary" onClick={onCreateRank}>
                    <Plus size={18} />
                    Add Rank
                </button>
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
                                        onEdit={onEditRank}
                                        onDelete={onDeleteRank}
                                    />
                                    <RankCategory
                                        title="Warrant Officers"
                                        ranks={branchRanks.filter(r => r.is_warrant)}
                                        onEdit={onEditRank}
                                        onDelete={onDeleteRank}
                                    />
                                    <RankCategory
                                        title="Enlisted"
                                        ranks={branchRanks.filter(r => r.is_enlisted)}
                                        onEdit={onEditRank}
                                        onDelete={onDeleteRank}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

const RequirementTypesTab = ({ requirementTypes, loading, onCreateType, onEditType, onDeleteType }) => {
    const typesByCategory = requirementTypes.reduce((acc, type) => {
        if (!acc[type.category]) acc[type.category] = [];
        acc[type.category].push(type);
        return acc;
    }, {});

    const categoryLabels = {
        'time_based': 'Time-Based Requirements',
        'position_based': 'Position-Based Requirements',
        'qualification_based': 'Qualification-Based Requirements',
        'deployment_based': 'Deployment-Based Requirements',
        'performance_based': 'Performance-Based Requirements',
        'administrative': 'Administrative Requirements'
    };

    return (
        <>
            <div className="section-filters">
                <button className="action-btn primary" onClick={onCreateType}>
                    <Plus size={18} />
                    Add Requirement Type
                </button>
            </div>

            <div className="requirement-types-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading requirement types...</p>
                    </div>
                ) : Object.keys(typesByCategory).length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No requirement types found</h3>
                        <p>Click "Add Requirement Type" to create one</p>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {Object.entries(typesByCategory).map(([category, types]) => (
                            <div key={category} className="category-section">
                                <h3 className="category-header">
                                    <FileText size={20} />
                                    {categoryLabels[category] || category}
                                </h3>
                                <div className="types-list">
                                    {types.map(type => (
                                        <div key={type.id} className="type-card">
                                            <div className="type-header">
                                                <h4>{type.name}</h4>
                                                <div className="type-actions">
                                                    <button className="icon-btn" onClick={() => onEditType(type)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn danger" onClick={() => onDeleteType(type.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="type-code">Code: {type.code}</p>
                                            <p className="type-evaluation">Type: {type.evaluation_type}</p>
                                            {type.description && (
                                                <p className="type-description">{type.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

const PromotionRequirementsTab = ({ requirements, ranks, loading, onCreateRequirement, onEditRequirement, onDeleteRequirement }) => {
    const requirementsByRank = requirements.reduce((acc, req) => {
        const rankKey = req.rank_details?.abbreviation || req.rank;
        if (!acc[rankKey]) acc[rankKey] = [];
        acc[rankKey].push(req);
        return acc;
    }, {});

    return (
        <>
            <div className="section-filters">
                <button className="action-btn primary" onClick={onCreateRequirement}>
                    <Plus size={18} />
                    Add Promotion Requirement
                </button>
            </div>

            <div className="promotion-requirements-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading promotion requirements...</p>
                    </div>
                ) : Object.keys(requirementsByRank).length === 0 ? (
                    <div className="empty-state">
                        <Award size={48} />
                        <h3>No promotion requirements found</h3>
                        <p>Click "Add Promotion Requirement" to create one</p>
                    </div>
                ) : (
                    <div className="ranks-requirements">
                        {Object.entries(requirementsByRank).map(([rankAbbr, reqs]) => (
                            <div key={rankAbbr} className="rank-requirements-section">
                                <h3 className="rank-header">
                                    <Award size={20} />
                                    Requirements for {rankAbbr}
                                </h3>
                                <div className="requirements-list">
                                    {reqs.map(req => (
                                        <div key={req.id} className="requirement-card">
                                            <div className="requirement-header">
                                                <h4>{req.display_text}</h4>
                                                <div className="requirement-actions">
                                                    <button className="icon-btn" onClick={() => onEditRequirement(req)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn danger" onClick={() => onDeleteRequirement(req.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="requirement-details">
                                                <span className="detail-item">
                                                    Type: {req.requirement_type_details?.name || 'Unknown'}
                                                </span>
                                                <span className="detail-item">
                                                    Value: {req.value_required}
                                                </span>
                                                {req.is_mandatory ? (
                                                    <span className="badge mandatory">Mandatory</span>
                                                ) : (
                                                    <span className="badge optional">Optional</span>
                                                )}
                                                {req.waiverable && (
                                                    <span className="badge waiverable">Waiverable</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

const RankHistoryTab = ({ users, loading, onViewHistory, onPromoteUser, onForcePromote }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.service_number && user.service_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="rank-history-content">
            <div className="section-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="data-table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>Service Number</th>
                            <th>Current Rank</th>
                            <th>Branch</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="user-cell">
                                    <img
                                        src={user.avatar_url || '/placeholder-avatar.png'}
                                        alt={user.username}
                                        className="user-avatar"
                                    />
                                    <div>
                                        <div className="user-name">{user.username}</div>
                                    </div>
                                </td>
                                <td>{user.service_number || '-'}</td>
                                <td className="rank-cell">
                                    {user.current_rank ? (
                                        <>
                                            {user.current_rank.insignia_image_url && (
                                                <img
                                                    src={user.current_rank.insignia_image_url}
                                                    alt={user.current_rank.name}
                                                    className="rank-insignia"
                                                />
                                            )}
                                            <span>{user.current_rank.name}</span>
                                        </>
                                    ) : (
                                        <span className="no-data">No Rank</span>
                                    )}
                                </td>
                                <td>{user.branch?.name || '-'}</td>
                                <td className="date-cell">
                                    <Clock size={14} />
                                    {new Date(user.join_date).toLocaleDateString()}
                                </td>
                                <td className="action-cell">
                                    <button
                                        className="icon-btn"
                                        onClick={() => onViewHistory(user)}
                                        title="View Rank History"
                                    >
                                        <History size={16} />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={() => onPromoteUser(user)}
                                        title="Promote User"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={() => onForcePromote(user)}
                                        title="Force Promote"
                                    >
                                        <Star size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const WaiversTab = ({ waivers, loading, onRevokeWaiver }) => {
    const activeWaivers = waivers.filter(w => w.is_active);
    const expiredWaivers = waivers.filter(w => !w.is_active);

    return (
        <div className="waivers-content">
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading waivers...</p>
                </div>
            ) : waivers.length === 0 ? (
                <div className="empty-state">
                    <Clock size={48} />
                    <h3>No waivers found</h3>
                    <p>Waivers will appear here when created</p>
                </div>
            ) : (
                <>
                    {activeWaivers.length > 0 && (
                        <div className="waivers-section">
                            <h3>Active Waivers</h3>
                            <div className="waivers-grid">
                                {activeWaivers.map(waiver => (
                                    <div key={waiver.id} className="waiver-card">
                                        <div className="waiver-header">
                                            <h4>{waiver.user_details?.username || 'Unknown User'}</h4>
                                            <button
                                                className="action-btn reject"
                                                onClick={() => onRevokeWaiver(waiver.id)}
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                        <div className="waiver-details">
                                            <p><strong>Requirement:</strong> {waiver.requirement_details?.display_text}</p>
                                            <p><strong>Reason:</strong> {waiver.reason}</p>
                                            <p><strong>Waived by:</strong> {waiver.waived_by_username}</p>
                                            <p><strong>Date:</strong> {new Date(waiver.waiver_date).toLocaleDateString()}</p>
                                            {waiver.expiry_date && (
                                                <p><strong>Expires:</strong> {new Date(waiver.expiry_date).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {expiredWaivers.length > 0 && (
                        <div className="waivers-section">
                            <h3>Expired/Revoked Waivers</h3>
                            <div className="waivers-grid">
                                {expiredWaivers.map(waiver => (
                                    <div key={waiver.id} className="waiver-card expired">
                                        <div className="waiver-header">
                                            <h4>{waiver.user_details?.username || 'Unknown User'}</h4>
                                            <span className="badge expired">Expired</span>
                                        </div>
                                        <div className="waiver-details">
                                            <p><strong>Requirement:</strong> {waiver.requirement_details?.display_text}</p>
                                            <p><strong>Reason:</strong> {waiver.reason}</p>
                                            <p><strong>Waived by:</strong> {waiver.waived_by_username}</p>
                                            <p><strong>Date:</strong> {new Date(waiver.waiver_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
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
                            {(rank.insignia_display_url || rank.insignia_image_url) && (
                                <img
                                    src={rank.insignia_display_url || rank.insignia_image_url}
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
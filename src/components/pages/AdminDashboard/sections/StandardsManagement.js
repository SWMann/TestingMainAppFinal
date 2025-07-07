import React, { useState, useEffect } from 'react';
import {
    BookOpen, Search, Filter, Plus, Edit, Trash2, FileText,
    ChevronRight, ChevronDown, Clock, User, Calendar, Tag,
    CheckCircle, AlertCircle, Archive, Eye, Copy, FolderOpen,
    Video, Download, ExternalLink, Shield, Info, X
} from 'lucide-react';
import api from '../../../../services/api';
import './ManagementSections.css';
import CreateStandardGroupModal from '../../../modals/CreateStandardGroupModal';
import EditStandardGroupModal from '../../../modals/EditStandardGroupModal';
import CreateStandardSubGroupModal from '../../../modals/CreateStandardSubGroupModal';
import EditStandardSubGroupModal from '../../../modals/EditStandardSubGroupModal';
import CreateStandardModal from '../../../modals/CreateStandardModal';
import EditStandardModal from '../../../modals/EditStandardModal';
import ViewStandardModal from '../../../modals/ViewStandardModal';
import ApproveStandardModal from '../../../modals/ApproveStandardModal';

const StandardsManagement = () => {
    const [activeTab, setActiveTab] = useState('standards');
    const [standardGroups, setStandardGroups] = useState([]);
    const [standardSubGroups, setStandardSubGroups] = useState([]);
    const [standards, setStandards] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [expandedSubGroups, setExpandedSubGroups] = useState(new Set());

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterRequired, setFilterRequired] = useState('all');

    // Selected items
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSubGroup, setSelectedSubGroup] = useState(null);
    const [selectedStandard, setSelectedStandard] = useState(null);

    // Modals
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    const [showCreateSubGroupModal, setShowCreateSubGroupModal] = useState(false);
    const [showEditSubGroupModal, setShowEditSubGroupModal] = useState(false);
    const [showCreateStandardModal, setShowCreateStandardModal] = useState(false);
    const [showEditStandardModal, setShowEditStandardModal] = useState(false);
    const [showViewStandardModal, setShowViewStandardModal] = useState(false);
    const [showApproveStandardModal, setShowApproveStandardModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [groupsRes, subGroupsRes, standardsRes, branchesRes] = await Promise.all([
                api.get('/sops/groups/'),
                api.get('/sops/subgroups/'),
                api.get('/sops/standards/'),
                api.get('/branches/')
            ]);

            setStandardGroups(groupsRes.data.results || groupsRes.data);
            setStandardSubGroups(subGroupsRes.data.results || subGroupsRes.data);
            setStandards(standardsRes.data.results || standardsRes.data);
            setBranches(branchesRes.data.results || branchesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load standards data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
        // Implement your notification system here
    };

    const toggleGroupExpansion = (groupId) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const toggleSubGroupExpansion = (subGroupId) => {
        const newExpanded = new Set(expandedSubGroups);
        if (newExpanded.has(subGroupId)) {
            newExpanded.delete(subGroupId);
        } else {
            newExpanded.add(subGroupId);
        }
        setExpandedSubGroups(newExpanded);
    };

    // Handler functions for fetching full details before edit/view
    const handleEditGroup = async (group) => {
        try {
            // Fetch full group details
            const response = await api.get(`/sops/groups/${group.id}/`);
            setSelectedGroup(response.data);
            setShowEditGroupModal(true);
        } catch (error) {
            console.error('Error fetching group details:', error);
            showNotification('Failed to load group details', 'error');
        }
    };

    const handleEditSubGroup = async (subGroup) => {
        try {
            // Fetch full subgroup details
            const response = await api.get(`/sops/subgroups/${subGroup.id}/`);
            setSelectedSubGroup(response.data);
            setShowEditSubGroupModal(true);
        } catch (error) {
            console.error('Error fetching subgroup details:', error);
            showNotification('Failed to load subgroup details', 'error');
        }
    };

    const handleEditStandard = async (standard) => {
        try {
            // Fetch full standard details including content
            const response = await api.get(`/sops/standards/${standard.id}/`);
            setSelectedStandard(response.data);
            setShowEditStandardModal(true);
        } catch (error) {
            console.error('Error fetching standard details:', error);
            showNotification('Failed to load standard details', 'error');
        }
    };

    const handleViewStandard = async (standard) => {
        try {
            // Fetch full standard details including content
            const response = await api.get(`/sops/standards/${standard.id}/`);
            setSelectedStandard(response.data);
            setShowViewStandardModal(true);
        } catch (error) {
            console.error('Error fetching standard details:', error);
            showNotification('Failed to load standard details', 'error');
        }
    };

    const handleOpenApproveModal = async (standard) => {
        try {
            const response = await api.get(`/sops/standards/${standard.id}/`);
            setSelectedStandard(response.data);
            setShowApproveStandardModal(true);
        } catch (error) {
            console.error('Error fetching standard details:', error);
            showNotification('Failed to load standard details', 'error');
        }
    };

    // CRUD Operations
    const handleCreateGroup = async (data) => {
        try {
            await api.post('/sops/groups/', data);
            await fetchData();
            setShowCreateGroupModal(false);
            showNotification('Standard group created successfully', 'success');
        } catch (error) {
            console.error('Error creating group:', error);
            showNotification('Failed to create standard group', 'error');
        }
    };

    const handleUpdateGroup = async (groupId, data) => {
        try {
            await api.put(`/sops/groups/${groupId}/`, data);
            await fetchData();
            setShowEditGroupModal(false);
            setSelectedGroup(null);
            showNotification('Standard group updated successfully', 'success');
        } catch (error) {
            console.error('Error updating group:', error);
            showNotification('Failed to update standard group', 'error');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to delete this standard group? This will also delete all subgroups and standards within it.')) {
            return;
        }

        try {
            await api.delete(`/sops/groups/${groupId}/`);
            await fetchData();
            showNotification('Standard group deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting group:', error);
            showNotification('Failed to delete standard group', 'error');
        }
    };

    const handleCreateSubGroup = async (data) => {
        try {
            await api.post('/sops/subgroups/', data);
            await fetchData();
            setShowCreateSubGroupModal(false);
            showNotification('Subgroup created successfully', 'success');
        } catch (error) {
            console.error('Error creating subgroup:', error);
            showNotification('Failed to create subgroup', 'error');
        }
    };

    const handleUpdateSubGroup = async (subGroupId, data) => {
        try {
            await api.put(`/sops/subgroups/${subGroupId}/`, data);
            await fetchData();
            setShowEditSubGroupModal(false);
            setSelectedSubGroup(null);
            showNotification('Subgroup updated successfully', 'success');
        } catch (error) {
            console.error('Error updating subgroup:', error);
            showNotification('Failed to update subgroup', 'error');
        }
    };

    const handleDeleteSubGroup = async (subGroupId) => {
        if (!window.confirm('Are you sure you want to delete this subgroup? This will also delete all standards within it.')) {
            return;
        }

        try {
            await api.delete(`/sops/subgroups/${subGroupId}/`);
            await fetchData();
            showNotification('Subgroup deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting subgroup:', error);
            showNotification('Failed to delete subgroup', 'error');
        }
    };

    const handleCreateStandard = async (data) => {
        try {
            await api.post('/sops/standards/', data);
            await fetchData();
            setShowCreateStandardModal(false);
            showNotification('Standard created successfully', 'success');
        } catch (error) {
            console.error('Error creating standard:', error);
            showNotification('Failed to create standard', 'error');
        }
    };

    const handleUpdateStandard = async (standardId, data) => {
        try {
            await api.put(`/sops/standards/${standardId}/`, data);
            await fetchData();
            setShowEditStandardModal(false);
            setSelectedStandard(null);
            showNotification('Standard updated successfully', 'success');
        } catch (error) {
            console.error('Error updating standard:', error);
            showNotification('Failed to update standard', 'error');
        }
    };

    const handleDeleteStandard = async (standardId) => {
        if (!window.confirm('Are you sure you want to delete this standard?')) {
            return;
        }

        try {
            await api.delete(`/sops/standards/${standardId}/`);
            await fetchData();
            showNotification('Standard deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting standard:', error);
            showNotification('Failed to delete standard', 'error');
        }
    };

    const handleApproveStandard = async (standardId, approvalData) => {
        try {
            await api.post(`/sops/standards/${standardId}/approve/`, approvalData);
            await fetchData();
            setShowApproveStandardModal(false);
            setSelectedStandard(null);
            showNotification('Standard approval status updated', 'success');
        } catch (error) {
            console.error('Error approving standard:', error);
            showNotification('Failed to update approval status', 'error');
        }
    };

    // Filter standards
    const filteredStandards = standards.filter(standard => {
        const matchesSearch =
            standard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (standard.document_number && standard.document_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (standard.content && standard.content.toLowerCase().includes(searchTerm.toLowerCase()));

        const subGroup = standardSubGroups.find(sg => sg.id === standard.standard_sub_group);
        const group = subGroup ? standardGroups.find(g => g.id === subGroup.standard_group) : null;

        const matchesBranch = filterBranch === 'all' || (group && group.branch === filterBranch);
        const matchesStatus = filterStatus === 'all' || standard.status === filterStatus;
        const matchesDifficulty = filterDifficulty === 'all' || standard.difficulty_level === filterDifficulty;
        const matchesRequired = filterRequired === 'all' ||
            (filterRequired === 'required' && standard.is_required) ||
            (filterRequired === 'optional' && !standard.is_required);

        return matchesSearch && matchesBranch && matchesStatus && matchesDifficulty && matchesRequired;
    });

    const renderStandardsView = () => (
        <>
            <div className="section-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search standards..."
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
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>

                <div className="filter-group">
                    <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                        <option value="all">All Levels</option>
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="filter-group">
                    <select value={filterRequired} onChange={(e) => setFilterRequired(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                    </select>
                </div>
            </div>

            <div className="data-table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading standards...</p>
                    </div>
                ) : filteredStandards.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No standards found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Document #</th>
                            <th>Title</th>
                            <th>Group / Subgroup</th>
                            <th>Status</th>
                            <th>Level</th>
                            <th>Type</th>
                            <th>Author</th>
                            <th>Updated</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredStandards.map(standard => {
                            const subGroup = standardSubGroups.find(sg => sg.id === standard.standard_sub_group);
                            const group = subGroup ? standardGroups.find(g => g.id === subGroup.standard_group) : null;

                            return (
                                <tr key={standard.id}>
                                    <td>
                                        <div className="document-number">
                                            {standard.document_number || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="standard-title">
                                            {standard.title}
                                            {standard.version && (
                                                <span className="version-badge">v{standard.version}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="group-info">
                                            <span className="group-name">{group?.name || 'Unknown'}</span>
                                            <span className="subgroup-name">{subGroup?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>
                                            <span className={`status-badge ${standard.status.toLowerCase()}`}>
                                                {standard.status}
                                            </span>
                                    </td>
                                    <td>
                                            <span className={`difficulty-badge ${standard.difficulty_level.toLowerCase()}`}>
                                                {standard.difficulty_level}
                                            </span>
                                    </td>
                                    <td>
                                        {standard.is_required ? (
                                            <span className="type-badge required">Required</span>
                                        ) : (
                                            <span className="type-badge optional">Optional</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="author-info">
                                            <User size={14} />
                                            <span>{standard.author_username || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-info">
                                            <Calendar size={14} />
                                            <span>{new Date(standard.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleViewStandard(standard)}
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleEditStandard(standard)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {standard.status === 'Draft' && (
                                                <button
                                                    className="icon-btn success"
                                                    onClick={() => handleOpenApproveModal(standard)}
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="icon-btn danger"
                                                onClick={() => handleDeleteStandard(standard.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );

    const renderHierarchyView = () => {
        const groupedStandards = standardGroups.map(group => {
            const groupSubGroups = standardSubGroups.filter(sg => sg.standard_group === group.id);
            return {
                ...group,
                subGroups: groupSubGroups.map(subGroup => ({
                    ...subGroup,
                    standards: standards.filter(s => s.standard_sub_group === subGroup.id)
                }))
            };
        });

        return (
            <div className="hierarchy-view">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading hierarchy...</p>
                    </div>
                ) : groupedStandards.length === 0 ? (
                    <div className="empty-state">
                        <FolderOpen size={48} />
                        <h3>No standard groups found</h3>
                        <button className="btn primary" onClick={() => setShowCreateGroupModal(true)}>
                            <Plus size={18} />
                            Create First Group
                        </button>
                    </div>
                ) : (
                    <div className="groups-tree">
                        {groupedStandards.map(group => (
                            <div key={group.id} className="group-item">
                                <div className="group-header">
                                    <button
                                        className="expand-btn"
                                        onClick={() => toggleGroupExpansion(group.id)}
                                    >
                                        {expandedGroups.has(group.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                    <div className="group-info">
                                        <h3>{group.name}</h3>
                                        {group.branch_name && (
                                            <span className="branch-badge">{group.branch_name}</span>
                                        )}
                                        <span className="count-badge">{group.subGroups.length} subgroups</span>
                                    </div>
                                    <div className="group-actions">
                                        <button
                                            className="icon-btn"
                                            onClick={() => handleEditGroup(group)}
                                            title="Edit Group"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="icon-btn"
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setShowCreateSubGroupModal(true);
                                            }}
                                            title="Add Subgroup"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            className="icon-btn danger"
                                            onClick={() => handleDeleteGroup(group.id)}
                                            title="Delete Group"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {expandedGroups.has(group.id) && (
                                    <div className="subgroups-container">
                                        {group.subGroups.length === 0 ? (
                                            <div className="empty-subgroup">
                                                <p>No subgroups yet</p>
                                                <button
                                                    className="btn small secondary"
                                                    onClick={() => {
                                                        setSelectedGroup(group);
                                                        setShowCreateSubGroupModal(true);
                                                    }}
                                                >
                                                    Add Subgroup
                                                </button>
                                            </div>
                                        ) : (
                                            group.subGroups.map(subGroup => (
                                                <div key={subGroup.id} className="subgroup-item">
                                                    <div className="subgroup-header">
                                                        <button
                                                            className="expand-btn"
                                                            onClick={() => toggleSubGroupExpansion(subGroup.id)}
                                                        >
                                                            {expandedSubGroups.has(subGroup.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        </button>
                                                        <div className="subgroup-info">
                                                            <h4>{subGroup.name}</h4>
                                                            <span className="count-badge">{subGroup.standards.length} standards</span>
                                                        </div>
                                                        <div className="subgroup-actions">
                                                            <button
                                                                className="icon-btn"
                                                                onClick={() => handleEditSubGroup(subGroup)}
                                                                title="Edit Subgroup"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className="icon-btn"
                                                                onClick={() => {
                                                                    setSelectedSubGroup(subGroup);
                                                                    setShowCreateStandardModal(true);
                                                                }}
                                                                title="Add Standard"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                            <button
                                                                className="icon-btn danger"
                                                                onClick={() => handleDeleteSubGroup(subGroup.id)}
                                                                title="Delete Subgroup"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {expandedSubGroups.has(subGroup.id) && (
                                                        <div className="standards-list">
                                                            {subGroup.standards.length === 0 ? (
                                                                <div className="empty-standards">
                                                                    <p>No standards yet</p>
                                                                    <button
                                                                        className="btn small secondary"
                                                                        onClick={() => {
                                                                            setSelectedSubGroup(subGroup);
                                                                            setShowCreateStandardModal(true);
                                                                        }}
                                                                    >
                                                                        Add Standard
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                subGroup.standards.map(standard => (
                                                                    <div key={standard.id} className="standard-item">
                                                                        <div className="standard-info">
                                                                            <FileText size={16} />
                                                                            <span className="document-number">{standard.document_number || 'N/A'}</span>
                                                                            <span className="standard-title">{standard.title}</span>
                                                                            <span className={`status-badge ${standard.status.toLowerCase()}`}>
                                                                                {standard.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="standard-actions">
                                                                            <button
                                                                                className="icon-btn"
                                                                                onClick={() => handleViewStandard(standard)}
                                                                                title="View"
                                                                            >
                                                                                <Eye size={14} />
                                                                            </button>
                                                                            <button
                                                                                className="icon-btn"
                                                                                onClick={() => handleEditStandard(standard)}
                                                                                title="Edit"
                                                                            >
                                                                                <Edit size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <BookOpen size={24} />
                        <h2>Standards & SOPs Management</h2>
                        <span className="count-badge">{standards.length} standards</span>
                    </div>
                    <div className="section-actions">
                        <div className="tab-switcher">
                            <button
                                className={`tab-btn ${activeTab === 'standards' ? 'active' : ''}`}
                                onClick={() => setActiveTab('standards')}
                            >
                                <FileText size={16} />
                                Standards List
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'hierarchy' ? 'active' : ''}`}
                                onClick={() => setActiveTab('hierarchy')}
                            >
                                <FolderOpen size={16} />
                                Hierarchy View
                            </button>
                        </div>
                        <div className="action-buttons">
                            {activeTab === 'hierarchy' && (
                                <button className="action-btn secondary" onClick={() => setShowCreateGroupModal(true)}>
                                    <Plus size={18} />
                                    Add Group
                                </button>
                            )}
                            <button className="action-btn primary" onClick={() => setShowCreateStandardModal(true)}>
                                <Plus size={18} />
                                Add Standard
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'standards' ? renderStandardsView() : renderHierarchyView()}
            </div>

            {/* Modals */}
            {showCreateGroupModal && (
                <CreateStandardGroupModal
                    branches={branches}
                    onClose={() => setShowCreateGroupModal(false)}
                    onCreate={handleCreateGroup}
                />
            )}

            {showEditGroupModal && selectedGroup && (
                <EditStandardGroupModal
                    group={selectedGroup}
                    branches={branches}
                    onClose={() => {
                        setShowEditGroupModal(false);
                        setSelectedGroup(null);
                    }}
                    onUpdate={handleUpdateGroup}
                />
            )}

            {showCreateSubGroupModal && (
                <CreateStandardSubGroupModal
                    groups={standardGroups}
                    selectedGroup={selectedGroup}
                    onClose={() => {
                        setShowCreateSubGroupModal(false);
                        setSelectedGroup(null);
                    }}
                    onCreate={handleCreateSubGroup}
                />
            )}

            {showEditSubGroupModal && selectedSubGroup && (
                <EditStandardSubGroupModal
                    subGroup={selectedSubGroup}
                    groups={standardGroups}
                    onClose={() => {
                        setShowEditSubGroupModal(false);
                        setSelectedSubGroup(null);
                    }}
                    onUpdate={handleUpdateSubGroup}
                />
            )}

            {showCreateStandardModal && (
                <CreateStandardModal
                    subGroups={standardSubGroups}
                    selectedSubGroup={selectedSubGroup}
                    onClose={() => {
                        setShowCreateStandardModal(false);
                        setSelectedSubGroup(null);
                    }}
                    onCreate={handleCreateStandard}
                />
            )}

            {showEditStandardModal && selectedStandard && (
                <EditStandardModal
                    standard={selectedStandard}
                    subGroups={standardSubGroups}
                    onClose={() => {
                        setShowEditStandardModal(false);
                        setSelectedStandard(null);
                    }}
                    onUpdate={handleUpdateStandard}
                />
            )}

            {showViewStandardModal && selectedStandard && (
                <ViewStandardModal
                    standard={selectedStandard}
                    subGroups={standardSubGroups}
                    groups={standardGroups}
                    onClose={() => {
                        setShowViewStandardModal(false);
                        setSelectedStandard(null);
                    }}
                    onEdit={() => {
                        setShowViewStandardModal(false);
                        // Use handleEditStandard to fetch full details
                        handleEditStandard(selectedStandard);
                    }}
                />
            )}

            {showApproveStandardModal && selectedStandard && (
                <ApproveStandardModal
                    standard={selectedStandard}
                    onClose={() => {
                        setShowApproveStandardModal(false);
                        setSelectedStandard(null);
                    }}
                    onApprove={handleApproveStandard}
                />
            )}
        </div>
    );
};

export default StandardsManagement;
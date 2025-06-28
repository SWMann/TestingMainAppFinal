import React, { useState, useEffect } from 'react';
import {
    Briefcase, Search, Filter, Plus, Edit, Trash2,
    Shield, Clock, Award, BookOpen, Users, AlertCircle,
    FileText, MapPin, Calendar, X, Check, Info
} from 'lucide-react';
import api from '../../../../services/api';
import './ManagementSections.css';
import CreateMOSModal from '../../../modals/CreateMOSModal';
import EditMOSModal from '../../../modals/EditMOSModal';
import DeleteMOSModal from '../../../modals/DeleteMOSModal';

const MOSManagement = () => {
    const [mosList, setMosList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterEntryLevel, setFilterEntryLevel] = useState('all');
    const [sortBy, setSortBy] = useState('code');
    const [selectedMOS, setSelectedMOS] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mosRes, branchesRes] = await Promise.all([
                api.get('/units/mos/'),
                api.get('/branches/')
            ]);

            setMosList(mosRes.data.results || mosRes.data);
            setBranches(branchesRes.data.results || branchesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load MOS data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMOSDetails = async (mosId) => {
        try {
            const [detailsRes, unitsRes, positionsRes, holdersRes] = await Promise.all([
                api.get(`/units/mos/${mosId}/`),
                api.get(`/units/mos/${mosId}/units/`),
                api.get(`/units/mos/${mosId}/positions/`),
                api.get(`/units/mos/${mosId}/holders/`)
            ]);

            setSelectedMOS({
                ...detailsRes.data,
                authorized_units: unitsRes.data,
                positions: positionsRes.data,
                holders: holdersRes.data
            });
            setShowDetailsPanel(true);
        } catch (error) {
            console.error('Error fetching MOS details:', error);
            showNotification('Failed to load MOS details', 'error');
        }
    };

    const handleCreate = async (mosData) => {
        try {
            // Ensure branch is sent as ID
            const dataToSend = {
                ...mosData,
                branch: mosData.branch ? parseInt(mosData.branch) : null
            };

            await api.post('/units/mos/', dataToSend);
            await fetchData();
            setShowCreateModal(false);
            showNotification('MOS created successfully', 'success');
        } catch (error) {
            console.error('Error creating MOS:', error);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to create MOS';
            showNotification(errorMessage, 'error');
        }
    };

    const handleUpdate = async (mosId, mosData) => {
        try {
            // Ensure branch is sent as ID
            const dataToSend = {
                ...mosData,
                branch: mosData.branch ? parseInt(mosData.branch) : null
            };

            await api.put(`/units/mos/${mosId}/`, dataToSend);
            await fetchData();
            setShowEditModal(false);
            setSelectedMOS(null);
            showNotification('MOS updated successfully', 'success');
        } catch (error) {
            console.error('Error updating MOS:', error);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to update MOS';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async (mosId) => {
        try {
            await api.delete(`/units/mos/${mosId}/`);
            await fetchData();
            setShowDeleteModal(false);
            setSelectedMOS(null);
            showNotification('MOS deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting MOS:', error);
            showNotification('Failed to delete MOS. It may be in use.', 'error');
        }
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
    };

    // Filter and sort MOS list
    const filteredMOS = mosList.filter(mos => {
        const matchesSearch =
            mos.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mos.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBranch = filterBranch === 'all' || mos.branch === filterBranch;
        const matchesCategory = filterCategory === 'all' || mos.category === filterCategory;
        const matchesEntryLevel =
            filterEntryLevel === 'all' ||
            (filterEntryLevel === 'entry' && mos.is_entry_level) ||
            (filterEntryLevel === 'advanced' && !mos.is_entry_level);

        return matchesSearch && matchesBranch && matchesCategory && matchesEntryLevel;
    });

    const sortedMOS = [...filteredMOS].sort((a, b) => {
        switch (sortBy) {
            case 'code':
                return a.code.localeCompare(b.code);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'branch':
                return (a.branch_name || '').localeCompare(b.branch_name || '');
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });

    // Get unique categories
    const categories = [...new Set(mosList.map(mos => mos.category))].sort();

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <Briefcase size={24} />
                        <h2>MOS Management</h2>
                        <span className="count-badge">{mosList.length} specialties</span>
                    </div>
                    <div className="section-actions">
                        <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            Add MOS
                        </button>
                    </div>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search MOS code or title..."
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
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={filterEntryLevel} onChange={(e) => setFilterEntryLevel(e.target.value)}>
                            <option value="all">All Levels</option>
                            <option value="entry">Entry Level</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="sort-group">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="code">Sort by Code</option>
                            <option value="title">Sort by Title</option>
                            <option value="branch">Sort by Branch</option>
                            <option value="category">Sort by Category</option>
                        </select>
                    </div>
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading MOS data...</p>
                        </div>
                    ) : sortedMOS.length === 0 ? (
                        <div className="empty-state">
                            <Briefcase size={48} />
                            <h3>No MOS found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>MOS Code</th>
                                <th>Title</th>
                                <th>Branch</th>
                                <th>Category</th>
                                <th>Requirements</th>
                                <th>Training</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedMOS.map(mos => (
                                <tr key={mos.id}>
                                    <td>
                                        <div className="mos-code">
                                            <strong>{mos.code}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="mos-title">
                                            {mos.title}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="branch-name">{mos.branch_name}</span>
                                    </td>
                                    <td>
                                            <span className={`category-badge ${mos.category}`}>
                                                {mos.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="requirements-cell">
                                            {mos.security_clearance_required !== 'none' && (
                                                <div className="requirement-item">
                                                    <Shield size={14} />
                                                    <span>{mos.security_clearance_required.toUpperCase()}</span>
                                                </div>
                                            )}
                                            {mos.min_asvab_score > 0 && (
                                                <div className="requirement-item">
                                                    <Award size={14} />
                                                    <span>ASVAB: {mos.min_asvab_score}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="training-info">
                                            <div className="training-item">
                                                <Clock size={14} />
                                                <span>{mos.ait_weeks} weeks</span>
                                            </div>
                                            {mos.ait_location && (
                                                <div className="training-item">
                                                    <MapPin size={14} />
                                                    <span>{mos.ait_location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-badges">
                                                <span className={`status-badge ${mos.is_active ? 'active' : 'inactive'}`}>
                                                    {mos.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            {mos.is_entry_level && (
                                                <span className="status-badge entry-level">Entry Level</span>
                                            )}
                                            <span className="count-badge">{mos.holders_count || 0} holders</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="icon-btn"
                                                onClick={() => fetchMOSDetails(mos.id)}
                                                title="View Details"
                                            >
                                                <Info size={16} />
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={() => {
                                                    setSelectedMOS(mos);
                                                    setShowEditModal(true);
                                                }}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="icon-btn danger"
                                                onClick={() => {
                                                    setSelectedMOS(mos);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MOS Details Panel */}
            {showDetailsPanel && selectedMOS && (
                <MOSDetailsPanel
                    mos={selectedMOS}
                    onClose={() => {
                        setShowDetailsPanel(false);
                        setSelectedMOS(null);
                    }}
                    onEdit={() => {
                        setShowDetailsPanel(false);
                        setShowEditModal(true);
                    }}
                />
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateMOSModal
                    branches={branches}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                />
            )}

            {showEditModal && selectedMOS && (
                <EditMOSModal
                    mos={selectedMOS}
                    branches={branches}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedMOS(null);
                    }}
                    onUpdate={handleUpdate}
                />
            )}

            {showDeleteModal && selectedMOS && (
                <DeleteMOSModal
                    mos={selectedMOS}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedMOS(null);
                    }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

// MOS Details Panel Component
const MOSDetailsPanel = ({ mos, onClose, onEdit }) => {
    return (
        <div className="details-panel">
            <div className="panel-header">
                <h3>MOS Details</h3>
                <div className="panel-header-actions">
                    <button className="icon-btn" onClick={onEdit} title="Edit MOS">
                        <Edit size={18} />
                    </button>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="panel-content">
                <div className="mos-header-section">
                    <h2>{mos.code} - {mos.title}</h2>
                    <div className="mos-badges">
                        <span className={`category-badge ${mos.category}`}>
                            {mos.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        {mos.is_active && <span className="status-badge active">Active</span>}
                        {mos.is_entry_level && <span className="status-badge entry-level">Entry Level</span>}
                    </div>
                </div>

                <div className="detail-sections">
                    <div className="detail-section">
                        <h4>Basic Information</h4>
                        <div className="detail-row">
                            <span className="label">Branch:</span>
                            <span className="value">{mos.branch?.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Category:</span>
                            <span className="value">
                                {mos.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                        </div>
                        {mos.description && (
                            <div className="detail-row">
                                <span className="label">Description:</span>
                                <p className="value">{mos.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h4>Requirements</h4>
                        <div className="detail-row">
                            <span className="label">ASVAB Score:</span>
                            <span className="value">{mos.min_asvab_score || 'None'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Security Clearance:</span>
                            <span className="value">
                                {mos.security_clearance_required === 'none'
                                    ? 'None Required'
                                    : mos.security_clearance_required.toUpperCase()}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Physical Demand:</span>
                            <span className="value">
                                {mos.physical_demand_rating.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Training Information</h4>
                        <div className="detail-row">
                            <span className="label">AIT Duration:</span>
                            <span className="value">{mos.ait_weeks} weeks</span>
                        </div>
                        {mos.ait_location && (
                            <div className="detail-row">
                                <span className="label">AIT Location:</span>
                                <span className="value">{mos.ait_location}</span>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h4>Personnel Statistics</h4>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-value">{mos.holders?.total_primary || 0}</div>
                                <div className="stat-label">Primary Holders</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{mos.holders?.total_secondary || 0}</div>
                                <div className="stat-label">Secondary Holders</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{mos.positions?.length || 0}</div>
                                <div className="stat-label">Open Positions</div>
                            </div>
                        </div>
                    </div>

                    {mos.authorized_units && mos.authorized_units.length > 0 && (
                        <div className="detail-section">
                            <h4>Authorized Units ({mos.authorized_units.length})</h4>
                            <div className="units-list">
                                {mos.authorized_units.map(unit => (
                                    <div key={unit.id} className="unit-item">
                                        <span className="unit-name">{unit.name}</span>
                                        <span className="unit-type">{unit.unit_type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MOSManagement;
import React, { useState, useEffect } from 'react';
import {
    FileText, Search, Filter, Plus, Edit, Trash2, Shield,
    CheckCircle, XCircle, Clock, Eye, MoreVertical, Calendar,
    User, AlertTriangle, FileCheck, Download
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import CreateOpordModal from "../../../modals/CreateOpordModal";
import EditOpordModal from "../../../modals/EditOpordModal";
import ViewOpordModal from "../../../modals/ViewOpordModal";
import ApproveOpordModal from "../../../modals/ApproveOpordModal";

const OperationsManagement = () => {
    const [opords, setOpords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterClassification, setFilterClassification] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [selectedOpord, setSelectedOpord] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        fetchOpords();
    }, []);

    const fetchOpords = async () => {
        setLoading(true);
        try {
            const response = await api.get('/opords/');
            setOpords(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching OPORDs:', error);
            showNotification('Failed to load OPORDs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOpord = async (opordData) => {
        try {
            await api.post('/opords/', opordData);
            await fetchOpords();
            setShowCreateModal(false);
            showNotification('OPORD created successfully', 'success');
        } catch (error) {
            console.error('Error creating OPORD:', error);
            showNotification('Failed to create OPORD', 'error');
        }
    };

    const handleUpdateOpord = async (opordId, opordData) => {
        try {
            await api.put(`/opords/${opordId}/`, opordData);
            await fetchOpords();
            setShowEditModal(false);
            setSelectedOpord(null);
            showNotification('OPORD updated successfully', 'success');
        } catch (error) {
            console.error('Error updating OPORD:', error);
            showNotification('Failed to update OPORD', 'error');
        }
    };

    const handleDeleteOpord = async (opordId) => {
        if (!window.confirm('Are you sure you want to delete this OPORD? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/opords/${opordId}/`);
            await fetchOpords();
            showNotification('OPORD deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting OPORD:', error);
            showNotification('Failed to delete OPORD', 'error');
        }
    };

    const handleApproveOpord = async (opordId, approvalData) => {
        try {
            await api.post(`/opords/${opordId}/approve/`, approvalData);
            await fetchOpords();
            setShowApproveModal(false);
            setSelectedOpord(null);
            showNotification(`OPORD ${approvalData.approval_status.toLowerCase()} successfully`, 'success');
        } catch (error) {
            console.error('Error approving OPORD:', error);
            showNotification('Failed to update OPORD approval status', 'error');
        }
    };

    const handleDuplicateOpord = async (opord) => {
        try {
            const newOpordData = {
                ...opord,
                operation_name: `${opord.operation_name} (Copy)`,
                approval_status: 'Draft',
                version: 1,
                approved_by: null
            };
            delete newOpordData.id;
            delete newOpordData.created_at;
            delete newOpordData.updated_at;
            delete newOpordData.creator;
            delete newOpordData.event_linked;

            await api.post('/opords/', newOpordData);
            await fetchOpords();
            showNotification('OPORD duplicated successfully', 'success');
        } catch (error) {
            console.error('Error duplicating OPORD:', error);
            showNotification('Failed to duplicate OPORD', 'error');
        }
    };

    const exportOpord = (opord) => {
        const content = `
OPERATION ORDER ${opord.operation_name}
Classification: ${opord.classification}
Version: ${opord.version}
Created: ${new Date(opord.created_at).toLocaleDateString()}
Creator: ${opord.creator_username}

1. SITUATION
${opord.situation || 'N/A'}

2. MISSION
${opord.mission || 'N/A'}

3. EXECUTION
${opord.execution || 'N/A'}

4. SERVICE SUPPORT
${opord.service_support || 'N/A'}

5. COMMAND AND SIGNAL
${opord.command_signal || 'N/A'}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OPORD_${opord.operation_name.replace(/[^a-z0-9]/gi, '_')}_v${opord.version}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
    };

    // Filter and sort OPORDs
    const filteredOpords = opords.filter(opord => {
        const matchesSearch =
            opord.operation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opord.creator_username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || opord.approval_status === filterStatus;
        const matchesClassification = filterClassification === 'all' || opord.classification === filterClassification;

        return matchesSearch && matchesStatus && matchesClassification;
    });

    const sortedOpords = [...filteredOpords].sort((a, b) => {
        switch (sortBy) {
            case 'created_at':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'name':
                return a.operation_name.localeCompare(b.operation_name);
            case 'version':
                return b.version - a.version;
            case 'classification':
                return a.classification.localeCompare(b.classification);
            default:
                return 0;
        }
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Draft': return FileText;
            case 'Pending': return Clock;
            case 'Approved': return CheckCircle;
            case 'Rejected': return XCircle;
            default: return FileText;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'draft';
            case 'Pending': return 'pending';
            case 'Approved': return 'approved';
            case 'Rejected': return 'rejected';
            default: return '';
        }
    };

    const getClassificationColor = (classification) => {
        switch (classification) {
            case 'Top Secret': return 'top-secret';
            case 'Secret': return 'secret';
            case 'Confidential': return 'confidential';
            case 'Unclassified': return 'unclassified';
            default: return '';
        }
    };

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <FileText size={24} />
                        <h2>Operations Management</h2>
                        <span className="count-badge">{opords.length} OPORDs</span>
                    </div>
                    <div className="section-actions">
                        <button
                            className="action-btn primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={18} />
                            Create OPORD
                        </button>
                    </div>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search OPORDs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Shield size={18} />
                        <select value={filterClassification} onChange={(e) => setFilterClassification(e.target.value)}>
                            <option value="all">All Classifications</option>
                            <option value="Unclassified">Unclassified</option>
                            <option value="Confidential">Confidential</option>
                            <option value="Secret">Secret</option>
                            <option value="Top Secret">Top Secret</option>
                        </select>
                    </div>

                    <div className="sort-group">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="created_at">Sort by Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="version">Sort by Version</option>
                            <option value="classification">Sort by Classification</option>
                        </select>
                    </div>
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading OPORDs...</p>
                        </div>
                    ) : sortedOpords.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <h3>No OPORDs found</h3>
                            <p>Try adjusting your search or filters</p>
                            <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Create First OPORD
                            </button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Operation</th>
                                <th>Event</th>
                                <th>Status</th>
                                <th>Classification</th>
                                <th>Version</th>
                                <th>Creator</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedOpords.map(opord => {
                                const StatusIcon = getStatusIcon(opord.approval_status);

                                return (
                                    <tr key={opord.id}>
                                        <td>
                                            <div className="opord-cell">
                                                <FileText size={20} />
                                                <span className="opord-name">{opord.operation_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {opord.event_title ? (
                                                <span className="event-link">
                                                        <Calendar size={14} />
                                                    {opord.event_title}
                                                    </span>
                                            ) : (
                                                <span className="no-data">Not linked</span>
                                            )}
                                        </td>
                                        <td>
                                                <span className={`status-badge ${getStatusColor(opord.approval_status)}`}>
                                                    <StatusIcon size={14} />
                                                    {opord.approval_status}
                                                </span>
                                        </td>
                                        <td>
                                                <span className={`classification-badge ${getClassificationColor(opord.classification)}`}>
                                                    {opord.classification}
                                                </span>
                                        </td>
                                        <td>
                                            <span className="version-badge">v{opord.version}</span>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <User size={16} />
                                                <span>{opord.creator_username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {new Date(opord.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => {
                                                        setSelectedOpord(opord);
                                                        setShowViewModal(true);
                                                    }}
                                                    title="View OPORD"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {(opord.approval_status === 'Draft' || opord.approval_status === 'Rejected') && (
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => {
                                                            setSelectedOpord(opord);
                                                            setShowEditModal(true);
                                                        }}
                                                        title="Edit OPORD"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                )}
                                                <div className="dropdown-container">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => setActiveDropdown(
                                                            activeDropdown === opord.id ? null : opord.id
                                                        )}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeDropdown === opord.id && (
                                                        <div className="dropdown-menu">
                                                            {opord.approval_status === 'Pending' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOpord(opord);
                                                                        setShowApproveModal(true);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                >
                                                                    <FileCheck size={16} />
                                                                    Review & Approve
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    handleDuplicateOpord(opord);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <FileText size={16} />
                                                                Duplicate
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    exportOpord(opord);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Download size={16} />
                                                                Export
                                                            </button>
                                                            <div className="dropdown-divider"></div>
                                                            {(opord.approval_status === 'Draft' || opord.approval_status === 'Rejected') && (
                                                                <button
                                                                    onClick={() => {
                                                                        handleDeleteOpord(opord.id);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="danger"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    Delete OPORD
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateOpordModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateOpord}
                />
            )}

            {showEditModal && selectedOpord && (
                <EditOpordModal
                    opord={selectedOpord}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedOpord(null);
                    }}
                    onUpdate={handleUpdateOpord}
                />
            )}

            {showViewModal && selectedOpord && (
                <ViewOpordModal
                    opord={selectedOpord}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedOpord(null);
                    }}
                    onEdit={() => {
                        setShowViewModal(false);
                        setShowEditModal(true);
                    }}
                />
            )}

            {showApproveModal && selectedOpord && (
                <ApproveOpordModal
                    opord={selectedOpord}
                    onClose={() => {
                        setShowApproveModal(false);
                        setSelectedOpord(null);
                    }}
                    onApprove={handleApproveOpord}
                />
            )}
        </div>
    );
};

export default OperationsManagement;
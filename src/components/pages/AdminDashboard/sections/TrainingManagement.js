import React, { useState, useEffect } from 'react';
import {
    GraduationCap, Search, Filter, Plus, Edit, Trash2, Award,
    Users, Clock, CheckCircle, XCircle, Eye, MoreVertical,
    Calendar, User, Shield, AlertTriangle, FileText, Download,
    RefreshCw, Mail, ChevronRight
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import CreateCertificateModal from "../../../modals/CreateCertificateModal";
import EditCertificateModal from "../../../modals/EditCertificateModal";
import IssueCertificateModal from "../../../modals/IssueCertificateModal";
import ViewCertificateDetailsModal from "../../../modals/ViewCertificateDetailsModal";
import ViewIssuedCertificateModal from "../../../modals/ViewIssuedCertificateModal";
import RevokeCertificateModal from "../../../modals/RevokeCertificateModal";

const TrainingManagement = () => {
    const [activeTab, setActiveTab] = useState('certificates');
    const [certificates, setCertificates] = useState([]);
    const [issuedCertificates, setIssuedCertificates] = useState([]);
    const [branches, setBranches] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [filterRequired, setFilterRequired] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [selectedIssuedCert, setSelectedIssuedCert] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showIssuedDetailsModal, setShowIssuedDetailsModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [certsRes, branchesRes, ranksRes] = await Promise.all([
                api.get('/training/'),
                api.get('/branches/'),
                api.get('/ranks/')
            ]);

            setCertificates(certsRes.data.results || certsRes.data);
            setBranches(branchesRes.data.results || branchesRes.data);
            setRanks(ranksRes.data.results || ranksRes.data);

            // Fetch issued certificates if on that tab
            if (activeTab === 'issued') {
                await fetchIssuedCertificates();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load training data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchIssuedCertificates = async () => {
        try {
            const response = await api.get('/user-certificates/');
            setIssuedCertificates(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching issued certificates:', error);
            showNotification('Failed to load issued certificates', 'error');
        }
    };

    const fetchCertificateDetails = async (certId) => {
        try {
            const [certRes, holdersRes] = await Promise.all([
                api.get(`/training/${certId}/`),
                api.get(`/training/${certId}/holders/`)
            ]);

            setSelectedCertificate({
                ...certRes.data,
                holders: holdersRes.data
            });
        } catch (error) {
            console.error('Error fetching certificate details:', error);
            showNotification('Failed to load certificate details', 'error');
        }
    };

    const handleCreateCertificate = async (certData) => {
        try {
            await api.post('/training/', certData);
            await fetchInitialData();
            setShowCreateModal(false);
            showNotification('Certificate created successfully', 'success');
        } catch (error) {
            console.error('Error creating certificate:', error);
            showNotification('Failed to create certificate', 'error');
        }
    };

    const handleUpdateCertificate = async (certId, certData) => {
        try {
            await api.put(`/training/${certId}/`, certData);
            await fetchInitialData();
            setShowEditModal(false);
            setSelectedCertificate(null);
            showNotification('Certificate updated successfully', 'success');
        } catch (error) {
            console.error('Error updating certificate:', error);
            showNotification('Failed to update certificate', 'error');
        }
    };

    const handleDeleteCertificate = async (certId) => {
        if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/training/${certId}/`);
            await fetchInitialData();
            showNotification('Certificate deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            showNotification('Failed to delete certificate. It may have been issued to users.', 'error');
        }
    };

    const handleIssueCertificate = async (certId, issueData) => {
        try {
            await api.post(`/training/${certId}/issue/`, issueData);
            await fetchIssuedCertificates();
            setShowIssueModal(false);
            showNotification('Certificate issued successfully', 'success');
        } catch (error) {
            console.error('Error issuing certificate:', error);
            showNotification(error.response?.data?.detail || 'Failed to issue certificate', 'error');
        }
    };

    const handleRevokeCertificate = async (userCertId, revokeData) => {
        try {
            const userCert = issuedCertificates.find(ic => ic.id === userCertId);
            if (!userCert) {
                throw new Error('Certificate not found');
            }

            await api.post(`/training/${userCert.certificate}/revoke/`, {
                user_id: userCert.user,
                ...revokeData
            });

            await fetchIssuedCertificates();
            setShowRevokeModal(false);
            setSelectedIssuedCert(null);
            showNotification('Certificate revoked successfully', 'success');
        } catch (error) {
            console.error('Error revoking certificate:', error);
            showNotification('Failed to revoke certificate', 'error');
        }
    };

    const exportCertificatesList = () => {
        const csvContent = certificates.map(cert => ({
            Name: cert.name,
            Abbreviation: cert.abbreviation,
            Branch: cert.branch_name,
            'Required for Promotion': cert.is_required_for_promotion ? 'Yes' : 'No',
            'Min Rank': cert.min_rank_name || 'None',
            'Expiration Days': cert.expiration_period || 'No expiration'
        }));

        const headers = Object.keys(csvContent[0]).join(',');
        const rows = csvContent.map(row => Object.values(row).map(val => `"${val}"`).join(','));
        const csv = [headers, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificates_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
    };

    // Filter certificates
    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch =
            cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBranch = filterBranch === 'all' || cert.branch === parseInt(filterBranch);
        const matchesRequired = filterRequired === 'all' ||
            (filterRequired === 'yes' && cert.is_required_for_promotion) ||
            (filterRequired === 'no' && !cert.is_required_for_promotion);

        return matchesSearch && matchesBranch && matchesRequired;
    });

    // Filter issued certificates
    const filteredIssuedCerts = issuedCertificates.filter(cert => {
        const matchesSearch =
            cert.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.certificate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.issuer_username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && cert.is_active) ||
            (filterStatus === 'expired' && cert.expiry_date && new Date(cert.expiry_date) < new Date()) ||
            (filterStatus === 'revoked' && !cert.is_active);

        return matchesSearch && matchesStatus;
    });

    // Sort certificates
    const sortedCertificates = [...filteredCertificates].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'branch':
                return (a.branch_name || '').localeCompare(b.branch_name || '');
            case 'abbreviation':
                return a.abbreviation.localeCompare(b.abbreviation);
            default:
                return 0;
        }
    });

    const sortedIssuedCerts = [...filteredIssuedCerts].sort((a, b) => {
        switch (sortBy) {
            case 'user':
                return (a.user_username || '').localeCompare(b.user_username || '');
            case 'certificate':
                return (a.certificate_name || '').localeCompare(b.certificate_name || '');
            case 'issue_date':
                return new Date(b.issue_date) - new Date(a.issue_date);
            case 'expiry':
                return (new Date(a.expiry_date || 0)) - (new Date(b.expiry_date || 0));
            default:
                return 0;
        }
    });

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <GraduationCap size={24} />
                        <h2>Training & Certification</h2>
                        <span className="count-badge">
                            {activeTab === 'certificates' ? certificates.length : issuedCertificates.length}
                        </span>
                    </div>
                    <div className="section-actions">
                        {activeTab === 'certificates' && (
                            <>
                                <button
                                    className="action-btn secondary"
                                    onClick={exportCertificatesList}
                                >
                                    <Download size={18} />
                                    Export
                                </button>
                                <button
                                    className="action-btn primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <Plus size={18} />
                                    Create Certificate
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="training-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('certificates');
                            setSearchTerm('');
                        }}
                    >
                        <Award size={18} />
                        Certificate Types
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'issued' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('issued');
                            setSearchTerm('');
                            fetchIssuedCertificates();
                        }}
                    >
                        <Users size={18} />
                        Issued Certificates
                    </button>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={activeTab === 'certificates' ? 'Search certificates...' : 'Search by user or certificate...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {activeTab === 'certificates' && (
                        <>
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
                                <select value={filterRequired} onChange={(e) => setFilterRequired(e.target.value)}>
                                    <option value="all">All Types</option>
                                    <option value="yes">Required for Promotion</option>
                                    <option value="no">Optional</option>
                                </select>
                            </div>

                            <div className="sort-group">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="name">Sort by Name</option>
                                    <option value="branch">Sort by Branch</option>
                                    <option value="abbreviation">Sort by Abbreviation</option>
                                </select>
                            </div>
                        </>
                    )}

                    {activeTab === 'issued' && (
                        <>
                            <div className="filter-group">
                                <Filter size={18} />
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="revoked">Revoked</option>
                                </select>
                            </div>

                            <div className="sort-group">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="issue_date">Sort by Issue Date</option>
                                    <option value="user">Sort by User</option>
                                    <option value="certificate">Sort by Certificate</option>
                                    <option value="expiry">Sort by Expiry</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading training data...</p>
                        </div>
                    ) : activeTab === 'certificates' ? (
                        sortedCertificates.length === 0 ? (
                            <div className="empty-state">
                                <Award size={48} />
                                <h3>No certificates found</h3>
                                <p>Try adjusting your search or filters</p>
                                <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} />
                                    Create First Certificate
                                </button>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Certificate</th>
                                    <th>Branch</th>
                                    <th>Requirements</th>
                                    <th>Validity</th>
                                    <th>Holders</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedCertificates.map(cert => (
                                    <tr key={cert.id}>
                                        <td>
                                            <div className="cert-cell">
                                                {cert.badge_image_url && (
                                                    <img
                                                        src={cert.badge_image_url}
                                                        alt={cert.name}
                                                        className="cert-badge"
                                                    />
                                                )}
                                                <div>
                                                    <div className="cert-name">{cert.name}</div>
                                                    <div className="cert-abbr">{cert.abbreviation}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="branch-badge">{cert.branch_name}</span>
                                        </td>
                                        <td>
                                            <div className="requirements-cell">
                                                {cert.is_required_for_promotion && (
                                                    <span className="req-badge promotion">Required for Promotion</span>
                                                )}
                                                {cert.min_rank_name && (
                                                    <span className="req-badge rank">Min: {cert.min_rank_name}</span>
                                                )}
                                                {!cert.is_required_for_promotion && !cert.min_rank_name && (
                                                    <span className="no-data">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {cert.expiration_period ? (
                                                <span className="validity-badge expiring">
                                                        <Clock size={14} />
                                                    {cert.expiration_period} days
                                                    </span>
                                            ) : (
                                                <span className="validity-badge permanent">
                                                        <CheckCircle size={14} />
                                                        No expiration
                                                    </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="holders-cell">
                                                <Users size={16} />
                                                <span>{cert.active_holders_count || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => {
                                                        fetchCertificateDetails(cert.id);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => {
                                                        setSelectedCertificate(cert);
                                                        setShowEditModal(true);
                                                    }}
                                                    title="Edit Certificate"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className="dropdown-container">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => setActiveDropdown(
                                                            activeDropdown === cert.id ? null : cert.id
                                                        )}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeDropdown === cert.id && (
                                                        <div className="dropdown-menu">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedCertificate(cert);
                                                                    setShowIssueModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Award size={16} />
                                                                Issue Certificate
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    fetchCertificateDetails(cert.id);
                                                                    setShowDetailsModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Users size={16} />
                                                                View Holders
                                                            </button>
                                                            <div className="dropdown-divider"></div>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteCertificate(cert.id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="danger"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete Certificate
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        sortedIssuedCerts.length === 0 ? (
                            <div className="empty-state">
                                <Users size={48} />
                                <h3>No issued certificates found</h3>
                                <p>Start by issuing certificates to users</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Certificate</th>
                                    <th>Issued By</th>
                                    <th>Issue Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedIssuedCerts.map(cert => {
                                    const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                                    const status = !cert.is_active ? 'revoked' : isExpired ? 'expired' : 'active';

                                    return (
                                        <tr key={cert.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <User size={20} />
                                                    <span>{cert.user_username}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="cert-cell">
                                                    {cert.certificate_badge && (
                                                        <img
                                                            src={cert.certificate_badge}
                                                            alt={cert.certificate_name}
                                                            className="cert-badge-small"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="cert-name">{cert.certificate_name}</div>
                                                        <div className="cert-abbr">{cert.certificate_abbreviation}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="issuer-name">{cert.issuer_username}</span>
                                            </td>
                                            <td>
                                                <div className="date-cell">
                                                    <Calendar size={14} />
                                                    {new Date(cert.issue_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="cert-status">
                                                        <span className={`status-badge ${status}`}>
                                                            {status === 'active' && <CheckCircle size={14} />}
                                                            {status === 'expired' && <Clock size={14} />}
                                                            {status === 'revoked' && <XCircle size={14} />}
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                    {cert.expiry_date && status === 'active' && (
                                                        <span className="expiry-date">
                                                                Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                                                            </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-cell">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => {
                                                            setSelectedIssuedCert(cert);
                                                            setShowIssuedDetailsModal(true);
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {cert.is_active && (
                                                        <button
                                                            className="icon-btn danger"
                                                            onClick={() => {
                                                                setSelectedIssuedCert(cert);
                                                                setShowRevokeModal(true);
                                                            }}
                                                            title="Revoke Certificate"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}
                                                    {cert.certificate_file_url && (
                                                        <button
                                                            className="icon-btn"
                                                            onClick={() => window.open(cert.certificate_file_url, '_blank')}
                                                            title="Download Certificate"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateCertificateModal
                    branches={branches}
                    ranks={ranks}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateCertificate}
                />
            )}

            {showEditModal && selectedCertificate && (
                <EditCertificateModal
                    certificate={selectedCertificate}
                    branches={branches}
                    ranks={ranks}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCertificate(null);
                    }}
                    onUpdate={handleUpdateCertificate}
                />
            )}

            {showIssueModal && selectedCertificate && (
                <IssueCertificateModal
                    certificate={selectedCertificate}
                    onClose={() => {
                        setShowIssueModal(false);
                        setSelectedCertificate(null);
                    }}
                    onIssue={(issueData) => handleIssueCertificate(selectedCertificate.id, issueData)}
                />
            )}

            {showDetailsModal && selectedCertificate && (
                <ViewCertificateDetailsModal
                    certificate={selectedCertificate}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedCertificate(null);
                    }}
                    onIssue={() => {
                        setShowDetailsModal(false);
                        setShowIssueModal(true);
                    }}
                />
            )}

            {showIssuedDetailsModal && selectedIssuedCert && (
                <ViewIssuedCertificateModal
                    issuedCert={selectedIssuedCert}
                    onClose={() => {
                        setShowIssuedDetailsModal(false);
                        setSelectedIssuedCert(null);
                    }}
                    onRevoke={() => {
                        setShowIssuedDetailsModal(false);
                        setShowRevokeModal(true);
                    }}
                />
            )}

            {showRevokeModal && selectedIssuedCert && (
                <RevokeCertificateModal
                    issuedCert={selectedIssuedCert}
                    onClose={() => {
                        setShowRevokeModal(false);
                        setSelectedIssuedCert(null);
                    }}
                    onRevoke={(revokeData) => handleRevokeCertificate(selectedIssuedCert.id, revokeData)}
                />
            )}
        </div>
    );
};

export default TrainingManagement;
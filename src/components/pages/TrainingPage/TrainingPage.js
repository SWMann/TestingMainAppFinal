// src/components/pages/TrainingPage/TrainingPage.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    BookOpen, Award, Search, Filter, ChevronRight, ChevronDown,
    Plus, Edit, Trash2, FileText, Clock, Shield, Users,
    CheckCircle, XCircle, AlertCircle, Download, ExternalLink,
    Tag, Calendar, User, Building, Lock, Unlock, ChevronUp,
    Cpu, Database, Terminal, Zap
} from 'lucide-react';
import api from '../../../services/api';
import './TrainingPage.css';
import CreateSOPModal from '../../modals/CreateSOPModal';
import CreateCertificateModal from '../../modals/CreateCertificateModal';
import IssueCertificateModal from '../../modals/IssueCertificateModal';
import RevokeCertificateModal from '../../modals/RevokeCertificateModal';

const TrainingPage = () => {
    const { user: currentUser } = useSelector(state => state.auth);
    const isAdmin = currentUser?.is_admin || currentUser?.is_staff;

    // State
    const [activeTab, setActiveTab] = useState('sops');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // SOPs State
    const [sopGroups, setSopGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSubGroup, setSelectedSubGroup] = useState(null);
    const [standards, setStandards] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [sopSearchTerm, setSopSearchTerm] = useState('');

    // Certificates State
    const [certificates, setCertificates] = useState([]);
    const [userCertificates, setUserCertificates] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [branches, setBranches] = useState([]);
    const [certSearchTerm, setCertSearchTerm] = useState('');

    // Modal State
    const [showCreateSOPModal, setShowCreateSOPModal] = useState(false);
    const [showCreateCertModal, setShowCreateCertModal] = useState(false);
    const [showIssueCertModal, setShowIssueCertModal] = useState(false);
    const [showRevokeCertModal, setShowRevokeCertModal] = useState(false);
    const [selectedCertForAction, setSelectedCertForAction] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'sops') {
            fetchSOPGroups();
        } else {
            fetchCertificates();
            if (currentUser) {
                fetchUserCertificates();
            }
        }
    }, [activeTab, currentUser]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // Fetch branches for filters
            const branchesRes = await api.get('/branches/');
            setBranches(branchesRes.data.results || branchesRes.data);
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to initialize training systems');
        } finally {
            setLoading(false);
        }
    };

    const fetchSOPGroups = async () => {
        try {
            const response = await api.get('/sops/groups/');
            setSopGroups(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching SOP groups:', err);
        }
    };

    const fetchSubGroups = async (groupId) => {
        try {
            const response = await api.get(`/sops/groups/${groupId}/subgroups/`);
            return response.data;
        } catch (err) {
            console.error('Error fetching subgroups:', err);
            return [];
        }
    };

    const fetchStandards = async (subGroupId) => {
        try {
            const response = await api.get(`/sops/subgroups/${subGroupId}/standards/`);
            setStandards(response.data);
        } catch (err) {
            console.error('Error fetching standards:', err);
        }
    };

    const fetchStandardDetail = async (standardId) => {
        try {
            const response = await api.get(`/sops/standards/${standardId}/`);
            setSelectedStandard(response.data);
        } catch (err) {
            console.error('Error fetching standard detail:', err);
        }
    };

    const fetchCertificates = async () => {
        try {
            let url = '/certificates/';
            if (selectedBranch !== 'all') {
                url += `?branch=${selectedBranch}`;
            }
            const response = await api.get(url);
            setCertificates(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching certificates:', err);
        }
    };

    const fetchUserCertificates = async () => {
        try {
            const response = await api.get(`/users/${currentUser.id}/certificates/`);
            setUserCertificates(response.data);
        } catch (err) {
            console.error('Error fetching user certificates:', err);
        }
    };

    const toggleGroup = async (groupId) => {
        const newExpanded = { ...expandedGroups };
        newExpanded[groupId] = !newExpanded[groupId];
        setExpandedGroups(newExpanded);

        if (newExpanded[groupId] && !sopGroups.find(g => g.id === groupId).subgroups) {
            const subgroups = await fetchSubGroups(groupId);
            setSopGroups(groups => groups.map(g =>
                g.id === groupId ? { ...g, subgroups } : g
            ));
        }
    };

    const handleSubGroupSelect = (subGroup) => {
        setSelectedSubGroup(subGroup);
        fetchStandards(subGroup.id);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'Active': 'active',
            'Draft': 'draft',
            'Archived': 'archived'
        };
        return statusClasses[status] || 'draft';
    };

    const getDifficultyBadgeClass = (difficulty) => {
        const difficultyClasses = {
            'Basic': 'basic',
            'Intermediate': 'intermediate',
            'Advanced': 'advanced'
        };
        return difficultyClasses[difficulty] || 'basic';
    };

    // Filter functions
    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = cert.name.toLowerCase().includes(certSearchTerm.toLowerCase()) ||
            cert.abbreviation.toLowerCase().includes(certSearchTerm.toLowerCase());
        const matchesBranch = selectedBranch === 'all' || cert.branch === selectedBranch;
        return matchesSearch && matchesBranch;
    });

    const searchStandards = async () => {
        if (!sopSearchTerm.trim()) {
            fetchSOPGroups();
            return;
        }

        try {
            const response = await api.get(`/sops/standards/search/?q=${sopSearchTerm}`);
            setStandards(response.data);
            setSelectedSubGroup(null);
        } catch (err) {
            console.error('Error searching standards:', err);
        }
    };

    if (loading) {
        return (
            <div className="training-loading">
                <div className="spinner"></div>
                <p>INITIALIZING TRAINING PROTOCOLS...</p>
            </div>
        );
    }

    return (
        <div className="training-container">
            {/* Header */}
            <div className="training-header">
                <div className="header-content">
                    <h1>FLEET TRAINING SYSTEMS</h1>
                    <p>Access operational protocols and certification management</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="training-tabs">
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'sops' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sops')}
                    >
                        <Database size={18} />
                        Operational Protocols
                    </button>
                    <button
                        className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('certificates')}
                    >
                        <Award size={18} />
                        Certification Registry
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="training-content">
                {activeTab === 'sops' ? (
                    <div className="sop-section">
                        {/* SOP Controls */}
                        <div className="section-controls">
                            <div className="left-controls">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search protocols..."
                                        value={sopSearchTerm}
                                        onChange={(e) => setSopSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchStandards()}
                                    />
                                </div>
                            </div>
                            {isAdmin && (
                                <button
                                    className="action-btn primary"
                                    onClick={() => setShowCreateSOPModal(true)}
                                >
                                    <Plus size={18} />
                                    CREATE PROTOCOL
                                </button>
                            )}
                        </div>

                        {/* SOP Content */}
                        <div className="sop-content">
                            {/* Groups Navigation */}
                            <div className="sop-navigation">
                                <div className="nav-header">
                                    <h3>PROTOCOL CATEGORIES</h3>
                                </div>
                                <div className="groups-list">
                                    {sopGroups.map(group => (
                                        <div key={group.id} className="group-item">
                                            <div
                                                className={`group-header ${selectedGroup?.id === group.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedGroup(group);
                                                    toggleGroup(group.id);
                                                }}
                                            >
                                                {expandedGroups[group.id] ?
                                                    <ChevronDown size={16} /> :
                                                    <ChevronRight size={16} />
                                                }
                                                <span>{group.name}</span>
                                                <span className="count">{group.subgroups_count}</span>
                                            </div>
                                            {expandedGroups[group.id] && group.subgroups && (
                                                <div className="subgroups-list">
                                                    {group.subgroups.map(subgroup => (
                                                        <div
                                                            key={subgroup.id}
                                                            className={`subgroup-item ${selectedSubGroup?.id === subgroup.id ? 'active' : ''}`}
                                                            onClick={() => handleSubGroupSelect(subgroup)}
                                                        >
                                                            <Terminal size={14} />
                                                            <span>{subgroup.name}</span>
                                                            <span className="count">{subgroup.standards_count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Standards List */}
                            <div className="standards-section">
                                {selectedSubGroup ? (
                                    <>
                                        <div className="section-header">
                                            <h3>{selectedSubGroup.name}</h3>
                                            {selectedSubGroup.description && (
                                                <p className="section-description">{selectedSubGroup.description}</p>
                                            )}
                                        </div>
                                        <div className="standards-list">
                                            {standards.map(standard => (
                                                <div
                                                    key={standard.id}
                                                    className="standard-item"
                                                    onClick={() => fetchStandardDetail(standard.id)}
                                                >
                                                    <div className="standard-header">
                                                        <div className="standard-title">
                                                            {standard.document_number && (
                                                                <span className="doc-number">{standard.document_number}</span>
                                                            )}
                                                            <h4>{standard.title}</h4>
                                                        </div>
                                                        <div className="standard-badges">
                                                            <span className={`status-badge ${getStatusBadgeClass(standard.status)}`}>
                                                                {standard.status}
                                                            </span>
                                                            <span className={`difficulty-badge ${getDifficultyBadgeClass(standard.difficulty_level)}`}>
                                                                {standard.difficulty_level}
                                                            </span>
                                                            {standard.is_required && (
                                                                <span className="required-badge">MANDATORY</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {standard.summary && (
                                                        <p className="standard-summary">{standard.summary}</p>
                                                    )}
                                                    <div className="standard-meta">
                                                        <span><User size={14} /> {standard.author_username}</span>
                                                        <span><Calendar size={14} /> {formatDate(standard.effective_date)}</span>
                                                        <span><Cpu size={14} /> v{standard.version}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : sopSearchTerm && standards.length > 0 ? (
                                    <>
                                        <div className="section-header">
                                            <h3>SEARCH RESULTS</h3>
                                        </div>
                                        <div className="standards-list">
                                            {standards.map(standard => (
                                                <div
                                                    key={standard.id}
                                                    className="standard-item"
                                                    onClick={() => fetchStandardDetail(standard.id)}
                                                >
                                                    <div className="standard-header">
                                                        <div className="standard-title">
                                                            {standard.document_number && (
                                                                <span className="doc-number">{standard.document_number}</span>
                                                            )}
                                                            <h4>{standard.title}</h4>
                                                        </div>
                                                        <div className="standard-badges">
                                                            <span className={`status-badge ${getStatusBadgeClass(standard.status)}`}>
                                                                {standard.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="standard-summary">{standard.summary}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <Database size={48} />
                                        <h3>NO PROTOCOL SELECTED</h3>
                                        <p>Select a category to access operational protocols or use the search function</p>
                                    </div>
                                )}
                            </div>

                            {/* Standard Detail */}
                            {selectedStandard && (
                                <div className="standard-detail">
                                    <div className="detail-header">
                                        <button
                                            className="back-btn"
                                            onClick={() => setSelectedStandard(null)}
                                        >
                                            ← RETURN TO LIST
                                        </button>
                                        {isAdmin && (
                                            <div className="detail-actions">
                                                <button className="action-btn small secondary">
                                                    <Edit size={16} />
                                                    MODIFY
                                                </button>
                                                <button className="action-btn small danger">
                                                    <Trash2 size={16} />
                                                    PURGE
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-content">
                                        <div className="detail-title-section">
                                            {selectedStandard.document_number && (
                                                <span className="doc-number large">{selectedStandard.document_number}</span>
                                            )}
                                            <h2>{selectedStandard.title}</h2>
                                            <div className="detail-badges">
                                                <span className={`status-badge ${getStatusBadgeClass(selectedStandard.status)}`}>
                                                    {selectedStandard.status}
                                                </span>
                                                <span className={`difficulty-badge ${getDifficultyBadgeClass(selectedStandard.difficulty_level)}`}>
                                                    {selectedStandard.difficulty_level}
                                                </span>
                                                {selectedStandard.is_required && (
                                                    <span className="required-badge">MANDATORY</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="detail-info">
                                            <div className="info-row">
                                                <span className="label">AUTHOR</span>
                                                <span>{selectedStandard.author_username}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">VERSION</span>
                                                <span>{selectedStandard.version}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">EFFECTIVE DATE</span>
                                                <span>{formatDate(selectedStandard.effective_date)}</span>
                                            </div>
                                            {selectedStandard.review_date && (
                                                <div className="info-row">
                                                    <span className="label">REVIEW DATE</span>
                                                    <span>{formatDate(selectedStandard.review_date)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {selectedStandard.summary && (
                                            <div className="detail-section">
                                                <h3>EXECUTIVE SUMMARY</h3>
                                                <p>{selectedStandard.summary}</p>
                                            </div>
                                        )}

                                        <div className="detail-section">
                                            <h3>PROTOCOL CONTENT</h3>
                                            <div className="sop-content-text">
                                                {selectedStandard.content}
                                            </div>
                                        </div>

                                        {selectedStandard.pdf_url && (
                                            <div className="detail-section">
                                                <h3>RESOURCES</h3>
                                                <a
                                                    href={selectedStandard.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="resource-link"
                                                >
                                                    <Download size={16} />
                                                    DOWNLOAD DATAPAD
                                                </a>
                                            </div>
                                        )}

                                        {selectedStandard.tags && selectedStandard.tags.length > 0 && (
                                            <div className="detail-section">
                                                <h3>TAGS</h3>
                                                <div className="tags-list">
                                                    {selectedStandard.tags.map((tag, index) => (
                                                        <span key={index} className="tag">
                                                            <Tag size={12} />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="certificates-section">
                        {/* Certificate Controls */}
                        <div className="section-controls">
                            <div className="left-controls">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search certifications..."
                                        value={certSearchTerm}
                                        onChange={(e) => setCertSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="branch-filter"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                >
                                    <option value="all">ALL DIVISIONS</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isAdmin && (
                                <button
                                    className="action-btn primary"
                                    onClick={() => setShowCreateCertModal(true)}
                                >
                                    <Plus size={18} />
                                    CREATE CERTIFICATION
                                </button>
                            )}
                        </div>

                        {/* User's Certificates */}
                        {currentUser && userCertificates.length > 0 && (
                            <div className="user-certificates">
                                <h3>MY CERTIFICATIONS</h3>
                                <div className="cert-grid">
                                    {userCertificates.map(userCert => (
                                        <div
                                            key={userCert.id}
                                            className={`user-cert-card ${!userCert.is_active ? 'revoked' : ''}`}
                                        >
                                            <div className="cert-header">
                                                <Award size={24} className="cert-icon" />
                                                <div className="cert-info">
                                                    <h4>{userCert.certificate_name}</h4>
                                                    <p className="cert-code">{userCert.certificate_abbreviation}</p>
                                                </div>
                                                {userCert.is_active ? (
                                                    <CheckCircle size={20} className="status-icon active" />
                                                ) : (
                                                    <XCircle size={20} className="status-icon revoked" />
                                                )}
                                            </div>
                                            <div className="cert-details">
                                                <div className="detail-item">
                                                    <Calendar size={14} />
                                                    <span>ISSUED: {formatDate(userCert.issue_date)}</span>
                                                </div>
                                                {userCert.expiry_date && (
                                                    <div className="detail-item">
                                                        <Clock size={14} />
                                                        <span className={new Date(userCert.expiry_date) < new Date() ? 'expired' : ''}>
                                                            EXPIRES: {formatDate(userCert.expiry_date)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="detail-item">
                                                    <User size={14} />
                                                    <span>AUTHORIZED BY: {userCert.issuer_username}</span>
                                                </div>
                                            </div>
                                            {!userCert.is_active && userCert.revocation_reason && (
                                                <div className="revocation-info">
                                                    <AlertCircle size={14} />
                                                    <span>REVOKED: {userCert.revocation_reason}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Certificates */}
                        <div className="available-certificates">
                            <h3>CERTIFICATION REGISTRY</h3>
                            <div className="cert-list">
                                {filteredCertificates.map(cert => (
                                    <div key={cert.id} className="cert-item">
                                        <div className="cert-main">
                                            <div className="cert-icon-wrapper">
                                                {cert.badge_image_url ? (
                                                    <img src={cert.badge_image_url} alt={cert.name} />
                                                ) : (
                                                    <Zap size={32} />
                                                )}
                                            </div>
                                            <div className="cert-content">
                                                <div className="cert-title">
                                                    <h4>{cert.name}</h4>
                                                    <span className="cert-abbr">{cert.abbreviation}</span>
                                                </div>
                                                <p className="cert-description">{cert.description}</p>
                                                <div className="cert-meta">
                                                    <span className="branch-tag">
                                                        <Building size={14} />
                                                        {cert.branch_name}
                                                    </span>
                                                    {cert.is_required_for_promotion && (
                                                        <span className="promotion-tag">
                                                            <ChevronUp size={14} />
                                                            PROMOTION REQUIRED
                                                        </span>
                                                    )}
                                                    {cert.min_rank_name && (
                                                        <span className="rank-req">
                                                            <Shield size={14} />
                                                            MIN: {cert.min_rank_name}
                                                        </span>
                                                    )}
                                                    {cert.expiration_period && (
                                                        <span className="expiry-info">
                                                            <Clock size={14} />
                                                            VALID FOR {cert.expiration_period} DAYS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {cert.requirements && (
                                            <div className="cert-requirements">
                                                <h5>REQUIREMENTS</h5>
                                                <p>{cert.requirements}</p>
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <div className="cert-actions">
                                                <button
                                                    className="action-btn small"
                                                    onClick={() => {
                                                        setSelectedCertForAction(cert);
                                                        setShowIssueCertModal(true);
                                                    }}
                                                >
                                                    <Award size={14} />
                                                    ISSUE
                                                </button>
                                                <button
                                                    className="action-btn small secondary"
                                                    onClick={() => {
                                                        setSelectedCertForAction(cert);
                                                        setShowRevokeCertModal(true);
                                                    }}
                                                >
                                                    <XCircle size={14} />
                                                    REVOKE
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateSOPModal && (
                <CreateSOPModal
                    onClose={() => setShowCreateSOPModal(false)}
                    onSuccess={() => {
                        setShowCreateSOPModal(false);
                        fetchSOPGroups();
                    }}
                    groups={sopGroups}
                />
            )}

            {showCreateCertModal && (
                <CreateCertificateModal
                    branches={branches}
                    onClose={() => setShowCreateCertModal(false)}
                    onSuccess={() => {
                        setShowCreateCertModal(false);
                        fetchCertificates();
                    }}
                />
            )}

            {showIssueCertModal && selectedCertForAction && (
                <IssueCertificateModal
                    certificate={selectedCertForAction}
                    onClose={() => {
                        setShowIssueCertModal(false);
                        setSelectedCertForAction(null);
                    }}
                    onSuccess={() => {
                        setShowIssueCertModal(false);
                        setSelectedCertForAction(null);
                        fetchUserCertificates();
                    }}
                />
            )}

            {showRevokeCertModal && selectedCertForAction && (
                <RevokeCertificateModal
                    certificate={selectedCertForAction}
                    onClose={() => {
                        setShowRevokeCertModal(false);
                        setSelectedCertForAction(null);
                    }}
                    onSuccess={() => {
                        setShowRevokeCertModal(false);
                        setSelectedCertForAction(null);
                        fetchUserCertificates();
                    }}
                />
            )}
        </div>
    );
};

export default TrainingPage;
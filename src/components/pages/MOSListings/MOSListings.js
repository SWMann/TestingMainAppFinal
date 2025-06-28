import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Search, Plus, Edit, Trash2, Shield, Building,
    FileText, Clock, ChevronRight, Filter, Download,
    Award, Users, Target, School, AlertCircle,
    CheckCircle, XCircle, Eye, EyeOff
} from 'lucide-react';
import './MOSListings.css';
import api from '../../../services/api';

// MOS Form Modal Component
const MOSFormModal = ({ isOpen, onClose, mos = null, onSave }) => {
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        branch: '',
        category: 'combat_arms',
        description: '',
        is_active: true,
        is_entry_level: true,
        ait_weeks: 0,
        ait_location: '',
        physical_demand_rating: 'moderate',
        security_clearance_required: 'none',
        min_asvab_score: 0
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (mos) {
            setFormData({
                code: mos.code || '',
                title: mos.title || '',
                branch: mos.branch?.id || mos.branch || '',
                category: mos.category || 'combat_arms',
                description: mos.description || '',
                is_active: mos.is_active !== undefined ? mos.is_active : true,
                is_entry_level: mos.is_entry_level !== undefined ? mos.is_entry_level : true,
                ait_weeks: mos.ait_weeks || 0,
                ait_location: mos.ait_location || '',
                physical_demand_rating: mos.physical_demand_rating || 'moderate',
                security_clearance_required: mos.security_clearance_required || 'none',
                min_asvab_score: mos.min_asvab_score || 0
            });
        }
    }, [mos]);

    const fetchBranches = async () => {
        try {
            const response = await api.get('/units/branches/');
            setBranches(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.code) newErrors.code = 'MOS code is required';
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.branch) newErrors.branch = 'Branch is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (formData.ait_weeks < 0) newErrors.ait_weeks = 'AIT weeks cannot be negative';
        if (formData.min_asvab_score < 0 || formData.min_asvab_score > 99) {
            newErrors.min_asvab_score = 'ASVAB score must be between 0 and 99';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving MOS:', error);
            if (error.response?.data) {
                setErrors(error.response.data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content mos-form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{mos ? 'Edit MOS' : 'Create New MOS'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="form-container">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>MOS Code *</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g., 11B"
                                className={errors.code ? 'error' : ''}
                            />
                            {errors.code && <span className="error-message">{errors.code}</span>}
                        </div>

                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Infantryman"
                                className={errors.title ? 'error' : ''}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label>Branch *</label>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className={errors.branch ? 'error' : ''}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            {errors.branch && <span className="error-message">{errors.branch}</span>}
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="combat_arms">Combat Arms</option>
                                <option value="combat_support">Combat Support</option>
                                <option value="combat_service_support">Combat Service Support</option>
                                <option value="special_operations">Special Operations</option>
                                <option value="aviation">Aviation</option>
                                <option value="medical">Medical</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="signal">Signal/Communications</option>
                                <option value="logistics">Logistics</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="administration">Administration</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describe the role and responsibilities..."
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        <div className="form-group">
                            <label>AIT Weeks</label>
                            <input
                                type="number"
                                name="ait_weeks"
                                value={formData.ait_weeks}
                                onChange={handleChange}
                                min="0"
                                className={errors.ait_weeks ? 'error' : ''}
                            />
                            {errors.ait_weeks && <span className="error-message">{errors.ait_weeks}</span>}
                        </div>

                        <div className="form-group">
                            <label>AIT Location</label>
                            <input
                                type="text"
                                name="ait_location"
                                value={formData.ait_location}
                                onChange={handleChange}
                                placeholder="e.g., Fort Benning, GA"
                            />
                        </div>

                        <div className="form-group">
                            <label>Physical Demand Rating</label>
                            <select
                                name="physical_demand_rating"
                                value={formData.physical_demand_rating}
                                onChange={handleChange}
                            >
                                <option value="light">Light</option>
                                <option value="moderate">Moderate</option>
                                <option value="heavy">Heavy</option>
                                <option value="very_heavy">Very Heavy</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Security Clearance</label>
                            <select
                                name="security_clearance_required"
                                value={formData.security_clearance_required}
                                onChange={handleChange}
                            >
                                <option value="none">None</option>
                                <option value="secret">Secret</option>
                                <option value="top_secret">Top Secret</option>
                                <option value="ts_sci">TS/SCI</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Min ASVAB Score</label>
                            <input
                                type="number"
                                name="min_asvab_score"
                                value={formData.min_asvab_score}
                                onChange={handleChange}
                                min="0"
                                max="99"
                                className={errors.min_asvab_score ? 'error' : ''}
                            />
                            {errors.min_asvab_score && <span className="error-message">{errors.min_asvab_score}</span>}
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span>Active</span>
                            </label>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_entry_level"
                                    checked={formData.is_entry_level}
                                    onChange={handleChange}
                                />
                                <span>Entry Level</span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Saving...' : 'Save MOS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// MOS Details Modal Component
const MOSDetailsModal = ({ isOpen, onClose, mosId }) => {
    const [mosData, setMosData] = useState(null);
    const [positions, setPositions] = useState([]);
    const [holders, setHolders] = useState({ primary: [], secondary: [], total_primary: 0, total_secondary: 0 });
    const [units, setUnits] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && mosId) {
            fetchMOSDetails();
        }
    }, [isOpen, mosId]);

    const fetchMOSDetails = async () => {
        setIsLoading(true);
        try {
            const [mosResponse, positionsResponse, holdersResponse, unitsResponse] = await Promise.all([
                api.get(`/units/mos/${mosId}/`),
                api.get(`/units/mos/${mosId}/positions/`),
                api.get(`/units/mos/${mosId}/holders/`),
                api.get(`/units/mos/${mosId}/units/`)
            ]);

            setMosData(mosResponse.data);
            setPositions(positionsResponse.data);
            setHolders(holdersResponse.data);
            setUnits(unitsResponse.data);
        } catch (error) {
            console.error('Error fetching MOS details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content mos-details-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {mosData ? `${mosData.code} - ${mosData.title}` : 'Loading...'}
                    </h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading MOS details...</p>
                    </div>
                ) : (
                    <>
                        <div className="details-tabs">
                            <button
                                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <FileText size={16} />
                                Overview
                            </button>
                            <button
                                className={`tab ${activeTab === 'units' ? 'active' : ''}`}
                                onClick={() => setActiveTab('units')}
                            >
                                <Building size={16} />
                                Authorized Units ({units.length})
                            </button>
                            <button
                                className={`tab ${activeTab === 'positions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('positions')}
                            >
                                <Target size={16} />
                                Positions ({positions.length})
                            </button>
                            <button
                                className={`tab ${activeTab === 'holders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('holders')}
                            >
                                <Users size={16} />
                                Personnel ({holders.total_primary + holders.total_secondary})
                            </button>
                        </div>

                        <div className="details-content">
                            {activeTab === 'overview' && mosData && (
                                <div className="overview-tab">
                                    <div className="info-section">
                                        <h3>Basic Information</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Category</label>
                                                <span>{mosData.category.replace(/_/g, ' ').toUpperCase()}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Branch</label>
                                                <span>{mosData.branch.name}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Status</label>
                                                <span className={`status-badge ${mosData.is_active ? 'active' : 'inactive'}`}>
                                                    {mosData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <label>Entry Level</label>
                                                <span className="status-badge">
                                                    {mosData.is_entry_level ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3>Description</h3>
                                        <p>{mosData.description}</p>
                                    </div>

                                    <div className="info-section">
                                        <h3>Training Requirements</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>AIT Duration</label>
                                                <span>{mosData.ait_weeks} weeks</span>
                                            </div>
                                            <div className="info-item">
                                                <label>AIT Location</label>
                                                <span>{mosData.ait_location || 'TBD'}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Min ASVAB Score</label>
                                                <span>{mosData.min_asvab_score || 'None'}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Security Clearance</label>
                                                <span>{mosData.security_clearance_required.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3>Physical Requirements</h3>
                                        <div className="physical-demand-indicator">
                                            <span className={`demand-level ${mosData.physical_demand_rating}`}>
                                                {mosData.physical_demand_rating.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {mosData.required_certifications?.length > 0 && (
                                        <div className="info-section">
                                            <h3>Required Certifications</h3>
                                            <div className="cert-list">
                                                {mosData.required_certifications.map(cert => (
                                                    <div key={cert.id} className="cert-item">
                                                        <Award size={16} />
                                                        <span>{cert.name} ({cert.abbreviation})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {mosData.related_mos?.length > 0 && (
                                        <div className="info-section">
                                            <h3>Related MOS</h3>
                                            <div className="unit-list">
                                                {mosData.related_mos.map(relatedMos => (
                                                    <div key={relatedMos.id} className="unit-item">
                                                        <Shield size={16} />
                                                        <span>{relatedMos.code} - {relatedMos.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'units' && (
                                <div className="units-tab">
                                    {units.length > 0 ? (
                                        <div className="unit-list">
                                            {units.map(unit => (
                                                <div key={unit.id} className="unit-item">
                                                    <Building size={16} />
                                                    <div className="unit-info">
                                                        <h4>{unit.name} ({unit.abbreviation})</h4>
                                                        <p>{unit.unit_type} - {unit.branch_name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <Building size={48} />
                                            <p>No units currently authorize this MOS</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'positions' && (
                                <div className="positions-tab">
                                    {positions.length > 0 ? (
                                        <div className="positions-list">
                                            {positions.map(position => (
                                                <div key={position.id} className="position-item">
                                                    <div className="position-info">
                                                        <h4>{position.display_title}</h4>
                                                        <p>{position.unit_name} ({position.unit_abbreviation})</p>
                                                    </div>
                                                    <span className={`vacancy-badge ${position.is_vacant ? 'vacant' : 'filled'}`}>
                                                        {position.is_vacant ? 'Vacant' : 'Filled'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <Target size={48} />
                                            <p>No positions currently require this MOS</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'holders' && (
                                <div className="holders-tab">
                                    <div className="holders-stats">
                                        <div className="stat-card">
                                            <div className="stat-value">{holders.total_primary}</div>
                                            <div className="stat-label">Primary MOS</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{holders.total_secondary}</div>
                                            <div className="stat-label">Secondary MOS</div>
                                        </div>
                                    </div>

                                    {holders.primary.length > 0 && (
                                        <div className="holders-section">
                                            <h4>Primary MOS Holders</h4>
                                            <div className="holders-list">
                                                {holders.primary.map(holder => (
                                                    <div key={holder.id} className="holder-item">
                                                        <div className="holder-info">
                                                            <span className="holder-name">
                                                                {holder.current_rank?.abbreviation} {holder.username}
                                                            </span>
                                                            <span className="holder-unit">
                                                                {holder.primary_unit?.name || 'No Unit'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {holders.secondary.length > 0 && (
                                        <div className="holders-section">
                                            <h4>Secondary MOS Holders</h4>
                                            <div className="holders-list">
                                                {holders.secondary.map(holder => (
                                                    <div key={holder.id} className="holder-item">
                                                        <div className="holder-info">
                                                            <span className="holder-name">
                                                                {holder.current_rank?.abbreviation} {holder.username}
                                                            </span>
                                                            <span className="holder-unit">
                                                                {holder.primary_unit?.name || 'No Unit'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Main MOS Listings Component
const MOSListings = () => {
    const { user: currentUser } = useSelector(state => state.auth);
    const isAdmin = currentUser?.is_admin;

    const [mosList, setMosList] = useState([]);
    const [filteredMosList, setFilteredMosList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        branch: '',
        category: '',
        status: 'all',
        entryLevel: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMos, setSelectedMos] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingMos, setEditingMos] = useState(null);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchMOSList();
        fetchBranches();
    }, []);

    useEffect(() => {
        filterMOSList();
    }, [mosList, searchTerm, filters]);

    const fetchBranches = async () => {
        try {
            const response = await api.get('/units/branches/');
            setBranches(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchMOSList = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/units/mos/');
            const data = response.data.results || response.data;
            setMosList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching MOS list:', error);
            setMosList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterMOSList = () => {
        let filtered = mosList;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(mos =>
                mos.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mos.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Branch filter
        if (filters.branch) {
            filtered = filtered.filter(mos =>
                mos.branch === filters.branch || mos.branch?.id === filters.branch
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(mos => mos.category === filters.category);
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(mos =>
                filters.status === 'active' ? mos.is_active : !mos.is_active
            );
        }

        // Entry level filter
        if (filters.entryLevel !== 'all') {
            filtered = filtered.filter(mos =>
                filters.entryLevel === 'yes' ? mos.is_entry_level : !mos.is_entry_level
            );
        }

        setFilteredMosList(filtered);
    };

    const handleCreateMOS = () => {
        setEditingMos(null);
        setShowFormModal(true);
    };

    const handleEditMOS = (mos) => {
        setEditingMos(mos);
        setShowFormModal(true);
    };

    const handleDeleteMOS = async (mosId) => {
        if (!window.confirm('Are you sure you want to delete this MOS? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/units/mos/${mosId}/`);
            setMosList(prev => prev.filter(mos => mos.id !== mosId));
        } catch (error) {
            console.error('Error deleting MOS:', error);
            alert('Failed to delete MOS. It may be in use by positions or personnel.');
        }
    };

    const handleSaveMOS = async (formData) => {
        try {
            if (editingMos) {
                const response = await api.put(`/units/mos/${editingMos.id}/`, formData);
                setMosList(prev => prev.map(mos =>
                    mos.id === editingMos.id ? response.data : mos
                ));
            } else {
                const response = await api.post('/units/mos/', formData);
                setMosList(prev => [...prev, response.data]);
            }
            fetchMOSList(); // Refresh list to get updated data
        } catch (error) {
            console.error('Error saving MOS:', error);
            throw error;
        }
    };

    const handleViewDetails = (mos) => {
        setSelectedMos(mos);
        setShowDetailsModal(true);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            combat_arms: '⚔️',
            combat_support: '🛡️',
            combat_service_support: '📦',
            special_operations: '🎯',
            aviation: '✈️',
            medical: '🏥',
            intelligence: '🔍',
            signal: '📡',
            logistics: '🚚',
            maintenance: '🔧',
            administration: '📋'
        };
        return icons[category] || '📌';
    };

    const getPhysicalDemandColor = (rating) => {
        const colors = {
            light: '#4ade80',
            moderate: '#fbbf24',
            heavy: '#fb923c',
            very_heavy: '#ef4444'
        };
        return colors[rating] || '#6b7280';
    };

    return (
        <div className="mos-listings-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Military Occupational Specialties</h1>
                    <p>Manage and view all MOS codes and their requirements</p>
                </div>
                {isAdmin && (
                    <button className="btn-primary" onClick={handleCreateMOS}>
                        <Plus size={20} />
                        Create MOS
                    </button>
                )}
            </div>

            <div className="controls-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by code, title, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    className={`filter-toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                    Filters
                </button>
            </div>

            {showFilters && (
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Branch</label>
                        <select
                            value={filters.branch}
                            onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
                        >
                            <option value="">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        >
                            <option value="">All Categories</option>
                            <option value="combat_arms">Combat Arms</option>
                            <option value="combat_support">Combat Support</option>
                            <option value="combat_service_support">Combat Service Support</option>
                            <option value="special_operations">Special Operations</option>
                            <option value="aviation">Aviation</option>
                            <option value="medical">Medical</option>
                            <option value="intelligence">Intelligence</option>
                            <option value="signal">Signal/Communications</option>
                            <option value="logistics">Logistics</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="administration">Administration</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Entry Level</label>
                        <select
                            value={filters.entryLevel}
                            onChange={(e) => setFilters(prev => ({ ...prev, entryLevel: e.target.value }))}
                        >
                            <option value="all">All</option>
                            <option value="yes">Entry Level Only</option>
                            <option value="no">Advanced Only</option>
                        </select>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading MOS data...</p>
                </div>
            ) : (
                <>
                    <div className="results-summary">
                        <span>Showing {filteredMosList.length} of {mosList.length} MOS entries</span>
                    </div>

                    <div className="mos-grid">
                        {filteredMosList.map(mos => (
                            <div key={mos.id} className="mos-card">
                                <div className="mos-header">
                                    <div className="mos-title-section">
                                        <span className="mos-icon">{getCategoryIcon(mos.category)}</span>
                                        <div>
                                            <h3>{mos.code}</h3>
                                            <p>{mos.title}</p>
                                        </div>
                                    </div>
                                    <div className="mos-badges">
                                        <span className={`status-badge ${mos.is_active ? 'active' : 'inactive'}`}>
                                            {mos.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {mos.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        {mos.is_entry_level && (
                                            <span className="entry-level-badge">Entry Level</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mos-body">
                                    <p className="mos-description">{mos.description}</p>

                                    <div className="mos-details">
                                        <div className="detail-item">
                                            <Building size={16} />
                                            <span>{mos.branch_name || mos.branch?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <School size={16} />
                                            <span>{mos.ait_weeks} weeks AIT</span>
                                        </div>
                                        <div className="detail-item">
                                            <Users size={16} />
                                            <span>{mos.holders_count || 0} personnel</span>
                                        </div>
                                        <div className="detail-item">
                                            <Shield size={16} />
                                            <span>{mos.security_clearance_required.toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div className="physical-demand">
                                        <span>Physical Demand:</span>
                                        <div
                                            className="demand-bar"
                                            style={{ backgroundColor: getPhysicalDemandColor(mos.physical_demand_rating) }}
                                        >
                                            {mos.physical_demand_rating.replace(/_/g, ' ').toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="mos-footer">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => handleViewDetails(mos)}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                    {isAdmin && (
                                        <div className="admin-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditMOS(mos)}
                                                title="Edit MOS"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDeleteMOS(mos.id)}
                                                title="Delete MOS"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredMosList.length === 0 && (
                        <div className="empty-state">
                            <AlertCircle size={48} />
                            <h3>No MOS entries found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <MOSFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                mos={editingMos}
                onSave={handleSaveMOS}
            />

            <MOSDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                mosId={selectedMos?.id}
            />
        </div>
    );
};

export default MOSListings;
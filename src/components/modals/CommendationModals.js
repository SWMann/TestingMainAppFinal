import React, { useState, useEffect } from 'react';
import {
    X, Medal, Award, FileText, Shield, Upload, Search,
    Calendar, User, AlertCircle, Plus, Users, MapPin,
    Hash, ChevronRight, Star, Zap, Trophy, Target, Sparkles
} from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";

// CreateCommendationModal Component
export const CreateCommendationModal = ({ branches = [], onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        description: '',
        category: 'valor',
        precedence: 100,
        eligibility_criteria: '',
        min_rank_requirement: null,
        requires_nomination: true,
        auto_award_criteria: {},
        is_active: true,
        multiple_awards_allowed: true,
        max_awards_per_user: 0,
        allowed_branches: [],
        ribbon_image_url: '',
        medal_image_url: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [ranks, setRanks] = useState([]);

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        try {
            const response = await api.get('/ranks/');
            setRanks(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching ranks:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.abbreviation.trim()) newErrors.abbreviation = 'Abbreviation is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.precedence) newErrors.precedence = 'Precedence is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                ...formData,
                precedence: parseInt(formData.precedence),
                max_awards_per_user: parseInt(formData.max_awards_per_user) || 0,
                min_rank_requirement: formData.min_rank_requirement || null
            };

            await api.post('/commendations/types/', submitData);
            onSuccess();
        } catch (error) {
            console.error('Error creating commendation:', error);
            if (error.response?.data) {
                setErrors(error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'allowed_branches') {
            const branchId = value;
            setFormData(prev => ({
                ...prev,
                allowed_branches: checked
                    ? [...prev.allowed_branches, branchId]
                    : prev.allowed_branches.filter(id => id !== branchId)
            }));
        } else if (name === 'min_rank_requirement' && value === '') {
            setFormData(prev => ({
                ...prev,
                [name]: null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const categories = [
        { value: 'valor', label: 'Valor', icon: Zap },
        { value: 'achievement', label: 'Achievement', icon: Trophy },
        { value: 'service', label: 'Service', icon: Shield },
        { value: 'campaign', label: 'Campaign', icon: Target },
        { value: 'qualification', label: 'Qualification', icon: Award },
        { value: 'unit', label: 'Unit Citation', icon: Users },
        { value: 'special', label: 'Special Recognition', icon: Sparkles }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Medal size={20} />
                        Create New Commendation
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Basic Information Section */}
                    <div className="form-section">
                        <h3>
                            <FileText size={18} />
                            Basic Information
                        </h3>

                        <div className="form-group">
                            <label>Commendation Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Distinguished Service Medal"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Abbreviation*</label>
                                <input
                                    type="text"
                                    name="abbreviation"
                                    value={formData.abbreviation}
                                    onChange={handleChange}
                                    placeholder="e.g., DSM"
                                    className={errors.abbreviation ? 'error' : ''}
                                />
                                {errors.abbreviation && <span className="error-message">{errors.abbreviation}</span>}
                            </div>

                            <div className="form-group">
                                <label>Precedence*</label>
                                <input
                                    type="number"
                                    name="precedence"
                                    value={formData.precedence}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Lower = Higher precedence"
                                    className={errors.precedence ? 'error' : ''}
                                />
                                {errors.precedence && <span className="error-message">{errors.precedence}</span>}
                                <span className="field-help">Order of precedence (lower numbers = higher precedence)</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Category*</label>
                            <div className="category-grid">
                                {categories.map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                        <label
                                            key={cat.value}
                                            className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.value}
                                                checked={formData.category === cat.value}
                                                onChange={handleChange}
                                                style={{ display: 'none' }}
                                            />
                                            <Icon size={18} />
                                            <span>{cat.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Brief description of the commendation..."
                            />
                        </div>
                    </div>

                    {/* Visual Elements Section */}
                    <div className="form-section">
                        <h3>
                            <Upload size={18} />
                            Visual Elements
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Ribbon Image URL</label>
                                <input
                                    type="url"
                                    name="ribbon_image_url"
                                    value={formData.ribbon_image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/ribbon.png"
                                />
                                <span className="field-help">URL for ribbon bar display</span>
                            </div>

                            <div className="form-group">
                                <label>Medal Image URL</label>
                                <input
                                    type="url"
                                    name="medal_image_url"
                                    value={formData.medal_image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/medal.png"
                                />
                                <span className="field-help">URL for full medal display</span>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="form-section">
                        <h3>
                            <Shield size={18} />
                            Requirements & Restrictions
                        </h3>

                        <div className="form-group">
                            <label>Eligibility Criteria</label>
                            <textarea
                                name="eligibility_criteria"
                                value={formData.eligibility_criteria}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe the eligibility requirements..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Minimum Rank Requirement</label>
                            <select
                                name="min_rank_requirement"
                                value={formData.min_rank_requirement || ''}
                                onChange={handleChange}
                            >
                                <option value="">No minimum rank</option>
                                {ranks.map(rank => (
                                    <option key={rank.id} value={rank.id}>
                                        {rank.name} ({rank.abbreviation})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Allowed Branches</label>
                            <div className="checkbox-grid">
                                {branches.map(branch => (
                                    <label key={branch.id} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="allowed_branches"
                                            value={branch.id}
                                            checked={formData.allowed_branches.includes(branch.id)}
                                            onChange={handleChange}
                                        />
                                        <span>{branch.name}</span>
                                    </label>
                                ))}
                            </div>
                            <span className="field-help">Leave empty for all branches</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="requires_nomination"
                                        checked={formData.requires_nomination}
                                        onChange={handleChange}
                                    />
                                    <span>Requires Nomination</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="multiple_awards_allowed"
                                        checked={formData.multiple_awards_allowed}
                                        onChange={handleChange}
                                    />
                                    <span>Multiple Awards Allowed</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <span>Active</span>
                                </label>
                            </div>
                        </div>

                        {formData.multiple_awards_allowed && (
                            <div className="form-group">
                                <label>Max Awards Per User</label>
                                <input
                                    type="number"
                                    name="max_awards_per_user"
                                    value={formData.max_awards_per_user}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0 = unlimited"
                                />
                                <span className="field-help">0 = unlimited awards allowed</span>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Commendation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// AwardCommendationModal Component
export const AwardCommendationModal = ({ commendationType, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        commendation_type_id: commendationType.id,
        citation: '',
        short_citation: '',
        awarded_date: new Date().toISOString().slice(0, 16),
        related_event_id: null,
        related_unit_id: null,
        order_number: '',
        is_public: true,
        supporting_documents: [],
        devices: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [units, setUnits] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        fetchRelatedData();
    }, []);

    const fetchRelatedData = async () => {
        try {
            // Fetch recent events
            const eventsRes = await api.get('/events/?limit=50');
            setEvents(eventsRes.data.results || eventsRes.data);

            // Fetch units
            const unitsRes = await api.get('/units/');
            setUnits(unitsRes.data.results || unitsRes.data);
        } catch (error) {
            console.error('Error fetching related data:', error);
        }
    };

    const searchUsers = async (term) => {
        if (term.length < 2) {
            setUsers([]);
            return;
        }

        setSearchingUsers(true);
        try {
            const response = await api.get(`/users/?search=${term}`);
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearchingUsers(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchUsers(searchTerm);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.user_id) newErrors.user_id = 'Please select a user';
        if (!formData.citation.trim()) newErrors.citation = 'Citation is required';
        if (!formData.short_citation.trim()) newErrors.short_citation = 'Short citation is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            // Clean up the data before sending - convert empty strings to null
            const submitData = {
                ...formData,
                related_event_id: formData.related_event_id || null,
                related_unit_id: formData.related_unit_id || null,
                order_number: formData.order_number || null
            };

            await api.post('/commendations/awards/award/', submitData);
            onSuccess();
        } catch (error) {
            console.error('Error awarding commendation:', error);
            if (error.response?.data) {
                setErrors(error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle select fields that should be null when empty
        if ((name === 'related_event_id' || name === 'related_unit_id') && value === '') {
            setFormData(prev => ({
                ...prev,
                [name]: null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const selectUser = (user) => {
        setFormData(prev => ({ ...prev, user_id: user.id }));
        setSearchTerm(user.username);
        setUsers([]);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Award size={20} />
                        Award {commendationType.name}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Commendation Info */}
                    <div className="commendation-type-info">
                        <div className="medal-preview">
                            {commendationType.medal_display_url ? (
                                <img
                                    src={commendationType.medal_display_url}
                                    alt={commendationType.name}
                                    className="medal-image"
                                />
                            ) : (
                                <div className="medal-placeholder">
                                    <Medal size={64} />
                                </div>
                            )}
                        </div>
                        <div className="commendation-details">
                            <h3>{commendationType.name}</h3>
                            <p className="abbreviation">{commendationType.abbreviation}</p>
                            {commendationType.description && (
                                <p className="description">{commendationType.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Recipient Selection */}
                    <div className="form-section">
                        <h3>
                            <User size={18} />
                            Recipient
                        </h3>

                        <div className="form-group">
                            <label>Search User*</label>
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by username..."
                                    className={errors.user_id ? 'error' : ''}
                                />
                            </div>
                            {errors.user_id && <span className="error-message">{errors.user_id}</span>}

                            {searchingUsers && (
                                <div className="searching">Searching...</div>
                            )}

                            {users.length > 0 && (
                                <div className="search-results">
                                    {users.map(user => (
                                        <div
                                            key={user.id}
                                            className="user-result"
                                            onClick={() => selectUser(user)}
                                        >
                                            <img
                                                src={user.avatar_url || '/default-avatar.png'}
                                                alt={user.username}
                                                className="user-avatar"
                                            />
                                            <div className="user-info">
                                                <div className="username">{user.username}</div>
                                                <div className="user-meta">
                                                    {user.current_rank?.abbreviation} • {user.primary_unit?.abbreviation || 'No Unit'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Citation */}
                    <div className="form-section">
                        <h3>
                            <FileText size={18} />
                            Citation
                        </h3>

                        <div className="form-group">
                            <label>Short Citation*</label>
                            <input
                                type="text"
                                name="short_citation"
                                value={formData.short_citation}
                                onChange={handleChange}
                                maxLength={500}
                                placeholder="Brief summary (max 500 characters)..."
                                className={errors.short_citation ? 'error' : ''}
                            />
                            {errors.short_citation && <span className="error-message">{errors.short_citation}</span>}
                            <span className="field-help">{formData.short_citation.length}/500 characters</span>
                        </div>

                        <div className="form-group">
                            <label>Full Citation*</label>
                            <textarea
                                name="citation"
                                value={formData.citation}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Full citation text describing the reason for the award..."
                                className={errors.citation ? 'error' : ''}
                            />
                            {errors.citation && <span className="error-message">{errors.citation}</span>}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="form-section">
                        <h3>
                            <Calendar size={18} />
                            Additional Details
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Award Date</label>
                                <input
                                    type="datetime-local"
                                    name="awarded_date"
                                    value={formData.awarded_date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Order Number</label>
                                <input
                                    type="text"
                                    name="order_number"
                                    value={formData.order_number}
                                    onChange={handleChange}
                                    placeholder="Optional order reference"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Related Event</label>
                                <select
                                    name="related_event_id"
                                    value={formData.related_event_id || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>
                                            {event.title} ({new Date(event.start_time).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Related Unit</label>
                                <select
                                    name="related_unit_id"
                                    value={formData.related_unit_id || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name} ({unit.abbreviation})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleChange}
                                />
                                <span>Make this award public</span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Awarding...' : 'Award Commendation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// CommendationDetailsModal Component
export const CommendationDetailsModal = ({ commendation, commendationType, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [recipients, setRecipients] = useState([]);
    const [loadingRecipients, setLoadingRecipients] = useState(false);

    useEffect(() => {
        if (commendationType && activeTab === 'recipients') {
            fetchRecipients();
        }
    }, [commendationType, activeTab]);

    const fetchRecipients = async () => {
        setLoadingRecipients(true);
        try {
            const response = await api.get(`/commendations/types/${commendationType.id}/recipients/`);
            setRecipients(response.data);
        } catch (error) {
            console.error('Error fetching recipients:', error);
        } finally {
            setLoadingRecipients(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Determine what to display
    const displayData = commendation || commendationType;
    const isAward = !!commendation;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Medal size={20} />
                        {isAward ? 'Award Details' : 'Commendation Details'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-form">
                    {/* Commendation Header */}
                    <div className="commendation-header-section">
                        <div className="medal-display">
                            {(isAward ? commendation.commendation_type_details.medal_display_url : displayData.medal_display_url) ? (
                                <img
                                    src={isAward ? commendation.commendation_type_details.medal_display_url : displayData.medal_display_url}
                                    alt={isAward ? commendation.commendation_type_details.name : displayData.name}
                                    className="medal-large"
                                />
                            ) : (
                                <div className="medal-placeholder-large">
                                    <Medal size={96} />
                                </div>
                            )}
                            {(isAward ? commendation.commendation_type_details.ribbon_display_url : displayData.ribbon_display_url) && (
                                <img
                                    src={isAward ? commendation.commendation_type_details.ribbon_display_url : displayData.ribbon_display_url}
                                    alt="Ribbon"
                                    className="ribbon-display"
                                />
                            )}
                        </div>

                        <div className="commendation-main-info">
                            <h3>{isAward ? commendation.commendation_type_details.name : displayData.name}</h3>
                            <p className="abbreviation-large">
                                {isAward ? commendation.commendation_type_details.abbreviation : displayData.abbreviation}
                            </p>
                            <div className="category-badge-large">
                                <Star size={16} />
                                {(isAward ? commendation.commendation_type_details.category : displayData.category).replace('_', ' ').toUpperCase()}
                            </div>
                            {(isAward ? commendation.commendation_type_details.description : displayData.description) && (
                                <p className="description">{isAward ? commendation.commendation_type_details.description : displayData.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Tabs for commendation type */}
                    {!isAward && (
                        <div className="detail-tabs">
                            <button
                                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Details
                            </button>
                            <button
                                className={`tab ${activeTab === 'recipients' ? 'active' : ''}`}
                                onClick={() => setActiveTab('recipients')}
                            >
                                Recipients ({displayData.awards_count || 0})
                            </button>
                        </div>
                    )}

                    {/* Content based on tab or award */}
                    {isAward ? (
                        // Award Details
                        <div className="award-details-content">
                            <div className="detail-section">
                                <h4>
                                    <User size={18} />
                                    Recipient Information
                                </h4>
                                <div className="recipient-card">
                                    <img
                                        src={commendation.user_avatar || '/default-avatar.png'}
                                        alt={commendation.user_username}
                                        className="recipient-avatar"
                                    />
                                    <div className="recipient-details">
                                        <h5>{commendation.user_username}</h5>
                                        <p>{commendation.user_rank?.abbreviation} {commendation.user_rank?.name}</p>
                                        {commendation.related_unit_name && (
                                            <p className="unit-info">
                                                <Shield size={14} />
                                                {commendation.related_unit_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>
                                    <FileText size={18} />
                                    Citation
                                </h4>
                                <div className="citation-box">
                                    <p className="citation-text">{commendation.citation}</p>
                                    <div className="citation-meta">
                                        <span>
                                            <Calendar size={14} />
                                            Awarded: {formatDate(commendation.awarded_date)}
                                        </span>
                                        {commendation.awarded_by_username && (
                                            <span>
                                                <User size={14} />
                                                Awarded by: {commendation.awarded_by_username}
                                            </span>
                                        )}
                                        {commendation.order_number && (
                                            <span>
                                                <Hash size={14} />
                                                Order: {commendation.order_number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {commendation.related_event_title && (
                                <div className="detail-section">
                                    <h4>
                                        <MapPin size={18} />
                                        Related Event
                                    </h4>
                                    <p>{commendation.related_event_title}</p>
                                </div>
                            )}

                            {commendation.devices && commendation.devices.length > 0 && (
                                <div className="detail-section">
                                    <h4>
                                        <Award size={18} />
                                        Devices
                                    </h4>
                                    <div className="devices-list">
                                        {commendation.devices.map(device => (
                                            <div key={device.id} className="device-item">
                                                <span>{device.device_details.name}</span>
                                                {device.quantity > 1 && <span className="quantity">x{device.quantity}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="award-status">
                                {commendation.is_verified ? (
                                    <div className="status-badge verified">
                                        <Shield size={16} />
                                        Verified
                                    </div>
                                ) : (
                                    <div className="status-badge unverified">
                                        <AlertCircle size={16} />
                                        Pending Verification
                                    </div>
                                )}
                                {commendation.award_number > 1 && (
                                    <div className="status-badge award-number">
                                        <Hash size={16} />
                                        Award #{commendation.award_number}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'details' ? (
                        // Commendation Type Details
                        <div className="type-details-content">
                            <div className="detail-section">
                                <h4>
                                    <Shield size={18} />
                                    Requirements
                                </h4>
                                {displayData.eligibility_criteria ? (
                                    <p>{displayData.eligibility_criteria}</p>
                                ) : (
                                    <p className="no-data">No specific eligibility criteria defined</p>
                                )}

                                <div className="requirement-items">
                                    {displayData.min_rank_name && (
                                        <div className="requirement-item">
                                            <ChevronRight size={16} />
                                            Minimum Rank: {displayData.min_rank_name}
                                        </div>
                                    )}
                                    {displayData.requires_nomination && (
                                        <div className="requirement-item">
                                            <ChevronRight size={16} />
                                            Requires nomination process
                                        </div>
                                    )}
                                    {displayData.multiple_awards_allowed ? (
                                        <div className="requirement-item">
                                            <ChevronRight size={16} />
                                            Multiple awards allowed
                                            {displayData.max_awards_per_user > 0 && ` (max ${displayData.max_awards_per_user})`}
                                        </div>
                                    ) : (
                                        <div className="requirement-item">
                                            <ChevronRight size={16} />
                                            Single award only
                                        </div>
                                    )}
                                </div>
                            </div>

                            {displayData.allowed_branches && displayData.allowed_branches.length > 0 && (
                                <div className="detail-section">
                                    <h4>
                                        <Users size={18} />
                                        Allowed Branches
                                    </h4>
                                    <div className="branches-list">
                                        {displayData.allowed_branches.map(branch => (
                                            <div key={branch.id} className="branch-badge">
                                                {branch.abbreviation}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>
                                    <Hash size={18} />
                                    Statistics
                                </h4>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-value">{displayData.awards_count || 0}</div>
                                        <div className="stat-label">Total Awards</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{displayData.precedence}</div>
                                        <div className="stat-label">Precedence</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{displayData.is_active ? 'Active' : 'Inactive'}</div>
                                        <div className="stat-label">Status</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Recipients Tab
                        <div className="recipients-content">
                            {loadingRecipients ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading recipients...</p>
                                </div>
                            ) : recipients.length > 0 ? (
                                <div className="recipients-list">
                                    {recipients.map(recipient => (
                                        <div key={recipient.id} className="recipient-row">
                                            <img
                                                src={recipient.user_avatar || '/default-avatar.png'}
                                                alt={recipient.user_username}
                                                className="recipient-avatar-small"
                                            />
                                            <div className="recipient-info">
                                                <div className="recipient-name">
                                                    {recipient.user_rank?.abbreviation} {recipient.user_username}
                                                </div>
                                                <div className="recipient-meta">
                                                    <span>{formatDate(recipient.awarded_date)}</span>
                                                    {recipient.related_unit_name && (
                                                        <span> • {recipient.related_unit_name}</span>
                                                    )}
                                                    {recipient.award_number > 1 && (
                                                        <span className="award-number-small">#{recipient.award_number}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {recipient.is_verified && (
                                                <Shield size={16} className="verified-icon" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data">
                                    <Medal size={48} />
                                    <p>No recipients yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Export all modals
export default {
    CreateCommendationModal,
    AwardCommendationModal,
    CommendationDetailsModal
};
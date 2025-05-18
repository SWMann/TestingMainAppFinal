import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Users, Shield, Flag, Grid, Search, Plus, Edit, Trash2,
    Filter, ChevronDown, ChevronUp, X, Save, Link, ExternalLink,
    Loader, MoreHorizontal, AlertTriangle, CheckCircle, UserPlus,
    Settings
} from 'lucide-react';
import api from '../../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    // Auth state
    const { user } = useSelector(state => state.auth);

    // Entity data states
    const [users, setUsers] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [units, setUnits] = useState([]);

    // UI states
    const [activeTab, setActiveTab] = useState('users');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalData, setModalData] = useState({});
    const [sortConfig, setSortConfig] = useState({ field: 'id', direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);

    // Fetch data when component mounts or active tab changes
    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    // Function to fetch data based on active tab
    const fetchData = async (tabName) => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            switch(tabName) {
                case 'users':
                    response = await api.get('/users/');
                    setUsers(response.data);
                    break;
                case 'ranks':
                    response = await api.get('/ranks/');
                    setRanks(response.data);
                    break;
                case 'branches':
                    response = await api.get('/branches/');
                    setBranches(response.data);
                    break;
                case 'units':
                    response = await api.get('/units/');
                    setUnits(response.data);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error(`Error fetching ${tabName}:`, err);
            setError(`Failed to load ${tabName}. Please try again.`);
            // Load sample data for development
            loadSampleData(tabName);
        } finally {
            setIsLoading(false);
        }
    };

    // Load sample data for development
    const loadSampleData = (tabName) => {
        switch(tabName) {
            case 'users':
                setUsers([
                    {
                        id: 'user-1',
                        username: 'Cmdr_Starhawk',
                        email: 'starhawk@ueenavy.org',
                        avatar_url: '/api/placeholder/40/40',
                        discord_id: '123456789012345678',
                        service_number: 'UEE-N-47291',
                        is_active: true,
                        is_staff: true,
                        rank_id: 'rank-3',
                        rank: { name: 'Lieutenant Commander', abbreviation: 'Lt. Cmdr.', branch: { name: 'UEE Navy', abbreviation: 'UEEN' } },
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        primary_unit_id: 'unit-2',
                        primary_unit: { name: '3rd Fleet, 2nd Squadron', abbreviation: '3F-2S' }
                    },
                    {
                        id: 'user-2',
                        username: 'Captain_Reynolds',
                        email: 'reynolds@ueenavy.org',
                        avatar_url: '/api/placeholder/40/40',
                        discord_id: '223456789012345678',
                        service_number: 'UEE-N-38291',
                        is_active: true,
                        is_staff: false,
                        rank_id: 'rank-4',
                        rank: { name: 'Captain', abbreviation: 'Capt.', branch: { name: 'UEE Navy', abbreviation: 'UEEN' } },
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        primary_unit_id: 'unit-1',
                        primary_unit: { name: 'Special Operations Group', abbreviation: 'SOG' }
                    },
                    {
                        id: 'user-3',
                        username: 'Lt_Chen',
                        email: 'chen@ueenavy.org',
                        avatar_url: '/api/placeholder/40/40',
                        discord_id: '323456789012345678',
                        service_number: 'UEE-N-52910',
                        is_active: true,
                        is_staff: false,
                        rank_id: 'rank-2',
                        rank: { name: 'Lieutenant', abbreviation: 'Lt.', branch: { name: 'UEE Navy', abbreviation: 'UEEN' } },
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        primary_unit_id: 'unit-2',
                        primary_unit: { name: '3rd Fleet, 2nd Squadron', abbreviation: '3F-2S' }
                    },
                    {
                        id: 'user-4',
                        username: 'Major_Thompson',
                        email: 'thompson@ueemarine.org',
                        avatar_url: '/api/placeholder/40/40',
                        discord_id: '423456789012345678',
                        service_number: 'UEE-M-12465',
                        is_active: true,
                        is_staff: false,
                        rank_id: 'rank-5',
                        rank: { name: 'Major', abbreviation: 'Maj.', branch: { name: 'UEE Marines', abbreviation: 'UEEM' } },
                        branch_id: 'branch-2',
                        branch: { name: 'UEE Marines', abbreviation: 'UEEM' },
                        primary_unit_id: 'unit-3',
                        primary_unit: { name: 'Fleet Intelligence Division', abbreviation: 'FID' }
                    },
                    {
                        id: 'user-5',
                        username: 'Pvt_Franklin',
                        email: 'franklin@ueemarine.org',
                        avatar_url: '/api/placeholder/40/40',
                        discord_id: '523456789012345678',
                        service_number: 'UEE-M-38291',
                        is_active: false,
                        is_staff: false,
                        rank_id: 'rank-1',
                        rank: { name: 'Private', abbreviation: 'Pvt.', branch: { name: 'UEE Marines', abbreviation: 'UEEM' } },
                        branch_id: 'branch-2',
                        branch: { name: 'UEE Marines', abbreviation: 'UEEM' },
                        primary_unit_id: 'unit-1',
                        primary_unit: { name: 'Special Operations Group', abbreviation: 'SOG' }
                    }
                ]);
                break;

            case 'ranks':
                setRanks([
                    {
                        id: 'rank-1',
                        name: 'Private',
                        abbreviation: 'Pvt.',
                        tier: 1,
                        description: 'Enlisted entry rank for Marines',
                        insignia_image_url: '/api/placeholder/30/15',
                        branch_id: 'branch-2',
                        branch: { name: 'UEE Marines', abbreviation: 'UEEM' },
                        is_officer: false,
                        is_enlisted: true,
                        is_warrant: false
                    },
                    {
                        id: 'rank-2',
                        name: 'Lieutenant',
                        abbreviation: 'Lt.',
                        tier: 5,
                        description: 'Junior commissioned officer rank',
                        insignia_image_url: '/api/placeholder/30/15',
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        is_officer: true,
                        is_enlisted: false,
                        is_warrant: false
                    },
                    {
                        id: 'rank-3',
                        name: 'Lieutenant Commander',
                        abbreviation: 'Lt. Cmdr.',
                        tier: 6,
                        description: 'Mid-grade commissioned officer rank',
                        insignia_image_url: '/api/placeholder/30/15',
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        is_officer: true,
                        is_enlisted: false,
                        is_warrant: false
                    },
                    {
                        id: 'rank-4',
                        name: 'Captain',
                        abbreviation: 'Capt.',
                        tier: 8,
                        description: 'Senior commissioned officer rank',
                        insignia_image_url: '/api/placeholder/30/15',
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        is_officer: true,
                        is_enlisted: false,
                        is_warrant: false
                    },
                    {
                        id: 'rank-5',
                        name: 'Major',
                        abbreviation: 'Maj.',
                        tier: 7,
                        description: 'Field grade officer rank',
                        insignia_image_url: '/api/placeholder/30/15',
                        branch_id: 'branch-2',
                        branch: { name: 'UEE Marines', abbreviation: 'UEEM' },
                        is_officer: true,
                        is_enlisted: false,
                        is_warrant: false
                    }
                ]);
                break;

            case 'branches':
                setBranches([
                    {
                        id: 'branch-1',
                        name: 'UEE Navy',
                        abbreviation: 'UEEN',
                        description: 'The backbone of UEE power projection.',
                        logo_url: '/api/placeholder/40/40',
                        banner_image_url: '/api/placeholder/120/40',
                        color_code: '#1F4287'
                    },
                    {
                        id: 'branch-2',
                        name: 'UEE Marines',
                        abbreviation: 'UEEM',
                        description: 'Elite ground and boarding forces.',
                        logo_url: '/api/placeholder/40/40',
                        banner_image_url: '/api/placeholder/120/40',
                        color_code: '#CF1020'
                    },
                    {
                        id: 'branch-3',
                        name: 'UEE Army',
                        abbreviation: 'UEEA',
                        description: 'Planetary defense and occupation forces.',
                        logo_url: '/api/placeholder/40/40',
                        banner_image_url: '/api/placeholder/120/40',
                        color_code: '#4B5D46'
                    },
                    {
                        id: 'branch-4',
                        name: 'Joint Command',
                        abbreviation: 'UEEJC',
                        description: 'Combined operations command structure.',
                        logo_url: '/api/placeholder/40/40',
                        banner_image_url: '/api/placeholder/120/40',
                        color_code: '#E4D00A'
                    }
                ]);
                break;

            case 'units':
                setUnits([
                    {
                        id: 'unit-1',
                        name: 'Special Operations Group',
                        abbreviation: 'SOG',
                        description: 'Elite unit conducting covert and high-risk operations',
                        emblem_url: '/api/placeholder/40/40',
                        branch_id: 'branch-4',
                        branch: { name: 'Joint Command', abbreviation: 'UEEJC' },
                        parent_unit_id: null,
                        unit_type: 'Special',
                        motto: 'Unseen, Unheard, Unstoppable',
                        established_date: '2947-09-22',
                        is_active: true
                    },
                    {
                        id: 'unit-2',
                        name: '3rd Fleet, 2nd Squadron',
                        abbreviation: '3F-2S',
                        description: 'Naval combat squadron specializing in coordinated fleet actions',
                        emblem_url: '/api/placeholder/40/40',
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        parent_unit_id: 'unit-4',
                        unit_type: 'Squadron',
                        motto: 'Swift Justice',
                        established_date: '2941-03-15',
                        is_active: true
                    },
                    {
                        id: 'unit-3',
                        name: 'Fleet Intelligence Division',
                        abbreviation: 'FID',
                        description: 'Intelligence gathering and tactical analysis unit',
                        emblem_url: '/api/placeholder/40/40',
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        parent_unit_id: null,
                        unit_type: 'Division',
                        motto: 'Knowledge Is Power',
                        established_date: '2944-11-05',
                        is_active: true
                    },
                    {
                        id: 'unit-4',
                        name: '3rd Fleet',
                        abbreviation: '3F',
                        description: 'Primary naval fleet operating in the Stanton system',
                        emblem_url: '/api/placeholder/40/40',
                        branch_id: 'branch-1',
                        branch: { name: 'UEE Navy', abbreviation: 'UEEN' },
                        parent_unit_id: null,
                        unit_type: 'Fleet',
                        motto: 'Beyond the Horizon',
                        established_date: '2940-07-23',
                        is_active: true
                    }
                ]);
                break;

            default:
                break;
        }
    };

    // Function to handle sort
    const handleSort = (field) => {
        const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ field, direction });
    };

    // Function to get sorted data
    const getSortedData = (data) => {
        if (!sortConfig.field) return data;

        return [...data].sort((a, b) => {
            // Handle nested properties like rank.name
            const aValue = sortConfig.field.includes('.')
                ? sortConfig.field.split('.').reduce((obj, key) => obj?.[key], a)
                : a[sortConfig.field];
            const bValue = sortConfig.field.includes('.')
                ? sortConfig.field.split('.').reduce((obj, key) => obj?.[key], b)
                : b[sortConfig.field];

            // Handle different data types
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // For boolean
            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                return sortConfig.direction === 'asc'
                    ? (aValue === bValue ? 0 : aValue ? -1 : 1)
                    : (aValue === bValue ? 0 : aValue ? 1 : -1);
            }

            // For numbers and dates
            return sortConfig.direction === 'asc'
                ? (aValue > bValue ? 1 : -1)
                : (aValue < bValue ? 1 : -1);
        });
    };

    // Function to handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Function to filter data based on search term
    const getFilteredData = (data) => {
        if (!searchTerm) return data;

        return data.filter(item => {
            // Search across all string properties
            return Object.keys(item).some(key => {
                if (typeof item[key] === 'string') {
                    return item[key].toLowerCase().includes(searchTerm.toLowerCase());
                }

                // Handle nested objects like rank.name
                if (typeof item[key] === 'object' && item[key] !== null) {
                    return Object.keys(item[key]).some(nestedKey => {
                        if (typeof item[key][nestedKey] === 'string') {
                            return item[key][nestedKey].toLowerCase().includes(searchTerm.toLowerCase());
                        }
                        return false;
                    });
                }

                return false;
            });
        });
    };

    // Function to handle item selection
    const handleItemSelect = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    // Function to select all items
    const handleSelectAll = (data) => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map(item => item.id));
        }
    };

    // Function to open modal for creating new item
    const handleOpenCreateModal = (type) => {
        setModalType(`create_${type}`);
        setModalData({});
        setIsModalOpen(true);
    };

    // Function to open modal for editing item
    const handleOpenEditModal = (type, item) => {
        setModalType(`edit_${type}`);
        setModalData(item);
        setIsModalOpen(true);
    };

    // Function to open modal for linking items
    const handleOpenLinkModal = (type, item) => {
        setModalType(`link_${type}`);
        setModalData(item);
        setIsModalOpen(true);
    };

    // Function to handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType('');
        setModalData({});
    };

    // Function to handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let response;

            // Handle various form submissions based on modalType
            if (modalType.startsWith('create_')) {
                const entityType = modalType.split('_')[1];
                response = await api.post(`/${entityType}/`, modalData);

                // Update local state
                if (entityType === 'users') setUsers([...users, response.data]);
                if (entityType === 'ranks') setRanks([...ranks, response.data]);
                if (entityType === 'branches') setBranches([...branches, response.data]);
                if (entityType === 'units') setUnits([...units, response.data]);
            }
            else if (modalType.startsWith('edit_')) {
                const entityType = modalType.split('_')[1];
                response = await api.put(`/${entityType}/${modalData.id}/`, modalData);

                // Update local state
                if (entityType === 'users') setUsers(users.map(item => item.id === modalData.id ? response.data : item));
                if (entityType === 'ranks') setRanks(ranks.map(item => item.id === modalData.id ? response.data : item));
                if (entityType === 'branches') setBranches(branches.map(item => item.id === modalData.id ? response.data : item));
                if (entityType === 'units') setUnits(units.map(item => item.id === modalData.id ? response.data : item));
            }
            else if (modalType.startsWith('link_')) {
                // Handle linking logic here
                const [_, entityType, linkType] = modalType.split('_');

                if (entityType === 'users' && linkType === 'unit') {
                    response = await api.post(`/units/${modalData.unitId}/members/`, {
                        user_id: modalData.userId
                    });

                    // Refresh users data
                    fetchData('users');
                }
            }

            handleCloseModal();
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Failed to save data. Please try again.');

            // For development, update local state to simulate successful API call
            const entityType = modalType.split('_')[1];
            if (modalType.startsWith('create_')) {
                const newItem = { ...modalData, id: `${entityType}-${Date.now()}` };
                if (entityType === 'users') setUsers([...users, newItem]);
                if (entityType === 'ranks') setRanks([...ranks, newItem]);
                if (entityType === 'branches') setBranches([...branches, newItem]);
                if (entityType === 'units') setUnits([...units, newItem]);
            }
            else if (modalType.startsWith('edit_')) {
                if (entityType === 'users') setUsers(users.map(item => item.id === modalData.id ? modalData : item));
                if (entityType === 'ranks') setRanks(ranks.map(item => item.id === modalData.id ? modalData : item));
                if (entityType === 'branches') setBranches(branches.map(item => item.id === modalData.id ? modalData : item));
                if (entityType === 'units') setUnits(units.map(item => item.id === modalData.id ? modalData : item));
            }

            handleCloseModal();
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle item deletion
    const handleDeleteItems = async () => {
        if (!selectedItems.length) return;

        setIsLoading(true);

        try {
            for (const itemId of selectedItems) {
                // Delete each selected item
                await api.delete(`/${activeTab}/${itemId}/`);
            }

            // Update local state
            if (activeTab === 'users') setUsers(users.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'ranks') setRanks(ranks.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'branches') setBranches(branches.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'units') setUnits(units.filter(item => !selectedItems.includes(item.id)));

            // Clear selected items
            setSelectedItems([]);
        } catch (err) {
            console.error('Error deleting items:', err);
            setError('Failed to delete items. Please try again.');

            // For development, update local state to simulate successful API call
            if (activeTab === 'users') setUsers(users.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'ranks') setRanks(ranks.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'branches') setBranches(branches.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'units') setUnits(units.filter(item => !selectedItems.includes(item.id)));

            // Clear selected items
            setSelectedItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Modal content based on type
    const renderModalContent = () => {
        // User creation/edit form
        if (modalType === 'create_users' || modalType === 'edit_users') {
            return (
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <h3 className="modal-title">{modalType === 'create_users' ? 'Create New User' : 'Edit User'}</h3>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={modalData.username || ''}
                            onChange={e => setModalData({...modalData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={modalData.email || ''}
                            onChange={e => setModalData({...modalData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="service_number">Service Number</label>
                        <input
                            type="text"
                            id="service_number"
                            value={modalData.service_number || ''}
                            onChange={e => setModalData({...modalData, service_number: e.target.value})}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="branch_id">Branch</label>
                            <select
                                id="branch_id"
                                value={modalData.branch_id || ''}
                                onChange={e => setModalData({...modalData, branch_id: e.target.value})}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="rank_id">Rank</label>
                            <select
                                id="rank_id"
                                value={modalData.rank_id || ''}
                                onChange={e => setModalData({...modalData, rank_id: e.target.value})}
                            >
                                <option value="">Select Rank</option>
                                {ranks
                                    .filter(rank => !modalData.branch_id || rank.branch_id === modalData.branch_id)
                                    .map(rank => (
                                        <option key={rank.id} value={rank.id}>{rank.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="primary_unit_id">Primary Unit</label>
                        <select
                            id="primary_unit_id"
                            value={modalData.primary_unit_id || ''}
                            onChange={e => setModalData({...modalData, primary_unit_id: e.target.value})}
                        >
                            <option value="">Select Primary Unit</option>
                            {units
                                .filter(unit => !modalData.branch_id || unit.branch_id === modalData.branch_id)
                                .map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-row checkbox-group">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={modalData.is_active || false}
                                onChange={e => setModalData({...modalData, is_active: e.target.checked})}
                            />
                            <label htmlFor="is_active">Active</label>
                        </div>

                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="is_staff"
                                checked={modalData.is_staff || false}
                                onChange={e => setModalData({...modalData, is_staff: e.target.checked})}
                            />
                            <label htmlFor="is_staff">Staff</label>
                        </div>

                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="is_admin"
                                checked={modalData.is_admin || false}
                                onChange={e => setModalData({...modalData, is_admin: e.target.checked})}
                            />
                            <label htmlFor="is_admin">Admin</label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="button secondary" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="button primary">
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Rank creation/edit form
        if (modalType === 'create_ranks' || modalType === 'edit_ranks') {
            return (
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <h3 className="modal-title">{modalType === 'create_ranks' ? 'Create New Rank' : 'Edit Rank'}</h3>

                    <div className="form-group">
                        <label htmlFor="name">Rank Name</label>
                        <input
                            type="text"
                            id="name"
                            value={modalData.name || ''}
                            onChange={e => setModalData({...modalData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="abbreviation">Abbreviation</label>
                        <input
                            type="text"
                            id="abbreviation"
                            value={modalData.abbreviation || ''}
                            onChange={e => setModalData({...modalData, abbreviation: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="branch_id">Branch</label>
                        <select
                            id="branch_id"
                            value={modalData.branch_id || ''}
                            onChange={e => setModalData({...modalData, branch_id: e.target.value})}
                            required
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tier">Tier (Rank Level)</label>
                        <input
                            type="number"
                            id="tier"
                            value={modalData.tier || ''}
                            onChange={e => setModalData({...modalData, tier: parseInt(e.target.value)})}
                            required
                            min="1"
                            max="10"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={modalData.description || ''}
                            onChange={e => setModalData({...modalData, description: e.target.value})}
                            rows="3"
                        />
                    </div>

                    <div className="form-row checkbox-group">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="is_officer"
                                checked={modalData.is_officer || false}
                                onChange={e => setModalData({...modalData, is_officer: e.target.checked})}
                            />
                            <label htmlFor="is_officer">Officer</label>
                        </div>

                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="is_enlisted"
                                checked={modalData.is_enlisted || false}
                                onChange={e => setModalData({...modalData, is_enlisted: e.target.checked})}
                            />
                            <label htmlFor="is_enlisted">Enlisted</label>
                        </div>

                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="is_warrant"
                                checked={modalData.is_warrant || false}
                                onChange={e => setModalData({...modalData, is_warrant: e.target.checked})}
                            />
                            <label htmlFor="is_warrant">Warrant</label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="button secondary" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="button primary">
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Branch creation/edit form
        if (modalType === 'create_branches' || modalType === 'edit_branches') {
            return (
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <h3 className="modal-title">{modalType === 'create_branches' ? 'Create New Branch' : 'Edit Branch'}</h3>

                    <div className="form-group">
                        <label htmlFor="name">Branch Name</label>
                        <input
                            type="text"
                            id="name"
                            value={modalData.name || ''}
                            onChange={e => setModalData({...modalData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="abbreviation">Abbreviation</label>
                        <input
                            type="text"
                            id="abbreviation"
                            value={modalData.abbreviation || ''}
                            onChange={e => setModalData({...modalData, abbreviation: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={modalData.description || ''}
                            onChange={e => setModalData({...modalData, description: e.target.value})}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="color_code">Color Code</label>
                        <div className="color-input-container">
                            <input
                                type="color"
                                id="color_code"
                                value={modalData.color_code || '#1F4287'}
                                onChange={e => setModalData({...modalData, color_code: e.target.value})}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={modalData.color_code || '#1F4287'}
                                onChange={e => setModalData({...modalData, color_code: e.target.value})}
                                placeholder="#000000"
                                className="color-text"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="button secondary" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="button primary">
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Unit creation/edit form
        if (modalType === 'create_units' || modalType === 'edit_units') {
            return (
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <h3 className="modal-title">{modalType === 'create_units' ? 'Create New Unit' : 'Edit Unit'}</h3>

                    <div className="form-group">
                        <label htmlFor="name">Unit Name</label>
                        <input
                            type="text"
                            id="name"
                            value={modalData.name || ''}
                            onChange={e => setModalData({...modalData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="abbreviation">Abbreviation</label>
                        <input
                            type="text"
                            id="abbreviation"
                            value={modalData.abbreviation || ''}
                            onChange={e => setModalData({...modalData, abbreviation: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="branch_id">Branch</label>
                            <select
                                id="branch_id"
                                value={modalData.branch_id || ''}
                                onChange={e => setModalData({...modalData, branch_id: e.target.value})}
                                required
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="unit_type">Unit Type</label>
                            <select
                                id="unit_type"
                                value={modalData.unit_type || ''}
                                onChange={e => setModalData({...modalData, unit_type: e.target.value})}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Fleet">Fleet</option>
                                <option value="Squadron">Squadron</option>
                                <option value="Division">Division</option>
                                <option value="Battalion">Battalion</option>
                                <option value="Company">Company</option>
                                <option value="Platoon">Platoon</option>
                                <option value="Special">Special</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="parent_unit_id">Parent Unit</label>
                        <select
                            id="parent_unit_id"
                            value={modalData.parent_unit_id || ''}
                            onChange={e => setModalData({...modalData, parent_unit_id: e.target.value || null})}
                        >
                            <option value="">None (Top Level Unit)</option>
                            {units
                                .filter(unit => unit.id !== modalData.id) // Can't be parent of itself
                                .filter(unit => !modalData.branch_id || unit.branch_id === modalData.branch_id)
                                .map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={modalData.description || ''}
                            onChange={e => setModalData({...modalData, description: e.target.value})}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="motto">Motto</label>
                        <input
                            type="text"
                            id="motto"
                            value={modalData.motto || ''}
                            onChange={e => setModalData({...modalData, motto: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="established_date">Established Date</label>
                        <input
                            type="date"
                            id="established_date"
                            value={modalData.established_date ? modalData.established_date.substring(0, 10) : ''}
                            onChange={e => setModalData({...modalData, established_date: e.target.value})}
                        />
                    </div>

                    <div className="form-check">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={modalData.is_active || false}
                            onChange={e => setModalData({...modalData, is_active: e.target.checked})}
                        />
                        <label htmlFor="is_active">Active</label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="button secondary" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="button primary">
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Link user to unit form
        if (modalType === 'link_users_unit') {
            return (
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <h3 className="modal-title">Assign User to Unit</h3>

                    <div className="form-group">
                        <label htmlFor="userId">User</label>
                        <select
                            id="userId"
                            value={modalData.userId || ''}
                            onChange={e => setModalData({...modalData, userId: e.target.value})}
                            required
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="unitId">Unit</label>
                        <select
                            id="unitId"
                            value={modalData.unitId || ''}
                            onChange={e => setModalData({...modalData, unitId: e.target.value})}
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="button secondary" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="button primary">
                            {isLoading ? <Loader size={16} className="spin" /> : 'Assign'}
                        </button>
                    </div>
                </form>
            );
        }

        return null;
    };

    // Render users table
    const renderUsersTable = () => {
        const filteredData = getFilteredData(users);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="table-actions">
                    <div className="table-filters">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            <Search className="search-icon" size={16} />
                        </div>

                        <button
                            className="button filter-button"
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="table-buttons">
                        {selectedItems.length > 0 && (
                            <button
                                className="button danger"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        <button
                            className="button secondary"
                            onClick={() => handleOpenLinkModal('users_unit')}
                        >
                            <Link size={16} /> Assign to Unit
                        </button>

                        <button
                            className="button primary"
                            onClick={() => handleOpenCreateModal('users')}
                        >
                            <Plus size={16} /> New User
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th className="avatar-cell">Avatar</th>
                            <th onClick={() => handleSort('username')} className="sortable-column">
                                Username
                                {sortConfig.field === 'username' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('rank.name')} className="sortable-column">
                                Rank
                                {sortConfig.field === 'rank.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('branch.name')} className="sortable-column">
                                Branch
                                {sortConfig.field === 'branch.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('primary_unit.name')} className="sortable-column">
                                Unit
                                {sortConfig.field === 'primary_unit.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('service_number')} className="sortable-column">
                                Service #
                                {sortConfig.field === 'service_number' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_active')} className="sortable-column">
                                Status
                                {sortConfig.field === 'is_active' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th className="actions-cell">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">No users found</td>
                            </tr>
                        ) : (
                            sortedData.map(user => (
                                <tr key={user.id} className={selectedItems.includes(user.id) ? 'selected-row' : ''}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(user.id)}
                                            onChange={() => handleItemSelect(user.id)}
                                        />
                                    </td>
                                    <td className="avatar-cell">
                                        <div className="user-avatar-container">
                                            <img
                                                src={user.avatar_url || '/api/placeholder/40/40'}
                                                alt={user.username}
                                                className="table-avatar"
                                            />
                                        </div>
                                    </td>
                                    <td>{user.username}</td>
                                    <td>
                                        {user.rank ? (
                                            <div className="badge" style={{ backgroundColor: user.rank.branch?.color_code || '#1F4287' }}>
                                                {user.rank.abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {user.branch ? (
                                            <div className="badge branch-badge" style={{ backgroundColor: user.branch.color_code || '#1F4287' }}>
                                                {user.branch.abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>{user.primary_unit?.name || '-'}</td>
                                    <td>{user.service_number || '-'}</td>
                                    <td>
                                        <div className={`status-indicator ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="icon-button"
                                                onClick={() => handleOpenEditModal('users', user)}
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="icon-button"
                                                onClick={() => handleOpenLinkModal('users_unit', { userId: user.id })}
                                                title="Assign to Unit"
                                            >
                                                <Link size={16} />
                                            </button>
                                            <button
                                                className="icon-button view-button"
                                                onClick={() => {}}
                                                title="View Profile"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // Render ranks table
    const renderRanksTable = () => {
        const filteredData = getFilteredData(ranks);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="table-actions">
                    <div className="table-filters">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search ranks..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            <Search className="search-icon" size={16} />
                        </div>

                        <button
                            className="button filter-button"
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="table-buttons">
                        {selectedItems.length > 0 && (
                            <button
                                className="button danger"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        <button
                            className="button primary"
                            onClick={() => handleOpenCreateModal('ranks')}
                        >
                            <Plus size={16} /> New Rank
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th className="icon-cell">Insignia</th>
                            <th onClick={() => handleSort('name')} className="sortable-column">
                                Name
                                {sortConfig.field === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('abbreviation')} className="sortable-column">
                                Abbr.
                                {sortConfig.field === 'abbreviation' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('branch.name')} className="sortable-column">
                                Branch
                                {sortConfig.field === 'branch.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('tier')} className="sortable-column">
                                Tier
                                {sortConfig.field === 'tier' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_officer')} className="sortable-column">
                                Type
                                {sortConfig.field === 'is_officer' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th className="actions-cell">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">No ranks found</td>
                            </tr>
                        ) : (
                            sortedData.map(rank => (
                                <tr key={rank.id} className={selectedItems.includes(rank.id) ? 'selected-row' : ''}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(rank.id)}
                                            onChange={() => handleItemSelect(rank.id)}
                                        />
                                    </td>
                                    <td className="icon-cell">
                                        <img
                                            src={rank.insignia_image_url || '/api/placeholder/30/15'}
                                            alt={rank.name}
                                            className="rank-insignia"
                                        />
                                    </td>
                                    <td>{rank.name}</td>
                                    <td>{rank.abbreviation}</td>
                                    <td>
                                        {rank.branch ? (
                                            <div className="badge branch-badge" style={{ backgroundColor: rank.branch.color_code || '#1F4287' }}>
                                                {rank.branch.abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>{rank.tier}</td>
                                    <td>
                                        {rank.is_officer && <span className="rank-type officer">Officer</span>}
                                        {rank.is_enlisted && <span className="rank-type enlisted">Enlisted</span>}
                                        {rank.is_warrant && <span className="rank-type warrant">Warrant</span>}
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="icon-button"
                                                onClick={() => handleOpenEditModal('ranks', rank)}
                                                title="Edit Rank"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // Render branches table
    const renderBranchesTable = () => {
        const filteredData = getFilteredData(branches);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="table-actions">
                    <div className="table-filters">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search branches..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            <Search className="search-icon" size={16} />
                        </div>
                    </div>

                    <div className="table-buttons">
                        {selectedItems.length > 0 && (
                            <button
                                className="button danger"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        <button
                            className="button primary"
                            onClick={() => handleOpenCreateModal('branches')}
                        >
                            <Plus size={16} /> New Branch
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th className="logo-cell">Logo</th>
                            <th onClick={() => handleSort('name')} className="sortable-column">
                                Name
                                {sortConfig.field === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('abbreviation')} className="sortable-column">
                                Abbr.
                                {sortConfig.field === 'abbreviation' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('color_code')} className="sortable-column">
                                Color
                                {sortConfig.field === 'color_code' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th>Description</th>
                            <th className="actions-cell">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">No branches found</td>
                            </tr>
                        ) : (
                            sortedData.map(branch => (
                                <tr key={branch.id} className={selectedItems.includes(branch.id) ? 'selected-row' : ''}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(branch.id)}
                                            onChange={() => handleItemSelect(branch.id)}
                                        />
                                    </td>
                                    <td className="logo-cell">
                                        <div className="branch-logo-container" style={{ backgroundColor: branch.color_code || '#1F4287' }}>
                                            <img
                                                src={branch.logo_url || '/api/placeholder/40/40'}
                                                alt={branch.name}
                                                className="branch-logo"
                                            />
                                        </div>
                                    </td>
                                    <td>{branch.name}</td>
                                    <td>
                                        <div className="badge branch-badge" style={{ backgroundColor: branch.color_code || '#1F4287' }}>
                                            {branch.abbreviation}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="color-swatch" style={{ backgroundColor: branch.color_code || '#1F4287' }}>
                                            {branch.color_code}
                                        </div>
                                    </td>
                                    <td className="description-cell">{branch.description}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="icon-button"
                                                onClick={() => handleOpenEditModal('branches', branch)}
                                                title="Edit Branch"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // Render units table
    const renderUnitsTable = () => {
        const filteredData = getFilteredData(units);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="table-actions">
                    <div className="table-filters">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search units..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            <Search className="search-icon" size={16} />
                        </div>

                        <button
                            className="button filter-button"
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="table-buttons">
                        {selectedItems.length > 0 && (
                            <button
                                className="button danger"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        <button
                            className="button secondary"
                            onClick={() => handleOpenLinkModal('users_unit')}
                        >
                            <UserPlus size={16} /> Add Members
                        </button>

                        <button
                            className="button primary"
                            onClick={() => handleOpenCreateModal('units')}
                        >
                            <Plus size={16} /> New Unit
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th className="emblem-cell">Emblem</th>
                            <th onClick={() => handleSort('name')} className="sortable-column">
                                Name
                                {sortConfig.field === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('abbreviation')} className="sortable-column">
                                Abbr.
                                {sortConfig.field === 'abbreviation' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('branch.name')} className="sortable-column">
                                Branch
                                {sortConfig.field === 'branch.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('unit_type')} className="sortable-column">
                                Type
                                {sortConfig.field === 'unit_type' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('parent_unit.name')} className="sortable-column">
                                Parent Unit
                                {sortConfig.field === 'parent_unit.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_active')} className="sortable-column">
                                Status
                                {sortConfig.field === 'is_active' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th className="actions-cell">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">No units found</td>
                            </tr>
                        ) : (
                            sortedData.map(unit => (
                                <tr key={unit.id} className={selectedItems.includes(unit.id) ? 'selected-row' : ''}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(unit.id)}
                                            onChange={() => handleItemSelect(unit.id)}
                                        />
                                    </td>
                                    <td className="emblem-cell">
                                        <div className="unit-emblem-container">
                                            <img
                                                src={unit.emblem_url || '/api/placeholder/40/40'}
                                                alt={unit.name}
                                                className="unit-emblem"
                                            />
                                        </div>
                                    </td>
                                    <td>{unit.name}</td>
                                    <td>
                                        <div className="unit-abbreviation">{unit.abbreviation}</div>
                                    </td>
                                    <td>
                                        {unit.branch ? (
                                            <div className="badge branch-badge" style={{ backgroundColor: unit.branch.color_code || '#1F4287' }}>
                                                {unit.branch.abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>{unit.unit_type}</td>
                                    <td>{unit.parent_unit?.name || '-'}</td>
                                    <td>
                                        <div className={`status-indicator ${unit.is_active ? 'active' : 'inactive'}`}>
                                            {unit.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="icon-button"
                                                onClick={() => handleOpenEditModal('units', unit)}
                                                title="Edit Unit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="icon-button"
                                                onClick={() => handleOpenLinkModal('users_unit', { unitId: unit.id })}
                                                title="Add Members"
                                            >
                                                <UserPlus size={16} />
                                            </button>
                                            <button
                                                className="icon-button view-button"
                                                onClick={() => {}}
                                                title="View Unit"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-title">
                        <h1>Administration Dashboard</h1>
                        <div className="admin-subtitle">Manage organization data and user accounts</div>
                    </div>

                    <div className="admin-user">
                        {user && (
                            <div className="admin-user-info">
                                <img
                                    src={user.avatar_url || '/api/placeholder/40/40'}
                                    alt={user.username}
                                    className="admin-user-avatar"
                                />
                                <div className="admin-user-details">
                                    <div className="admin-username">{user.username}</div>
                                    <div className="admin-role">Administrator</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="admin-content">
                <nav className="admin-sidebar">
                    <div className="admin-logo">
                        <div className="logo-icon">
                            <svg className="logo-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <div className="logo-text">5TH EXPEDITIONARY</div>
                    </div>

                    <ul className="admin-nav">
                        <li className={activeTab === 'users' ? 'active' : ''}>
                            <button onClick={() => setActiveTab('users')}>
                                <Users size={18} />
                                <span>Users</span>
                            </button>
                        </li>
                        <li className={activeTab === 'ranks' ? 'active' : ''}>
                            <button onClick={() => setActiveTab('ranks')}>
                                <Shield size={18} />
                                <span>Ranks</span>
                            </button>
                        </li>
                        <li className={activeTab === 'branches' ? 'active' : ''}>
                            <button onClick={() => setActiveTab('branches')}>
                                <Flag size={18} />
                                <span>Branches</span>
                            </button>
                        </li>
                        <li className={activeTab === 'units' ? 'active' : ''}>
                            <button onClick={() => setActiveTab('units')}>
                                <Grid size={18} />
                                <span>Units</span>
                            </button>
                        </li>
                        <li>
                            <a href="/" className="back-link">
                                <Settings size={18} />
                                <span>Settings</span>
                            </a>
                        </li>
                    </ul>

                    <div className="admin-footer">
                        <a href="/" className="back-link">
                            &larr; Back to Website
                        </a>
                    </div>
                </nav>

                <main className="admin-main">
                    {error && (
                        <div className="error-message">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="close-button">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="admin-panel">
                        {isLoading ? (
                            <div className="loading-indicator">
                                <Loader size={24} className="spin" />
                                <span>Loading data...</span>
                            </div>
                        ) : (
                            <>
                                <div className="panel-header">
                                    {activeTab === 'users' && <h2><Users size={20} /> Users Management</h2>}
                                    {activeTab === 'ranks' && <h2><Shield size={20} /> Ranks Management</h2>}
                                    {activeTab === 'branches' && <h2><Flag size={20} /> Branches Management</h2>}
                                    {activeTab === 'units' && <h2><Grid size={20} /> Units Management</h2>}
                                </div>

                                <div className="panel-content">
                                    {activeTab === 'users' && renderUsersTable()}
                                    {activeTab === 'ranks' && renderRanksTable()}
                                    {activeTab === 'branches' && renderBranchesTable()}
                                    {activeTab === 'units' && renderUnitsTable()}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <button className="modal-close" onClick={handleCloseModal}>
                            <X size={20} />
                        </button>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
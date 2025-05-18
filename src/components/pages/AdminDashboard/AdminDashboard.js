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

    // Initialize state variables with empty arrays to ensure they're always iterable
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
    // Initialize with data safety checks for modal content
    const [modalData, setModalData] = useState({});
    const [sortConfig, setSortConfig] = useState({ field: 'id', direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);

    // Fetch data when component mounts or active tab changes
    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    // Check user permissions and redirect if not an admin
    useEffect(() => {
        if (user && !user.is_admin && !user.is_staff) {
            setError('This page requires administrator privileges.');
        }
    }, [user]);

    // Function to check if user can perform an action
    const canPerformAction = (action) => {
        if (!user) return false;

        switch(action) {
            case 'read':
                // Staff and admins can read
                return user.is_admin || user.is_staff;
            case 'write':
                // Only admins can create/edit
                return user.is_admin;
            case 'delete':
                // Only admins can delete
                return user.is_admin;
            case 'admin':
                // Only admins have full admin privileges
                return user.is_admin;
            default:
                return false;
        }
    };

    // Function to handle API requests with error handling
    const handleRequest = async (method, endpoint, data = null) => {
        try {
            let response;

            switch(method) {
                case 'GET':
                    response = await api.get(endpoint);
                    break;
                case 'POST':
                    response = await api.post(endpoint, data);
                    break;
                case 'PUT':
                    response = await api.put(endpoint, data);
                    break;
                case 'DELETE':
                    response = await api.delete(endpoint);
                    return null; // Successful delete returns null
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }

            return response.data;
        } catch (err) {
            if (err.response) {
                // Handle different error statuses
                if (err.response.status === 401) {
                    setError('Authentication required. Please log in again.');
                    return null;
                } else if (err.response.status === 403) {
                    setError('You do not have permission to perform this action.');
                    return null;
                } else if (err.response.status === 422 || err.response.status === 400) {
                    // Handle validation errors
                    const errorMsg = err.response.data.message ||
                        err.response.data.error ||
                        'Validation error. Please check your input.';

                    // Check for field-specific errors
                    if (err.response.data.errors) {
                        const fieldErrors = Object.entries(err.response.data.errors)
                            .map(([field, error]) => `${field}: ${error}`)
                            .join('; ');
                        setError(`${errorMsg} (${fieldErrors})`);
                    } else {
                        setError(errorMsg);
                    }
                } else {
                    setError(`Error: ${err.response.data.message || 'Something went wrong'}`);
                }
            } else if (err.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError(`Error: ${err.message}`);
            }

            return undefined;
        }
    };

    // Function to fetch data based on active tab
    const fetchData = async (tabName) => {
        setIsLoading(true);
        setError(null);

        try {
            let data;

            // For users, we need to use a different endpoint to get the full objects with joined data
            if (tabName === 'users') {
                data = await handleRequest('GET', `/users/?expand=rank,branch,unit`);
            } else {
                data = await handleRequest('GET', `/${tabName}/`);
            }

            if (!data) return; // handleRequest already set the error

            // Handle paginated response format or direct array response
            const results = data.results && Array.isArray(data.results) ? data.results :
                Array.isArray(data) ? data : [];

            console.log(`Fetched ${tabName} data:`, results); // Log data to inspect structure

            switch(tabName) {
                case 'users':
                    // Process users data to ensure linked objects are properly structured
                    const processedUsers = results.map(user => {
                        // Process the user data to ensure we have nested objects properly formatted
                        const processed = { ...user };

                        // Add rank object if it doesn't exist but current_rank does
                        if (!processed.rank && processed.current_rank) {
                            const rankObj = ranks.find(r => r.id === processed.current_rank);
                            if (rankObj) {
                                processed.rank = rankObj;
                            }
                        }

                        // Add branch object if it doesn't exist but branch_id does
                        if (!processed.branch && processed.branch_id) {
                            const branchObj = branches.find(b => b.id === processed.branch_id);
                            if (branchObj) {
                                processed.branch = branchObj;
                            }
                        }

                        // Add primary_unit object if it doesn't exist but primary_unit_id does
                        if (!processed.primary_unit && processed.primary_unit_id) {
                            const unitObj = units.find(u => u.id === processed.primary_unit_id);
                            if (unitObj) {
                                processed.primary_unit = unitObj;
                            }
                        }

                        return processed;
                    });

                    setUsers(processedUsers);
                    break;
                case 'ranks':
                    setRanks(results);
                    break;
                case 'branches':
                    setBranches(results);
                    break;
                case 'units':
                    setUnits(results);
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
        if (!sortConfig.field || !Array.isArray(data)) return data || [];

        return [...data].sort((a, b) => {
            // Handle nested properties like rank.name or current_rank.name
            let aValue, bValue;

            // Special handling for rank fields which might be in either rank or current_rank
            if (sortConfig.field === 'rank.name' || sortConfig.field === 'current_rank.name') {
                aValue = a.current_rank?.name || a.rank?.name;
                bValue = b.current_rank?.name || b.rank?.name;
            } else if (sortConfig.field.includes('.')) {
                aValue = sortConfig.field.split('.').reduce((obj, key) => obj?.[key], a);
                bValue = sortConfig.field.split('.').reduce((obj, key) => obj?.[key], b);
            } else {
                aValue = a[sortConfig.field];
                bValue = b[sortConfig.field];
            }

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
        if (!searchTerm || !Array.isArray(data)) return data || [];

        return data.filter(item => {
            // Search across all string properties
            return Object.keys(item).some(key => {
                if (typeof item[key] === 'string') {
                    return item[key].toLowerCase().includes(searchTerm.toLowerCase());
                }

                // Handle nested objects like rank.name or current_rank.name
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
        if (!Array.isArray(data)) return;

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

    // Function to handle opening edit modal with proper data mapping
    const handleOpenEditModal = (type, item) => {
        // Create a clone of the item to avoid modifying the original
        const itemData = { ...item };

        // For users, map the nested objects to their IDs for form fields
        if (type === 'users') {
            // Map current_rank to current_rank_id if it's an object
            if (itemData.current_rank && typeof itemData.current_rank === 'object') {
                itemData.current_rank_id = itemData.current_rank.id;
            } else if (typeof itemData.current_rank === 'string') {
                itemData.current_rank_id = itemData.current_rank;
            }

            // Map branch to branch_id if it's an object
            if (itemData.branch && typeof itemData.branch === 'object') {
                itemData.branch_id = itemData.branch.id;
            }

            // Map primary_unit to primary_unit_id if it's an object
            if (itemData.primary_unit && typeof itemData.primary_unit === 'object') {
                itemData.primary_unit_id = itemData.primary_unit.id;
            }
        }

        setModalType(`edit_${type}`);
        setModalData(itemData);
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
            let responseData = null;

            // Handle various form submissions based on modalType
            if (modalType.startsWith('create_')) {
                const entityType = modalType.split('_')[1];
                responseData = await handleRequest('POST', `/${entityType}/`, modalData);

                if (responseData) {
                    // Update local state
                    if (entityType === 'users') setUsers([...users, responseData]);
                    if (entityType === 'ranks') setRanks([...ranks, responseData]);
                    if (entityType === 'branches') setBranches([...branches, responseData]);
                    if (entityType === 'units') setUnits([...units, responseData]);
                    handleCloseModal();
                }
            }
            else if (modalType.startsWith('edit_')) {
                const entityType = modalType.split('_')[1];

                // Special handling for user updates when the entity is a user
                if (entityType === 'users') {
                    // Get the original user data
                    const originalUser = users.find(u => u.id === modalData.id);

                    // Check for changes to sensitive fields
                    const sensitiveFieldsChanged =
                        (originalUser.current_rank?.id || originalUser.current_rank) !== modalData.current_rank_id ||
                        (originalUser.branch?.id || originalUser.branch_id) !== modalData.branch_id ||
                        (originalUser.primary_unit?.id || originalUser.primary_unit_id) !== modalData.primary_unit_id;

                    // Split the payload for regular fields and sensitive fields
                    const regularFieldsData = { ...modalData };
                    const sensitiveFieldsData = {};

                    // Move sensitive fields to a separate object
                    if (modalData.current_rank_id !== undefined) {
                        sensitiveFieldsData.current_rank = modalData.current_rank_id;
                        delete regularFieldsData.current_rank;
                        delete regularFieldsData.current_rank_id;
                    }

                    if (modalData.primary_unit_id !== undefined) {
                        sensitiveFieldsData.primary_unit = modalData.primary_unit_id;
                        delete regularFieldsData.primary_unit;
                        delete regularFieldsData.primary_unit_id;
                    }

                    if (modalData.branch_id !== undefined) {
                        sensitiveFieldsData.branch = modalData.branch_id;
                        delete regularFieldsData.branch;
                    }

                    if (modalData.commission_stage !== undefined) {
                        sensitiveFieldsData.commission_stage = modalData.commission_stage;
                        delete regularFieldsData.commission_stage;
                    }

                    if (modalData.recruit_status !== undefined) {
                        sensitiveFieldsData.recruit_status = modalData.recruit_status;
                        delete regularFieldsData.recruit_status;
                    }

                    console.log('Regular fields:', regularFieldsData);
                    console.log('Sensitive fields:', sensitiveFieldsData);

                    // Regular user update for non-sensitive fields
                    responseData = await handleRequest('PUT', `/users/${modalData.id}/`, regularFieldsData);

                    // If we have sensitive fields and user is admin, update those separately
                    if (sensitiveFieldsChanged && canPerformAction('admin') && Object.keys(sensitiveFieldsData).length > 0) {
                        try {
                            const sensitiveResponse = await handleRequest(
                                'PUT',
                                `/users/${modalData.id}/sensitive-fields/`,
                                sensitiveFieldsData
                            );

                            if (sensitiveResponse) {
                                // Use the response from the sensitive fields update as it contains all updated data
                                responseData = sensitiveResponse;
                            }
                        } catch (err) {
                            console.error('Error updating sensitive fields:', err);
                            setError('Failed to update restricted fields. Admin privileges required.');
                        }
                    } else if (sensitiveFieldsChanged) {
                        setError('Note: Changes to rank, unit, and branch require admin privileges and were not applied.');
                    }

                    if (responseData) {
                        // Update local state
                        setUsers(users.map(item => item.id === modalData.id ? responseData : item));
                        handleCloseModal();
                    }
                } else {
                    // Handle normal updates for other entity types
                    responseData = await handleRequest('PUT', `/${entityType}/${modalData.id}/`, modalData);

                    if (responseData) {
                        // Update local state
                        if (entityType === 'ranks') setRanks(ranks.map(item => item.id === modalData.id ? responseData : item));
                        if (entityType === 'branches') setBranches(branches.map(item => item.id === modalData.id ? responseData : item));
                        if (entityType === 'units') setUnits(units.map(item => item.id === modalData.id ? responseData : item));
                        handleCloseModal();
                    }
                }
            }
            else if (modalType.startsWith('link_')) {
                // Handle linking logic here
                const [_, entityType, linkType] = modalType.split('_');

                if (entityType === 'users' && linkType === 'unit') {
                    responseData = await handleRequest('POST', `/units/${modalData.unitId}/members/`, {
                        user_id: modalData.userId
                    });

                    if (responseData) {
                        // Refresh users data
                        fetchData('users');
                        handleCloseModal();
                    }
                }
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            // Error is already set by handleRequest function
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
                const result = await handleRequest('DELETE', `/${activeTab}/${itemId}/`);
                if (!result && result !== null) {
                    // If handleRequest returns undefined but not null, the request failed but without a 401/403
                    throw new Error(`Failed to delete item ${itemId}`);
                }
            }

            // Update local state only if all deletes were successful
            if (activeTab === 'users') setUsers(users.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'ranks') setRanks(ranks.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'branches') setBranches(branches.filter(item => !selectedItems.includes(item.id)));
            if (activeTab === 'units') setUnits(units.filter(item => !selectedItems.includes(item.id)));

            // Clear selected items
            setSelectedItems([]);
        } catch (err) {
            console.error('Error deleting items:', err);
            setError(`Failed to delete one or more items. ${err.message}`);
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
                                disabled={modalType === 'edit_users' && !canPerformAction('admin')}
                                title={modalType === 'edit_users' && !canPerformAction('admin') ? 'Branch changes require admin privileges' : ''}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                            {modalType === 'edit_users' && !canPerformAction('admin') &&
                                <div className="field-note">Branch changes need admin privileges</div>
                            }
                        </div>

                        <div className="form-group">
                            <label htmlFor="current_rank_id">Rank</label>
                            <select
                                id="current_rank_id"
                                value={modalData.current_rank_id || ''}
                                onChange={e => setModalData({...modalData, current_rank_id: e.target.value})}
                                disabled={modalType === 'edit_users' && !canPerformAction('admin')}
                                title={modalType === 'edit_users' && !canPerformAction('admin') ? 'Rank changes require admin privileges' : ''}
                            >
                                <option value="">Select Rank</option>
                                {ranks
                                    .filter(rank => !modalData.branch_id || rank.branch_id === modalData.branch_id)
                                    .map(rank => (
                                        <option key={rank.id} value={rank.id}>{rank.name}</option>
                                    ))
                                }
                            </select>
                            {modalType === 'edit_users' && !canPerformAction('admin') &&
                                <div className="field-note">Rank changes need admin privileges</div>
                            }
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="primary_unit_id">Primary Unit</label>
                        <select
                            id="primary_unit_id"
                            value={modalData.primary_unit_id || ''}
                            onChange={e => setModalData({...modalData, primary_unit_id: e.target.value})}
                            disabled={modalType === 'edit_users' && !canPerformAction('admin')}
                            title={modalType === 'edit_users' && !canPerformAction('admin') ? 'Unit changes require admin privileges' : ''}
                        >
                            <option value="">Select Primary Unit</option>
                            {units
                                .filter(unit => !modalData.branch_id || unit.branch_id === modalData.branch_id)
                                .map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))
                            }
                        </select>
                        {modalType === 'edit_users' && !canPerformAction('admin') &&
                            <div className="field-note">Unit changes need admin privileges</div>
                        }
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
        // Ensure users is an array before filtering
        if (!Array.isArray(users)) {
            console.error("Users data is not an array:", users);
            return (
                <div className="loading-indicator">
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(users);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="admin-action-bar">
                    <div className="search-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-field"
                            />
                            <Search className="search-icon" size={16} />
                        </div>

                        <button
                            className="filter-btn"
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="action-section">
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                className="delete-btn"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <>
                                <button
                                    className="assign-btn"
                                    onClick={() => handleOpenLinkModal('users_unit')}
                                >
                                    <Link size={16} /> Assign to Unit
                                </button>

                                <button
                                    className="create-btn"
                                    onClick={() => handleOpenCreateModal('users')}
                                >
                                    <Plus size={16} /> New User
                                </button>
                            </>
                        )}
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
                            <th onClick={() => handleSort('current_rank.name')} className="sortable-column">
                                Rank
                                {sortConfig.field === 'current_rank.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
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
                                        {(user.current_rank && typeof user.current_rank === 'object') ? (
                                            <div className="badge" style={{ backgroundColor: (user.branch && typeof user.branch === 'object') ? user.branch.color_code : '#1F4287' }}>
                                                {user.current_rank.abbreviation}
                                            </div>
                                        ) : (user.rank && typeof user.rank === 'object') ? (
                                            <div className="badge" style={{ backgroundColor: (user.rank.branch && typeof user.rank.branch === 'object') ? user.rank.branch.color_code : '#1F4287' }}>
                                                {user.rank.abbreviation}
                                            </div>
                                        ) : ranks.find(r => r.id === user.current_rank) ? (
                                            <div className="badge" style={{ backgroundColor: '#1F4287' }}>
                                                {ranks.find(r => r.id === user.current_rank).abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {(user.branch && typeof user.branch === 'object') ? (
                                            <div className="badge branch-badge" style={{ backgroundColor: user.branch.color_code || '#1F4287' }}>
                                                {user.branch.abbreviation}
                                            </div>
                                        ) : branches.find(b => b.id === user.branch_id) ? (
                                            <div className="badge branch-badge" style={{ backgroundColor: branches.find(b => b.id === user.branch_id).color_code || '#1F4287' }}>
                                                {branches.find(b => b.id === user.branch_id).abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>{(user.primary_unit && typeof user.primary_unit === 'object') ? user.primary_unit.name :
                                        units.find(u => u.id === user.primary_unit_id) ? units.find(u => u.id === user.primary_unit_id).name : '-'}</td>
                                    <td>{user.service_number || '-'}</td>
                                    <td>
                                        <div className={`status-indicator ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {canPerformAction('write') && (
                                                <>
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
                                                </>
                                            )}
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
        // Ensure ranks is an array before filtering
        if (!Array.isArray(ranks)) {
            console.error("Ranks data is not an array:", ranks);
            return (
                <div className="loading-indicator">
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(ranks);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="admin-action-bar">
                    <div className="search-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search ranks..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-field"
                            />
                            <Search className="search-icon" size={16} />
                        </div>

                        <button
                            className="filter-btn"
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="action-section">
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                className="delete-btn"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <button
                                className="create-btn"
                                onClick={() => handleOpenCreateModal('ranks')}
                            >
                                <Plus size={16} /> New Rank
                            </button>
                        )}
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
                                            {canPerformAction('write') && (
                                                <button
                                                    className="icon-button"
                                                    onClick={() => handleOpenEditModal('ranks', rank)}
                                                    title="Edit Rank"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
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
        // Ensure branches is an array before filtering
        if (!Array.isArray(branches)) {
            console.error("Branches data is not an array:", branches);
            return (
                <div className="loading-indicator">
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(branches);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="admin-action-bar">
                    <div className="search-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search branches..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-field"
                            />
                            <Search className="search-icon" size={16} />
                        </div>
                    </div>

                    <div className="action-section">
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                className="delete-btn"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <button
                                className="create-btn"
                                onClick={() => handleOpenCreateModal('branches')}
                            >
                                <Plus size={16} /> New Branch
                            </button>
                        )}
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
                                            {canPerformAction('write') && (
                                                <button
                                                    className="icon-button"
                                                    onClick={() => handleOpenEditModal('branches', branch)}
                                                    title="Edit Branch"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
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
        // Ensure units is an array before filtering
        if (!Array.isArray(units)) {
            console.error("Units data is not an array:", units);
            return (
                <div className="loading-indicator">
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(units);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div className="admin-action-bar">
                    <div className="search-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search units..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-field"
                            />
                            <Search className="search-icon" size={16} />
                        </div>

                        <button
                            className="filter-btn"
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="action-section">
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                className="delete-btn"
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <>
                                <button
                                    className="assign-btn"
                                    onClick={() => handleOpenLinkModal('users_unit')}
                                >
                                    <UserPlus size={16} /> Add Members
                                </button>

                                <button
                                    className="create-btn"
                                    onClick={() => handleOpenCreateModal('units')}
                                >
                                    <Plus size={16} /> New Unit
                                </button>
                            </>
                        )}
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
                                            {canPerformAction('write') && (
                                                <>
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
                                                </>
                                            )}
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
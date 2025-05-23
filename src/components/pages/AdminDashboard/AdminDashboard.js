import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Users, Shield, Flag, Grid, Search, Plus, Edit, Trash2,
    Filter, ChevronDown, ChevronUp, X, Save, Link, ExternalLink,
    Loader, MoreHorizontal, AlertTriangle, CheckCircle, UserPlus,
    Settings
} from 'lucide-react';
import api from '../../../services/api';

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
                <form onSubmit={handleFormSubmit} style={styles.modalForm}>
                    <h3 style={styles.modalTitle}>{modalType === 'create_users' ? 'Create New User' : 'Edit User'}</h3>

                    <div style={styles.formGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={modalData.username || ''}
                            onChange={e => setModalData({...modalData, username: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={modalData.email || ''}
                            onChange={e => setModalData({...modalData, email: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="service_number">Service Number</label>
                        <input
                            type="text"
                            id="service_number"
                            value={modalData.service_number || ''}
                            onChange={e => setModalData({...modalData, service_number: e.target.value})}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label htmlFor="branch_id">Branch</label>
                            <select
                                id="branch_id"
                                value={modalData.branch_id || ''}
                                onChange={e => setModalData({...modalData, branch_id: e.target.value})}
                                disabled={modalType === 'edit_users' && !canPerformAction('admin')}
                                title={modalType === 'edit_users' && !canPerformAction('admin') ? 'Branch changes require admin privileges' : ''}
                                style={styles.input}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                            {modalType === 'edit_users' && !canPerformAction('admin') &&
                                <div style={styles.fieldNote}>Branch changes need admin privileges</div>
                            }
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="current_rank_id">Rank</label>
                            <select
                                id="current_rank_id"
                                value={modalData.current_rank_id || ''}
                                onChange={e => setModalData({...modalData, current_rank_id: e.target.value})}
                                disabled={modalType === 'edit_users' && !canPerformAction('admin')}
                                title={modalType === 'edit_users' && !canPerformAction('admin') ? 'Rank changes require admin privileges' : ''}
                                style={styles.input}
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
                                <div style={styles.fieldNote}>Rank changes need admin privileges</div>
                            }
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="primary_unit_id">Primary Unit</label>
                        <select
                            id="primary_unit_id"
                            value={modalData.primary_unit_id || ''}
                            onChange={e => setModalData({...modalData, primary_unit_id: e.target.value})}
                            disabled={modalType === 'edit_users' && !canPerformAction('admin')}
                            title={modalType === 'edit_users' && !canPerformAction('admin') ? 'Unit changes require admin privileges' : ''}
                            style={styles.input}
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
                            <div style={styles.fieldNote}>Unit changes need admin privileges</div>
                        }
                    </div>

                    <div style={styles.checkboxGroup}>
                        <div style={styles.formCheck}>
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={modalData.is_active || false}
                                onChange={e => setModalData({...modalData, is_active: e.target.checked})}
                            />
                            <label htmlFor="is_active">Active</label>
                        </div>

                        <div style={styles.formCheck}>
                            <input
                                type="checkbox"
                                id="is_staff"
                                checked={modalData.is_staff || false}
                                onChange={e => setModalData({...modalData, is_staff: e.target.checked})}
                            />
                            <label htmlFor="is_staff">Staff</label>
                        </div>

                        <div style={styles.formCheck}>
                            <input
                                type="checkbox"
                                id="is_admin"
                                checked={modalData.is_admin || false}
                                onChange={e => setModalData({...modalData, is_admin: e.target.checked})}
                            />
                            <label htmlFor="is_admin">Admin</label>
                        </div>
                    </div>

                    <div style={styles.modalActions}>
                        <button type="button" style={{...styles.button, ...styles.buttonSecondary}} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" style={{...styles.button, ...styles.buttonPrimary}}>
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Rank creation/edit form
        if (modalType === 'create_ranks' || modalType === 'edit_ranks') {
            return (
                <form onSubmit={handleFormSubmit} style={styles.modalForm}>
                    <h3 style={styles.modalTitle}>{modalType === 'create_ranks' ? 'Create New Rank' : 'Edit Rank'}</h3>

                    <div style={styles.formGroup}>
                        <label htmlFor="name">Rank Name</label>
                        <input
                            type="text"
                            id="name"
                            value={modalData.name || ''}
                            onChange={e => setModalData({...modalData, name: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="abbreviation">Abbreviation</label>
                        <input
                            type="text"
                            id="abbreviation"
                            value={modalData.abbreviation || ''}
                            onChange={e => setModalData({...modalData, abbreviation: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="branch_id">Branch</label>
                        <select
                            id="branch_id"
                            value={modalData.branch_id || ''}
                            onChange={e => setModalData({...modalData, branch_id: e.target.value})}
                            required
                            style={styles.input}
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="tier">Tier (Rank Level)</label>
                        <input
                            type="number"
                            id="tier"
                            value={modalData.tier || ''}
                            onChange={e => setModalData({...modalData, tier: parseInt(e.target.value)})}
                            required
                            min="1"
                            max="10"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={modalData.description || ''}
                            onChange={e => setModalData({...modalData, description: e.target.value})}
                            rows="3"
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.checkboxGroup}>
                        <div style={styles.formCheck}>
                            <input
                                type="checkbox"
                                id="is_officer"
                                checked={modalData.is_officer || false}
                                onChange={e => setModalData({...modalData, is_officer: e.target.checked})}
                            />
                            <label htmlFor="is_officer">Officer</label>
                        </div>

                        <div style={styles.formCheck}>
                            <input
                                type="checkbox"
                                id="is_enlisted"
                                checked={modalData.is_enlisted || false}
                                onChange={e => setModalData({...modalData, is_enlisted: e.target.checked})}
                            />
                            <label htmlFor="is_enlisted">Enlisted</label>
                        </div>

                        <div style={styles.formCheck}>
                            <input
                                type="checkbox"
                                id="is_warrant"
                                checked={modalData.is_warrant || false}
                                onChange={e => setModalData({...modalData, is_warrant: e.target.checked})}
                            />
                            <label htmlFor="is_warrant">Warrant</label>
                        </div>
                    </div>

                    <div style={styles.modalActions}>
                        <button type="button" style={{...styles.button, ...styles.buttonSecondary}} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" style={{...styles.button, ...styles.buttonPrimary}}>
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Branch creation/edit form
        if (modalType === 'create_branches' || modalType === 'edit_branches') {
            return (
                <form onSubmit={handleFormSubmit} style={styles.modalForm}>
                    <h3 style={styles.modalTitle}>{modalType === 'create_branches' ? 'Create New Branch' : 'Edit Branch'}</h3>

                    <div style={styles.formGroup}>
                        <label htmlFor="name">Branch Name</label>
                        <input
                            type="text"
                            id="name"
                            value={modalData.name || ''}
                            onChange={e => setModalData({...modalData, name: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="abbreviation">Abbreviation</label>
                        <input
                            type="text"
                            id="abbreviation"
                            value={modalData.abbreviation || ''}
                            onChange={e => setModalData({...modalData, abbreviation: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={modalData.description || ''}
                            onChange={e => setModalData({...modalData, description: e.target.value})}
                            rows="3"
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="color_code">Color Code</label>
                        <div style={styles.colorInputContainer}>
                            <input
                                type="color"
                                id="color_code"
                                value={modalData.color_code || '#1F4287'}
                                onChange={e => setModalData({...modalData, color_code: e.target.value})}
                                style={styles.colorPicker}
                            />
                            <input
                                type="text"
                                value={modalData.color_code || '#1F4287'}
                                onChange={e => setModalData({...modalData, color_code: e.target.value})}
                                placeholder="#000000"
                                style={styles.colorText}
                            />
                        </div>
                    </div>

                    <div style={styles.modalActions}>
                        <button type="button" style={{...styles.button, ...styles.buttonSecondary}} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" style={{...styles.button, ...styles.buttonPrimary}}>
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Unit creation/edit form
        if (modalType === 'create_units' || modalType === 'edit_units') {
            return (
                <form onSubmit={handleFormSubmit} style={styles.modalForm}>
                    <h3 style={styles.modalTitle}>{modalType === 'create_units' ? 'Create New Unit' : 'Edit Unit'}</h3>

                    <div style={styles.formGroup}>
                        <label htmlFor="name">Unit Name</label>
                        <input
                            type="text"
                            id="name"
                            value={modalData.name || ''}
                            onChange={e => setModalData({...modalData, name: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="abbreviation">Abbreviation</label>
                        <input
                            type="text"
                            id="abbreviation"
                            value={modalData.abbreviation || ''}
                            onChange={e => setModalData({...modalData, abbreviation: e.target.value})}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label htmlFor="branch_id">Branch</label>
                            <select
                                id="branch_id"
                                value={modalData.branch_id || ''}
                                onChange={e => setModalData({...modalData, branch_id: e.target.value})}
                                required
                                style={styles.input}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="unit_type">Unit Type</label>
                            <select
                                id="unit_type"
                                value={modalData.unit_type || ''}
                                onChange={e => setModalData({...modalData, unit_type: e.target.value})}
                                required
                                style={styles.input}
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

                    <div style={styles.formGroup}>
                        <label htmlFor="parent_unit_id">Parent Unit</label>
                        <select
                            id="parent_unit_id"
                            value={modalData.parent_unit_id || ''}
                            onChange={e => setModalData({...modalData, parent_unit_id: e.target.value || null})}
                            style={styles.input}
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

                    <div style={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={modalData.description || ''}
                            onChange={e => setModalData({...modalData, description: e.target.value})}
                            rows="3"
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="motto">Motto</label>
                        <input
                            type="text"
                            id="motto"
                            value={modalData.motto || ''}
                            onChange={e => setModalData({...modalData, motto: e.target.value})}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="established_date">Established Date</label>
                        <input
                            type="date"
                            id="established_date"
                            value={modalData.established_date ? modalData.established_date.substring(0, 10) : ''}
                            onChange={e => setModalData({...modalData, established_date: e.target.value})}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formCheck}>
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={modalData.is_active || false}
                            onChange={e => setModalData({...modalData, is_active: e.target.checked})}
                        />
                        <label htmlFor="is_active">Active</label>
                    </div>

                    <div style={styles.modalActions}>
                        <button type="button" style={{...styles.button, ...styles.buttonSecondary}} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" style={{...styles.button, ...styles.buttonPrimary}}>
                            {isLoading ? <Loader size={16} className="spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            );
        }

        // Link user to unit form
        if (modalType === 'link_users_unit') {
            return (
                <form onSubmit={handleFormSubmit} style={styles.modalForm}>
                    <h3 style={styles.modalTitle}>Assign User to Unit</h3>

                    <div style={styles.formGroup}>
                        <label htmlFor="userId">User</label>
                        <select
                            id="userId"
                            value={modalData.userId || ''}
                            onChange={e => setModalData({...modalData, userId: e.target.value})}
                            required
                            style={styles.input}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="unitId">Unit</label>
                        <select
                            id="unitId"
                            value={modalData.unitId || ''}
                            onChange={e => setModalData({...modalData, unitId: e.target.value})}
                            required
                            style={styles.input}
                        >
                            <option value="">Select Unit</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.modalActions}>
                        <button type="button" style={{...styles.button, ...styles.buttonSecondary}} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" style={{...styles.button, ...styles.buttonPrimary}}>
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
                <div style={styles.loadingIndicator}>
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(users);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div style={styles.tableActions}>
                    <div style={styles.tableFilters}>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={styles.searchInput}
                            />
                            <Search style={styles.searchIcon} size={16} />
                        </div>

                        <button
                            style={{...styles.button, ...styles.filterButton}}
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                style={{...styles.button, ...styles.buttonDanger}}
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <>
                                <button
                                    style={{...styles.button, ...styles.buttonSecondary, marginLeft: '8px'}}
                                    onClick={() => handleOpenLinkModal('users_unit')}
                                >
                                    <Link size={16} /> Assign to Unit
                                </button>

                                <button
                                    style={{...styles.button, ...styles.buttonPrimary, marginLeft: '8px'}}
                                    onClick={() => handleOpenCreateModal('users')}
                                >
                                    <Plus size={16} /> New User
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th style={styles.avatarCell}>Avatar</th>
                            <th onClick={() => handleSort('username')} style={{...styles.th, ...styles.sortableColumn}}>
                                Username
                                {sortConfig.field === 'username' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('current_rank.name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Rank
                                {sortConfig.field === 'current_rank.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                                {sortConfig.field === 'rank.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('branch.name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Branch
                                {sortConfig.field === 'branch.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('primary_unit.name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Unit
                                {sortConfig.field === 'primary_unit.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('service_number')} style={{...styles.th, ...styles.sortableColumn}}>
                                Service #
                                {sortConfig.field === 'service_number' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_active')} style={{...styles.th, ...styles.sortableColumn}}>
                                Status
                                {sortConfig.field === 'is_active' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th style={styles.actionsCell}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={styles.noData}>No users found</td>
                            </tr>
                        ) : (
                            sortedData.map(user => (
                                <tr key={user.id} style={selectedItems.includes(user.id) ? styles.selectedRow : {}}>
                                    <td style={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(user.id)}
                                            onChange={() => handleItemSelect(user.id)}
                                        />
                                    </td>
                                    <td style={styles.avatarCell}>
                                        <div style={styles.userAvatarContainer}>
                                            <img
                                                src={user.avatar_url || '/api/placeholder/40/40'}
                                                alt={user.username}
                                                style={styles.tableAvatar}
                                            />
                                        </div>
                                    </td>
                                    <td style={styles.td}>{user.username}</td>
                                    <td style={styles.td}>
                                        {(user.current_rank && typeof user.current_rank === 'object') ? (
                                            <div style={{...styles.badge, backgroundColor: (user.branch && typeof user.branch === 'object') ? user.branch.color_code : '#1F4287'}}>
                                                {user.current_rank.abbreviation}
                                            </div>
                                        ) : (user.rank && typeof user.rank === 'object') ? (
                                            <div style={{...styles.badge, backgroundColor: (user.rank.branch && typeof user.rank.branch === 'object') ? user.rank.branch.color_code : '#1F4287'}}>
                                                {user.rank.abbreviation}
                                            </div>
                                        ) : ranks.find(r => r.id === user.current_rank) ? (
                                            <div style={{...styles.badge, backgroundColor: '#1F4287'}}>
                                                {ranks.find(r => r.id === user.current_rank).abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={styles.td}>
                                        {(user.branch && typeof user.branch === 'object') ? (
                                            <div style={{...styles.badge, ...styles.branchBadge, backgroundColor: user.branch.color_code || '#1F4287'}}>
                                                {user.branch.abbreviation}
                                            </div>
                                        ) : branches.find(b => b.id === user.branch_id) ? (
                                            <div style={{...styles.badge, ...styles.branchBadge, backgroundColor: branches.find(b => b.id === user.branch_id).color_code || '#1F4287'}}>
                                                {branches.find(b => b.id === user.branch_id).abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={styles.td}>{(user.primary_unit && typeof user.primary_unit === 'object') ? user.primary_unit.name :
                                        units.find(u => u.id === user.primary_unit_id) ? units.find(u => u.id === user.primary_unit_id).name : '-'}</td>
                                    <td style={styles.td}>{user.service_number || '-'}</td>
                                    <td style={styles.td}>
                                        <div style={user.is_active ? styles.statusActive : styles.statusInactive}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td style={styles.actionsCell}>
                                        <div style={styles.actionButtons}>
                                            {canPerformAction('write') && (
                                                <>
                                                    <button
                                                        style={styles.iconButton}
                                                        onClick={() => handleOpenEditModal('users', user)}
                                                        title="Edit User"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        style={styles.iconButton}
                                                        onClick={() => handleOpenLinkModal('users_unit', { userId: user.id })}
                                                        title="Assign to Unit"
                                                    >
                                                        <Link size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                style={{...styles.iconButton, ...styles.viewButton}}
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
                <div style={styles.loadingIndicator}>
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(ranks);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div style={styles.tableActions}>
                    <div style={styles.tableFilters}>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search ranks..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={styles.searchInput}
                            />
                            <Search style={styles.searchIcon} size={16} />
                        </div>

                        <button
                            style={{...styles.button, ...styles.filterButton}}
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                style={{...styles.button, ...styles.buttonDanger}}
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <button
                                style={{...styles.button, ...styles.buttonPrimary, marginLeft: '8px'}}
                                onClick={() => handleOpenCreateModal('ranks')}
                            >
                                <Plus size={16} /> New Rank
                            </button>
                        )}
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th style={styles.iconCell}>Insignia</th>
                            <th onClick={() => handleSort('name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Name
                                {sortConfig.field === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('abbreviation')} style={{...styles.th, ...styles.sortableColumn}}>
                                Abbr.
                                {sortConfig.field === 'abbreviation' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('branch.name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Branch
                                {sortConfig.field === 'branch.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('tier')} style={{...styles.th, ...styles.sortableColumn}}>
                                Tier
                                {sortConfig.field === 'tier' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_officer')} style={{...styles.th, ...styles.sortableColumn}}>
                                Type
                                {sortConfig.field === 'is_officer' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th style={styles.actionsCell}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={styles.noData}>No ranks found</td>
                            </tr>
                        ) : (
                            sortedData.map(rank => (
                                <tr key={rank.id} style={selectedItems.includes(rank.id) ? styles.selectedRow : {}}>
                                    <td style={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(rank.id)}
                                            onChange={() => handleItemSelect(rank.id)}
                                        />
                                    </td>
                                    <td style={styles.iconCell}>
                                        <img
                                            src={rank.insignia_image_url || '/api/placeholder/30/15'}
                                            alt={rank.name}
                                            style={styles.rankInsignia}
                                        />
                                    </td>
                                    <td style={styles.td}>{rank.name}</td>
                                    <td style={styles.td}>{rank.abbreviation}</td>
                                    <td style={styles.td}>
                                        {rank.branch ? (
                                            <div style={{...styles.badge, ...styles.branchBadge, backgroundColor: rank.branch.color_code || '#1F4287'}}>
                                                {rank.branch.abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={styles.td}>{rank.tier}</td>
                                    <td style={styles.td}>
                                        {rank.is_officer && <span style={styles.rankTypeOfficer}>Officer</span>}
                                        {rank.is_enlisted && <span style={styles.rankTypeEnlisted}>Enlisted</span>}
                                        {rank.is_warrant && <span style={styles.rankTypeWarrant}>Warrant</span>}
                                    </td>
                                    <td style={styles.actionsCell}>
                                        <div style={styles.actionButtons}>
                                            {canPerformAction('write') && (
                                                <button
                                                    style={styles.iconButton}
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
                <div style={styles.loadingIndicator}>
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(branches);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div style={styles.tableActions}>
                    <div style={styles.tableFilters}>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search branches..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={styles.searchInput}
                            />
                            <Search style={styles.searchIcon} size={16} />
                        </div>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                style={{...styles.button, ...styles.buttonDanger}}
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <button
                                style={{...styles.button, ...styles.buttonPrimary, marginLeft: '8px'}}
                                onClick={() => handleOpenCreateModal('branches')}
                            >
                                <Plus size={16} /> New Branch
                            </button>
                        )}
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th style={styles.logoCell}>Logo</th>
                            <th onClick={() => handleSort('name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Name
                                {sortConfig.field === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('abbreviation')} style={{...styles.th, ...styles.sortableColumn}}>
                                Abbr.
                                {sortConfig.field === 'abbreviation' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('color_code')} style={{...styles.th, ...styles.sortableColumn}}>
                                Color
                                {sortConfig.field === 'color_code' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.actionsCell}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={styles.noData}>No branches found</td>
                            </tr>
                        ) : (
                            sortedData.map(branch => (
                                <tr key={branch.id} style={selectedItems.includes(branch.id) ? styles.selectedRow : {}}>
                                    <td style={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(branch.id)}
                                            onChange={() => handleItemSelect(branch.id)}
                                        />
                                    </td>
                                    <td style={styles.logoCell}>
                                        <div style={{...styles.branchLogoContainer, backgroundColor: branch.color_code || '#1F4287'}}>
                                            <img
                                                src={branch.logo_url || '/api/placeholder/40/40'}
                                                alt={branch.name}
                                                style={styles.branchLogo}
                                            />
                                        </div>
                                    </td>
                                    <td style={styles.td}>{branch.name}</td>
                                    <td style={styles.td}>
                                        <div style={{...styles.badge, ...styles.branchBadge, backgroundColor: branch.color_code || '#1F4287'}}>
                                            {branch.abbreviation}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{...styles.colorSwatch, backgroundColor: branch.color_code || '#1F4287'}}>
                                            {branch.color_code}
                                        </div>
                                    </td>
                                    <td style={styles.descriptionCell}>{branch.description}</td>
                                    <td style={styles.actionsCell}>
                                        <div style={styles.actionButtons}>
                                            {canPerformAction('write') && (
                                                <button
                                                    style={styles.iconButton}
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
                <div style={styles.loadingIndicator}>
                    <AlertTriangle size={24} />
                    <span>Error: Invalid data format</span>
                </div>
            );
        }

        const filteredData = getFilteredData(units);
        const sortedData = getSortedData(filteredData);

        return (
            <>
                <div style={styles.tableActions}>
                    <div style={styles.tableFilters}>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search units..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={styles.searchInput}
                            />
                            <Search style={styles.searchIcon} size={16} />
                        </div>

                        <button
                            style={{...styles.button, ...styles.filterButton}}
                            onClick={() => {}}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        {selectedItems.length > 0 && canPerformAction('delete') && (
                            <button
                                style={{...styles.button, ...styles.buttonDanger}}
                                onClick={handleDeleteItems}
                            >
                                <Trash2 size={16} /> Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
                            </button>
                        )}

                        {canPerformAction('write') && (
                            <>
                                <button
                                    style={{...styles.button, ...styles.buttonSecondary, marginLeft: '8px'}}
                                    onClick={() => handleOpenLinkModal('users_unit')}
                                >
                                    <UserPlus size={16} /> Add Members
                                </button>

                                <button
                                    style={{...styles.button, ...styles.buttonPrimary, marginLeft: '8px'}}
                                    onClick={() => handleOpenCreateModal('units')}
                                >
                                    <Plus size={16} /> New Unit
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                    onChange={() => handleSelectAll(filteredData)}
                                />
                            </th>
                            <th style={styles.emblemCell}>Emblem</th>
                            <th onClick={() => handleSort('name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Name
                                {sortConfig.field === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('abbreviation')} style={{...styles.th, ...styles.sortableColumn}}>
                                Abbr.
                                {sortConfig.field === 'abbreviation' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('branch.name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Branch
                                {sortConfig.field === 'branch.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('unit_type')} style={{...styles.th, ...styles.sortableColumn}}>
                                Type
                                {sortConfig.field === 'unit_type' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('parent_unit.name')} style={{...styles.th, ...styles.sortableColumn}}>
                                Parent Unit
                                {sortConfig.field === 'parent_unit.name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_active')} style={{...styles.th, ...styles.sortableColumn}}>
                                Status
                                {sortConfig.field === 'is_active' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </th>
                            <th style={styles.actionsCell}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={styles.noData}>No units found</td>
                            </tr>
                        ) : (
                            sortedData.map(unit => (
                                <tr key={unit.id} style={selectedItems.includes(unit.id) ? styles.selectedRow : {}}>
                                    <td style={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(unit.id)}
                                            onChange={() => handleItemSelect(unit.id)}
                                        />
                                    </td>
                                    <td style={styles.emblemCell}>
                                        <div style={styles.unitEmblemContainer}>
                                            <img
                                                src={unit.emblem_url || '/api/placeholder/40/40'}
                                                alt={unit.name}
                                                style={styles.unitEmblem}
                                            />
                                        </div>
                                    </td>
                                    <td style={styles.td}>{unit.name}</td>
                                    <td style={styles.td}>
                                        <div style={styles.unitAbbreviation}>{unit.abbreviation}</div>
                                    </td>
                                    <td style={styles.td}>
                                        {unit.branch ? (
                                            <div style={{...styles.badge, ...styles.branchBadge, backgroundColor: unit.branch.color_code || '#1F4287'}}>
                                                {unit.branch.abbreviation}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={styles.td}>{unit.unit_type}</td>
                                    <td style={styles.td}>{unit.parent_unit?.name || '-'}</td>
                                    <td style={styles.td}>
                                        <div style={unit.is_active ? styles.statusActive : styles.statusInactive}>
                                            {unit.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td style={styles.actionsCell}>
                                        <div style={styles.actionButtons}>
                                            {canPerformAction('write') && (
                                                <>
                                                    <button
                                                        style={styles.iconButton}
                                                        onClick={() => handleOpenEditModal('units', unit)}
                                                        title="Edit Unit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        style={styles.iconButton}
                                                        onClick={() => handleOpenLinkModal('users_unit', { unitId: unit.id })}
                                                        title="Add Members"
                                                    >
                                                        <UserPlus size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                style={{...styles.iconButton, ...styles.viewButton}}
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
        <div style={styles.adminDashboard}>
            <header style={styles.adminHeader}>
                <div style={styles.adminHeaderContent}>
                    <div style={styles.adminTitle}>
                        <h1>Administration Dashboard</h1>
                        <div style={styles.adminSubtitle}>Manage organization data and user accounts</div>
                    </div>

                    <div style={styles.adminUser}>
                        {user && (
                            <div style={styles.adminUserInfo}>
                                <img
                                    src={user.avatar_url || '/api/placeholder/40/40'}
                                    alt={user.username}
                                    style={styles.adminUserAvatar}
                                />
                                <div style={styles.adminUserDetails}>
                                    <div style={styles.adminUsername}>{user.username}</div>
                                    <div style={styles.adminRole}>Administrator</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div style={styles.adminContent}>
                <nav style={styles.adminSidebar}>
                    <div style={styles.adminLogo}>
                        <div style={styles.logoIcon}>
                            <svg style={styles.logoSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <div style={styles.logoText}>5TH EXPEDITIONARY</div>
                    </div>

                    <ul style={styles.adminNav}>
                        <li style={activeTab === 'users' ? styles.navItemActive : styles.navItem}>
                            <button onClick={() => setActiveTab('users')} style={styles.navButton}>
                                <Users size={18} />
                                <span>Users</span>
                            </button>
                        </li>
                        <li style={activeTab === 'ranks' ? styles.navItemActive : styles.navItem}>
                            <button onClick={() => setActiveTab('ranks')} style={styles.navButton}>
                                <Shield size={18} />
                                <span>Ranks</span>
                            </button>
                        </li>
                        <li style={activeTab === 'branches' ? styles.navItemActive : styles.navItem}>
                            <button onClick={() => setActiveTab('branches')} style={styles.navButton}>
                                <Flag size={18} />
                                <span>Branches</span>
                            </button>
                        </li>
                        <li style={activeTab === 'units' ? styles.navItemActive : styles.navItem}>
                            <button onClick={() => setActiveTab('units')} style={styles.navButton}>
                                <Grid size={18} />
                                <span>Units</span>
                            </button>
                        </li>
                        <li style={styles.navItem}>
                            <a href="/" style={styles.backLink}>
                                <Settings size={18} />
                                <span>Settings</span>
                            </a>
                        </li>
                    </ul>

                    <div style={styles.adminFooter}>
                        <a href="/" style={styles.backLink}>
                            &larr; Back to Website
                        </a>
                    </div>
                </nav>

                <main style={styles.adminMain}>
                    {error && (
                        <div style={styles.errorMessage}>
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                            <button onClick={() => setError(null)} style={styles.closeButton}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div style={styles.adminPanel}>
                        {isLoading ? (
                            <div style={styles.loadingIndicator}>
                                <Loader size={24} className="spin" />
                                <span>Loading data...</span>
                            </div>
                        ) : (
                            <>
                                <div style={styles.panelHeader}>
                                    {activeTab === 'users' && <h2><Users size={20} /> Users Management</h2>}
                                    {activeTab === 'ranks' && <h2><Shield size={20} /> Ranks Management</h2>}
                                    {activeTab === 'branches' && <h2><Flag size={20} /> Branches Management</h2>}
                                    {activeTab === 'units' && <h2><Grid size={20} /> Units Management</h2>}
                                </div>

                                <div style={styles.panelContent}>
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
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContainer}>
                        <button style={styles.modalClose} onClick={handleCloseModal}>
                            <X size={20} />
                        </button>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

// Inline styles to prevent column overlap
const styles = {
    adminDashboard: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#0C1C2C',
        color: '#FFFFFF',
        fontFamily: "'Titillium Web', sans-serif",
    },
    adminHeader: {
        backgroundColor: '#0C1C2C',
        borderBottom: '1px solid #382C54',
        padding: '16px 24px',
    },
    adminHeaderContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    adminTitle: {
        display: 'flex',
        flexDirection: 'column',
    },
    adminSubtitle: {
        fontSize: '14px',
        color: '#8B92A0',
        marginTop: '4px',
    },
    adminUser: {
        display: 'flex',
        alignItems: 'center',
    },
    adminUserInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    adminUserAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #4FCBF8',
    },
    adminUserDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    adminUsername: {
        fontWeight: 'bold',
        fontSize: '14px',
    },
    adminRole: {
        fontSize: '12px',
        color: '#8B92A0',
    },
    adminContent: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    adminSidebar: {
        width: '240px',
        backgroundColor: '#0A1929',
        borderRight: '1px solid #382C54',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
    },
    adminLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 24px',
        marginBottom: '32px',
    },
    logoIcon: {
        width: '32px',
        height: '32px',
        color: '#4FCBF8',
    },
    logoSvg: {
        width: '100%',
        height: '100%',
    },
    logoText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#4FCBF8',
    },
    adminNav: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        flex: 1,
    },
    navItem: {
        marginBottom: '4px',
    },
    navItemActive: {
        marginBottom: '4px',
        backgroundColor: '#1A2332',
        borderLeft: '3px solid #4FCBF8',
    },
    navButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 24px',
        background: 'none',
        border: 'none',
        color: '#8B92A0',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    adminFooter: {
        padding: '24px',
    },
    backLink: {
        color: '#8B92A0',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    adminMain: {
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#0C1C2C',
        padding: '24px',
    },
    errorMessage: {
        backgroundColor: '#FF6B35',
        color: '#FFFFFF',
        padding: '12px 16px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
    },
    closeButton: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: '#FFFFFF',
        cursor: 'pointer',
    },
    adminPanel: {
        backgroundColor: '#0A1929',
        borderRadius: '8px',
        border: '1px solid #382C54',
        overflow: 'hidden',
    },
    loadingIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '48px',
        color: '#8B92A0',
    },
    panelHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #382C54',
    },
    panelContent: {
        padding: '0',
    },
    tableActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #382C54',
    },
    tableFilters: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },
    searchContainer: {
        position: 'relative',
    },
    searchInput: {
        backgroundColor: '#0C1C2C',
        border: '1px solid #382C54',
        borderRadius: '4px',
        padding: '8px 36px 8px 12px',
        color: '#FFFFFF',
        fontSize: '14px',
        width: '240px',
    },
    searchIcon: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#8B92A0',
    },
    button: {
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
    },
    buttonPrimary: {
        backgroundColor: '#4FCBF8',
        color: '#0C1C2C',
    },
    buttonSecondary: {
        backgroundColor: '#382C54',
        color: '#FFFFFF',
    },
    buttonDanger: {
        backgroundColor: '#FF6B35',
        color: '#FFFFFF',
    },
    filterButton: {
        backgroundColor: '#0C1C2C',
        color: '#8B92A0',
        border: '1px solid #382C54',
    },
    tableContainer: {
        overflowX: 'auto',
        minHeight: '400px',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        tableLayout: 'fixed',
    },
    th: {
        backgroundColor: '#0C1C2C',
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '13px',
        color: '#8B92A0',
        borderBottom: '1px solid #382C54',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    td: {
        padding: '12px 16px',
        fontSize: '14px',
        color: '#FFFFFF',
        borderBottom: '1px solid #1A2332',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    checkboxCell: {
        width: '48px',
        padding: '12px 16px',
        borderBottom: '1px solid #1A2332',
    },
    avatarCell: {
        width: '64px',
        padding: '12px 16px',
        borderBottom: '1px solid #1A2332',
    },
    iconCell: {
        width: '64px',
        padding: '12px 16px',
        borderBottom: '1px solid #1A2332',
    },
    logoCell: {
        width: '64px',
        padding: '12px 16px',
        borderBottom: '1px solid #1A2332',
    },
    emblemCell: {
        width: '64px',
        padding: '12px 16px',
        borderBottom: '1px solid #1A2332',
    },
    actionsCell: {
        width: '120px',
        padding: '12px 16px',
        borderBottom: '1px solid #1A2332',
    },
    descriptionCell: {
        maxWidth: '300px',
        padding: '12px 16px',
        fontSize: '14px',
        color: '#FFFFFF',
        borderBottom: '1px solid #1A2332',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    sortableColumn: {
        cursor: 'pointer',
        userSelect: 'none',
    },
    selectedRow: {
        backgroundColor: '#1A2332',
    },
    noData: {
        textAlign: 'center',
        padding: '48px',
        color: '#8B92A0',
    },
    userAvatarContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    badge: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#FFFFFF',
    },
    branchBadge: {
        textTransform: 'uppercase',
    },
    statusActive: {
        color: '#39FF14',
        fontSize: '13px',
        fontWeight: '500',
    },
    statusInactive: {
        color: '#FF6B35',
        fontSize: '13px',
        fontWeight: '500',
    },
    actionButtons: {
        display: 'flex',
        gap: '8px',
    },
    iconButton: {
        padding: '8px',
        backgroundColor: 'transparent',
        border: '1px solid #382C54',
        borderRadius: '4px',
        color: '#8B92A0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    viewButton: {
        borderColor: '#4FCBF8',
        color: '#4FCBF8',
    },
    rankInsignia: {
        maxWidth: '48px',
        maxHeight: '24px',
        objectFit: 'contain',
    },
    rankTypeOfficer: {
        color: '#E4D00A',
        fontSize: '12px',
        fontWeight: '500',
    },
    rankTypeEnlisted: {
        color: '#4FCBF8',
        fontSize: '12px',
        fontWeight: '500',
    },
    rankTypeWarrant: {
        color: '#39FF14',
        fontSize: '12px',
        fontWeight: '500',
    },
    branchLogoContainer: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
    },
    branchLogo: {
        width: '32px',
        height: '32px',
        objectFit: 'contain',
    },
    colorSwatch: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#FFFFFF',
    },
    unitEmblemContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unitEmblem: {
        width: '40px',
        height: '40px',
        objectFit: 'contain',
    },
    unitAbbreviation: {
        fontSize: '13px',
        fontWeight: '600',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: '#0A1929',
        border: '1px solid #382C54',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
    },
    modalClose: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'none',
        border: 'none',
        color: '#8B92A0',
        cursor: 'pointer',
    },
    modalForm: {
        padding: '32px',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '24px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        backgroundColor: '#0C1C2C',
        border: '1px solid #382C54',
        borderRadius: '4px',
        color: '#FFFFFF',
        fontSize: '14px',
        marginTop: '8px',
    },
    textarea: {
        width: '100%',
        padding: '8px 12px',
        backgroundColor: '#0C1C2C',
        border: '1px solid #382C54',
        borderRadius: '4px',
        color: '#FFFFFF',
        fontSize: '14px',
        marginTop: '8px',
        resize: 'vertical',
    },
    checkboxGroup: {
        display: 'flex',
        gap: '24px',
        marginBottom: '20px',
    },
    formCheck: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    fieldNote: {
        fontSize: '12px',
        color: '#FF6B35',
        marginTop: '4px',
    },
    colorInputContainer: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginTop: '8px',
    },
    colorPicker: {
        width: '48px',
        height: '36px',
        padding: '2px',
        backgroundColor: '#0C1C2C',
        border: '1px solid #382C54',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    colorText: {
        flex: 1,
        padding: '8px 12px',
        backgroundColor: '#0C1C2C',
        border: '1px solid #382C54',
        borderRadius: '4px',
        color: '#FFFFFF',
        fontSize: '14px',
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '32px',
    },
};

export default AdminDashboard;
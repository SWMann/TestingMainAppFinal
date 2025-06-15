// src/components/pages/ORBAT/hooks/useORBAT.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api';

/**
 * Custom hook for managing ORBAT data and operations
 */
export const useORBAT = (unitId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        branches: [],
        ranks: [],
        positionTypes: [],
        showVacant: true,
        showFilled: true,
        unitTypes: []
    });

    // Fetch ORBAT data
    const fetchData = useCallback(async () => {
        if (!unitId) {
            setError('No unit ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/units/orbat/unit_orbat/`, {
                params: {
                    unit_id: unitId,
                    include_subunits: true
                }
            });

            setData(response.data);
        } catch (err) {
            console.error('Error fetching ORBAT data:', err);
            setError(err.response?.data?.error || 'Failed to load ORBAT data');
        } finally {
            setLoading(false);
        }
    }, [unitId]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter data based on active filters
    const filteredData = useMemo(() => {
        if (!data) return null;

        let filteredNodes = [...data.nodes];

        // Apply vacancy filter
        if (!filters.showVacant) {
            filteredNodes = filteredNodes.filter(node => !node.is_vacant);
        }
        if (!filters.showFilled) {
            filteredNodes = filteredNodes.filter(node => node.is_vacant);
        }

        // Apply position type filter
        if (filters.positionTypes.length > 0) {
            filteredNodes = filteredNodes.filter(node =>
                filters.positionTypes.includes(node.position_type)
            );
        }

        // Apply branch filter
        if (filters.branches.length > 0) {
            filteredNodes = filteredNodes.filter(node =>
                filters.branches.includes(node.unit_info?.branch_name)
            );
        }

        // Apply rank filter
        if (filters.ranks.length > 0) {
            filteredNodes = filteredNodes.filter(node =>
                node.current_holder?.rank?.abbreviation &&
                filters.ranks.includes(node.current_holder.rank.abbreviation)
            );
        }

        // Filter edges to only include visible nodes
        const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredEdges = data.edges.filter(edge =>
            visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        );

        return {
            ...data,
            nodes: filteredNodes,
            edges: filteredEdges,
            statistics: calculateStatistics(filteredNodes)
        };
    }, [data, filters]);

    // Calculate statistics for filtered data
    const calculateStatistics = (nodes) => {
        const total = nodes.length;
        const filled = nodes.filter(n => !n.is_vacant).length;
        const vacant = total - filled;

        return {
            total_positions: total,
            filled_positions: filled,
            vacant_positions: vacant,
            fill_rate: total > 0 ? Math.round((filled / total) * 100) : 0
        };
    };

    // Get unique filter values from data
    const availableFilters = useMemo(() => {
        if (!data) return {
            branches: [],
            ranks: [],
            positionTypes: [],
            unitTypes: []
        };

        const branches = [...new Set(data.nodes
            .map(n => n.unit_info?.branch_name)
            .filter(Boolean))];

        const ranks = [...new Set(data.nodes
            .map(n => n.current_holder?.rank?.abbreviation)
            .filter(Boolean))];

        const positionTypes = [...new Set(data.nodes
            .map(n => n.position_type)
            .filter(Boolean))];

        const unitTypes = [...new Set(data.nodes
            .map(n => n.unit_info?.unit_type)
            .filter(Boolean))];

        return { branches, ranks, positionTypes, unitTypes };
    }, [data]);

    return {
        data,
        filteredData,
        loading,
        error,
        filters,
        setFilters,
        availableFilters,
        refresh: fetchData
    };
};

/**
 * Custom hook for managing position assignments
 */
export const usePositionAssignment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const assignUser = useCallback(async (positionId, userId, assignmentData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/positions/${positionId}/assign/`, {
                user_id: userId,
                ...assignmentData
            });

            return response.data;
        } catch (err) {
            console.error('Error assigning user:', err);
            setError(err.response?.data?.error || 'Failed to assign user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const vacatePosition = useCallback(async (positionId, data = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/positions/${positionId}/vacate/`, data);
            return response.data;
        } catch (err) {
            console.error('Error vacating position:', err);
            setError(err.response?.data?.error || 'Failed to vacate position');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getEligibleUsers = useCallback(async (roleId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/roles/${roleId}/eligible_users/`);
            return response.data.eligible_users || [];
        } catch (err) {
            console.error('Error fetching eligible users:', err);
            // Fallback to all users
            try {
                const allUsersResponse = await api.get('/users/');
                return allUsersResponse.data.results || allUsersResponse.data || [];
            } catch (fallbackErr) {
                setError('Failed to load users');
                return [];
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        assignUser,
        vacatePosition,
        getEligibleUsers
    };
};

/**
 * Custom hook for position history
 */
export const usePositionHistory = (positionId) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (!positionId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/positions/${positionId}/history/`);
            setHistory(response.data);
        } catch (err) {
            console.error('Error fetching position history:', err);
            setError('Failed to load position history');
        } finally {
            setLoading(false);
        }
    }, [positionId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, error, refresh: fetchHistory };
};

/**
 * Custom hook for managing ORBAT view preferences
 */
export const useORBATPreferences = () => {
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('orbat_preferences');
        return saved ? JSON.parse(saved) : {
            viewMode: 'tree',
            showStatistics: true,
            showFilters: false,
            defaultFilters: {
                showVacant: true,
                showFilled: true
            }
        };
    });

    const updatePreferences = useCallback((updates) => {
        setPreferences(prev => {
            const newPrefs = { ...prev, ...updates };
            localStorage.setItem('orbat_preferences', JSON.stringify(newPrefs));
            return newPrefs;
        });
    }, []);

    return { preferences, updatePreferences };
};

/**
 * Custom hook for search functionality
 */
export const useORBATSearch = (nodes) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (!searchQuery || !nodes) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = nodes.filter(node => {
            // Search in position title
            if (node.display_title.toLowerCase().includes(query)) return true;

            // Search in unit name/abbreviation
            if (node.unit_info?.name?.toLowerCase().includes(query)) return true;
            if (node.unit_info?.abbreviation?.toLowerCase().includes(query)) return true;

            // Search in current holder
            if (node.current_holder?.username?.toLowerCase().includes(query)) return true;
            if (node.current_holder?.service_number?.toLowerCase().includes(query)) return true;

            // Search in rank
            if (node.current_holder?.rank?.abbreviation?.toLowerCase().includes(query)) return true;

            return false;
        });

        setSearchResults(results);
    }, [searchQuery, nodes]);

    return { searchQuery, setSearchQuery, searchResults };
};
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Calendar, MapPin, Users, Clock, Filter, Search,
    ChevronRight, AlertCircle, Target, Shield, School,
    Trophy, Coffee, Users2, RefreshCw, Check, X
} from 'lucide-react';
import './OperationsPage.css';
import api from '../../../services/api';

const OperationsPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    // State management
    const [operations, setOperations] = useState([]);
    const [filteredOperations, setFilteredOperations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('upcoming');
    const [hostUnitFilter, setHostUnitFilter] = useState('all');
    const [mandatoryFilter, setMandatoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-asc');

    // Refs for caching and auto-refresh
    const cacheRef = useRef({});
    const autoRefreshInterval = useRef(null);
    const lastFetchTime = useRef(null);

    // Event type icons
    const eventTypeIcons = {
        'Operation': Target,
        'Training': School,
        'Ceremony': Trophy,
        'Meeting': Users2,
        'Social': Coffee,
        'Other': Calendar
    };

    // Fetch operations with caching
    const fetchOperations = useCallback(async (force = false) => {
        // Check cache validity (1 minute)
        const now = Date.now();
        const cacheValid = lastFetchTime.current && (now - lastFetchTime.current < 60000);

        if (!force && cacheValid && cacheRef.current.operations) {
            setOperations(cacheRef.current.operations);
            applyFilters(cacheRef.current.operations);
            return;
        }

        setIsRefreshing(true);

        try {
            // Fetch events with appropriate filters
            const params = {};
            if (statusFilter === 'upcoming') {
                params.start_date = new Date().toISOString();
            }

            const response = await api.get('/events/', { params });
            const eventsData = response.data.results || response.data;

            // Update cache
            cacheRef.current.operations = eventsData;
            lastFetchTime.current = now;

            setOperations(eventsData);
            setLastUpdated(new Date());
            applyFilters(eventsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching operations:', err);
            setError('Failed to load operations');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [statusFilter]);

    // Apply filters and sorting
    const applyFilters = useCallback((ops) => {
        let filtered = [...ops];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(op =>
                op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                op.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                op.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Event type filter
        if (eventTypeFilter !== 'all') {
            filtered = filtered.filter(op => op.event_type === eventTypeFilter);
        }

        // Status filter
        if (statusFilter === 'upcoming') {
            filtered = filtered.filter(op => new Date(op.start_time) >= new Date());
        } else if (statusFilter === 'past') {
            filtered = filtered.filter(op => new Date(op.start_time) < new Date());
        } else if (statusFilter !== 'all') {
            filtered = filtered.filter(op => op.status === statusFilter);
        }

        // Host unit filter
        if (hostUnitFilter !== 'all') {
            filtered = filtered.filter(op => op.host_unit === parseInt(hostUnitFilter));
        }

        // Mandatory filter
        if (mandatoryFilter === 'mandatory') {
            filtered = filtered.filter(op => op.is_mandatory);
        } else if (mandatoryFilter === 'optional') {
            filtered = filtered.filter(op => !op.is_mandatory);
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.start_time) - new Date(b.start_time);
                case 'date-desc':
                    return new Date(b.start_time) - new Date(a.start_time);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'type':
                    return a.event_type.localeCompare(b.event_type);
                default:
                    return 0;
            }
        });

        setFilteredOperations(filtered);
    }, [searchTerm, eventTypeFilter, statusFilter, hostUnitFilter, mandatoryFilter, sortBy]);

    // Effect for initial load
    useEffect(() => {
        fetchOperations();
    }, []);

    // Effect for filters
    useEffect(() => {
        applyFilters(operations);
    }, [operations, searchTerm, eventTypeFilter, statusFilter, hostUnitFilter, mandatoryFilter, sortBy, applyFilters]);

    // Auto-refresh setup
    useEffect(() => {
        // Clear existing interval
        if (autoRefreshInterval.current) {
            clearInterval(autoRefreshInterval.current);
        }

        // Set up new interval (every minute)
        autoRefreshInterval.current = setInterval(() => {
            fetchOperations();
        }, 60000);

        // Cleanup on unmount
        return () => {
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        };
    }, [fetchOperations]);

    // Get unique host units for filter
    const getUniqueHostUnits = () => {
        const units = [...new Map(operations.map(op =>
            [op.host_unit, { id: op.host_unit, name: op.host_unit_name }]
        )).values()];
        return units.filter(unit => unit.id);
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate time until event
    const getTimeUntil = (startTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const diff = start - now;

        if (diff < 0) return 'Started';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return 'Soon';
    };

    // Handle manual refresh
    const handleManualRefresh = () => {
        fetchOperations(true);
    };

    // Handle operation click
    const handleOperationClick = (operationId) => {
        navigate(`/operations/${operationId}`);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setEventTypeFilter('all');
        setStatusFilter('upcoming');
        setHostUnitFilter('all');
        setMandatoryFilter('all');
        setSortBy('date-asc');
    };

    if (isLoading && !isRefreshing) {
        return (
            <div className="operations-loading">
                <div className="loading-spinner"></div>
                <p>Loading operations...</p>
            </div>
        );
    }

    if (error && !operations.length) {
        return (
            <div className="operations-error">
                <AlertCircle size={48} />
                <h2>Error Loading Operations</h2>
                <p>{error}</p>
                <button onClick={() => fetchOperations(true)}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="operations-container">
            {/* Header */}
            <div className="operations-header">
                <div className="header-content">
                    <h1>Operations & Events</h1>
                    <div className="header-actions">
                        <div className="last-updated">
                            {lastUpdated && (
                                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                            )}
                        </div>
                        <button
                            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={18} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="operations-filters">
                <div className="filters-row">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search operations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={eventTypeFilter}
                        onChange={(e) => setEventTypeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="Operation">Operations</option>
                        <option value="Training">Training</option>
                        <option value="Ceremony">Ceremonies</option>
                        <option value="Meeting">Meetings</option>
                        <option value="Social">Social</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                        <option value="all">All Time</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={hostUnitFilter}
                        onChange={(e) => setHostUnitFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Units</option>
                        {getUniqueHostUnits().map(unit => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={mandatoryFilter}
                        onChange={(e) => setMandatoryFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Events</option>
                        <option value="mandatory">Mandatory Only</option>
                        <option value="optional">Optional Only</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="date-asc">Date (Earliest First)</option>
                        <option value="date-desc">Date (Latest First)</option>
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="type">Type</option>
                    </select>

                    <button onClick={resetFilters} className="reset-filters-button">
                        <X size={18} />
                        Reset
                    </button>
                </div>

                <div className="filter-summary">
                    Showing {filteredOperations.length} of {operations.length} operations
                </div>
            </div>

            {/* Operations List */}
            <div className="operations-list">
                {filteredOperations.length === 0 ? (
                    <div className="no-operations">
                        <Calendar size={48} />
                        <h3>No operations found</h3>
                        <p>Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    filteredOperations.map(operation => {
                        const IconComponent = eventTypeIcons[operation.event_type] || Calendar;
                        const isPast = new Date(operation.start_time) < new Date();

                        return (
                            <div
                                key={operation.id}
                                className={`operation-card ${isPast ? 'past' : ''} ${operation.is_mandatory ? 'mandatory' : ''}`}
                                onClick={() => handleOperationClick(operation.id)}
                            >
                                <div className="operation-icon">
                                    <IconComponent size={32} />
                                </div>

                                <div className="operation-content">
                                    <div className="operation-header">
                                        <h3>{operation.title}</h3>
                                        <div className="operation-badges">
                                            <span className={`type-badge ${operation.event_type.toLowerCase()}`}>
                                                {operation.event_type}
                                            </span>
                                            {operation.is_mandatory && (
                                                <span className="mandatory-badge">MANDATORY</span>
                                            )}
                                            <span className={`status-badge ${operation.status.toLowerCase().replace(' ', '-')}`}>
                                                {operation.status}
                                            </span>
                                        </div>
                                    </div>

                                    {operation.description && (
                                        <p className="operation-description">{operation.description}</p>
                                    )}

                                    <div className="operation-details">
                                        <div className="detail-item">
                                            <Clock size={16} />
                                            <span>{formatDateTime(operation.start_time)}</span>
                                        </div>
                                        {operation.location && (
                                            <div className="detail-item">
                                                <MapPin size={16} />
                                                <span>{operation.location}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <Shield size={16} />
                                            <span>{operation.host_unit_name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <Users size={16} />
                                            <span>{operation.attendees_count || 0} attending</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="operation-actions">
                                    <div className="time-until">
                                        {!isPast && getTimeUntil(operation.start_time)}
                                    </div>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default OperationsPage;
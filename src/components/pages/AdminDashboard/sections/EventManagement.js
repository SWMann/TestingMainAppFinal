import React, { useState, useEffect } from 'react';
import {
    Calendar, Search, Filter, Plus, Edit, Trash2, Clock, MapPin,
    Users, MoreVertical, Eye, CheckCircle, XCircle, AlertCircle,
    Flag, FileText, ExternalLink, CalendarCheck, Shield
} from 'lucide-react';
import './ManagementSections.css';
import api from "../../../../services/api";
import CreateEventModal from "../../../modals/CreateEventModal";
import EditEventModal from "../../../modals/EditEventModal";
import EventDetailsModal from "../../../modals/EventDetailsModal";
import EventAttendanceModal from "../../../modals/EventAttendanceModal";
import LinkOpordModal from "../../../modals/LinkOpordModal";

const EventManagement = ({ currentUser }) => {
    const [events, setEvents] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUnit, setFilterUnit] = useState('all');
    const [sortBy, setSortBy] = useState('start_time');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showLinkOpordModal, setShowLinkOpordModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        fetchInitialData();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/users/me/');
            const userId = response.data.id || response.data.user_id || response.data.pk;
            setCurrentUserId(userId);
        } catch (error) {
            console.error('Error fetching current user from /api/users/me/:', error);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [eventsRes, unitsRes] = await Promise.all([
                api.get('/events/'),
                api.get('/units/')
            ]);

            setEvents(eventsRes.data.results || eventsRes.data);
            setUnits(unitsRes.data.results || unitsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to load events', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async (eventId) => {
        try {
            const [eventRes, attendanceRes] = await Promise.all([
                api.get(`/events/${eventId}/`),
                api.get(`/events/${eventId}/attendance/`)
            ]);

            setSelectedEvent({
                ...eventRes.data,
                attendances: attendanceRes.data
            });
        } catch (error) {
            console.error('Error fetching event details:', error);
            showNotification('Failed to load event details', 'error');
        }
    };

    const handleCreateEvent = async (eventData) => {
        try {
            // Ensure creator is set
            if (!eventData.creator && currentUserId) {
                eventData.creator = currentUserId;
            }

            // If creator is still missing, try to get it from the API
            if (!eventData.creator) {
                try {
                    const userResponse = await api.get('/users/me/');
                    eventData.creator = userResponse.data.id || userResponse.data.user_id || userResponse.data.pk;
                } catch (error) {
                    console.error('Failed to fetch current user from /api/users/me/:', error);
                }
            }

            await api.post('/events/', eventData);
            await fetchInitialData();
            setShowCreateModal(false);
            showNotification('Event created successfully', 'success');
        } catch (error) {
            console.error('Error creating event:', error);
            console.error('Error response:', error.response?.data);
            showNotification('Failed to create event', 'error');
        }
    };

    const handleUpdateEvent = async (eventId, eventData) => {
        try {
            await api.put(`/events/${eventId}/`, eventData);
            await fetchInitialData();
            setShowEditModal(false);
            setSelectedEvent(null);
            showNotification('Event updated successfully', 'success');
        } catch (error) {
            console.error('Error updating event:', error);
            showNotification('Failed to update event', 'error');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/events/${eventId}/`);
            await fetchInitialData();
            showNotification('Event deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting event:', error);
            showNotification('Failed to delete event. It may have associated data.', 'error');
        }
    };

    const handleUpdateStatus = async (eventId, newStatus) => {
        try {
            await api.patch(`/events/${eventId}/`, { status: newStatus });
            await fetchInitialData();
            showNotification('Event status updated successfully', 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Failed to update event status', 'error');
        }
    };

    const handleLinkOpord = async (eventId, opordId) => {
        try {
            await api.patch(`/events/${eventId}/`, { operation_order: opordId });
            await fetchInitialData();
            setShowLinkOpordModal(false);
            showNotification('OPORD linked successfully', 'success');
        } catch (error) {
            console.error('Error linking OPORD:', error);
            showNotification('Failed to link OPORD', 'error');
        }
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
    };

    // Filter and sort events
    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || event.event_type === filterType;
        const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
        const matchesUnit = filterUnit === 'all' || event.host_unit === filterUnit;

        return matchesSearch && matchesType && matchesStatus && matchesUnit;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        switch (sortBy) {
            case 'start_time':
                return new Date(a.start_time) - new Date(b.start_time);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'type':
                return a.event_type.localeCompare(b.event_type);
            case 'unit':
                return (a.host_unit_name || '').localeCompare(b.host_unit_name || '');
            default:
                return 0;
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return 'scheduled';
            case 'In Progress': return 'in-progress';
            case 'Completed': return 'completed';
            case 'Cancelled': return 'cancelled';
            case 'Postponed': return 'postponed';
            default: return '';
        }
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'Operation': return Shield;
            case 'Training': return Users;
            case 'Ceremony': return Flag;
            case 'Meeting': return Users;
            case 'Social': return Users;
            default: return Calendar;
        }
    };

    return (
        <div className="management-section">
            <div className="section-container">
                <div className="section-header">
                    <div className="section-title">
                        <Calendar size={24} />
                        <h2>Event Management</h2>
                        <span className="count-badge">{events.length} events</span>
                    </div>
                    <div className="section-actions">
                        <button
                            className="action-btn secondary"
                            onClick={() => window.open('/calendar', '_blank')}
                        >
                            <CalendarCheck size={18} />
                            View Calendar
                        </button>
                        <button
                            className="action-btn primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={18} />
                            Create Event
                        </button>
                    </div>
                </div>

                <div className="section-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="Operation">Operations</option>
                            <option value="Training">Training</option>
                            <option value="Ceremony">Ceremonies</option>
                            <option value="Meeting">Meetings</option>
                            <option value="Social">Social</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Postponed">Postponed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}>
                            <option value="all">All Units</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sort-group">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="start_time">Sort by Date</option>
                            <option value="title">Sort by Title</option>
                            <option value="type">Sort by Type</option>
                            <option value="unit">Sort by Unit</option>
                        </select>
                    </div>
                </div>

                <div className="data-table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading events...</p>
                        </div>
                    ) : sortedEvents.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} />
                            <h3>No events found</h3>
                            <p>Try adjusting your search or filters</p>
                            <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Create First Event
                            </button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Event</th>
                                <th>Date & Time</th>
                                <th>Type</th>
                                <th>Host Unit</th>
                                <th>Status</th>
                                <th>Attendance</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedEvents.map(event => {
                                const EventIcon = getEventTypeIcon(event.event_type);

                                return (
                                    <tr key={event.id}>
                                        <td>
                                            <div className="event-cell">
                                                <EventIcon size={20} />
                                                <div>
                                                    <div className="event-title">
                                                        {event.title}
                                                        {event.is_mandatory && (
                                                            <span className="mandatory-badge">MANDATORY</span>
                                                        )}
                                                    </div>
                                                    {event.location && (
                                                        <div className="event-location">
                                                            <MapPin size={14} />
                                                            {event.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-time-cell">
                                                <div className="date">
                                                    {new Date(event.start_time).toLocaleDateString()}
                                                </div>
                                                <div className="time">
                                                    {new Date(event.start_time).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="event-type-badge">{event.event_type}</span>
                                        </td>
                                        <td>
                                            <span className="unit-name">{event.host_unit_name}</span>
                                        </td>
                                        <td>
                                                <span className={`status-badge ${getStatusColor(event.status)}`}>
                                                    {event.status}
                                                </span>
                                        </td>
                                        <td>
                                            <div className="attendance-cell">
                                                <Users size={16} />
                                                <span>{event.attendees_count || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => {
                                                        fetchEventDetails(event.id);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => {
                                                        setSelectedEvent(event);
                                                        setShowEditModal(true);
                                                    }}
                                                    title="Edit Event"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className="dropdown-container">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => setActiveDropdown(
                                                            activeDropdown === event.id ? null : event.id
                                                        )}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeDropdown === event.id && (
                                                        <div className="dropdown-menu">
                                                            <button
                                                                onClick={() => {
                                                                    fetchEventDetails(event.id);
                                                                    setShowAttendanceModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <Users size={16} />
                                                                Manage Attendance
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedEvent(event);
                                                                    setShowLinkOpordModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                            >
                                                                <FileText size={16} />
                                                                Link OPORD
                                                            </button>
                                                            {event.briefing_url && (
                                                                <button
                                                                    onClick={() => {
                                                                        window.open(event.briefing_url, '_blank');
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                >
                                                                    <ExternalLink size={16} />
                                                                    View Briefing
                                                                </button>
                                                            )}
                                                            <div className="dropdown-divider"></div>
                                                            {event.status === 'Scheduled' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleUpdateStatus(event.id, 'In Progress');
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                    >
                                                                        <Clock size={16} />
                                                                        Start Event
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleUpdateStatus(event.id, 'Postponed');
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                    >
                                                                        <AlertCircle size={16} />
                                                                        Postpone
                                                                    </button>
                                                                </>
                                                            )}
                                                            {event.status === 'In Progress' && (
                                                                <button
                                                                    onClick={() => {
                                                                        handleUpdateStatus(event.id, 'Completed');
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    Complete Event
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdateStatus(event.id, 'Cancelled');
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="danger"
                                                            >
                                                                <XCircle size={16} />
                                                                Cancel Event
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteEvent(event.id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="danger"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete Event
                                                            </button>
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
                <CreateEventModal
                    units={units}
                    currentUser={currentUser || { id: currentUserId }}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateEvent}
                />
            )}

            {showEditModal && selectedEvent && (
                <EditEventModal
                    event={selectedEvent}
                    units={units}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEvent(null);
                    }}
                    onUpdate={handleUpdateEvent}
                />
            )}

            {showDetailsModal && selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedEvent(null);
                    }}
                    onEdit={() => {
                        setShowDetailsModal(false);
                        setShowEditModal(true);
                    }}
                    onManageAttendance={() => {
                        setShowDetailsModal(false);
                        setShowAttendanceModal(true);
                    }}
                />
            )}

            {showAttendanceModal && selectedEvent && (
                <EventAttendanceModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowAttendanceModal(false);
                        setSelectedEvent(null);
                    }}
                    onUpdate={() => fetchEventDetails(selectedEvent.id)}
                />
            )}

            {showLinkOpordModal && selectedEvent && (
                <LinkOpordModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowLinkOpordModal(false);
                        setSelectedEvent(null);
                    }}
                    onLink={handleLinkOpord}
                />
            )}
        </div>
    );
};

export default EventManagement;
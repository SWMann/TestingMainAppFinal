import React, { useState, useEffect } from 'react';
import {
    X, Users, CheckCircle, XCircle, AlertCircle, Clock,
    Search, Filter, Download, MessageSquare, User
} from 'lucide-react';
import './AdminModals.css';
import api from "../../services/api";


const EventAttendanceModal = ({ event, onClose, onUpdate }) => {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('status');
    const [selectedAttendances, setSelectedAttendances] = useState(new Set());

    useEffect(() => {
        fetchAttendances();
    }, [event.id]);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/events/${event.id}/attendance/`);
            setAttendances(response.data);
        } catch (error) {
            console.error('Error fetching attendances:', error);
            showNotification('Failed to load attendance data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (attendanceId, newStatus) => {
        try {
            await api.patch(`/event-attendance/${attendanceId}/`, {
                status: newStatus
            });
            await fetchAttendances();
            showNotification('Attendance status updated', 'success');
            onUpdate();
        } catch (error) {
            console.error('Error updating attendance:', error);
            showNotification('Failed to update attendance status', 'error');
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (selectedAttendances.size === 0) {
            showNotification('No attendees selected', 'warning');
            return;
        }

        try {
            await Promise.all(
                Array.from(selectedAttendances).map(id =>
                    api.patch(`/event-attendance/${id}/`, { status: newStatus })
                )
            );
            await fetchAttendances();
            setSelectedAttendances(new Set());
            showNotification(`Updated ${selectedAttendances.size} attendance records`, 'success');
            onUpdate();
        } catch (error) {
            console.error('Error bulk updating attendance:', error);
            showNotification('Failed to update some attendance records', 'error');
        }
    };

    const exportAttendanceList = () => {
        const csvContent = [
            ['Username', 'Status', 'Response Time', 'Check In', 'Check Out', 'Feedback'],
            ...attendances.map(a => [
                a.user_username,
                a.status,
                a.response_time ? new Date(a.response_time).toLocaleString() : '',
                a.check_in_time ? new Date(a.check_in_time).toLocaleString() : '',
                a.check_out_time ? new Date(a.check_out_time).toLocaleString() : '',
                a.feedback || ''
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_attendance.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const showNotification = (message, type) => {
        console.log(`${type}: ${message}`);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Attending': return CheckCircle;
            case 'Declined': return XCircle;
            case 'Maybe': return AlertCircle;
            case 'Excused': return AlertCircle;
            case 'No Response': return Clock;
            default: return User;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Attending': return 'attending';
            case 'Declined': return 'declined';
            case 'Maybe': return 'maybe';
            case 'Excused': return 'excused';
            case 'No Response': return 'no-response';
            default: return '';
        }
    };

    // Filter and sort attendances
    const filteredAttendances = attendances.filter(attendance => {
        const matchesSearch = attendance.user_username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || attendance.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const sortedAttendances = [...filteredAttendances].sort((a, b) => {
        switch (sortBy) {
            case 'username':
                return a.user_username.localeCompare(b.user_username);
            case 'status':
                return a.status.localeCompare(b.status);
            case 'response':
                return new Date(b.response_time || 0) - new Date(a.response_time || 0);
            default:
                return 0;
        }
    });

    const attendanceStats = attendances.reduce((acc, attendance) => {
        acc[attendance.status] = (acc[attendance.status] || 0) + 1;
        return acc;
    }, {});

    const toggleSelection = (id) => {
        const newSelection = new Set(selectedAttendances);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedAttendances(newSelection);
    };

    const selectAll = () => {
        if (selectedAttendances.size === sortedAttendances.length) {
            setSelectedAttendances(new Set());
        } else {
            setSelectedAttendances(new Set(sortedAttendances.map(a => a.id)));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Users size={20} />
                        Manage Attendance - {event.title}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-form">
                    {/* Attendance Statistics */}
                    <div className="attendance-stats-grid">
                        <div className="stat-card attending">
                            <CheckCircle size={24} />
                            <div>
                                <div className="stat-value">{attendanceStats['Attending'] || 0}</div>
                                <div className="stat-label">Attending</div>
                            </div>
                        </div>
                        <div className="stat-card declined">
                            <XCircle size={24} />
                            <div>
                                <div className="stat-value">{attendanceStats['Declined'] || 0}</div>
                                <div className="stat-label">Declined</div>
                            </div>
                        </div>
                        <div className="stat-card maybe">
                            <AlertCircle size={24} />
                            <div>
                                <div className="stat-value">{attendanceStats['Maybe'] || 0}</div>
                                <div className="stat-label">Maybe</div>
                            </div>
                        </div>
                        <div className="stat-card excused">
                            <AlertCircle size={24} />
                            <div>
                                <div className="stat-value">{attendanceStats['Excused'] || 0}</div>
                                <div className="stat-label">Excused</div>
                            </div>
                        </div>
                        <div className="stat-card no-response">
                            <Clock size={24} />
                            <div>
                                <div className="stat-value">{attendanceStats['No Response'] || 0}</div>
                                <div className="stat-label">No Response</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Actions */}
                    <div className="attendance-controls">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <Filter size={18} />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="Attending">Attending</option>
                                <option value="Declined">Declined</option>
                                <option value="Maybe">Maybe</option>
                                <option value="Excused">Excused</option>
                                <option value="No Response">No Response</option>
                            </select>
                        </div>

                        <div className="sort-group">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="status">Sort by Status</option>
                                <option value="username">Sort by Name</option>
                                <option value="response">Sort by Response Time</option>
                            </select>
                        </div>

                        <button className="action-btn secondary" onClick={exportAttendanceList}>
                            <Download size={16} />
                            Export
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedAttendances.size > 0 && (
                        <div className="bulk-actions">
                            <span>{selectedAttendances.size} selected</span>
                            <div className="bulk-action-buttons">
                                <button
                                    className="bulk-action-btn attending"
                                    onClick={() => handleBulkStatusUpdate('Attending')}
                                >
                                    Set Attending
                                </button>
                                <button
                                    className="bulk-action-btn declined"
                                    onClick={() => handleBulkStatusUpdate('Declined')}
                                >
                                    Set Declined
                                </button>
                                <button
                                    className="bulk-action-btn excused"
                                    onClick={() => handleBulkStatusUpdate('Excused')}
                                >
                                    Set Excused
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Attendance List */}
                    <div className="attendance-list-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading attendance data...</p>
                            </div>
                        ) : sortedAttendances.length === 0 ? (
                            <div className="empty-state">
                                <Users size={48} />
                                <p>No attendance records found</p>
                            </div>
                        ) : (
                            <table className="attendance-table">
                                <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedAttendances.size === sortedAttendances.length}
                                            onChange={selectAll}
                                        />
                                    </th>
                                    <th>Member</th>
                                    <th>Status</th>
                                    <th>Response Time</th>
                                    <th>Check In/Out</th>
                                    <th>Feedback</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedAttendances.map(attendance => {
                                    const StatusIcon = getStatusIcon(attendance.status);

                                    return (
                                        <tr key={attendance.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAttendances.has(attendance.id)}
                                                    onChange={() => toggleSelection(attendance.id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="user-cell">
                                                    <img
                                                        src={attendance.user_avatar || '/default-avatar.png'}
                                                        alt={attendance.user_username}
                                                        className="user-avatar"
                                                    />
                                                    <span>{attendance.user_username}</span>
                                                </div>
                                            </td>
                                            <td>
                                                    <span className={`attendance-status ${getStatusColor(attendance.status)}`}>
                                                        <StatusIcon size={16} />
                                                        {attendance.status}
                                                    </span>
                                            </td>
                                            <td>
                                                {attendance.response_time ? (
                                                    <span className="time-text">
                                                            {new Date(attendance.response_time).toLocaleString()}
                                                        </span>
                                                ) : (
                                                    <span className="no-data">No response</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="check-times">
                                                    {attendance.check_in_time && (
                                                        <div className="check-in">
                                                            In: {new Date(attendance.check_in_time).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                    {attendance.check_out_time && (
                                                        <div className="check-out">
                                                            Out: {new Date(attendance.check_out_time).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                    {!attendance.check_in_time && !attendance.check_out_time && (
                                                        <span className="no-data">Not checked in</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {attendance.feedback ? (
                                                    <div className="feedback-preview">
                                                        <MessageSquare size={16} />
                                                        <span title={attendance.feedback}>
                                                                {attendance.feedback.substring(0, 50)}
                                                            {attendance.feedback.length > 50 && '...'}
                                                            </span>
                                                    </div>
                                                ) : (
                                                    <span className="no-data">No feedback</span>
                                                )}
                                            </td>
                                            <td>
                                                <select
                                                    value={attendance.status}
                                                    onChange={(e) => handleStatusUpdate(attendance.id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="Attending">Attending</option>
                                                    <option value="Declined">Declined</option>
                                                    <option value="Maybe">Maybe</option>
                                                    <option value="Excused">Excused</option>
                                                    <option value="No Response">No Response</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventAttendanceModal;
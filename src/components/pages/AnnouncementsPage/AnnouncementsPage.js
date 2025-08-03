// src/components/pages/AnnouncementsPage/AnnouncementsPage.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Megaphone, Calendar, User, Clock, Pin, Edit, Trash2,
    Plus, AlertCircle, ChevronRight, Shield, Hash, Globe,
    MessageSquare, Share2, Bell, Archive
} from 'lucide-react';
import api from '../../../services/api';
import './AnnouncementsPage.css';
import CreateAnnouncementModal from '../../modals/CreateAnnouncementModal';
import EditAnnouncementModal from '../../modals/EditAnnouncementModal';
import DeleteAnnouncementModal from '../../modals/DeleteAnnouncementModal';
import { formatDistanceToNow } from 'date-fns';

const AnnouncementsPage = () => {
    const { user: currentUser } = useSelector(state => state.auth);
    const isAdmin = currentUser?.is_admin || currentUser?.is_staff;

    // State
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPinned, setFilterPinned] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [announcementToEdit, setAnnouncementToEdit] = useState(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchAnnouncements();
    }, [currentPage, filterPinned]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            let url = `/announcements/?page=${currentPage}`;
            if (filterPinned) {
                url += '&is_pinned=true';
            }
            if (searchTerm) {
                url += `&search=${searchTerm}`;
            }

            const response = await api.get(url);
            const data = response.data;

            // Handle both paginated and non-paginated responses
            if (data.results) {
                setAnnouncements(data.results);
                setTotalCount(data.count);
                setTotalPages(Math.ceil(data.count / 20)); // Assuming 20 per page
            } else {
                setAnnouncements(data);
                setTotalCount(data.length);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Error fetching announcements:', err);
            setError('Failed to load announcements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAnnouncements();
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        setCurrentPage(1);
        fetchAnnouncements();
    };

    const handleEditClick = (announcement) => {
        setAnnouncementToEdit(announcement);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setAnnouncementToEdit(null);
        fetchAnnouncements();
    };

    const handleDeleteClick = (announcement) => {
        setAnnouncementToDelete(announcement);
        setShowDeleteModal(true);
    };

    const handleDeleteSuccess = () => {
        setShowDeleteModal(false);
        setAnnouncementToDelete(null);
        fetchAnnouncements();
    };

    const togglePin = async (announcement) => {
        try {
            await api.patch(`/announcements/${announcement.id}/`, {
                is_pinned: !announcement.is_pinned
            });
            fetchAnnouncements();
        } catch (err) {
            console.error('Error toggling pin:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (dateString) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    if (loading) {
        return (
            <div className="announcements-loading">
                <div className="loading-spinner"></div>
                <p>LOADING FLEET COMMUNICATIONS...</p>
            </div>
        );
    }

    return (
        <div className="announcements-container">
            {/* Header */}
            <div className="announcements-header">
                <div className="header-content">
                    <div className="header-title">
                        <Megaphone size={48} className="header-icon" />
                        <div>
                            <h1>FLEET ANNOUNCEMENTS</h1>
                            <p>Official communications from Fleet Command</p>
                        </div>
                    </div>
                    <div className="header-stats">
                        <div className="stat-item">
                            <Hash size={20} />
                            <span>{totalCount} Total</span>
                        </div>
                        <div className="stat-item">
                            <Pin size={20} />
                            <span>{announcements.filter(a => a.is_pinned).length} Pinned</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="announcements-controls">
                <div className="controls-container">
                    <div className="left-controls">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-box">
                                <MessageSquare size={18} />
                                <input
                                    type="text"
                                    placeholder="Search announcements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </form>
                        <button
                            className={`filter-btn ${filterPinned ? 'active' : ''}`}
                            onClick={() => {
                                setFilterPinned(!filterPinned);
                                setCurrentPage(1);
                            }}
                        >
                            <Pin size={16} />
                            Pinned Only
                        </button>
                    </div>
                    {isAdmin && (
                        <button
                            className="action-btn primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={18} />
                            NEW ANNOUNCEMENT
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="announcements-content">
                {error ? (
                    <div className="error-state">
                        <AlertCircle size={48} />
                        <h3>ERROR</h3>
                        <p>{error}</p>
                        <button onClick={fetchAnnouncements} className="action-btn">
                            Retry
                        </button>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <h3>NO ANNOUNCEMENTS</h3>
                        <p>There are no announcements to display at this time.</p>
                    </div>
                ) : (
                    <div className="announcements-list">
                        {announcements.map(announcement => (
                            <div
                                key={announcement.id}
                                className={`announcement-card ${announcement.is_pinned ? 'pinned' : ''} ${
                                    selectedAnnouncement?.id === announcement.id ? 'selected' : ''
                                }`}
                                onClick={() => setSelectedAnnouncement(
                                    selectedAnnouncement?.id === announcement.id ? null : announcement
                                )}
                            >
                                <div className="announcement-header">
                                    <div className="announcement-title-section">
                                        {announcement.is_pinned && (
                                            <div className="pinned-indicator">
                                                <Pin size={16} />
                                                PINNED
                                            </div>
                                        )}
                                        <h3>{announcement.title}</h3>
                                    </div>
                                    {isAdmin && (
                                        <div className="announcement-actions">
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePin(announcement);
                                                }}
                                                title={announcement.is_pinned ? 'Unpin' : 'Pin'}
                                            >
                                                <Pin size={16} className={announcement.is_pinned ? 'pinned' : ''} />
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(announcement);
                                                }}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="icon-btn danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(announcement);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="announcement-meta">
                                    <div className="meta-item">
                                        <User size={14} />
                                        <span>
                                            {announcement.author?.current_rank?.abbreviation} {announcement.author?.username}
                                        </span>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={14} />
                                        <span>{formatDate(announcement.publish_date)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        <span>{formatRelativeTime(announcement.publish_date)}</span>
                                    </div>
                                </div>

                                <div className={`announcement-content ${
                                    selectedAnnouncement?.id === announcement.id ? 'expanded' : ''
                                }`}>
                                    <p>{announcement.content}</p>
                                </div>

                                {selectedAnnouncement?.id !== announcement.id && announcement.content.length > 150 && (
                                    <div className="announcement-expand">
                                        <span>Click to read more</span>
                                        <ChevronRight size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateAnnouncementModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showEditModal && announcementToEdit && (
                <EditAnnouncementModal
                    announcement={announcementToEdit}
                    onClose={() => {
                        setShowEditModal(false);
                        setAnnouncementToEdit(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}

            {showDeleteModal && announcementToDelete && (
                <DeleteAnnouncementModal
                    announcement={announcementToDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setAnnouncementToDelete(null);
                    }}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
};

export default AnnouncementsPage;
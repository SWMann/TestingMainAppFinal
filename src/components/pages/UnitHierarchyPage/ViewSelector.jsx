// src/components/UnitHierarchy/Controls/ViewSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { hierarchyService } from './hierarchyService';
import ViewSettingsModal from './ViewSettingsModal';
import { toast } from 'react-toastify';

const ViewSelector = ({ currentView, onViewChange, isAdmin }) => {
    const [views, setViews] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingView, setEditingView] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadViews();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadViews = async () => {
        try {
            setLoading(true);
            const response = await hierarchyService.getViews();
            setViews(response.data);
        } catch (error) {
            console.error('Failed to load views:', error);
            toast.error('Failed to load hierarchy views');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSelect = (viewId) => {
        onViewChange(viewId);
        setIsOpen(false);
    };

    const handleCreateNew = () => {
        setEditingView(null);
        setShowCreateModal(true);
        setIsOpen(false);
    };

    const handleEdit = (view, e) => {
        e.stopPropagation();
        setEditingView(view);
        setShowCreateModal(true);
        setIsOpen(false);
    };

    const handleDelete = async (viewId, e) => {
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this view?')) {
            return;
        }

        try {
            await hierarchyService.deleteView(viewId);
            toast.success('View deleted successfully');
            loadViews();

            // If deleted view was current, switch to default
            if (currentView === viewId) {
                const defaultView = views.find(v => v.is_default);
                if (defaultView) {
                    onViewChange(defaultView.id);
                }
            }
        } catch (error) {
            console.error('Failed to delete view:', error);
            toast.error('Failed to delete view');
        }
    };

    const handleViewSaved = (savedView) => {
        loadViews();
        onViewChange(savedView.id);
    };

    const currentViewData = views.find(v => v.id === currentView);

    return (
        <>
            <div className="view-selector" ref={dropdownRef}>
                <button
                    className="view-selector-button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={loading}
                >
                    <div className="selector-content">
                        <span className="selector-label">View:</span>
                        <span className="selector-value">
              {loading ? 'Loading...' : (currentViewData?.name || 'Select a view')}
            </span>
                    </div>
                    <ChevronDown
                        size={16}
                        className={`chevron ${isOpen ? 'rotated' : ''}`}
                    />
                </button>

                {isOpen && !loading && (
                    <div className="view-dropdown">
                        <div className="dropdown-header">
                            <span>Hierarchy Views</span>
                            {isAdmin && (
                                <button
                                    className="create-button"
                                    onClick={handleCreateNew}
                                    title="Create New View"
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>

                        <div className="view-list">
                            {views.length > 0 ? (
                                views.map(view => (
                                    <div
                                        key={view.id}
                                        className={`view-item ${view.id === currentView ? 'active' : ''}`}
                                        onClick={() => handleViewSelect(view.id)}
                                    >
                                        <div className="view-info">
                                            <div className="view-name">
                                                {view.name}
                                                {view.is_default && (
                                                    <span className="default-badge">Default</span>
                                                )}
                                            </div>
                                            {view.description && (
                                                <div className="view-description">{view.description}</div>
                                            )}
                                            <div className="view-meta">
                                                <span className="view-type">{view.view_type}</span>
                                                <span className="separator">•</span>
                                                <span className="view-visibility">
                          {view.is_public ? (
                              <>
                                  <Eye size={12} />
                                  Public
                              </>
                          ) : (
                              <>
                                  <EyeOff size={12} />
                                  Private
                              </>
                          )}
                        </span>
                                                {view.included_units_count !== 'All Units' && (
                                                    <>
                                                        <span className="separator">•</span>
                                                        <span className="units-count">
                              {view.included_units_count} units
                            </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="view-actions">
                                                <button
                                                    className="action-button"
                                                    onClick={(e) => handleEdit(view, e)}
                                                    title="Edit View"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {!view.is_default && (
                                                    <button
                                                        className="action-button danger"
                                                        onClick={(e) => handleDelete(view.id, e)}
                                                        title="Delete View"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="empty-views">
                                    <p>No views available</p>
                                    {isAdmin && (
                                        <button
                                            className="create-first-button"
                                            onClick={handleCreateNew}
                                        >
                                            <Plus size={16} />
                                            Create First View
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <ViewSettingsModal
                    view={editingView}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingView(null);
                    }}
                    onSave={handleViewSaved}
                />
            )}
        </>
    );
};

export default ViewSelector;
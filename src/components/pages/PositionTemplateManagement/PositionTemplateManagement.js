// Create new file: src/components/pages/PositionTemplateManagement/PositionTemplateManagement.js

import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Edit, Trash2, Copy, Eye,
    FileText, Users, Shield, ChevronRight,
    AlertCircle, Check, X, GitBranch, Building
} from 'lucide-react';
import api from '../../../services/api';
import './PositionTemplateManagement.css';

const PositionTemplateManagement = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/units/position-templates/');
            setTemplates(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (templateId) => {
        if (!window.confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            await api.delete(`/units/position-templates/${templateId}/`);
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
        }
    };

    const handleDuplicate = async (templateId) => {
        const name = prompt('Enter name for the duplicated template:');
        if (!name) return;

        try {
            await api.post(`/units/position-templates/${templateId}/duplicate/`, {
                name
            });
            fetchTemplates();
        } catch (error) {
            console.error('Error duplicating template:', error);
            alert('Failed to duplicate template');
        }
    };

    const filteredTemplates = templates.filter(template => {
        if (filter === 'all') return true;
        return template.template_type === filter;
    });

    const getTemplateIcon = (type) => {
        const icons = {
            'squad': <Users size={16} />,
            'platoon': <Shield size={16} />,
            'company': <Building size={16} />,
            'battalion': <GitBranch size={16} />,
            'custom': <Package size={16} />
        };
        return icons[type] || <FileText size={16} />;
    };

    return (
        <div className="template-management-container">
            <div className="template-management-header">
                <div className="header-content">
                    <h1>
                        <Package size={32} />
                        Position Template Management
                    </h1>
                    <p>Create and manage position templates for quick unit setup</p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={16} />
                        Create Template
                    </button>
                </div>
            </div>

            <div className="template-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Templates
                </button>
                <button
                    className={`filter-btn ${filter === 'squad' ? 'active' : ''}`}
                    onClick={() => setFilter('squad')}
                >
                    Squad
                </button>
                <button
                    className={`filter-btn ${filter === 'platoon' ? 'active' : ''}`}
                    onClick={() => setFilter('platoon')}
                >
                    Platoon
                </button>
                <button
                    className={`filter-btn ${filter === 'company' ? 'active' : ''}`}
                    onClick={() => setFilter('company')}
                >
                    Company
                </button>
                <button
                    className={`filter-btn ${filter === 'battalion' ? 'active' : ''}`}
                    onClick={() => setFilter('battalion')}
                >
                    Battalion
                </button>
                <button
                    className={`filter-btn ${filter === 'custom' ? 'active' : ''}`}
                    onClick={() => setFilter('custom')}
                >
                    Custom
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading templates...</p>
                </div>
            ) : (
                <div className="templates-grid">
                    {filteredTemplates.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onEdit={() => {
                                setSelectedTemplate(template);
                                setShowEditModal(true);
                            }}
                            onDelete={() => handleDelete(template.id)}
                            onDuplicate={() => handleDuplicate(template.id)}
                            onPreview={() => {
                                setSelectedTemplate(template);
                                // Show preview modal
                            }}
                        />
                    ))}
                </div>
            )}

            {filteredTemplates.length === 0 && !loading && (
                <div className="empty-state">
                    <Package size={48} />
                    <p>No templates found{filter !== 'all' ? ` for ${filter} type` : ''}</p>
                    <button
                        className="btn primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create First Template
                    </button>
                </div>
            )}

            {showCreateModal && (
                <CreateTemplateModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={() => {
                        setShowCreateModal(false);
                        fetchTemplates();
                    }}
                />
            )}

            {showEditModal && selectedTemplate && (
                <EditTemplateModal
                    template={selectedTemplate}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedTemplate(null);
                    }}
                    onUpdate={() => {
                        setShowEditModal(false);
                        setSelectedTemplate(null);
                        fetchTemplates();
                    }}
                />
            )}
        </div>
    );
};

const TemplateCard = ({ template, onEdit, onDelete, onDuplicate, onPreview }) => {
    const positionCount = template.position_count || 0;

    return (
        <div className="template-card">
            <div className="template-card-header">
                <h3>
                    {getTemplateIcon(template.template_type)}
                    {template.name}
                </h3>
                <span className={`template-type ${template.template_type}`}>
                    {template.template_type}
                </span>
            </div>

            {template.description && (
                <p className="template-description">{template.description}</p>
            )}

            <div className="template-stats">
                <div className="stat">
                    <Users size={14} />
                    <span>{positionCount} positions</span>
                </div>
                {template.applicable_unit_types && template.applicable_unit_types.length > 0 && (
                    <div className="stat">
                        <Shield size={14} />
                        <span>{template.applicable_unit_types.join(', ')}</span>
                    </div>
                )}
            </div>

            {template.template_positions && template.template_positions.length > 0 && (
                <div className="template-positions-preview">
                    <h4>Positions:</h4>
                    <div className="positions-list">
                        {template.template_positions.slice(0, 5).map((tp, index) => (
                            <div key={index} className="position-item">
                                <span>{tp.role_details?.name || 'Unknown'}</span>
                                <span className="quantity">×{tp.quantity}</span>
                            </div>
                        ))}
                        {template.template_positions.length > 5 && (
                            <div className="more-positions">
                                +{template.template_positions.length - 5} more...
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="template-actions">
                <button
                    className="action-btn preview"
                    onClick={onPreview}
                    title="Preview"
                >
                    <Eye size={16} />
                </button>
                <button
                    className="action-btn edit"
                    onClick={onEdit}
                    title="Edit"
                >
                    <Edit size={16} />
                </button>
                <button
                    className="action-btn duplicate"
                    onClick={onDuplicate}
                    title="Duplicate"
                >
                    <Copy size={16} />
                </button>
                <button
                    className="action-btn delete"
                    onClick={onDelete}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

// Placeholder for Create/Edit modals - these would be more complex in practice
const CreateTemplateModal = ({ onClose, onCreate }) => {
    // Implementation would include form for creating template
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Create Position Template</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-content">
                    <p>Template creation form would go here...</p>
                </div>
                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn primary" onClick={onCreate}>
                        Create Template
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditTemplateModal = ({ template, onClose, onUpdate }) => {
    // Implementation would include form for editing template
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Edit Template: {template.name}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-content">
                    <p>Template editing form would go here...</p>
                </div>
                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn primary" onClick={onUpdate}>
                        Update Template
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function
const getTemplateIcon = (type) => {
    const icons = {
        'squad': <Users size={16} />,
        'platoon': <Shield size={16} />,
        'company': <Building size={16} />,
        'battalion': <GitBranch size={16} />,
        'custom': <Package size={16} />
    };
    return icons[type] || <FileText size={16} />;
};

export default PositionTemplateManagement;
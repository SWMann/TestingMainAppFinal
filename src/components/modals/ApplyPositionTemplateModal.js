// Create new file: src/components/modals/ApplyPositionTemplateModal.js

import React, { useState, useEffect } from 'react';
import {
    X, FileText, Users, Eye, Check, AlertCircle,
    ChevronRight, Building, Briefcase, Hash,
    Package, Layers, GitBranch
} from 'lucide-react';
import api from "../../services/api";
import './AdminModals.css';

export const ApplyPositionTemplateModal = ({ unit, onClose, onApply }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('select'); // 'select' or 'preview'

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            // Fetch templates applicable to this unit type
            const response = await api.get('/units/position-templates/by_unit_type/', {
                params: { unit_type: unit.unit_type }
            });
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setError('Failed to load position templates');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = async (template) => {
        setSelectedTemplate(template);
        setError(null);

        try {
            // Get preview of what will be created
            const response = await api.post(`/units/position-templates/${template.id}/preview/`, {
                unit_id: unit.id
            });
            setPreview(response.data);
            setStep('preview');
        } catch (error) {
            console.error('Error generating preview:', error);
            setError('Failed to generate preview');
        }
    };

    const handleApply = async () => {
        if (!selectedTemplate) return;

        setApplying(true);
        setError(null);

        try {
            const response = await api.post(`/units/position-templates/${selectedTemplate.id}/apply/`, {
                unit_id: unit.id,
                preview_only: false
            });

            onApply(response.data.positions);
            onClose();
        } catch (error) {
            console.error('Error applying template:', error);
            setError(error.response?.data?.error || 'Failed to apply template');
        } finally {
            setApplying(false);
        }
    };

    const renderTemplateCard = (template) => {
        const positionCount = template.position_count || 0;
        const roleBreakdown = {};

        template.template_positions?.forEach(tp => {
            const roleName = tp.role_details?.name || 'Unknown';
            roleBreakdown[roleName] = (roleBreakdown[roleName] || 0) + tp.quantity;
        });

        return (
            <div
                key={template.id}
                className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template)}
            >
                <div className="template-header">
                    <h4>
                        <FileText size={18} />
                        {template.name}
                    </h4>
                    <span className={`template-type-badge ${template.template_type}`}>
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
                    <div className="stat">
                        <Layers size={14} />
                        <span>{Object.keys(roleBreakdown).length} unique roles</span>
                    </div>
                </div>

                <div className="role-breakdown">
                    {Object.entries(roleBreakdown).map(([role, count]) => (
                        <div key={role} className="role-item">
                            <span className="role-name">{role}</span>
                            <span className="role-count">×{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        if (!preview) return null;

        return (
            <div className="template-preview">
                <div className="preview-header">
                    <h3>
                        <Eye size={20} />
                        Preview: {selectedTemplate.name}
                    </h3>
                    <button
                        className="btn secondary small"
                        onClick={() => {
                            setStep('select');
                            setPreview(null);
                        }}
                    >
                        Back to Templates
                    </button>
                </div>

                <div className="preview-summary">
                    <h4>Summary</h4>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Total Positions:</span>
                            <span className="value">{preview.summary.total_positions}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Target Unit:</span>
                            <span className="value">{unit.name}</span>
                        </div>
                    </div>

                    <div className="category-breakdown">
                        <h5>By Category:</h5>
                        {Object.entries(preview.summary.by_category).map(([category, count]) => (
                            <div key={category} className="category-item">
                                <span className={`category-badge ${category}`}>{category}</span>
                                <span className="count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="preview-positions">
                    <h4>Positions to be Created</h4>
                    <div className="positions-list">
                        {preview.positions.map((pos, index) => (
                            <div key={index} className="preview-position">
                                <div className="position-info">
                                    <Briefcase size={16} />
                                    <div>
                                        <div className="position-title">
                                            {pos.display_title}
                                        </div>
                                        <div className="position-meta">
                                            <span className={`role-badge ${pos.role.category}`}>
                                                {pos.role.name}
                                            </span>
                                            {pos.identifier && (
                                                <span className="identifier">
                                                    <Hash size={12} />
                                                    {pos.identifier}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container large">
                <div className="modal-header">
                    <h2>
                        <Package size={24} />
                        Apply Position Template to {unit.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading templates...</p>
                        </div>
                    ) : step === 'select' ? (
                        <>
                            <div className="templates-info">
                                <AlertCircle size={16} />
                                <p>
                                    Select a template to quickly create multiple positions for {unit.name}.
                                    Templates are pre-configured position structures that match your unit type.
                                </p>
                            </div>

                            {templates.length === 0 ? (
                                <div className="no-templates">
                                    <Package size={48} />
                                    <p>No templates available for {unit.unit_type} units.</p>
                                </div>
                            ) : (
                                <div className="templates-grid">
                                    {templates.map(template => renderTemplateCard(template))}
                                </div>
                            )}
                        </>
                    ) : (
                        renderPreview()
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    {step === 'preview' && (
                        <button
                            className="btn primary"
                            onClick={handleApply}
                            disabled={applying || !selectedTemplate}
                        >
                            {applying ? (
                                <>
                                    <div className="spinner small"></div>
                                    Applying Template...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Apply Template
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add these styles to AdminModals.css:
const additionalStyles = `
.template-card {
    background-color: #3a3a3a;
    border: 1px solid #404040;
    border-radius: 0.5rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.template-card:hover {
    border-color: #ffd700;
    transform: translateY(-2px);
}

.template-card.selected {
    border-color: #ffd700;
    background-color: #404040;
}

.template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.template-header h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: #ffffff;
}

.template-type-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.template-type-badge.squad { background-color: rgba(34, 197, 94, 0.2); color: #22c55e; }
.template-type-badge.platoon { background-color: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.template-type-badge.company { background-color: rgba(251, 146, 60, 0.2); color: #fb923c; }
.template-type-badge.battalion { background-color: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
.template-type-badge.custom { background-color: rgba(156, 163, 175, 0.2); color: #9ca3af; }

.template-description {
    color: #cccccc;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.template-stats {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
}

.template-stats .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #999999;
    font-size: 0.875rem;
}

.role-breakdown {
    border-top: 1px solid #404040;
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.role-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
}

.role-name {
    color: #cccccc;
}

.role-count {
    color: #ffd700;
    font-weight: 600;
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.template-preview {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-header h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: #ffd700;
}

.preview-summary {
    background-color: #3a3a3a;
    border: 1px solid #404040;
    border-radius: 0.5rem;
    padding: 1.5rem;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 1rem 0;
}

.summary-item {
    display: flex;
    justify-content: space-between;
}

.summary-item .label {
    color: #999999;
}

.summary-item .value {
    color: #ffffff;
    font-weight: 600;
}

.category-breakdown {
    margin-top: 1.5rem;
}

.category-breakdown h5 {
    margin-bottom: 0.75rem;
    color: #cccccc;
}

.category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.preview-positions {
    background-color: #2d2d2d;
    border: 1px solid #404040;
    border-radius: 0.5rem;
    padding: 1.5rem;
}

.positions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
}

.preview-position {
    background-color: #3a3a3a;
    border: 1px solid #404040;
    border-radius: 0.375rem;
    padding: 1rem;
}

.position-info {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.position-title {
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 0.5rem;
}

.position-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.role-badge {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.identifier {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #999999;
    font-size: 0.875rem;
}

.templates-info {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background-color: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.templates-info p {
    margin: 0;
    color: #cccccc;
    font-size: 0.875rem;
}

.no-templates {
    text-align: center;
    padding: 3rem;
    color: #999999;
}

.no-templates p {
    margin-top: 1rem;
}
`;
// src/components/UnitHierarchy/EdgeTypes/EdgeContextMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Edit2,
    Trash2,
    Info,
    GitBranch,
    MoreVertical,
    Flag,
    Zap,
    X
} from 'lucide-react';

const EdgeContextMenu = ({
                             edge,
                             position,
                             onClose,
                             onEdit,
                             onDelete,
                             onChangeType,
                             isAdmin
                         }) => {
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Position menu to avoid going off-screen
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;

            let adjustedX = position.x;
            let adjustedY = position.y;

            if (rect.right > innerWidth) {
                adjustedX = position.x - rect.width;
            }

            if (rect.bottom > innerHeight) {
                adjustedY = position.y - rect.height;
            }

            menuRef.current.style.left = `${adjustedX}px`;
            menuRef.current.style.top = `${adjustedY}px`;
        }
    }, [position]);

    const edgeTypeOptions = [
        { value: 'command', label: 'Command', icon: GitBranch, color: '#4a5d23' },
        { value: 'support', label: 'Support', icon: Zap, color: '#3b82f6' },
        { value: 'coordination', label: 'Coordination', icon: MoreVertical, color: '#f59e0b' },
    ];

    return (
        <div
            ref={menuRef}
            className="edge-context-menu"
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
            }}
        >
            {/* Edge Information */}
            <div className="edge-context-menu-item" onClick={() => console.log('Show edge info')}>
                <Info size={16} />
                <span>Edge Details</span>
            </div>

            <div className="edge-context-menu-divider" />

            {/* Change Edge Type (Admin only) */}
            {isAdmin && (
                <>
                    <div className="edge-context-menu-submenu">
                        <div className="edge-context-menu-item">
                            <GitBranch size={16} />
                            <span>Change Type</span>
                        </div>
                        <div className="submenu-items">
                            {edgeTypeOptions.map(option => (
                                <div
                                    key={option.value}
                                    className="edge-context-menu-item"
                                    onClick={() => {
                                        onChangeType(edge.id, option.value);
                                        onClose();
                                    }}
                                    style={{
                                        paddingLeft: '2rem',
                                        color: edge.type === option.value ? option.color : undefined,
                                    }}
                                >
                                    <option.icon size={14} />
                                    <span>{option.label}</span>
                                    {edge.type === option.value && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="edge-context-menu-divider" />
                </>
            )}

            {/* Set Priority (Admin only) */}
            {isAdmin && (
                <>
                    <div className="edge-context-menu-item" onClick={() => onEdit(edge)}>
                        <Flag size={16} />
                        <span>Set Priority</span>
                    </div>
                </>
            )}

            {/* Edit Edge (Admin only) */}
            {isAdmin && (
                <>
                    <div className="edge-context-menu-item" onClick={() => onEdit(edge)}>
                        <Edit2 size={16} />
                        <span>Edit Relationship</span>
                    </div>
                </>
            )}

            {/* Delete Edge (Admin only) */}
            {isAdmin && (
                <>
                    <div className="edge-context-menu-divider" />
                    <div
                        className="edge-context-menu-item danger"
                        onClick={() => {
                            if (window.confirm(`Delete ${edge.type} relationship between units?`)) {
                                onDelete(edge.id);
                                onClose();
                            }
                        }}
                    >
                        <Trash2 size={16} />
                        <span>Delete Relationship</span>
                    </div>
                </>
            )}
        </div>
    );
};

// Edge Edit Modal
export const EdgeEditModal = ({ edge, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        label: edge.data?.label || '',
        priority: edge.data?.priority || 'normal',
        supportType: edge.data?.supportType || '',
        description: edge.data?.description || '',
        bidirectional: edge.data?.bidirectional || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(edge.id, formData);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content edge-edit-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Relationship</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Relationship Label</label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g., Direct Command, Administrative Support"
                        />
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {edge.type === 'support' && (
                        <div className="form-group">
                            <label>Support Type</label>
                            <select
                                value={formData.supportType}
                                onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                            >
                                <option value="">General Support</option>
                                <option value="logistics">Logistics</option>
                                <option value="medical">Medical</option>
                                <option value="communications">Communications</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Additional details about this relationship..."
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.bidirectional}
                                onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
                            />
                            <span>Bidirectional Relationship</span>
                            <small>Both units have equal relationship status</small>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EdgeContextMenu;
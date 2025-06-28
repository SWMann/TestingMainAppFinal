import React, { useState } from 'react';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import './AdminModals.css';

/**
 * DeleteMOSModal - Modal for deleting a Military Occupational Specialty
 *
 * @param {Object} mos - MOS object to delete (should include code, title, branch_name, category, holders_count, positions_count)
 * @param {Function} onClose - Callback when modal is closed
 * @param {Function} onDelete - Callback when MOS is deleted, receives mosId
 */
const DeleteMOSModal = ({ mos, onClose, onDelete }) => {
    const [confirmText, setConfirmText] = useState('');
    const mosCode = mos?.code || 'UNKNOWN';
    const requiredText = `DELETE ${mosCode}`;
    const canDelete = confirmText === requiredText;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (canDelete && mos?.id) {
            onDelete(mos.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Trash2 size={20} />
                        Delete MOS
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="delete-warning">
                        <AlertCircle size={48} className="warning-icon" />
                        <h3>Are you sure you want to delete this MOS?</h3>
                        <p>This action cannot be undone.</p>
                    </div>

                    <div className="delete-target">
                        <div className="mos-details">
                            <h4>{mos?.code || 'Unknown'} - {mos?.title || 'Unknown MOS'}</h4>
                            {mos?.branch_name && (
                                <p className="branch-name">{mos.branch_name}</p>
                            )}
                            {mos?.category && (
                                <span className={`category-badge ${mos.category}`}>
                                    {mos.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                            )}
                        </div>
                    </div>

                    {((mos?.holders_count && mos.holders_count > 0) || (mos?.positions_count && mos.positions_count > 0)) && (
                        <div className="delete-impact">
                            <h4>
                                <AlertCircle size={16} />
                                This MOS is currently in use:
                            </h4>
                            <ul>
                                {mos.holders_count > 0 && (
                                    <li>{mos.holders_count} personnel have this MOS</li>
                                )}
                                {mos.positions_count > 0 && (
                                    <li>{mos.positions_count} positions require this MOS</li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="delete-confirmation">
                        <p>To confirm deletion, please type: <strong>{requiredText}</strong></p>
                        <input
                            type="text"
                            className="confirm-input"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type confirmation text"
                            autoFocus
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button danger"
                            disabled={!canDelete}
                        >
                            Delete MOS
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Add these styles to AdminModals.css if not already present
const deleteModalStyles = `
.delete-warning {
    text-align: center;
    padding: 2rem 1rem;
}

.delete-warning .warning-icon {
    color: #ef4444;
    margin-bottom: 1rem;
}

.delete-warning h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #ffffff;
}

.delete-warning p {
    color: #999999;
    margin: 0;
}

.delete-target {
    background-color: #1a1a1a;
    border: 1px solid #2d2d2d;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin: 1.5rem 0;
}

.mos-details h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #ffffff;
}

.mos-details .branch-name {
    color: #999999;
    margin: 0 0 1rem 0;
    display: block;
}

.delete-impact {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.delete-impact h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #ef4444;
    margin: 0 0 0.75rem 0;
}

.delete-impact ul {
    margin: 0;
    padding-left: 1.5rem;
}

.delete-impact li {
    color: #ffffff;
    margin-bottom: 0.25rem;
}

.delete-confirmation {
    margin-bottom: 1.5rem;
}

.delete-confirmation p {
    font-size: 0.875rem;
    color: #999999;
    margin-bottom: 0.75rem;
}

.delete-confirmation strong {
    color: #ef4444;
    font-weight: 600;
}

.confirm-input {
    width: 100%;
    padding: 0.75rem;
    background-color: #1a1a1a;
    border: 1px solid #2d2d2d;
    border-radius: 0.375rem;
    color: #ffffff;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.confirm-input:focus {
    outline: none;
    border-color: #ef4444;
}

.submit-button.danger {
    background-color: #dc2626;
    color: #ffffff;
}

.submit-button.danger:hover:not(:disabled) {
    background-color: #ef4444;
}

.submit-button.danger:disabled {
    background-color: #3a3a3a;
    color: #666666;
}
`;

export default DeleteMOSModal;
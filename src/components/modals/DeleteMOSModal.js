import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import './AdminModals.css';

const DeleteMOSModal = ({ mos, onClose, onDelete }) => {
    const [confirmText, setConfirmText] = useState('');
    const requiredText = `DELETE ${mos.code}`;
    const canDelete = confirmText === requiredText;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (canDelete) {
            onDelete(mos.id);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-modal">
                <div className="modal-header delete-header">
                    <h2>Delete MOS</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="delete-warning">
                            <AlertCircle size={48} className="warning-icon" />
                            <h3>Are you sure you want to delete this MOS?</h3>
                            <p>This action cannot be undone.</p>
                        </div>

                        <div className="delete-target">
                            <h4>{mos.code} - {mos.title}</h4>
                            <p className="branch-name">{mos.branch_name}</p>
                        </div>

                        {(mos.holders_count > 0 || mos.positions_count > 0) && (
                            <div className="delete-impact">
                                <h4><AlertCircle size={16} /> This MOS is currently in use:</h4>
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
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn danger delete-button"
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

export default DeleteMOSModal;
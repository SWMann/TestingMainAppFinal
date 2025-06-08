import React, { useState } from 'react';
import { X, AlertTriangle, Shield, Users } from 'lucide-react';
import './AdminModals.css';

const DeleteRankModal = ({ rank, onClose, onDelete }) => {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmText === rank.abbreviation) {
            setIsDeleting(true);
            await onDelete(rank.id);
            setIsDeleting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header delete-header">
                    <h2>
                        <AlertTriangle size={20} />
                        Delete Rank
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-form">
                    <div className="delete-warning">
                        <AlertTriangle size={48} className="warning-icon" />
                        <h3>Are you sure you want to delete this rank?</h3>
                        <p>This action cannot be undone.</p>
                    </div>

                    <div className="delete-target">
                        <div className="rank-display">
                            {rank.insignia_image_url && (
                                <img
                                    src={rank.insignia_image_url}
                                    alt={rank.name}
                                    className="rank-insignia-modal"
                                />
                            )}
                            <div>
                                <div className="rank-name">{rank.name}</div>
                                <div className="rank-abbr">{rank.abbreviation}</div>
                                <div className="rank-branch">{rank.branch_name}</div>
                            </div>
                        </div>
                    </div>

                    <div className="delete-impact">
                        <h4>
                            <Users size={18} />
                            Impact of Deletion
                        </h4>
                        <ul>
                            <li>This rank will be permanently removed from the system</li>
                            <li>Users currently holding this rank will need to be reassigned</li>
                            <li>Historical records referencing this rank will be affected</li>
                            <li>Any promotion requirements using this rank will need updating</li>
                        </ul>
                    </div>

                    <div className="delete-confirmation">
                        <p>To confirm deletion, please type <strong>{rank.abbreviation}</strong> below:</p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Type ${rank.abbreviation} to confirm`}
                            className="confirm-input"
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="submit-button delete-button"
                            onClick={handleDelete}
                            disabled={confirmText !== rank.abbreviation || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Rank'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteRankModal;
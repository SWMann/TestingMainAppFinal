import React from 'react';
import { X, Award, Users, Clock, Shield, ChevronRight, CheckCircle } from 'lucide-react';
import '../AdminModals.css';

const ViewCertificateDetailsModal = ({ certificate, onClose, onIssue }) => {
    if (!certificate) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Award size={24} />
                        <h2>Certificate Details</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="cert-details-header">
                        {certificate.badge_image_url && (
                            <img
                                src={certificate.badge_image_url}
                                alt={certificate.name}
                                className="cert-details-badge"
                            />
                        )}
                        <div className="cert-details-info">
                            <h3>{certificate.name}</h3>
                            <p className="abbreviation">{certificate.abbreviation}</p>
                            <p>{certificate.branch_name}</p>
                        </div>
                        <button
                            className="btn primary"
                            onClick={onIssue}
                        >
                            <Award size={18} />
                            Issue Certificate
                        </button>
                    </div>

                    <div className="detail-sections">
                        <div className="detail-section">
                            <h4>Certificate Information</h4>

                            {certificate.description && (
                                <div className="detail-row">
                                    <span className="label">Description:</span>
                                    <p className="value">{certificate.description}</p>
                                </div>
                            )}

                            {certificate.requirements && (
                                <div className="detail-row">
                                    <span className="label">Requirements:</span>
                                    <p className="value">{certificate.requirements}</p>
                                </div>
                            )}

                            <div className="detail-row">
                                <span className="label">Validity:</span>
                                <span className="value">
                                    {certificate.expiration_period ? (
                                        <span className="validity-badge expiring">
                                            <Clock size={14} />
                                            Expires after {certificate.expiration_period} days
                                        </span>
                                    ) : (
                                        <span className="validity-badge permanent">
                                            <CheckCircle size={14} />
                                            No expiration
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="label">Required for Promotion:</span>
                                <span className="value">
                                    {certificate.is_required_for_promotion ? (
                                        <span className="badge required">Yes</span>
                                    ) : (
                                        <span className="badge optional">No</span>
                                    )}
                                </span>
                            </div>

                            {certificate.min_rank_name && (
                                <div className="detail-row">
                                    <span className="label">Minimum Rank:</span>
                                    <span className="value">{certificate.min_rank_name}</span>
                                </div>
                            )}

                            {certificate.authorized_trainers && certificate.authorized_trainers.length > 0 && (
                                <div className="detail-row">
                                    <span className="label">Authorized Trainers:</span>
                                    <div className="authorized-trainers">
                                        {certificate.authorized_trainers.map((trainer, index) => (
                                            <span key={index} className="trainer-badge">
                                                {trainer}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="cert-holders-section">
                            <h4>
                                <Users size={18} />
                                Certificate Holders ({certificate.holders?.length || 0})
                            </h4>

                            {certificate.holders && certificate.holders.length > 0 ? (
                                <div className="cert-holders-grid">
                                    {certificate.holders.map(holder => (
                                        <div key={holder.id} className="cert-holder-card">
                                            <div className="cert-holder-left">
                                                <img
                                                    src={holder.user_avatar || '/default-avatar.png'}
                                                    alt={holder.user_username}
                                                    className="cert-holder-avatar"
                                                />
                                                <div className="cert-holder-info">
                                                    <h5>{holder.user_username}</h5>
                                                    <p className="cert-holder-unit">
                                                        {holder.user_rank} • {holder.user_unit || 'No unit'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="cert-holder-right">
                                                <p className="issue-date">
                                                    {new Date(holder.issue_date).toLocaleDateString()}
                                                </p>
                                                {holder.is_active ? (
                                                    holder.expiry_date && new Date(holder.expiry_date) < new Date() ? (
                                                        <span className="cert-status-badge expired">
                                                            <Clock size={12} />
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="cert-status-badge active">
                                                            <CheckCircle size={12} />
                                                            Active
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="cert-status-badge expired">
                                                        <X size={12} />
                                                        Revoked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Users size={32} />
                                    <p>No users have been issued this certificate yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCertificateDetailsModal;
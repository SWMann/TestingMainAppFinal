import React from 'react';
import { X, Award, User, Calendar, Clock, CheckCircle, XCircle, Download, AlertTriangle } from 'lucide-react';
import '../Modal.css';

const ViewIssuedCertificateModal = ({ issuedCert, onClose, onRevoke }) => {
    if (!issuedCert) return null;

    const isExpired = issuedCert.expiry_date && new Date(issuedCert.expiry_date) < new Date();
    const status = !issuedCert.is_active ? 'revoked' : isExpired ? 'expired' : 'active';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Award size={24} />
                        <h2>Issued Certificate Details</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="cert-details-header">
                        {issuedCert.certificate_badge && (
                            <img
                                src={issuedCert.certificate_badge}
                                alt={issuedCert.certificate_name}
                                className="cert-details-badge"
                            />
                        )}
                        <div className="cert-details-info">
                            <h3>{issuedCert.certificate_name}</h3>
                            <p className="abbreviation">{issuedCert.certificate_abbreviation}</p>
                            <div className="cert-status">
                                <span className={`status-badge ${status}`}>
                                    {status === 'active' && <CheckCircle size={14} />}
                                    {status === 'expired' && <Clock size={14} />}
                                    {status === 'revoked' && <XCircle size={14} />}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-sections">
                        <div className="detail-section">
                            <h4>Holder Information</h4>
                            <div className="detail-row">
                                <span className="label">User:</span>
                                <div className="user-info">
                                    <User size={18} />
                                    <span className="value">{issuedCert.user_username}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Certificate Details</h4>
                            <div className="detail-row">
                                <span className="label">Issue Date:</span>
                                <span className="value">
                                    <Calendar size={14} />
                                    {new Date(issuedCert.issue_date).toLocaleString()}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="label">Issued By:</span>
                                <span className="value">{issuedCert.issuer_username}</span>
                            </div>

                            {issuedCert.training_event_title && (
                                <div className="detail-row">
                                    <span className="label">Training Event:</span>
                                    <span className="value">{issuedCert.training_event_title}</span>
                                </div>
                            )}

                            {issuedCert.expiry_date && (
                                <div className="detail-row">
                                    <span className="label">Expiry Date:</span>
                                    <span className="value">
                                        <Clock size={14} />
                                        {new Date(issuedCert.expiry_date).toLocaleDateString()}
                                        {isExpired && (
                                            <span className="expired-warning">
                                                <AlertTriangle size={14} />
                                                Expired
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}

                            {!issuedCert.is_active && (
                                <>
                                    <div className="detail-row">
                                        <span className="label">Revocation Date:</span>
                                        <span className="value">
                                            {issuedCert.revocation_date ?
                                                new Date(issuedCert.revocation_date).toLocaleDateString() :
                                                'N/A'
                                            }
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="label">Revoked By:</span>
                                        <span className="value">{issuedCert.revoked_by_username || 'N/A'}</span>
                                    </div>

                                    {issuedCert.revocation_reason && (
                                        <div className="detail-row">
                                            <span className="label">Revocation Reason:</span>
                                            <p className="value revocation-reason">
                                                {issuedCert.revocation_reason}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {issuedCert.certificate_file_url && (
                            <div className="detail-section">
                                <h4>Certificate Document</h4>
                                <button
                                    className="btn secondary"
                                    onClick={() => window.open(issuedCert.certificate_file_url, '_blank')}
                                >
                                    <Download size={18} />
                                    Download Certificate
                                </button>
                            </div>
                        )}
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
                    {issuedCert.is_active && !isExpired && (
                        <button
                            type="button"
                            className="btn danger"
                            onClick={onRevoke}
                        >
                            <XCircle size={18} />
                            Revoke Certificate
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewIssuedCertificateModal;
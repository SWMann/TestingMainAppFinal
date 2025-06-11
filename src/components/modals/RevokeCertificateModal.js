import React, { useState } from 'react';
import { X, AlertTriangle, XCircle, User, Award, Calendar } from 'lucide-react';
import './AdminModals.css';

const RevokeCertificateModal = ({ issuedCert, onClose, onRevoke }) => {
    const [formData, setFormData] = useState({
        revocation_reason: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.revocation_reason.trim()) {
            newErrors.revocation_reason = 'Please provide a reason for revocation';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await onRevoke(formData);
        } catch (error) {
            console.error('Error revoking certificate:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header delete-header">
                    <div className="modal-title">
                        <XCircle size={24} />
                        <h2>Revoke Certificate</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="delete-warning">
                            <div className="warning-icon">
                                <AlertTriangle size={48} />
                            </div>
                            <h3>Are you sure you want to revoke this certificate?</h3>
                            <p>This action will mark the certificate as invalid and cannot be undone.</p>
                        </div>

                        <div className="revoke-target">
                            <div className="cert-info-summary">
                                <div className="info-row">
                                    <div className="info-icon">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="label">User</div>
                                        <div className="value">{issuedCert.user_username}</div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <Award size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Certificate</div>
                                        <div className="value">
                                            {issuedCert.certificate_name} ({issuedCert.certificate_abbreviation})
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Issue Date</div>
                                        <div className="value">
                                            {new Date(issuedCert.issue_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="label">Issued By</div>
                                        <div className="value">{issuedCert.issuer_username}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="revocation_reason">
                                Reason for Revocation <span className="required">*</span>
                            </label>
                            <textarea
                                id="revocation_reason"
                                name="revocation_reason"
                                value={formData.revocation_reason}
                                onChange={handleChange}
                                className={errors.revocation_reason ? 'error' : ''}
                                rows="4"
                                placeholder="Please provide a detailed reason for revoking this certificate..."
                            />
                            {errors.revocation_reason && (
                                <span className="error-message">{errors.revocation_reason}</span>
                            )}
                        </div>

                        <div className="revoke-impact">
                            <h4>
                                <AlertTriangle size={16} />
                                Impact of Revocation
                            </h4>
                            <ul>
                                <li>The certificate will be marked as revoked</li>
                                <li>The user will lose any privileges associated with this certificate</li>
                                <li>This action will be logged and cannot be reversed</li>
                                <li>The user will need to re-earn the certificate if required</li>
                            </ul>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn danger"
                            disabled={loading}
                        >
                            {loading ? 'Revoking...' : 'Revoke Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RevokeCertificateModal;
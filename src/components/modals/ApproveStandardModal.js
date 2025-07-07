import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Calendar, FileText, Shield, ChevronRight } from 'lucide-react';
import '../modals/AdminModals.css';

const ApproveStandardModal = ({ standard, onClose, onApprove }) => {
    const [formData, setFormData] = useState({
        status: 'Active',
        effective_date: new Date().toISOString().split('T')[0],
        review_date: '',
        comment: ''
    });
    const [errors, setErrors] = useState({});

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

        if (formData.status === 'Active' && !formData.effective_date) {
            newErrors.effective_date = 'Effective date is required for active standards';
        }

        if (formData.effective_date && formData.review_date) {
            const effectiveDate = new Date(formData.effective_date);
            const reviewDate = new Date(formData.review_date);
            if (reviewDate <= effectiveDate) {
                newErrors.review_date = 'Review date must be after effective date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const approvalData = {
                status: formData.status,
                comment: formData.comment
            };

            if (formData.effective_date) {
                approvalData.effective_date = new Date(formData.effective_date).toISOString();
            }

            if (formData.review_date) {
                approvalData.review_date = new Date(formData.review_date).toISOString();
            }

            onApprove(standard.id, approvalData);
        }
    };

    // Calculate suggested review date (e.g., 1 year from effective date)
    const suggestReviewDate = () => {
        if (formData.effective_date) {
            const date = new Date(formData.effective_date);
            date.setFullYear(date.getFullYear() + 1);
            setFormData(prev => ({
                ...prev,
                review_date: date.toISOString().split('T')[0]
            }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Shield size={20} />
                        Approve Standard
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="standard-info-box">
                        <h4>Standard Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <FileText size={16} />
                                <span className="label">Document:</span>
                                <span className="value">
                                    {standard.document_number || 'N/A'} - {standard.title}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Current Status:</span>
                                <span className={`status-badge ${standard.status.toLowerCase()}`}>
                                    {standard.status}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Version:</span>
                                <span className="value">{standard.version}</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Status*</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Draft">Keep as Draft</option>
                            <option value="Archived">Archive</option>
                        </select>
                        <span className="field-help">
                            {formData.status === 'Active' && 'Standard will be published and available to all users'}
                            {formData.status === 'Draft' && 'Standard will remain in draft status for further editing'}
                            {formData.status === 'Archived' && 'Standard will be archived and no longer available'}
                        </span>
                    </div>

                    {formData.status === 'Active' && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Effective Date*</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} />
                                        <input
                                            type="date"
                                            name="effective_date"
                                            value={formData.effective_date}
                                            onChange={handleChange}
                                            className={errors.effective_date ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.effective_date && <span className="error-message">{errors.effective_date}</span>}
                                    <span className="field-help">When this standard becomes active</span>
                                </div>

                                <div className="form-group">
                                    <label>Review Date</label>
                                    <div className="input-with-icon">
                                        <AlertCircle size={18} />
                                        <input
                                            type="date"
                                            name="review_date"
                                            value={formData.review_date}
                                            onChange={handleChange}
                                            className={errors.review_date ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.review_date && <span className="error-message">{errors.review_date}</span>}
                                    <button
                                        type="button"
                                        className="suggest-btn"
                                        onClick={suggestReviewDate}
                                    >
                                        Suggest 1 year
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Approval Comments</label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Add any notes about this approval decision..."
                        />
                        <span className="field-help">Optional: These comments will be logged in the approval history</span>
                    </div>

                    {formData.status === 'Active' && (
                        <div className="approval-checklist">
                            <h4>Pre-Approval Checklist</h4>
                            <div className="checklist-items">
                                <label className="checklist-item">
                                    <input type="checkbox" />
                                    <span>Content has been reviewed for accuracy</span>
                                </label>
                                <label className="checklist-item">
                                    <input type="checkbox" />
                                    <span>All referenced documents are available</span>
                                </label>
                                <label className="checklist-item">
                                    <input type="checkbox" />
                                    <span>Standard complies with organizational policies</span>
                                </label>
                                <label className="checklist-item">
                                    <input type="checkbox" />
                                    <span>Relevant stakeholders have been consulted</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="warning-message">
                        <AlertCircle size={18} />
                        <span>
                            {formData.status === 'Active' && 'Approving this standard will make it immediately available to all users.'}
                            {formData.status === 'Archived' && 'Archiving this standard will remove it from active use.'}
                            {formData.status === 'Draft' && 'This standard will remain editable and not visible to regular users.'}
                        </span>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`submit-button ${formData.status === 'Active' ? 'success' : ''}`}
                        >
                            <CheckCircle size={18} />
                            {formData.status === 'Active' ? 'Approve Standard' : `Set as ${formData.status}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApproveStandardModal;
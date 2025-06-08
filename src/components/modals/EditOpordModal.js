import React, { useState, useEffect } from 'react';
import {
    X, FileText, Shield, Save, FileCheck, AlertCircle
} from 'lucide-react';
import './AdminModals.css';

const EditOpordModal = ({ opord, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        operation_name: '',
        situation: '',
        mission: '',
        execution: '',
        service_support: '',
        command_signal: '',
        classification: 'Unclassified',
        approval_status: 'Draft',
        version: 1
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (opord) {
            setFormData({
                operation_name: opord.operation_name || '',
                situation: opord.situation || '',
                mission: opord.mission || '',
                execution: opord.execution || '',
                service_support: opord.service_support || '',
                command_signal: opord.command_signal || '',
                classification: opord.classification || 'Unclassified',
                approval_status: opord.approval_status || 'Draft',
                version: opord.version || 1
            });
        }
    }, [opord]);

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

        if (!formData.operation_name.trim()) {
            newErrors.operation_name = 'Operation name is required';
        }

        if (!formData.mission.trim()) {
            newErrors.mission = 'Mission statement is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onUpdate(opord.id, formData);
        }
    };

    const handleSaveAndSubmit = () => {
        if (validateForm()) {
            onUpdate(opord.id, {
                ...formData,
                approval_status: 'Pending',
                version: formData.version + 1
            });
        }
    };

    const hasChanges = () => {
        return Object.keys(formData).some(key => {
            return formData[key] !== opord[key];
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileText size={20} />
                        Edit Operation Order - {opord.operation_name}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-info-bar">
                        <div className="info-item">
                            <span className="label">Version:</span>
                            <span className="value">v{formData.version}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${formData.approval_status.toLowerCase()}`}>
                                {formData.approval_status}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Created:</span>
                            <span className="value">{new Date(opord.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Operation Name*</label>
                            <input
                                type="text"
                                name="operation_name"
                                value={formData.operation_name}
                                onChange={handleChange}
                                placeholder="e.g., Operation Thunder Strike"
                                className={errors.operation_name ? 'error' : ''}
                            />
                            {errors.operation_name && <span className="error-message">{errors.operation_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>
                                <Shield size={16} />
                                Classification
                            </label>
                            <select
                                name="classification"
                                value={formData.classification}
                                onChange={handleChange}
                            >
                                <option value="Unclassified">Unclassified</option>
                                <option value="Confidential">Confidential</option>
                                <option value="Secret">Secret</option>
                                <option value="Top Secret">Top Secret</option>
                            </select>
                        </div>
                    </div>

                    <div className="opord-section">
                        <h3>1. SITUATION</h3>
                        <div className="form-group">
                            <textarea
                                name="situation"
                                value={formData.situation}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe the current tactical situation, enemy forces, friendly forces, and any relevant background information..."
                            />
                            <span className="field-help">Include enemy forces, friendly forces, attachments/detachments, and civil considerations</span>
                        </div>
                    </div>

                    <div className="opord-section">
                        <h3>2. MISSION*</h3>
                        <div className="form-group">
                            <textarea
                                name="mission"
                                value={formData.mission}
                                onChange={handleChange}
                                rows={3}
                                placeholder="State the mission in clear, concise terms. Include WHO, WHAT, WHEN, WHERE, and WHY..."
                                className={errors.mission ? 'error' : ''}
                            />
                            {errors.mission && <span className="error-message">{errors.mission}</span>}
                            <span className="field-help">Use the five W's format: Who, What, When, Where, and Why</span>
                        </div>
                    </div>

                    <div className="opord-section">
                        <h3>3. EXECUTION</h3>
                        <div className="form-group">
                            <textarea
                                name="execution"
                                value={formData.execution}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Detail the concept of operations, scheme of maneuver, tasks to subordinate units, and coordinating instructions..."
                            />
                            <span className="field-help">Include concept of operations, tasks to subordinate units, and coordinating instructions</span>
                        </div>
                    </div>

                    <div className="opord-section">
                        <h3>4. SERVICE SUPPORT</h3>
                        <div className="form-group">
                            <textarea
                                name="service_support"
                                value={formData.service_support}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe logistics, supply, maintenance, medical support, and other service support matters..."
                            />
                            <span className="field-help">Cover supply, maintenance, medical, and personnel matters</span>
                        </div>
                    </div>

                    <div className="opord-section">
                        <h3>5. COMMAND AND SIGNAL</h3>
                        <div className="form-group">
                            <textarea
                                name="command_signal"
                                value={formData.command_signal}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Specify command relationships, command posts, communication plans, and signal instructions..."
                            />
                            <span className="field-help">Include chain of command, CP locations, and communication procedures</span>
                        </div>
                    </div>

                    {hasChanges() && (
                        <div className="warning-message">
                            <AlertCircle size={16} />
                            You have unsaved changes
                        </div>
                    )}

                    {formData.approval_status === 'Rejected' && (
                        <div className="info-message">
                            <AlertCircle size={16} />
                            This OPORD was rejected. You can make changes and resubmit for approval.
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button secondary"
                            disabled={!hasChanges()}
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="submit-button"
                            onClick={handleSaveAndSubmit}
                            disabled={!hasChanges()}
                        >
                            <FileCheck size={16} />
                            Save & Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditOpordModal;
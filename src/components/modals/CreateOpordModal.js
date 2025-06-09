import React, { useState } from 'react';
import {
    X, FileText, Shield, Save, FileCheck
} from 'lucide-react';
import './AdminModals.css';
const CreateOpordModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        operation_name: '',
        situation: '',
        mission: '',
        execution: '',
        service_support: '',
        command_signal: '',
        classification: 'Unclassified',
        approval_status: 'Draft'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm() && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await onCreate(formData);
            } catch (error) {
                console.error('Error creating OPORD:', error);
                setIsSubmitting(false);
            }
        }
    };

    const handleSaveAndSubmit = async () => {
        if (validateForm() && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await onCreate({ ...formData, approval_status: 'Pending' });
            } catch (error) {
                console.error('Error creating OPORD:', error);
                setIsSubmitting(false);
            }
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileText size={20} />
                        Create Operation Order
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
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

                    <div className="opord-actions-info">
                        <div className="info-box">
                            <Save size={16} />
                            <span><strong>Save as Draft</strong> - You can continue editing later</span>
                        </div>
                        <div className="info-box">
                            <FileCheck size={16} />
                            <span><strong>Submit for Approval</strong> - Send for command review</span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button secondary">
                            <Save size={16} />
                            Save as Draft
                        </button>
                        <button
                            type="button"
                            className="submit-button"
                            onClick={handleSaveAndSubmit}
                        >
                            <FileCheck size={16} />
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOpordModal;
import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import './AdminModals.css';

const EditPromotionRequirementTypeModal = ({ requirementType, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        category: '',
        evaluation_type: '',
        description: '',
        custom_evaluation_function: ''
    });
    const [errors, setErrors] = useState({});

    const REQUIREMENT_CATEGORIES = [
        { value: 'time_based', label: 'Time-Based Requirements' },
        { value: 'position_based', label: 'Position-Based Requirements' },
        { value: 'qualification_based', label: 'Qualification-Based Requirements' },
        { value: 'deployment_based', label: 'Deployment-Based Requirements' },
        { value: 'performance_based', label: 'Performance-Based Requirements' },
        { value: 'administrative', label: 'Administrative Requirements' }
    ];

    const EVALUATION_TYPES = [
        { value: 'time_in_service', label: 'Total Time in Service' },
        { value: 'time_in_grade', label: 'Time in Current Grade' },
        { value: 'time_in_unit', label: 'Time in Current Unit' },
        { value: 'time_in_unit_type', label: 'Time in Unit Type' },
        { value: 'time_in_position', label: 'Time in Specific Position' },
        { value: 'time_in_position_type', label: 'Time in Position Type' },
        { value: 'certification_required', label: 'Required Certification' },
        { value: 'certifications_count', label: 'Number of Certifications' },
        { value: 'deployments_count', label: 'Number of Deployments' },
        { value: 'deployment_time', label: 'Total Deployment Time' },
        { value: 'deployment_in_position', label: 'Deployments in Specific Position' },
        { value: 'event_participation', label: 'Event Participation Count' },
        { value: 'leadership_time', label: 'Time in Leadership Position' },
        { value: 'command_time', label: 'Time in Command Position' },
        { value: 'performance_rating', label: 'Average Performance Rating' },
        { value: 'commendations_count', label: 'Number of Commendations' },
        { value: 'mos_qualification', label: 'MOS Qualification Level' },
        { value: 'custom_evaluation', label: 'Custom Evaluation Function' }
    ];

    useEffect(() => {
        if (requirementType) {
            setFormData({
                name: requirementType.name || '',
                code: requirementType.code || '',
                category: requirementType.category || '',
                evaluation_type: requirementType.evaluation_type || '',
                description: requirementType.description || '',
                custom_evaluation_function: requirementType.custom_evaluation_function || ''
            });
        }
    }, [requirementType]);

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

        // Show/hide custom evaluation field
        if (name === 'evaluation_type' && value !== 'custom_evaluation') {
            setFormData(prev => ({ ...prev, custom_evaluation_function: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        } else if (!/^[A-Z_]+$/.test(formData.code)) {
            newErrors.code = 'Code must be uppercase letters and underscores only';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.evaluation_type) {
            newErrors.evaluation_type = 'Evaluation type is required';
        }

        if (formData.evaluation_type === 'custom_evaluation' && !formData.custom_evaluation_function.trim()) {
            newErrors.custom_evaluation_function = 'Custom evaluation function is required for custom evaluation type';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onUpdate(requirementType.id, formData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileText size={20} />
                        Edit Promotion Requirement Type
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Time in Service"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Code*</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="e.g., TIME_IN_SERVICE"
                            className={errors.code ? 'error' : ''}
                        />
                        {errors.code && <span className="error-message">{errors.code}</span>}
                        <span className="field-help">Unique identifier using uppercase and underscores</span>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category*</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={errors.category ? 'error' : ''}
                            >
                                <option value="">Select Category...</option>
                                {REQUIREMENT_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label>Evaluation Type*</label>
                            <select
                                name="evaluation_type"
                                value={formData.evaluation_type}
                                onChange={handleChange}
                                className={errors.evaluation_type ? 'error' : ''}
                            >
                                <option value="">Select Type...</option>
                                {EVALUATION_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {errors.evaluation_type && <span className="error-message">{errors.evaluation_type}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe what this requirement type measures..."
                        />
                    </div>

                    {formData.evaluation_type === 'custom_evaluation' && (
                        <div className="form-group">
                            <label>Custom Evaluation Function*</label>
                            <div className="warning-message">
                                <AlertCircle size={16} />
                                <span>Warning: Custom functions should be carefully reviewed for security</span>
                            </div>
                            <textarea
                                name="custom_evaluation_function"
                                value={formData.custom_evaluation_function}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Python code for custom evaluation..."
                                className={`code-input ${errors.custom_evaluation_function ? 'error' : ''}`}
                            />
                            {errors.custom_evaluation_function &&
                                <span className="error-message">{errors.custom_evaluation_function}</span>
                            }
                            <span className="field-help">
                                Function should return tuple: (met: bool, current_value: int/float)
                            </span>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Update Requirement Type
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPromotionRequirementTypeModal;

import React, { useState, useEffect } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';
import './AdminModals.css';

const CreateRankPromotionRequirementModal = ({
                                                 ranks,
                                                 requirementTypes,
                                                 roles,
                                                 certificates,
                                                 onClose,
                                                 onCreate
                                             }) => {
    const [formData, setFormData] = useState({
        rank: '',
        requirement_type: '',
        value_required: 0,
        unit_type: '',
        position_role: '',
        position_category: '',
        required_certification: '',
        certification_category: '',
        required_mos_level: '',
        is_mandatory: true,
        requirement_group: '',
        display_order: 0,
        display_text: '',
        waiverable: false,
        waiver_authority: ''
    });
    const [errors, setErrors] = useState({});
    const [selectedType, setSelectedType] = useState(null);

    const POSITION_CATEGORIES = [
        'command', 'staff', 'nco', 'specialist', 'trooper', 'support'
    ];

    const MOS_LEVELS = [
        { value: 10, label: 'Level 10 - Entry' },
        { value: 20, label: 'Level 20 - Journeyman' },
        { value: 30, label: 'Level 30 - Senior' },
        { value: 40, label: 'Level 40 - Master' }
    ];

    const WAIVER_AUTHORITIES = [
        { value: 'unit_commander', label: 'Unit Commander' },
        { value: 'branch_commander', label: 'Branch Commander' },
        { value: 'admin', label: 'Admin Only' }
    ];

    useEffect(() => {
        // Update selected type when requirement type changes
        if (formData.requirement_type && requirementTypes) {
            const type = requirementTypes.find(t => t.id === formData.requirement_type);
            setSelectedType(type);

            // Generate default display text based on type
            if (type) {
                generateDisplayText(type, formData);
            }
        }
    }, [formData.requirement_type, requirementTypes]);

    const generateDisplayText = (type, data) => {
        let text = type.name;

        if (type.evaluation_type.includes('time')) {
            text = `${data.value_required || 0} days ${type.name.toLowerCase()}`;
        } else if (type.evaluation_type === 'certification_required') {
            const cert = certificates?.find(c => c.id === data.required_certification);
            text = cert ? `Earn ${cert.name} certification` : type.name;
        } else if (type.evaluation_type.includes('count')) {
            text = `${data.value_required || 0} ${type.name.toLowerCase()}`;
        }

        setFormData(prev => ({ ...prev, display_text: text }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Clear waiver authority if not waiverable
        if (name === 'waiverable' && !checked) {
            setFormData(prev => ({ ...prev, waiver_authority: '' }));
        }

        // Regenerate display text if relevant fields change
        if (['value_required', 'required_certification'].includes(name) && selectedType) {
            generateDisplayText(selectedType, { ...formData, [name]: newValue });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.rank) {
            newErrors.rank = 'Rank is required';
        }

        if (!formData.requirement_type) {
            newErrors.requirement_type = 'Requirement type is required';
        }

        if (!formData.display_text.trim()) {
            newErrors.display_text = 'Display text is required';
        }

        // Validate based on selected requirement type
        if (selectedType) {
            const evalType = selectedType.evaluation_type;

            if (evalType === 'certification_required' && !formData.required_certification) {
                newErrors.required_certification = 'Certification is required for this type';
            }

            if (evalType.includes('position') && !formData.position_role && !formData.position_category) {
                newErrors.position_role = 'Position role or category is required';
            }

            if (evalType === 'mos_qualification' && !formData.required_mos_level) {
                newErrors.required_mos_level = 'MOS level is required';
            }
        }

        if (formData.waiverable && !formData.waiver_authority) {
            newErrors.waiver_authority = 'Waiver authority is required when waiverable';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Clean up data based on type
            const submitData = { ...formData };

            // Convert numeric strings to integers
            submitData.value_required = parseInt(submitData.value_required) || 0;
            submitData.display_order = parseInt(submitData.display_order) || 0;

            // Clear irrelevant fields
            if (!selectedType || selectedType.evaluation_type !== 'certification_required') {
                delete submitData.required_certification;
                delete submitData.certification_category;
            }

            if (!selectedType || !selectedType.evaluation_type.includes('position')) {
                delete submitData.position_role;
                delete submitData.position_category;
            }

            if (!selectedType || selectedType.evaluation_type !== 'mos_qualification') {
                delete submitData.required_mos_level;
            }

            onCreate(submitData);
        }
    };

    const renderTypeSpecificFields = () => {
        if (!selectedType) return null;

        const evalType = selectedType.evaluation_type;

        if (evalType === 'certification_required') {
            return (
                <div className="form-group">
                    <label>Required Certification*</label>
                    <select
                        name="required_certification"
                        value={formData.required_certification}
                        onChange={handleChange}
                        className={errors.required_certification ? 'error' : ''}
                    >
                        <option value="">Select Certification...</option>
                        {certificates?.map(cert => (
                            <option key={cert.id} value={cert.id}>
                                {cert.name} ({cert.abbreviation})
                            </option>
                        ))}
                    </select>
                    {errors.required_certification &&
                        <span className="error-message">{errors.required_certification}</span>
                    }
                </div>
            );
        }

        if (evalType.includes('position')) {
            return (
                <>
                    <div className="form-group">
                        <label>Position Role</label>
                        <select
                            name="position_role"
                            value={formData.position_role}
                            onChange={handleChange}
                        >
                            <option value="">Any Role...</option>
                            {roles?.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>OR Position Category</label>
                        <select
                            name="position_category"
                            value={formData.position_category}
                            onChange={handleChange}
                        >
                            <option value="">Any Category...</option>
                            {POSITION_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            );
        }

        if (evalType === 'mos_qualification') {
            return (
                <div className="form-group">
                    <label>Required MOS Level*</label>
                    <select
                        name="required_mos_level"
                        value={formData.required_mos_level}
                        onChange={handleChange}
                        className={errors.required_mos_level ? 'error' : ''}
                    >
                        <option value="">Select Level...</option>
                        {MOS_LEVELS.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                    {errors.required_mos_level &&
                        <span className="error-message">{errors.required_mos_level}</span>
                    }
                </div>
            );
        }

        return null;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Award size={20} />
                        Create Rank Promotion Requirement
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Target Rank*</label>
                            <select
                                name="rank"
                                value={formData.rank}
                                onChange={handleChange}
                                className={errors.rank ? 'error' : ''}
                            >
                                <option value="">Select Rank...</option>
                                {ranks?.map(rank => (
                                    <option key={rank.id} value={rank.id}>
                                        {rank.name} ({rank.abbreviation})
                                    </option>
                                ))}
                            </select>
                            {errors.rank && <span className="error-message">{errors.rank}</span>}
                        </div>

                        <div className="form-group">
                            <label>Requirement Type*</label>
                            <select
                                name="requirement_type"
                                value={formData.requirement_type}
                                onChange={handleChange}
                                className={errors.requirement_type ? 'error' : ''}
                            >
                                <option value="">Select Type...</option>
                                {requirementTypes?.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} ({type.category})
                                    </option>
                                ))}
                            </select>
                            {errors.requirement_type &&
                                <span className="error-message">{errors.requirement_type}</span>
                            }
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Value Required</label>
                            <input
                                type="number"
                                name="value_required"
                                value={formData.value_required}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="field-help">
                                Numeric value (days, count, etc.) based on requirement type
                            </span>
                        </div>

                        <div className="form-group">
                            <label>Display Order</label>
                            <input
                                type="number"
                                name="display_order"
                                value={formData.display_order}
                                onChange={handleChange}
                                min="0"
                            />
                            <span className="field-help">Order in requirement list</span>
                        </div>
                    </div>

                    {renderTypeSpecificFields()}

                    <div className="form-group">
                        <label>Display Text*</label>
                        <input
                            type="text"
                            name="display_text"
                            value={formData.display_text}
                            onChange={handleChange}
                            placeholder="Human-readable requirement description"
                            className={errors.display_text ? 'error' : ''}
                        />
                        {errors.display_text && <span className="error-message">{errors.display_text}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_mandatory"
                                    checked={formData.is_mandatory}
                                    onChange={handleChange}
                                />
                                Mandatory Requirement
                            </label>
                            <span className="field-help">
                                If unchecked, this becomes an alternative requirement
                            </span>
                        </div>

                        <div className="form-group">
                            <label>Requirement Group</label>
                            <input
                                type="text"
                                name="requirement_group"
                                value={formData.requirement_group}
                                onChange={handleChange}
                                placeholder="e.g., leadership_options"
                            />
                            <span className="field-help">
                                Group ID for OR requirements
                            </span>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="waiverable"
                                    checked={formData.waiverable}
                                    onChange={handleChange}
                                />
                                Waiverable
                            </label>
                            <span className="field-help">
                                Can this requirement be waived?
                            </span>
                        </div>

                        {formData.waiverable && (
                            <div className="form-group">
                                <label>Waiver Authority*</label>
                                <select
                                    name="waiver_authority"
                                    value={formData.waiver_authority}
                                    onChange={handleChange}
                                    className={errors.waiver_authority ? 'error' : ''}
                                >
                                    <option value="">Select Authority...</option>
                                    {WAIVER_AUTHORITIES.map(auth => (
                                        <option key={auth.value} value={auth.value}>
                                            {auth.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.waiver_authority &&
                                    <span className="error-message">{errors.waiver_authority}</span>
                                }
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create Requirement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRankPromotionRequirementModal;
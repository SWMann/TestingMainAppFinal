// src/components/modals/CreateSOPModal.js
import React, { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import './AdminModals.css';

const CreateSOPModal = ({ groups, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Group/Subgroup, 2: Standard Details
    const [loading, setLoading] = useState(false);
    const [subGroups, setSubGroups] = useState([]);

    const [formData, setFormData] = useState({
        // Step 1
        groupId: '',
        subGroupId: '',
        createNewGroup: false,
        newGroupName: '',
        newGroupDescription: '',
        createNewSubGroup: false,
        newSubGroupName: '',
        newSubGroupDescription: '',

        // Step 2
        title: '',
        document_number: '',
        content: '',
        summary: '',
        version: '1.0',
        status: 'Draft',
        difficulty_level: 'Basic',
        is_required: false,
        effective_date: new Date().toISOString().split('T')[0],
        tags: []
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (formData.groupId && !formData.createNewGroup) {
            fetchSubGroups(formData.groupId);
        }
    }, [formData.groupId]);

    const fetchSubGroups = async (groupId) => {
        try {
            const response = await api.get(`/sops/groups/${groupId}/subgroups/`);
            setSubGroups(response.data);
        } catch (err) {
            console.error('Error fetching subgroups:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (formData.createNewGroup) {
            if (!formData.newGroupName.trim()) {
                newErrors.newGroupName = 'Group name is required';
            }
        } else {
            if (!formData.groupId) {
                newErrors.groupId = 'Please select a group';
            }
        }

        if (!formData.createNewGroup && formData.groupId) {
            if (formData.createNewSubGroup) {
                if (!formData.newSubGroupName.trim()) {
                    newErrors.newSubGroupName = 'Subgroup name is required';
                }
            } else {
                if (!formData.subGroupId) {
                    newErrors.subGroupId = 'Please select a subgroup';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep2()) return;

        setLoading(true);

        try {
            let groupId = formData.groupId;
            let subGroupId = formData.subGroupId;

            // Create new group if needed
            if (formData.createNewGroup) {
                const groupRes = await api.post('/sops/groups/', {
                    name: formData.newGroupName,
                    description: formData.newGroupDescription,
                    is_active: true
                });
                groupId = groupRes.data.id;
            }

            // Create new subgroup if needed
            if (formData.createNewSubGroup || formData.createNewGroup) {
                const subGroupRes = await api.post('/sops/subgroups/', {
                    name: formData.createNewSubGroup ? formData.newSubGroupName : 'General',
                    description: formData.createNewSubGroup ? formData.newSubGroupDescription : '',
                    standard_group: groupId,
                    is_active: true
                });
                subGroupId = subGroupRes.data.id;
            }

            // Create the standard
            await api.post('/sops/standards/', {
                title: formData.title,
                document_number: formData.document_number,
                standard_sub_group: subGroupId,
                content: formData.content,
                summary: formData.summary,
                version: formData.version,
                status: formData.status,
                difficulty_level: formData.difficulty_level,
                is_required: formData.is_required,
                effective_date: formData.effective_date,
                tags: formData.tags
            });

            onSuccess();
        } catch (err) {
            console.error('Error creating SOP:', err);
            setErrors({ submit: 'Failed to create SOP. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <BookOpen size={20} />
                        Create Standard Operating Procedure
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {step === 1 ? (
                        <>
                            <h3>Step 1: Select Category</h3>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="createNewGroup"
                                        checked={formData.createNewGroup}
                                        onChange={handleChange}
                                    />
                                    Create new group
                                </label>
                            </div>

                            {formData.createNewGroup ? (
                                <>
                                    <div className="form-group">
                                        <label>New Group Name*</label>
                                        <input
                                            type="text"
                                            name="newGroupName"
                                            value={formData.newGroupName}
                                            onChange={handleChange}
                                            className={errors.newGroupName ? 'error' : ''}
                                        />
                                        {errors.newGroupName && <span className="error-message">{errors.newGroupName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Group Description</label>
                                        <textarea
                                            name="newGroupDescription"
                                            value={formData.newGroupDescription}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Select Group*</label>
                                        <select
                                            name="groupId"
                                            value={formData.groupId}
                                            onChange={handleChange}
                                            className={errors.groupId ? 'error' : ''}
                                        >
                                            <option value="">Choose a group...</option>
                                            {groups.map(group => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.groupId && <span className="error-message">{errors.groupId}</span>}
                                    </div>

                                    {formData.groupId && (
                                        <>
                                            <div className="form-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="createNewSubGroup"
                                                        checked={formData.createNewSubGroup}
                                                        onChange={handleChange}
                                                    />
                                                    Create new subgroup
                                                </label>
                                            </div>

                                            {formData.createNewSubGroup ? (
                                                <>
                                                    <div className="form-group">
                                                        <label>New Subgroup Name*</label>
                                                        <input
                                                            type="text"
                                                            name="newSubGroupName"
                                                            value={formData.newSubGroupName}
                                                            onChange={handleChange}
                                                            className={errors.newSubGroupName ? 'error' : ''}
                                                        />
                                                        {errors.newSubGroupName && <span className="error-message">{errors.newSubGroupName}</span>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Subgroup Description</label>
                                                        <textarea
                                                            name="newSubGroupDescription"
                                                            value={formData.newSubGroupDescription}
                                                            onChange={handleChange}
                                                            rows={3}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="form-group">
                                                    <label>Select Subgroup*</label>
                                                    <select
                                                        name="subGroupId"
                                                        value={formData.subGroupId}
                                                        onChange={handleChange}
                                                        className={errors.subGroupId ? 'error' : ''}
                                                    >
                                                        <option value="">Choose a subgroup...</option>
                                                        {subGroups.map(subgroup => (
                                                            <option key={subgroup.id} value={subgroup.id}>
                                                                {subgroup.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.subGroupId && <span className="error-message">{errors.subGroupId}</span>}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="cancel-button" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="button" className="submit-button" onClick={handleNext}>
                                    Next Step
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3>Step 2: Standard Details</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title*</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={errors.title ? 'error' : ''}
                                    />
                                    {errors.title && <span className="error-message">{errors.title}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Document Number</label>
                                    <input
                                        type="text"
                                        name="document_number"
                                        value={formData.document_number}
                                        onChange={handleChange}
                                        placeholder="e.g., SOP-001"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Summary</label>
                                <textarea
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Brief summary of the SOP..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Content*</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows={10}
                                    className={errors.content ? 'error' : ''}
                                    placeholder="Enter the full SOP content..."
                                />
                                {errors.content && <span className="error-message">{errors.content}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Version</label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={formData.version}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Difficulty Level</label>
                                    <select
                                        name="difficulty_level"
                                        value={formData.difficulty_level}
                                        onChange={handleChange}
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Effective Date</label>
                                    <input
                                        type="date"
                                        name="effective_date"
                                        value={formData.effective_date}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_required"
                                        checked={formData.is_required}
                                        onChange={handleChange}
                                    />
                                    Mark as required reading
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Tags</label>
                                <div className="tag-input">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add tags..."
                                    />
                                    <button type="button" onClick={addTag} className="add-tag-btn">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="tags-display">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="error-message">{errors.submit}</div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="cancel-button" onClick={() => setStep(1)}>
                                    Back
                                </button>
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create SOP'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateSOPModal;
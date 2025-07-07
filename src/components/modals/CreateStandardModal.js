import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Link, Video, Image, Tag, AlertCircle } from 'lucide-react';
import '../modals/AdminModals.css';

const CreateStandardModal = ({ subGroups, selectedSubGroup, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '',
        document_number: '',
        standard_sub_group: selectedSubGroup?.id || '',
        content: '',
        summary: '',
        pdf_url: '',
        video_url: '',
        image_urls: [],
        version: '1.0',
        status: 'Draft',
        difficulty_level: 'Basic',
        is_required: false,
        tags: [],
        related_standards: [],
        related_training: []
    });
    const [errors, setErrors] = useState({});
    const [newTag, setNewTag] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleAddImage = () => {
        if (newImageUrl.trim() && !formData.image_urls.includes(newImageUrl.trim())) {
            setFormData(prev => ({
                ...prev,
                image_urls: [...prev.image_urls, newImageUrl.trim()]
            }));
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (urlToRemove) => {
        setFormData(prev => ({
            ...prev,
            image_urls: prev.image_urls.filter(url => url !== urlToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.standard_sub_group) {
            newErrors.standard_sub_group = 'Subgroup is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onCreate({
                ...formData,
                tags: formData.tags.length > 0 ? formData.tags : null,
                image_urls: formData.image_urls.length > 0 ? formData.image_urls : null,
                related_standards: formData.related_standards.length > 0 ? formData.related_standards : null,
                related_training: formData.related_training.length > 0 ? formData.related_training : null
            });
        }
    };

    // Group subgroups by their parent group
    const groupedSubGroups = subGroups.reduce((acc, subGroup) => {
        const groupName = subGroup.group_name || 'Ungrouped';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(subGroup);
        return acc;
    }, {});

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileText size={20} />
                        Create New Standard
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Document Number</label>
                                <input
                                    type="text"
                                    name="document_number"
                                    value={formData.document_number}
                                    onChange={handleChange}
                                    placeholder="e.g., SOP-001"
                                />
                                <span className="field-help">Optional unique identifier</span>
                            </div>

                            <div className="form-group">
                                <label>Version</label>
                                <input
                                    type="text"
                                    name="version"
                                    value={formData.version}
                                    onChange={handleChange}
                                    placeholder="1.0"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Title*</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter standard title"
                                className={errors.title ? 'error' : ''}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label>Subgroup*</label>
                            <select
                                name="standard_sub_group"
                                value={formData.standard_sub_group}
                                onChange={handleChange}
                                className={errors.standard_sub_group ? 'error' : ''}
                            >
                                <option value="">Select Subgroup...</option>
                                {Object.entries(groupedSubGroups).map(([groupName, subGroups]) => (
                                    <optgroup key={groupName} label={groupName}>
                                        {subGroups.map(subGroup => (
                                            <option key={subGroup.id} value={subGroup.id}>
                                                {subGroup.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            {errors.standard_sub_group && <span className="error-message">{errors.standard_sub_group}</span>}
                        </div>

                        <div className="form-row">
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
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_required"
                                        checked={formData.is_required}
                                        onChange={handleChange}
                                    />
                                    <span>Required Standard</span>
                                </label>
                                <span className="field-help">Check if this is mandatory for all personnel</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Content</h3>

                        <div className="form-group">
                            <label>Summary</label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Brief description of the standard..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Content*</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={10}
                                placeholder="Enter the full standard content..."
                                className={errors.content ? 'error' : ''}
                            />
                            {errors.content && <span className="error-message">{errors.content}</span>}
                            <span className="field-help">Supports markdown formatting</span>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Media & Resources</h3>

                        <div className="form-group">
                            <label>PDF Document URL</label>
                            <div className="input-with-icon">
                                <Upload size={18} />
                                <input
                                    type="url"
                                    name="pdf_url"
                                    value={formData.pdf_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/document.pdf"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Video URL</label>
                            <div className="input-with-icon">
                                <Video size={18} />
                                <input
                                    type="url"
                                    name="video_url"
                                    value={formData.video_url}
                                    onChange={handleChange}
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Image URLs</label>
                            <div className="tag-input-container">
                                <div className="input-with-button">
                                    <div className="input-with-icon">
                                        <Image size={18} />
                                        <input
                                            type="url"
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddImage();
                                                }
                                            }}
                                        />
                                    </div>
                                    <button type="button" onClick={handleAddImage} className="add-btn">
                                        Add
                                    </button>
                                </div>
                                {formData.image_urls.length > 0 && (
                                    <div className="tags-list">
                                        {formData.image_urls.map((url, index) => (
                                            <div key={index} className="tag-item image-url">
                                                <Link size={14} />
                                                <span className="url-text">{url}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(url)}
                                                    className="remove-tag"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Tags & Categories</h3>

                        <div className="form-group">
                            <label>Tags</label>
                            <div className="tag-input-container">
                                <div className="input-with-button">
                                    <div className="input-with-icon">
                                        <Tag size={18} />
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add a tag..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddTag();
                                                }
                                            }}
                                        />
                                    </div>
                                    <button type="button" onClick={handleAddTag} className="add-btn">
                                        Add
                                    </button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="tags-list">
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className="tag-item">
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="remove-tag"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="field-help">Add tags for easier searching</span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create Standard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStandardModal;
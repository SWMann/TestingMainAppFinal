import React, { useState, useEffect } from 'react';
import {
    X, User, Mail, Hash, Clock, Bell, Shield,
    Calendar, Award, GraduationCap, AlertCircle,
    Save, Info
} from 'lucide-react';
import './AdminModals.css';

const EditUserDetailsModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        service_number: '',
        timezone: '',
        discord_notifications: true,
        email_notifications: true,
        is_active: true,
        is_staff: false,
        is_admin: false,
        onboarding_status: '',
        recruit_status: true,
        officer_candidate: false,
        warrant_officer_candidate: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Timezone options
    const timezones = [
        { value: '', label: 'Select Timezone' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
        { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
        { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
        { value: 'Europe/Paris', label: 'Central European Time (CET)' },
        { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
        { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
        { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' }
    ];

    // Onboarding status options
    const onboardingStatuses = [
        { value: '', label: 'Select Status' },
        { value: 'Applied', label: 'Applied' },
        { value: 'BIT Completed', label: 'BIT Completed' },
        { value: 'Branch Applied', label: 'Branch Applied' },
        { value: 'Branch Inducted', label: 'Branch Inducted' },
        { value: 'Unit Assigned', label: 'Unit Assigned' },
        { value: 'Active', label: 'Active' }
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                service_number: user.service_number || '',
                timezone: user.timezone || '',
                discord_notifications: user.discord_notifications ?? true,
                email_notifications: user.email_notifications ?? true,
                is_active: user.is_active ?? true,
                is_staff: user.is_staff ?? false,
                is_admin: user.is_admin ?? false,
                onboarding_status: user.onboarding_status || '',
                recruit_status: user.recruit_status ?? true,
                officer_candidate: user.officer_candidate ?? false,
                warrant_officer_candidate: user.warrant_officer_candidate ?? false
            });
        }
    }, [user]);

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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.service_number && !/^[A-Z0-9-]+$/.test(formData.service_number)) {
            newErrors.service_number = 'Invalid service number format';
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
            await onSave(formData);
        } catch (error) {
            console.error('Error saving user details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <User size={20} />
                        Edit User Details
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* User Info Section */}
                    <div className="form-section">
                        <h3>User Information</h3>
                        <div className="user-info-display">
                            <img
                                src={user.avatar_url || '/default-avatar.png'}
                                alt={user.username}
                                className="user-avatar-large"
                            />
                            <div>
                                <p className="discord-id">Discord ID: {user.discord_id}</p>
                                <p className="join-date">
                                    <Calendar size={14} />
                                    Joined: {new Date(user.join_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    <User size={16} />
                                    Username*
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? 'error' : ''}
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label>
                                    <Mail size={16} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    <Hash size={16} />
                                    Service Number
                                </label>
                                <input
                                    type="text"
                                    name="service_number"
                                    value={formData.service_number}
                                    onChange={handleChange}
                                    placeholder="e.g., US-12345"
                                    className={errors.service_number ? 'error' : ''}
                                />
                                {errors.service_number && <span className="error-message">{errors.service_number}</span>}
                                <span className="field-help">Format: Letters, numbers, and hyphens only</span>
                            </div>

                            <div className="form-group">
                                <label>
                                    <Clock size={16} />
                                    Timezone
                                </label>
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                >
                                    {timezones.map(tz => (
                                        <option key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <Info size={16} />
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Brief description or bio..."
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="form-section">
                        <h3>Notification Preferences</h3>
                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="discord_notifications"
                                    checked={formData.discord_notifications}
                                    onChange={handleChange}
                                />
                                <Bell size={16} />
                                Discord Notifications
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="email_notifications"
                                    checked={formData.email_notifications}
                                    onChange={handleChange}
                                />
                                <Mail size={16} />
                                Email Notifications
                            </label>
                        </div>
                    </div>

                    {/* Administrative Settings */}
                    <div className="form-section">
                        <h3>Administrative Settings</h3>
                        <div className="warning-message">
                            <AlertCircle size={16} />
                            <span>Changes to these settings will affect user access and permissions</span>
                        </div>

                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <Shield size={16} />
                                Active Account
                                <span className="field-help">Unchecking will disable user login</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_staff"
                                    checked={formData.is_staff}
                                    onChange={handleChange}
                                />
                                <Award size={16} />
                                Staff Member
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_admin"
                                    checked={formData.is_admin}
                                    onChange={handleChange}
                                />
                                <Shield size={16} />
                                Administrator
                                <span className="field-help">Full system access</span>
                            </label>
                        </div>
                    </div>

                    {/* Onboarding Status */}
                    <div className="form-section">
                        <h3>Onboarding & Training</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    <GraduationCap size={16} />
                                    Onboarding Status
                                </label>
                                <select
                                    name="onboarding_status"
                                    value={formData.onboarding_status}
                                    onChange={handleChange}
                                >
                                    {onboardingStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="recruit_status"
                                    checked={formData.recruit_status}
                                    onChange={handleChange}
                                />
                                Recruit Status
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="officer_candidate"
                                    checked={formData.officer_candidate}
                                    onChange={handleChange}
                                />
                                Officer Candidate
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="warrant_officer_candidate"
                                    checked={formData.warrant_officer_candidate}
                                    onChange={handleChange}
                                />
                                Warrant Officer Candidate
                            </label>
                        </div>
                    </div>

                    {/* Dates Information (Read-only) */}
                    <div className="form-section">
                        <h3>Important Dates</h3>
                        <div className="dates-info">
                            {user.last_login && (
                                <div className="date-item">
                                    <span className="label">Last Login:</span>
                                    <span className="value">{new Date(user.last_login).toLocaleString()}</span>
                                </div>
                            )}
                            {user.bit_completion_date && (
                                <div className="date-item">
                                    <span className="label">BIT Completed:</span>
                                    <span className="value">{new Date(user.bit_completion_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            {user.branch_induction_date && (
                                <div className="date-item">
                                    <span className="label">Branch Inducted:</span>
                                    <span className="value">{new Date(user.branch_induction_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            {user.unit_assignment_date && (
                                <div className="date-item">
                                    <span className="label">Unit Assigned:</span>
                                    <span className="value">{new Date(user.unit_assignment_date).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserDetailsModal;
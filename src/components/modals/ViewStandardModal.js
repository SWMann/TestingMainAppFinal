import React from 'react';
import {
    X, FileText, Download, ExternalLink, Video, Image,
    Tag, Calendar, User, Shield, Clock, Edit,
    CheckCircle, AlertCircle, Archive, Copy, Share2, ChevronRight
} from 'lucide-react';
import '../modals/AdminModals.css';

const ViewStandardModal = ({ standard, subGroups, groups, onClose, onEdit }) => {
    const subGroup = subGroups.find(sg => sg.id === standard.standard_sub_group);
    const group = subGroup ? groups.find(g => g.id === subGroup.standard_group) : null;

    const handleCopyLink = () => {
        const url = `${window.location.origin}/standards/${standard.id}`;
        navigator.clipboard.writeText(url).then(() => {
            // You could show a toast notification here
            console.log('Link copied to clipboard');
        });
    };

    const handleDownloadPDF = () => {
        if (standard.pdf_url) {
            window.open(standard.pdf_url, '_blank');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderContent = () => {
        // If content contains markdown, you might want to use a markdown renderer here
        return standard.content.split('\n').map((paragraph, index) => (
            <p key={index} className="content-paragraph">
                {paragraph}
            </p>
        ));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FileText size={20} />
                        Standard Details
                    </h2>
                    <div className="header-actions">
                        <button className="icon-btn" onClick={onEdit} title="Edit Standard">
                            <Edit size={18} />
                        </button>
                        <button className="close-button" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="modal-form view-mode">
                    {/* Header Section */}
                    <div className="standard-header-section">
                        <div className="standard-title-row">
                            <div>
                                <h1 className="standard-title">
                                    {standard.document_number && (
                                        <span className="document-number">{standard.document_number}:</span>
                                    )}
                                    {standard.title}
                                </h1>
                                <div className="standard-meta">
                                    <span className="version-info">Version {standard.version}</span>
                                    <span className="separator">•</span>
                                    <span className={`status-badge ${standard.status.toLowerCase()}`}>
                                        {standard.status}
                                    </span>
                                    <span className={`difficulty-badge ${standard.difficulty_level.toLowerCase()}`}>
                                        {standard.difficulty_level}
                                    </span>
                                    {standard.is_required && (
                                        <span className="required-badge">Required</span>
                                    )}
                                </div>
                            </div>
                            <div className="standard-actions">
                                {standard.pdf_url && (
                                    <button className="action-btn secondary" onClick={handleDownloadPDF}>
                                        <Download size={16} />
                                        Download PDF
                                    </button>
                                )}
                                <button className="action-btn secondary" onClick={handleCopyLink}>
                                    <Copy size={16} />
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        <div className="breadcrumb">
                            <span className="breadcrumb-item">{group?.name || 'Unknown Group'}</span>
                            <ChevronRight size={16} />
                            <span className="breadcrumb-item">{subGroup?.name || 'Unknown Subgroup'}</span>
                        </div>
                    </div>

                    {/* Summary Section */}
                    {standard.summary && (
                        <div className="content-section">
                            <h3>Summary</h3>
                            <div className="summary-box">
                                {standard.summary}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="content-section">
                        <h3>Content</h3>
                        <div className="standard-content">
                            {renderContent()}
                        </div>
                    </div>

                    {/* Media Section */}
                    {(standard.video_url || (standard.image_urls && standard.image_urls.length > 0)) && (
                        <div className="content-section">
                            <h3>Media Resources</h3>
                            <div className="media-grid">
                                {standard.video_url && (
                                    <div className="media-item video">
                                        <Video size={20} />
                                        <a href={standard.video_url} target="_blank" rel="noopener noreferrer">
                                            Training Video
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                                {standard.image_urls && standard.image_urls.map((url, index) => (
                                    <div key={index} className="media-item image">
                                        <Image size={20} />
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            Image {index + 1}
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags Section */}
                    {standard.tags && standard.tags.length > 0 && (
                        <div className="content-section">
                            <h3>Tags</h3>
                            <div className="tags-display">
                                {standard.tags.map((tag, index) => (
                                    <span key={index} className="tag-badge">
                                        <Tag size={14} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata Section */}
                    <div className="content-section metadata-section">
                        <h3>Document Information</h3>
                        <div className="metadata-grid">
                            <div className="metadata-item">
                                <span className="metadata-label">
                                    <User size={16} />
                                    Author
                                </span>
                                <span className="metadata-value">{standard.author_username || 'Unknown'}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="metadata-label">
                                    <Calendar size={16} />
                                    Created
                                </span>
                                <span className="metadata-value">{formatDate(standard.created_at)}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="metadata-label">
                                    <Clock size={16} />
                                    Last Updated
                                </span>
                                <span className="metadata-value">{formatDate(standard.updated_at)}</span>
                            </div>
                            {standard.effective_date && (
                                <div className="metadata-item">
                                    <span className="metadata-label">
                                        <CheckCircle size={16} />
                                        Effective Date
                                    </span>
                                    <span className="metadata-value">{formatDate(standard.effective_date)}</span>
                                </div>
                            )}
                            {standard.review_date && (
                                <div className="metadata-item">
                                    <span className="metadata-label">
                                        <AlertCircle size={16} />
                                        Review Date
                                    </span>
                                    <span className="metadata-value">{formatDate(standard.review_date)}</span>
                                </div>
                            )}
                            {standard.approved_by_username && (
                                <div className="metadata-item">
                                    <span className="metadata-label">
                                        <Shield size={16} />
                                        Approved By
                                    </span>
                                    <span className="metadata-value">{standard.approved_by_username}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStandardModal;
// src/components/modals/OnboardingGuideModal.js
import React, { useState } from 'react';
import {
    X, Navigation, CheckCircle, Circle, Clock,
    User, FileText, Calendar, Award, Shield,
    ChevronRight, AlertCircle, Star, BookOpen,
    Briefcase, Users, Target, Rocket
} from 'lucide-react';
import './AdminModals.css';

const OnboardingGuideModal = ({ application, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [completedSteps, setCompletedSteps] = useState([]);

    const toggleStepCompletion = (stepId) => {
        setCompletedSteps(prev =>
            prev.includes(stepId)
                ? prev.filter(id => id !== stepId)
                : [...prev, stepId]
        );
    };

    const onboardingSteps = [
        {
            id: 'discord-setup',
            title: 'Discord Setup',
            icon: Users,
            duration: '5 min',
            description: 'Join our Discord server and get your roles assigned',
            tasks: [
                'Join the 5th Expeditionary Group Discord server',
                'Verify your account in #verification',
                'Read #rules-and-regulations',
                'Get your recruit role assigned'
            ]
        },
        {
            id: 'bit-enrollment',
            title: 'Basic Infantry Training (BIT)',
            icon: Target,
            duration: '2 weeks',
            description: 'Complete mandatory basic training course',
            tasks: [
                'Enroll in next available BIT session',
                'Attend all training sessions',
                'Pass final evaluation',
                'Receive BIT certificate'
            ]
        },
        {
            id: 'mos-selection',
            title: 'MOS Selection & AIT',
            icon: Briefcase,
            duration: '3-4 weeks',
            description: 'Choose your Military Occupational Specialty and complete advanced training',
            tasks: [
                'Review available MOS options',
                'Consult with your mentor on best fit',
                'Submit MOS application',
                'Complete Advanced Individual Training (AIT)'
            ]
        },
        {
            id: 'unit-assignment',
            title: 'Unit Assignment',
            icon: Shield,
            duration: '1 week',
            description: 'Get assigned to your operational unit',
            tasks: [
                'Review available unit positions',
                'Interview with unit leadership',
                'Receive official unit assignment',
                'Meet your squad/team members'
            ]
        },
        {
            id: 'final-activation',
            title: 'Active Duty Status',
            icon: Award,
            duration: 'Ongoing',
            description: 'Begin active service with your unit',
            tasks: [
                'Attend first unit operation',
                'Complete unit-specific orientation',
                'Set up equipment and loadouts',
                'Begin regular duty rotation'
            ]
        }
    ];

    const timelineEvents = [
        { week: 0, event: 'Application Approved', status: 'completed' },
        { week: 1, event: 'Discord Setup & Orientation', status: 'current' },
        { week: 2, event: 'BIT Course Begins', status: 'upcoming' },
        { week: 4, event: 'BIT Completion', status: 'upcoming' },
        { week: 5, event: 'MOS Selection', status: 'upcoming' },
        { week: 8, event: 'AIT Completion', status: 'upcoming' },
        { week: 9, event: 'Unit Assignment', status: 'upcoming' },
        { week: 10, event: 'Active Duty Status', status: 'upcoming' }
    ];

    const resources = [
        {
            title: 'New Recruit Handbook',
            icon: BookOpen,
            description: 'Essential reading for all new members',
            link: '#'
        },
        {
            title: 'Discord Guide',
            icon: Users,
            description: 'How to use our Discord server effectively',
            link: '#'
        },
        {
            title: 'MOS Catalog',
            icon: Briefcase,
            description: 'Detailed information on all specialties',
            link: '#'
        },
        {
            title: 'Training Videos',
            icon: FileText,
            description: 'Video tutorials and training materials',
            link: '#'
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="tab-content overview-content">
                        <div className="welcome-section">
                            <Rocket size={48} />
                            <h3>WELCOME TO THE 5TH EXPEDITIONARY GROUP</h3>
                            <p>
                                Congratulations on your acceptance! This guide will walk you through
                                the complete onboarding process from recruit to active duty member.
                            </p>
                        </div>

                        <div className="quick-info">
                            <div className="info-card">
                                <Clock size={24} />
                                <div>
                                    <h4>Total Duration</h4>
                                    <p>8-10 weeks</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <Calendar size={24} />
                                <div>
                                    <h4>Next Step</h4>
                                    <p>Discord Setup</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <User size={24} />
                                <div>
                                    <h4>Your Mentor</h4>
                                    <p>{application?.mentor_name || 'To be assigned'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="important-notice">
                            <AlertCircle size={20} />
                            <div>
                                <h4>IMPORTANT INFORMATION</h4>
                                <ul>
                                    <li>Maintain 75% attendance during training</li>
                                    <li>Complete all steps within 90 days</li>
                                    <li>Contact your mentor if you need assistance</li>
                                    <li>Review unit SOPs before active duty</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'steps':
                return (
                    <div className="tab-content steps-content">
                        <h3>ONBOARDING STEPS</h3>
                        <div className="steps-list">
                            {onboardingSteps.map((step, index) => {
                                const isCompleted = completedSteps.includes(step.id);
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className={`step-item ${isCompleted ? 'completed' : ''}`}>
                                        <div className="step-header" onClick={() => toggleStepCompletion(step.id)}>
                                            <div className="step-number">
                                                {isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                                            </div>
                                            <div className="step-info">
                                                <h4>
                                                    <Icon size={18} />
                                                    {step.title}
                                                </h4>
                                                <span className="step-duration">{step.duration}</span>
                                            </div>
                                            <ChevronRight className="expand-icon" size={20} />
                                        </div>
                                        <div className="step-content">
                                            <p>{step.description}</p>
                                            <ul className="task-list">
                                                {step.tasks.map((task, idx) => (
                                                    <li key={idx}>
                                                        <CheckCircle size={14} />
                                                        {task}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'timeline':
                return (
                    <div className="tab-content timeline-content">
                        <h3>ONBOARDING TIMELINE</h3>
                        <div className="timeline">
                            {timelineEvents.map((event, index) => (
                                <div key={index} className={`timeline-item ${event.status}`}>
                                    <div className="timeline-marker">
                                        {event.status === 'completed' ? (
                                            <CheckCircle size={20} />
                                        ) : event.status === 'current' ? (
                                            <div className="current-marker"></div>
                                        ) : (
                                            <Circle size={20} />
                                        )}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-week">Week {event.week}</div>
                                        <div className="timeline-event">{event.event}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'resources':
                return (
                    <div className="tab-content resources-content">
                        <h3>ONBOARDING RESOURCES</h3>
                        <div className="resources-grid">
                            {resources.map((resource, index) => {
                                const Icon = resource.icon;
                                return (
                                    <a key={index} href={resource.link} className="resource-card">
                                        <Icon size={32} />
                                        <h4>{resource.title}</h4>
                                        <p>{resource.description}</p>
                                        <span className="resource-link">
                                            Access Resource
                                            <ChevronRight size={16} />
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container xlarge" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Navigation size={24} />
                        ONBOARDING GUIDE
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="guide-tabs" style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0 1.5rem',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'overview' ? 'var(--rsi-blue)' : 'var(--text-secondary)',
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Star size={18} />
                        Overview
                        {activeTab === 'overview' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'var(--rsi-blue)',
                                boxShadow: '0 0 10px var(--rsi-blue-glow)'
                            }} />
                        )}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'steps' ? 'active' : ''}`}
                        onClick={() => setActiveTab('steps')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'steps' ? 'var(--rsi-blue)' : 'var(--text-secondary)',
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <CheckCircle size={18} />
                        Steps
                        {activeTab === 'steps' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'var(--rsi-blue)',
                                boxShadow: '0 0 10px var(--rsi-blue-glow)'
                            }} />
                        )}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'timeline' ? 'var(--rsi-blue)' : 'var(--text-secondary)',
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Calendar size={18} />
                        Timeline
                        {activeTab === 'timeline' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'var(--rsi-blue)',
                                boxShadow: '0 0 10px var(--rsi-blue-glow)'
                            }} />
                        )}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'resources' ? 'var(--rsi-blue)' : 'var(--text-secondary)',
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <BookOpen size={18} />
                        Resources
                        {activeTab === 'resources' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'var(--rsi-blue)',
                                boxShadow: '0 0 10px var(--rsi-blue-glow)'
                            }} />
                        )}
                    </button>
                </div>

                <div className="modal-form">
                    {renderContent()}
                </div>

                <div className="modal-actions">
                    <div className="progress-indicator" style={{ flex: 1 }}>
                        <span>Progress: {completedSteps.length}/{onboardingSteps.length} steps completed</span>
                        <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(completedSteps.length / onboardingSteps.length) * 100}%`,
                                    height: '6px',
                                    background: 'linear-gradient(90deg, var(--rsi-blue) 0%, var(--rsi-cyan) 100%)'
                                }}
                            ></div>
                        </div>
                    </div>
                    <button className="cancel-button" onClick={onClose}>
                        CLOSE GUIDE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingGuideModal;
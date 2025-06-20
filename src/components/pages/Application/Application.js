import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, ChevronRight, ChevronLeft, CheckCircle,
    Calendar, MapPin, Clock, Users, Award, Briefcase,
    AlertCircle, Target, Plane, Crosshair, Truck,
    Loader
} from 'lucide-react';
import api from "../../../services/api";
import './Application.css'

const ApplicationForm = () => {
    const navigate = useNavigate();

    // Form state
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // API data state
    const [brigades, setBrigades] = useState([]);
    const [platoons, setPlatoons] = useState([]);
    const [isLoadingBrigades, setIsLoadingBrigades] = useState(false);
    const [isLoadingPlatoons, setIsLoadingPlatoons] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        selectedBrigade: null,
        selectedPlatoon: null,
        selectedPath: null,
        discordId: '',
        email: '',
        age: '',
        timezone: '',
        referrer: '',
        milsimExperience: '',
        unitMotivation: '',
        leadershipExperience: '',
        flightExperience: '',
        divisionMotivation: '',
        weeklyAvailability: '',
        conductAgreed: false,
        attendanceAgreed: false,
        trainingAgreed: false
    });

    const totalSteps = 7;

    // Fetch brigades on component mount
    useEffect(() => {
        fetchBrigades();
    }, []);

    // Fetch brigades from API
    const fetchBrigades = async () => {
        setIsLoadingBrigades(true);
        try {
            const response = await api.get('/onboarding/recruitment/brigades/');
            setBrigades(response.data);
        } catch (err) {
            console.error('Error fetching brigades:', err);
            setError('Failed to load brigade data. Please try again.');
        } finally {
            setIsLoadingBrigades(false);
        }
    };

    // Fetch platoons when brigade is selected
    const fetchPlatoons = async (brigadeId) => {
        setIsLoadingPlatoons(true);
        setPlatoons([]); // Clear previous platoons
        try {
            const response = await api.get(`/onboarding/recruitment/brigades/${brigadeId}/platoons/`);
            setPlatoons(response.data);
        } catch (err) {
            console.error('Error fetching platoons:', err);
            setError('Failed to load platoon data. Please try again.');
        } finally {
            setIsLoadingPlatoons(false);
        }
    };

    // Auto-skip to warrant path for aviation units
    useEffect(() => {
        if (currentStep === 4 && formData.selectedBrigade) {
            const selectedBrigadeData = brigades.find(b => b.id === formData.selectedBrigade);
            if (selectedBrigadeData?.is_aviation_only) {
                setFormData(prev => ({ ...prev, selectedPath: 'warrant' }));
            }
        }
    }, [currentStep, formData.selectedBrigade, brigades]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBrigadeSelect = async (brigadeId) => {
        setFormData(prev => ({
            ...prev,
            selectedBrigade: brigadeId,
            selectedPlatoon: null // Reset platoon when brigade changes
        }));

        // Fetch platoons for selected brigade
        await fetchPlatoons(brigadeId);
    };

    const handlePlatoonSelect = (platoonId) => {
        setFormData(prev => ({ ...prev, selectedPlatoon: platoonId }));
    };

    const handlePathSelect = (path) => {
        setFormData(prev => ({ ...prev, selectedPath: path }));
    };

    const validateStep = () => {
        switch (currentStep) {
            case 2:
                if (!formData.selectedBrigade) {
                    setError('Please select a brigade to continue');
                    return false;
                }
                break;
            case 3:
                if (!formData.selectedPlatoon) {
                    setError('Please select a platoon assignment');
                    return false;
                }
                break;
            case 4:
                if (!formData.selectedPath) {
                    setError('Please select a career path');
                    return false;
                }
                break;
            case 5:
                if (!formData.discordId || !formData.email || !formData.age || !formData.timezone) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 6:
                if (!formData.milsimExperience || !formData.divisionMotivation || !formData.weeklyAvailability) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 7:
                if (!formData.conductAgreed || !formData.attendanceAgreed || !formData.trainingAgreed) {
                    setError('Please agree to all division standards');
                    return false;
                }
                break;
        }
        setError(null);
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;

        const selectedBrigadeData = brigades.find(b => b.id === formData.selectedBrigade);

        // Skip career path for aviation
        if (currentStep === 3 && selectedBrigadeData?.is_aviation_only) {
            setCurrentStep(5);
        } else if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        const selectedBrigadeData = brigades.find(b => b.id === formData.selectedBrigade);

        // Skip career path when going back from aviation
        if (currentStep === 5 && selectedBrigadeData?.is_aviation_only) {
            setCurrentStep(3);
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setIsLoading(true);

        try {
            // Try to check eligibility first, but don't fail if endpoint doesn't exist
            try {
                const eligibilityCheck = await api.post('/onboarding/recruitment/check-eligibility/', {
                    discord_id: formData.discordId
                });

                if (eligibilityCheck.data && !eligibilityCheck.data.eligible) {
                    setError(eligibilityCheck.data.reason || 'You are not eligible to apply at this time.');
                    setIsLoading(false);
                    return;
                }
            } catch (eligibilityErr) {
                // If eligibility check fails, continue with application
                console.log('Eligibility check skipped:', eligibilityErr);
            }

            const selectedBrigadeData = brigades.find(b => b.id === formData.selectedBrigade);
            const selectedPlatoonData = platoons.find(p => p.id === formData.selectedPlatoon);

            const applicationData = {
                discord_id: formData.discordId,
                username: formData.discordId.split('#')[0] || formData.discordId, // Parse username from Discord ID
                email: formData.email,
                preferred_brigade: formData.selectedBrigade,
                preferred_platoon: formData.selectedPlatoon,
                motivation: formData.divisionMotivation,
                experience: formData.milsimExperience,
                referrer: formData.referrer || null,
                has_flight_experience: formData.selectedPath === 'warrant' && formData.flightExperience ? true : false,
                flight_hours: formData.selectedPath === 'warrant' ? parseInt(formData.flightExperience || 0) : 0
            };

            const response = await api.post('/onboarding/applications/', applicationData);

            // Store application reference for success page
            localStorage.setItem('applicationReference', response.data.id);

            setCurrentStep(8); // Success state
        } catch (err) {
            console.error('Error submitting application:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data) {
                // Handle field-specific errors
                const errors = Object.entries(err.response.data)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('; ');
                setError(errors || 'Failed to submit application. Please try again.');
            } else {
                setError('Failed to submit application. Please try again.');
            }
            setIsLoading(false);
        }
    };

    const getSelectedBrigadeData = () => {
        return brigades.find(b => b.id === formData.selectedBrigade);
    };

    const getSelectedPlatoonData = () => {
        return platoons.find(p => p.id === formData.selectedPlatoon);
    };

    const progressPercentage = (currentStep / totalSteps) * 100;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <WelcomeStep />;
            case 2:
                return <BrigadeSelectionStep
                    brigades={brigades}
                    selectedBrigade={formData.selectedBrigade}
                    onSelect={handleBrigadeSelect}
                    isLoading={isLoadingBrigades}
                />;
            case 3:
                return <PlatoonSelectionStep
                    platoons={platoons}
                    selectedPlatoon={formData.selectedPlatoon}
                    selectedBrigade={getSelectedBrigadeData()}
                    onSelect={handlePlatoonSelect}
                    isLoading={isLoadingPlatoons}
                />;
            case 4:
                return <CareerPathStep
                    selectedPath={formData.selectedPath}
                    selectedPlatoon={getSelectedPlatoonData()}
                    selectedBrigade={getSelectedBrigadeData()}
                    onSelect={handlePathSelect}
                />;
            case 5:
                return <BasicInfoStep
                    formData={formData}
                    onChange={handleInputChange}
                />;
            case 6:
                return <ExperienceStep
                    formData={formData}
                    selectedPath={formData.selectedPath}
                    onChange={handleInputChange}
                />;
            case 7:
                return <AgreementStep
                    formData={formData}
                    onChange={handleInputChange}
                />;
            case 8:
                return <SuccessStep
                    formData={formData}
                    selectedBrigade={getSelectedBrigadeData()}
                    selectedPlatoon={getSelectedPlatoonData()}
                />;
            default:
                return null;
        }
    };

    if (currentStep === 8) {
        return renderStepContent();
    }

    return (
        <div className="application-container">
            {/* Header */}
            <div className="application-header">
                <div className="division-emblem">
                    <Shield size={40} />
                </div>
                <h1>5th Infantry Division</h1>
                <p>"Red Diamond" - We Will</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="step-indicator">
                    Step {currentStep} of {totalSteps}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Content */}
            <div className="application-content">
                {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="navigation">
                {currentStep > 1 && (
                    <button
                        className="nav-btn prev"
                        onClick={handlePrevious}
                        disabled={isLoading}
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>
                )}

                {currentStep < totalSteps ? (
                    <button
                        className="nav-btn next"
                        onClick={handleNext}
                        disabled={isLoading || (currentStep === 3 && isLoadingPlatoons)}
                    >
                        {currentStep === 1 ? 'Begin Application' : 'Next'}
                        <ChevronRight size={20} />
                    </button>
                ) : (
                    <button
                        className="nav-btn submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader className="spinning" size={20} />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Application
                                <CheckCircle size={20} />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

// Step Components
const WelcomeStep = () => (
    <div className="welcome-section">
        <h2>Join the Red Diamond Division</h2>
        <p>Welcome to the 5th Infantry Division (Mechanized) application portal</p>

        <div className="features">
            <div className="feature-card">
                <Target size={24} className="feature-icon" />
                <h3>Historic Legacy</h3>
                <p>Serving since WWI, the Red Diamond has a proud tradition of excellence in mechanized warfare</p>
            </div>
            <div className="feature-card">
                <Truck size={24} className="feature-icon" />
                <h3>Mechanized Operations</h3>
                <p>Combined arms tactics with M2 Bradleys, M1 Abrams, and integrated support elements</p>
            </div>
            <div className="feature-card">
                <MapPin size={24} className="feature-icon" />
                <h3>REFORGER Ready</h3>
                <p>Rapid deployment capabilities to reinforce NATO forces in Central Europe</p>
            </div>
        </div>

        <div className="feature-card highlight">
            <h3><Target size={20} /> Division Mission</h3>
            <p>As part of III Corps, the 5th Infantry Division stands ready to deploy to the NORTHAG sector, conducting mechanized operations against Warsaw Pact forces in the Fulda Gap and North German Plain.</p>
        </div>

        <div className="feature-card requirements">
            <h3><AlertCircle size={20} /> Requirements</h3>
            <ul>
                <li>✓ Minimum age: 16 years</li>
                <li>✓ Own Arma Reforger</li>
                <li>✓ Working microphone</li>
                <li>✓ Discord account</li>
            </ul>
        </div>
    </div>
);

const BrigadeSelectionStep = ({ brigades, selectedBrigade, onSelect, isLoading }) => {
    const getUnitIcon = (brigade) => {
        // Determine icon based on unit type or name
        if (brigade.name.includes('Aviation')) {
            return <Plane size={24} />;
        } else if (brigade.name.includes('Artillery')) {
            return <Crosshair size={24} />;
        } else if (brigade.name.includes('Armor') || brigade.name.includes('Iron')) {
            return '2';
        } else {
            return '1';
        }
    };

    const getUnitIconClass = (brigade) => {
        if (brigade.name.includes('Aviation')) return 'aviation-icon';
        if (brigade.name.includes('Artillery')) return 'arty-icon';
        if (brigade.name.includes('Armor') || brigade.name.includes('Iron')) return 'armor-icon';
        return 'infantry-icon';
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>Loading brigade information...</p>
            </div>
        );
    }

    // Filter for open brigades
    const openBrigades = brigades.filter(b => b.recruitment_status === 'open' || b.recruitment_status === 'limited');

    if (openBrigades.length === 0) {
        return (
            <div className="no-brigades-message">
                <AlertCircle size={48} />
                <h3>No Brigades Currently Recruiting</h3>
                <p>All brigades are currently closed for recruitment. Please check back later or contact a recruiter on Discord for more information.</p>
            </div>
        );
    }

    return (
        <div className="brigade-selection">
            <h2>Select Your Brigade</h2>
            <p className="step-description">Choose which brigade you'd like to join within the 5th Infantry Division</p>

            <div className="unit-cards">
                {brigades.map(brigade => {
                    const isOpen = brigade.recruitment_status === 'open' || brigade.recruitment_status === 'limited';

                    return (
                        <div
                            key={brigade.id}
                            className={`unit-card ${selectedBrigade === brigade.id ? 'selected' : ''} ${!isOpen ? 'disabled' : ''}`}
                            onClick={() => isOpen && onSelect(brigade.id)}
                        >
                            <div className="unit-header">
                                <div className={`unit-icon ${getUnitIconClass(brigade)}`}>
                                    {getUnitIcon(brigade)}
                                </div>
                                <div className="unit-info">
                                    <h3>{brigade.name}</h3>
                                    {brigade.motto && <p>"{brigade.motto}"</p>}
                                </div>
                            </div>
                            <div className="unit-details">
                                <p><strong>{brigade.unit_type}</strong></p>
                                {brigade.description && (
                                    <p className="unit-description">{brigade.description}</p>
                                )}

                                {brigade.is_aviation_only && (
                                    <p className="warrant-notice">
                                        ⚠️ WARRANT OFFICERS ONLY - Requires flight experience
                                    </p>
                                )}

                                <div className="unit-stats">
                                    <div className="stat-item">
                                        <div>Status</div>
                                        <div className={`stat-value ${brigade.recruitment_status}`}>
                                            {brigade.recruitment_status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div>Slots Open</div>
                                        <div className="stat-value">{brigade.available_slots || 0}</div>
                                    </div>
                                </div>

                                {brigade.recruitment_notes && (
                                    <p className="recruitment-notes">{brigade.recruitment_notes}</p>
                                )}

                                {!isOpen && (
                                    <div className="unit-closed-overlay">
                                        <p>Currently Closed for Recruitment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PlatoonSelectionStep = ({ platoons, selectedPlatoon, selectedBrigade, onSelect, isLoading }) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>Loading platoon information...</p>
            </div>
        );
    }

    // Group platoons by battalion and company
    const groupedPlatoons = platoons.reduce((acc, platoon) => {
        const battalion = platoon.battalion || 'Unassigned';
        const company = platoon.company || 'Unassigned';

        if (!acc[battalion]) {
            acc[battalion] = {};
        }
        if (!acc[battalion][company]) {
            acc[battalion][company] = [];
        }

        acc[battalion][company].push(platoon);
        return acc;
    }, {});

    return (
        <div className="platoon-selection">
            <h2>Select Your Platoon</h2>
            <div className="selection-summary">
                <h4>Selected Brigade:</h4>
                <p>{selectedBrigade?.name}</p>
            </div>
            <p className="step-description">Choose an available platoon assignment</p>

            <div className="platoon-grid">
                {Object.entries(groupedPlatoons).map(([battalion, companies]) => (
                    <div key={battalion}>
                        <div className="battalion-header">{battalion}</div>
                        {Object.entries(companies).map(([company, companyPlatoons]) => (
                            <div key={company}>
                                <div className="company-header">{company}</div>
                                {companyPlatoons.map((platoon) => (
                                    <div
                                        key={platoon.id}
                                        className={`platoon-card ${platoon.available_slots === 0 ? 'full' : ''} ${selectedPlatoon === platoon.id ? 'selected' : ''}`}
                                        onClick={() => platoon.available_slots > 0 && platoon.is_accepting_applications && onSelect(platoon.id)}
                                    >
                                        <div className="platoon-header">
                                            <span className="platoon-designation">{platoon.designation}</span>
                                            <span className="platoon-type">{platoon.unit_type}</span>
                                        </div>
                                        <div className="platoon-info">
                                            <span className="platoon-strength">
                                                Strength: {platoon.current_strength}/{platoon.max_strength}
                                            </span>
                                            <span className={`platoon-slots ${
                                                platoon.available_slots === 0 ? 'slots-full' :
                                                    platoon.available_slots <= 3 ? 'slots-limited' :
                                                        'slots-available'
                                            }`}>
                                                {platoon.available_slots === 0 ? 'FULL' : `${platoon.available_slots} slots`}
                                            </span>
                                        </div>
                                        <div className="platoon-details">
                                            PL: {platoon.leader || 'Vacant'}
                                            {platoon.career_tracks_available && platoon.career_tracks_available.length > 0 && (
                                                <span> • Tracks: {platoon.career_tracks_available.join(', ')}</span>
                                            )}
                                        </div>
                                        {!platoon.is_accepting_applications && (
                                            <div className="platoon-closed">Not accepting applications</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CareerPathStep = ({ selectedPath, selectedPlatoon, selectedBrigade, onSelect }) => {
    // Check if platoon has specific career track limitations
    const availableTracks = selectedPlatoon?.career_tracks_available || ['enlisted', 'warrant', 'officer'];

    return (
        <div className="career-selection">
            <h2>Choose Your Path</h2>
            <div className="selection-summary">
                <h4>Your Assignment:</h4>
                <p>{selectedPlatoon?.designation} - {selectedBrigade?.name}</p>
            </div>

            <div className="career-paths">
                {availableTracks.includes('enlisted') && (
                    <div
                        className={`career-card ${selectedPath === 'enlisted' ? 'selected' : ''}`}
                        onClick={() => onSelect('enlisted')}
                    >
                        <div className="career-header">
                            <div className="career-icon enlisted-icon">
                                <Award size={24} />
                            </div>
                            <div className="career-info">
                                <h3>Enlisted Soldier</h3>
                                <p>Start as a Private</p>
                            </div>
                        </div>
                        <div className="career-details">
                            <p><strong>The Backbone of the Army</strong></p>
                            <ul className="benefits-list">
                                <li>Immediate action after training</li>
                                <li>Learn from experienced NCOs</li>
                                <li>Hands-on combat experience</li>
                                <li>Clear promotion path to NCO</li>
                            </ul>
                            <div className="timeline">
                                <strong>Timeline:</strong> 2 weeks BIT → Unit assignment
                            </div>
                            <p className="requirements"><em>Requirements: 2 operations per month</em></p>
                        </div>
                    </div>
                )}

                {availableTracks.includes('warrant') && (
                    <div
                        className={`career-card ${selectedPath === 'warrant' ? 'selected' : ''}`}
                        onClick={() => onSelect('warrant')}
                    >
                        <div className="career-header">
                            <div className="career-icon warrant-icon">
                                <Plane size={24} />
                            </div>
                            <div className="career-info">
                                <h3>Warrant Officer</h3>
                                <p>Technical Specialist</p>
                            </div>
                        </div>
                        <div className="career-details">
                            <p><strong>Master Your Craft</strong></p>
                            <ul className="benefits-list">
                                <li>Helicopter pilot positions</li>
                                <li>Technical expertise roles</li>
                                <li>Start as WO1</li>
                                <li>Specialized equipment access</li>
                            </ul>
                            <div className="timeline">
                                <strong>Timeline:</strong> 4 weeks WOCS → 6 weeks specialization
                            </div>
                            <div className="challenges">
                                <strong>Note:</strong> Limited slots, requires experience
                            </div>
                        </div>
                    </div>
                )}

                {availableTracks.includes('officer') && (
                    <div
                        className={`career-card ${selectedPath === 'officer' ? 'selected' : ''}`}
                        onClick={() => onSelect('officer')}
                    >
                        <div className="career-header">
                            <div className="career-icon officer-icon">
                                <Shield size={24} />
                            </div>
                            <div className="career-info">
                                <h3>Commissioned Officer</h3>
                                <p>Leader of Soldiers</p>
                            </div>
                        </div>
                        <div className="career-details">
                            <p><strong>Lead from the Front</strong></p>
                            <ul className="benefits-list">
                                <li>Platoon leadership positions</li>
                                <li>Start as 2nd Lieutenant</li>
                                <li>Command authority</li>
                                <li>Strategic planning role</li>
                            </ul>
                            <div className="timeline">
                                <strong>Timeline:</strong> 6 weeks OCS → Branch assignment
                            </div>
                            <div className="challenges">
                                <strong>Requirements:</strong> Leadership experience, 90% attendance
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const BasicInfoStep = ({ formData, onChange }) => (
    <div className="basic-info">
        <h2>Basic Information</h2>

        <div className="form-group">
            <label>Discord Username</label>
            <input
                type="text"
                placeholder="YourName#1234"
                value={formData.discordId}
                onChange={(e) => onChange('discordId', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Email Address</label>
            <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Your Age</label>
            <input
                type="number"
                placeholder="18"
                min="16"
                value={formData.age}
                onChange={(e) => onChange('age', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Timezone</label>
            <select
                value={formData.timezone}
                onChange={(e) => onChange('timezone', e.target.value)}
            >
                <option value="">Select timezone...</option>
                <option value="PST">Pacific (PST)</option>
                <option value="MST">Mountain (MST)</option>
                <option value="CST">Central (CST)</option>
                <option value="EST">Eastern (EST)</option>
                <option value="GMT">GMT/BST</option>
                <option value="CET">Central European</option>
                <option value="AEST">Australian Eastern</option>
            </select>
        </div>

        <div className="form-group">
            <label>Referred By (Optional)</label>
            <input
                type="text"
                placeholder="Member's Discord username (if applicable)"
                value={formData.referrer || ''}
                onChange={(e) => onChange('referrer', e.target.value)}
            />
            <small style={{ color: '#999', fontSize: '0.85rem' }}>
                If a current member referred you, please enter their Discord username
            </small>
        </div>
    </div>
);

const ExperienceStep = ({ formData, selectedPath, onChange }) => (
    <div className="experience-info">
        <h2>Experience & Motivation</h2>

        <div className="form-group">
            <label>Military Simulation Experience</label>
            <textarea
                placeholder="Tell us about your milsim experience, previous units, and preferred roles..."
                value={formData.milsimExperience}
                onChange={(e) => onChange('milsimExperience', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Why this unit?</label>
            <textarea
                placeholder="Why do you want to join this specific unit?"
                value={formData.unitMotivation}
                onChange={(e) => onChange('unitMotivation', e.target.value)}
            />
        </div>

        {selectedPath === 'officer' && (
            <div className="form-group">
                <label>Leadership Experience (Officer Track)</label>
                <textarea
                    placeholder="Describe your leadership experience in gaming or real life..."
                    value={formData.leadershipExperience}
                    onChange={(e) => onChange('leadershipExperience', e.target.value)}
                />
            </div>
        )}

        {selectedPath === 'warrant' && (
            <div className="form-group">
                <label>Flight Hours / Technical Experience (Warrant Track)</label>
                <textarea
                    placeholder="List your flight simulation hours and relevant technical skills..."
                    value={formData.flightExperience}
                    onChange={(e) => onChange('flightExperience', e.target.value)}
                />
            </div>
        )}

        <div className="form-group">
            <label>Why do you want to join the 5th Infantry Division?</label>
            <textarea
                placeholder="Tell us your motivation for joining... (minimum 100 characters)"
                value={formData.divisionMotivation}
                onChange={(e) => onChange('divisionMotivation', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Weekly Availability</label>
            <select
                value={formData.weeklyAvailability}
                onChange={(e) => onChange('weeklyAvailability', e.target.value)}
            >
                <option value="">Select...</option>
                <option value="1-2">1-2 nights per week</option>
                <option value="3-4">3-4 nights per week</option>
                <option value="5+">5+ nights per week</option>
                <option value="weekends">Weekends only</option>
            </select>
        </div>
    </div>
);

const AgreementStep = ({ formData, onChange }) => (
    <div className="agreement-section">
        <h2>Division Standards</h2>

        <div className="agreement-item">
            <h4>Code of Honor</h4>
            <p>As a member of the 5th Infantry Division, I agree to:</p>
            <ul>
                <li>Uphold the honor of the Red Diamond</li>
                <li>Follow all lawful orders</li>
                <li>Treat all members with respect</li>
                <li>Maintain military bearing at all times</li>
            </ul>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="conduct"
                    checked={formData.conductAgreed}
                    onChange={(e) => onChange('conductAgreed', e.target.checked)}
                />
                <label htmlFor="conduct">I agree to the Code of Honor</label>
            </div>
        </div>

        <div className="agreement-item">
            <h4>Operational Requirements</h4>
            <ul>
                <li>Minimum 2 operations/month (enlisted)</li>
                <li>Minimum 3 operations/month (NCOs/Officers)</li>
                <li>Weekly training participation</li>
                <li>Proper use of chain of command</li>
            </ul>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="attendance"
                    checked={formData.attendanceAgreed}
                    onChange={(e) => onChange('attendanceAgreed', e.target.checked)}
                />
                <label htmlFor="attendance">I understand the operational requirements</label>
            </div>
        </div>

        <div className="agreement-item">
            <h4>Training Standards</h4>
            <ul>
                <li>Complete Basic Individual Training</li>
                <li>Maintain MOS qualifications</li>
                <li>Participate in unit exercises</li>
                <li>Pursue professional development</li>
            </ul>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="training"
                    checked={formData.trainingAgreed}
                    onChange={(e) => onChange('trainingAgreed', e.target.checked)}
                />
                <label htmlFor="training">I commit to maintaining training standards</label>
            </div>
        </div>
    </div>
);

const SuccessStep = ({ formData, selectedBrigade, selectedPlatoon }) => {
    const navigate = useNavigate();
    const applicationReference = localStorage.getItem('applicationReference') || `5ID-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return (
        <div className="success-container">
            <div className="success-message">
                <div className="success-icon">
                    <CheckCircle size={48} />
                </div>
                <h2>Application Submitted!</h2>
                <p>Welcome to the 5th Infantry Division recruitment process</p>

                <div className="assignment-summary">
                    <h3>Your Assignment</h3>
                    <div className="assignment-details">
                        <p className="assignment-text">
                            {selectedPlatoon?.designation} - {selectedBrigade?.name} ({formData.selectedPath?.toUpperCase()} track)
                        </p>
                    </div>
                </div>

                <div className="next-steps">
                    <h3>Next Steps</h3>
                    <ol>
                        <li>Check Discord for recruiter contact (24-48 hours)</li>
                        <li>Complete your interview</li>
                        <li>Receive unit assignment confirmation</li>
                        <li>Report for Basic Individual Training</li>
                        <li>Join your assigned platoon</li>
                    </ol>
                </div>

                <div className="reference-code">
                    <p>Application Reference:</p>
                    <code>{applicationReference}</code>
                </div>

                <div className="motto-box">
                    <p>Division Motto: "We Will"</p>
                </div>

                <button
                    className="return-home-btn"
                    onClick={() => navigate('/')}
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default ApplicationForm;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, ChevronRight, ChevronLeft, CheckCircle,
    Calendar, MapPin, Clock, Users, Award, Briefcase,
    AlertCircle, Target, Plane, Crosshair, Truck,
    Loader, Wrench, GraduationCap, Star, Rocket,
    Ship, Zap, Globe, Activity
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
    const [mosList, setMosList] = useState([]);
    const [isLoadingBrigades, setIsLoadingBrigades] = useState(false);
    const [isLoadingPlatoons, setIsLoadingPlatoons] = useState(false);
    const [isLoadingMOS, setIsLoadingMOS] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        selectedBrigade: null,
        selectedPlatoon: null,
        selectedPath: null,
        selectedMOS: [], // Array of up to 3 MOS choices
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

    const totalSteps = 8;

    // Fetch brigades on component mount
    useEffect(() => {
        fetchBrigades();
    }, []);

    // Fetch MOS list when career path is selected
    useEffect(() => {
        if (formData.selectedPath && formData.selectedBrigade) {
            fetchMOSList();
        }
    }, [formData.selectedPath, formData.selectedBrigade]);

    // Fetch brigades from API
    const fetchBrigades = async () => {
        setIsLoadingBrigades(true);
        try {
            const response = await api.get('/onboarding/recruitment/brigades/');
            setBrigades(response.data);
        } catch (err) {
            console.error('Error fetching brigades:', err);
            setError('Failed to load fleet data. Please try again.');
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
            setError('Failed to load squadron data. Please try again.');
        } finally {
            setIsLoadingPlatoons(false);
        }
    };

    // Fetch MOS list based on selected career path
    const fetchMOSList = async () => {
        setIsLoadingMOS(true);
        try {
            // Fetch entry-level MOS options
            const response = await api.get('/units/mos/entry_level/');
            setMosList(response.data);
        } catch (err) {
            console.error('Error fetching MOS list:', err);
            setError('Failed to load specialization options. Please try again.');
        } finally {
            setIsLoadingMOS(false);
        }
    };

    // Check MOS eligibility
    const checkMOSEligibility = async (mosIds) => {
        try {
            const response = await api.post('/onboarding/applications/check_eligibility/', {
                mos_ids: mosIds
            });
            return response.data;
        } catch (err) {
            console.error('Error checking MOS eligibility:', err);
            return null;
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
            selectedPlatoon: null, // Reset platoon when brigade changes
            selectedMOS: [] // Reset MOS selection
        }));

        // Fetch platoons for selected brigade
        await fetchPlatoons(brigadeId);
    };

    const handlePlatoonSelect = (platoonId) => {
        setFormData(prev => ({ ...prev, selectedPlatoon: platoonId }));
    };

    const handlePathSelect = (path) => {
        setFormData(prev => ({ ...prev, selectedPath: path, selectedMOS: [] }));
    };

    const handleMOSSelect = (mosId, priority) => {
        setFormData(prev => {
            const newMOS = [...prev.selectedMOS];
            newMOS[priority - 1] = mosId;
            // Filter out any undefined values
            return { ...prev, selectedMOS: newMOS.filter(Boolean) };
        });
    };

    const validateStep = () => {
        switch (currentStep) {
            case 2:
                if (!formData.selectedBrigade) {
                    setError('Please select a fleet division to continue');
                    return false;
                }
                break;
            case 3:
                if (!formData.selectedPlatoon) {
                    setError('Please select a squadron assignment');
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
                if (formData.selectedMOS.length === 0) {
                    setError('Please select at least one specialization preference');
                    return false;
                }
                break;
            case 6:
                if (!formData.discordId || !formData.email || !formData.age || !formData.timezone) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 7:
                if (!formData.milsimExperience || !formData.divisionMotivation || !formData.weeklyAvailability) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 8:
                if (!formData.conductAgreed || !formData.attendanceAgreed || !formData.trainingAgreed) {
                    setError('Please agree to all fleet standards');
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
            // Try to check eligibility first
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
                console.log('Eligibility check skipped:', eligibilityErr);
            }

            // Check MOS eligibility if MOS were selected
            if (formData.selectedMOS.length > 0) {
                const mosEligibility = await checkMOSEligibility(formData.selectedMOS);
                if (mosEligibility) {
                    // Show any MOS-specific warnings
                    const warnings = [];
                    formData.selectedMOS.forEach(mosId => {
                        if (mosEligibility[mosId] && !mosEligibility[mosId].eligible) {
                            warnings.push(`${mosEligibility[mosId].mos_code}: ${mosEligibility[mosId].reasons.join(', ')}`);
                        }
                    });
                    if (warnings.length > 0) {
                        console.warn('MOS eligibility warnings:', warnings);
                    }
                }
            }

            const applicationData = {
                discord_id: formData.discordId,
                username: formData.discordId.split('#')[0] || formData.discordId,
                email: formData.email,
                preferred_brigade: formData.selectedBrigade,
                preferred_platoon: formData.selectedPlatoon,
                motivation: formData.divisionMotivation,
                experience: formData.milsimExperience,
                referrer: formData.referrer || null,
                has_flight_experience: formData.selectedPath === 'warrant' && formData.flightExperience ? true : false,
                flight_hours: formData.selectedPath === 'warrant' ? parseInt(formData.flightExperience || 0) : 0,
                // MOS preferences
                mos_priority_1: formData.selectedMOS[0] || null,
                mos_priority_2: formData.selectedMOS[1] || null,
                mos_priority_3: formData.selectedMOS[2] || null,
                mos_waiver_requested: formData.mosWaiverRequested || false,
                mos_waiver_reason: formData.mosWaiverReason || null
            };

            const response = await api.post('/onboarding/applications/', applicationData);

            // Store application reference for success page
            localStorage.setItem('applicationReference', response.data.id);

            setCurrentStep(9); // Success state
        } catch (err) {
            console.error('Error submitting application:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data) {
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

    const getSelectedMOSData = (priority) => {
        const mosId = formData.selectedMOS[priority - 1];
        if (!mosId || !mosList) return null;

        // mosList is grouped by branch
        for (const branch in mosList) {
            const mos = mosList[branch].find(m => m.id === mosId);
            if (mos) return mos;
        }
        return null;
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
                return <MOSSelectionStep
                    mosList={mosList}
                    selectedMOS={formData.selectedMOS}
                    selectedPath={formData.selectedPath}
                    selectedBrigade={getSelectedBrigadeData()}
                    onSelect={handleMOSSelect}
                    isLoading={isLoadingMOS}
                />;
            case 6:
                return <BasicInfoStep
                    formData={formData}
                    onChange={handleInputChange}
                />;
            case 7:
                return <ExperienceStep
                    formData={formData}
                    selectedPath={formData.selectedPath}
                    onChange={handleInputChange}
                />;
            case 8:
                return <AgreementStep
                    formData={formData}
                    onChange={handleInputChange}
                />;
            case 9:
                return <SuccessStep
                    formData={formData}
                    selectedBrigade={getSelectedBrigadeData()}
                    selectedPlatoon={getSelectedPlatoonData()}
                    selectedMOS={[
                        getSelectedMOSData(1),
                        getSelectedMOSData(2),
                        getSelectedMOSData(3)
                    ].filter(Boolean)}
                />;
            default:
                return null;
        }
    };

    if (currentStep === 9) {
        return renderStepContent();
    }

    return (
        <div className="application-container">
            {/* Header */}
            <div className="application-header">
                <div className="division-emblem">
                    <Rocket size={40} />
                </div>
                <h1>5TH EXPEDITIONARY GROUP</h1>
                <p>"Beyond the Stars" - Elite Space Operations</p>
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
                        disabled={isLoading || (currentStep === 3 && isLoadingPlatoons) || (currentStep === 5 && isLoadingMOS)}
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
                                Transmitting...
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
        <h2>Join the Elite Fleet</h2>
        <p className="step-description">Welcome to the 5th Expeditionary Group recruitment portal</p>

        <div className="features">
            <div className="feature-card">
                <h3><Rocket size={24} className="feature-icon" />Deep Space Operations</h3>
                <p>Execute high-risk missions in uncharted systems, pushing the boundaries of known space</p>
            </div>
            <div className="feature-card">
                <h3><Ship size={24} className="feature-icon" />Advanced Fleet Assets</h3>
                <p>Access to cutting-edge vessels from fighters to capital ships, equipped with the latest technology</p>
            </div>
            <div className="feature-card">
                <h3><Globe size={24} className="feature-icon" />Strategic Deployment</h3>
                <p>Rapid response capabilities across multiple star systems, protecting UEE interests</p>
            </div>
        </div>

        <div className="feature-card highlight">
            <h3><Target size={20} /> Mission Profile</h3>
            <p>The 5th Expeditionary Group specializes in deep space reconnaissance, combat operations, and establishing forward operating bases in contested sectors. Our crews are the tip of the spear in humanity's expansion.</p>
        </div>

        <div className="feature-card requirements">
            <h3><AlertCircle size={20} /> Requirements</h3>
            <ul>
                <li>Minimum age: 16 years</li>
                <li>Own Star Citizen</li>
                <li>Working microphone</li>
                <li>Discord account</li>
                <li>Team-oriented mindset</li>
            </ul>
        </div>
    </div>
);

const BrigadeSelectionStep = ({ brigades, selectedBrigade, onSelect, isLoading }) => {
    const getUnitIcon = (brigade) => {
        if (brigade.name.includes('Aviation') || brigade.name.includes('Fighter')) {
            return <Plane size={24} />;
        } else if (brigade.name.includes('Capital') || brigade.name.includes('Heavy')) {
            return <Ship size={24} />;
        } else if (brigade.name.includes('Support') || brigade.name.includes('Logistics')) {
            return <Truck size={24} />;
        } else if (brigade.name.includes('Recon') || brigade.name.includes('Scout')) {
            return <Activity size={24} />;
        } else {
            return <Rocket size={24} />;
        }
    };

    const getUnitIconClass = (brigade) => {
        if (brigade.name.includes('Aviation') || brigade.name.includes('Fighter')) return 'aviation-icon';
        if (brigade.name.includes('Capital') || brigade.name.includes('Heavy')) return 'armor-icon';
        if (brigade.name.includes('Support') || brigade.name.includes('Logistics')) return 'arty-icon';
        return 'infantry-icon';
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>ACCESSING FLEET DATABASE...</p>
            </div>
        );
    }

    const openBrigades = brigades.filter(b => b.recruitment_status === 'open' || b.recruitment_status === 'limited');

    if (openBrigades.length === 0) {
        return (
            <div className="no-brigades-message">
                <AlertCircle size={48} />
                <h3>No Fleets Currently Recruiting</h3>
                <p>All fleet divisions are currently at operational capacity. Please check back later or contact a recruitment officer on Discord for more information.</p>
            </div>
        );
    }

    return (
        <div className="brigade-selection">
            <h2>Select Your Fleet Division</h2>
            <p className="step-description">Choose which specialized fleet you'd like to join within the 5th Expeditionary Group</p>

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
                                        ⚠️ FLIGHT CERTIFIED ONLY - Requires pilot qualifications
                                    </p>
                                )}

                                <div className="unit-stats">
                                    <div className="stat-item">
                                        <div>STATUS</div>
                                        <div className={`stat-value ${brigade.recruitment_status}`}>
                                            {brigade.recruitment_status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div>BERTHS OPEN</div>
                                        <div className="stat-value">{brigade.available_slots || 0}</div>
                                    </div>
                                </div>

                                {brigade.recruitment_notes && (
                                    <p className="recruitment-notes">{brigade.recruitment_notes}</p>
                                )}

                                {!isOpen && (
                                    <div className="unit-closed-overlay">
                                        <p>RECRUITMENT CLOSED</p>
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
                <p>LOADING SQUADRON MANIFEST...</p>
            </div>
        );
    }

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
            <h2>Select Your Squadron</h2>
            <div className="selection-summary">
                <h4>Selected Fleet Division:</h4>
                <p>{selectedBrigade?.name}</p>
            </div>
            <p className="step-description">Choose an available squadron assignment</p>

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
                                                Crew: {platoon.current_strength}/{platoon.max_strength}
                                            </span>
                                            <span className={`platoon-slots ${
                                                platoon.available_slots === 0 ? 'slots-full' :
                                                    platoon.available_slots <= 3 ? 'slots-limited' :
                                                        'slots-available'
                                            }`}>
                                                {platoon.available_slots === 0 ? 'FULL' : `${platoon.available_slots} berths`}
                                            </span>
                                        </div>
                                        <div className="platoon-details">
                                            CMDR: {platoon.leader || 'Vacant'}
                                            {platoon.career_tracks_available && platoon.career_tracks_available.length > 0 && (
                                                <span> • Tracks: {platoon.career_tracks_available.join(', ')}</span>
                                            )}
                                        </div>
                                        {!platoon.is_accepting_applications && (
                                            <div className="platoon-closed">RECRUITMENT SUSPENDED</div>
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
    const availableTracks = selectedPlatoon?.career_tracks_available || ['enlisted', 'warrant', 'officer'];

    return (
        <div className="career-selection">
            <h2>Choose Your Career Path</h2>
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
                                <h3>Fleet Crew</h3>
                                <p>Start as Crewman</p>
                            </div>
                        </div>
                        <div className="career-details">
                            <p><strong>The Backbone of the Fleet</strong></p>
                            <ul className="benefits-list">
                                <li>Immediate deployment after training</li>
                                <li>Learn from experienced crew chiefs</li>
                                <li>Hands-on ship operations</li>
                                <li>Clear advancement to crew chief</li>
                            </ul>
                            <div className="timeline">
                                <strong>Timeline:</strong> 2 weeks basic → Ship assignment
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
                                <h3>Flight Officer</h3>
                                <p>Certified Pilot</p>
                            </div>
                        </div>
                        <div className="career-details">
                            <p><strong>Master the Void</strong></p>
                            <ul className="benefits-list">
                                <li>Fighter & support craft pilot</li>
                                <li>Flight certification program</li>
                                <li>Start as Flight Officer</li>
                                <li>Advanced ship systems access</li>
                            </ul>
                            <div className="timeline">
                                <strong>Timeline:</strong> 4 weeks flight school → Squadron assignment
                            </div>
                            <div className="challenges">
                                <strong>Note:</strong> Limited berths, requires flight experience
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
                                <h3>Command Track</h3>
                                <p>Squadron Leader</p>
                            </div>
                        </div>
                        <div className="career-details">
                            <p><strong>Lead from the Bridge</strong></p>
                            <ul className="benefits-list">
                                <li>Squadron command positions</li>
                                <li>Start as Lieutenant</li>
                                <li>Tactical command authority</li>
                                <li>Strategic operations planning</li>
                            </ul>
                            <div className="timeline">
                                <strong>Timeline:</strong> 6 weeks command school → Fleet assignment
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

const MOSSelectionStep = ({ mosList, selectedMOS, selectedPath, selectedBrigade, onSelect, isLoading }) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>LOADING SPECIALIZATION DATABASE...</p>
            </div>
        );
    }

    const getMOSIcon = (category) => {
        const icons = {
            'combat_arms': <Target size={20} />,
            'combat_support': <Shield size={20} />,
            'combat_service_support': <Truck size={20} />,
            'aviation': <Plane size={20} />,
            'medical': <Award size={20} />,
            'intelligence': <AlertCircle size={20} />,
            'signal': <Users size={20} />,
            'logistics': <Truck size={20} />,
            'maintenance': <Wrench size={20} />,
            'special_operations': <Star size={20} />,
            'engineering': <Zap size={20} />,
            'navigation': <Globe size={20} />,
            'operations': <Activity size={20} />
        };
        return icons[category] || <Briefcase size={20} />;
    };

    return (
        <div className="mos-selection">
            <h2>Select Your Specialization</h2>
            <div className="selection-summary">
                <h4>Career Path:</h4>
                <p>{selectedPath?.charAt(0).toUpperCase() + selectedPath?.slice(1)} Track</p>
            </div>
            <p className="step-description">Choose up to 3 specialization preferences in order of priority</p>

            {selectedMOS.length > 0 && (
                <div className="mos-priority-display">
                    <h4>Your Specialization Preferences:</h4>
                    <div className="priority-list">
                        {[1, 2, 3].map(priority => {
                            const mosId = selectedMOS[priority - 1];
                            let mos = null;
                            if (mosId && mosList) {
                                for (const branch in mosList) {
                                    mos = mosList[branch].find(m => m.id === mosId);
                                    if (mos) break;
                                }
                            }
                            return (
                                <div key={priority} className={`priority-item ${mos ? 'selected' : ''}`}>
                                    <span className="priority-number">{priority}.</span>
                                    {mos ? (
                                        <>
                                            <strong>{mos.code}</strong> - {mos.title}
                                        </>
                                    ) : (
                                        <span className="placeholder">Select {priority === 1 ? '1st' : priority === 2 ? '2nd' : '3rd'} choice</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mos-categories">
                {Object.entries(mosList).map(([branchName, mosList]) => (
                    <div key={branchName} className="mos-branch-section">
                        <h3 className="branch-header">{branchName}</h3>
                        <div className="mos-grid">
                            {mosList.map(mos => {
                                const isSelected = selectedMOS.includes(mos.id);
                                const priority = selectedMOS.indexOf(mos.id) + 1;

                                return (
                                    <div
                                        key={mos.id}
                                        className={`mos-card ${isSelected ? 'selected' : ''} ${selectedMOS.length >= 3 && !isSelected ? 'disabled' : ''}`}
                                        onClick={() => {
                                            if (isSelected) {
                                                // Remove from selection
                                                onSelect(null, priority);
                                            } else if (selectedMOS.length < 3) {
                                                // Add to next available priority
                                                onSelect(mos.id, selectedMOS.length + 1);
                                            }
                                        }}
                                    >
                                        <div className="mos-header">
                                            <div className={`mos-icon ${mos.category}`}>
                                                {getMOSIcon(mos.category)}
                                            </div>
                                            <div className="mos-info">
                                                <h4>{mos.code}</h4>
                                                <p>{mos.title}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="priority-badge">
                                                    #{priority}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mos-details">
                                            <div className="mos-stat">
                                                <span className="stat-label">Training:</span>
                                                <span className="stat-value">{mos.ait_weeks} weeks</span>
                                            </div>
                                            {mos.security_clearance_required !== 'none' && (
                                                <div className="mos-stat">
                                                    <span className="stat-label">Clearance:</span>
                                                    <span className="stat-value">{mos.security_clearance_required.toUpperCase()}</span>
                                                </div>
                                            )}
                                            <div className="mos-stat">
                                                <span className="stat-label">Demand:</span>
                                                <span className="stat-value">{mos.physical_demand_rating}</span>
                                            </div>
                                        </div>
                                        {mos.description && (
                                            <p className="mos-description">{mos.description}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
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
            <small>
                If a current member referred you, please enter their Discord username
            </small>
        </div>
    </div>
);

const ExperienceStep = ({ formData, selectedPath, onChange }) => (
    <div className="experience-info">
        <h2>Experience & Motivation</h2>

        <div className="form-group">
            <label>Space Simulation Experience</label>
            <textarea
                placeholder="Tell us about your experience in Star Citizen, previous organizations, and preferred roles..."
                value={formData.milsimExperience}
                onChange={(e) => onChange('milsimExperience', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Why this fleet?</label>
            <textarea
                placeholder="Why do you want to join this specific fleet division?"
                value={formData.unitMotivation}
                onChange={(e) => onChange('unitMotivation', e.target.value)}
            />
        </div>

        {selectedPath === 'officer' && (
            <div className="form-group">
                <label>Leadership Experience (Command Track)</label>
                <textarea
                    placeholder="Describe your leadership experience in gaming or real life..."
                    value={formData.leadershipExperience}
                    onChange={(e) => onChange('leadershipExperience', e.target.value)}
                />
            </div>
        )}

        {selectedPath === 'warrant' && (
            <div className="form-group">
                <label>Flight Hours / Technical Experience (Pilot Track)</label>
                <textarea
                    placeholder="List your flight hours in Star Citizen and relevant piloting skills..."
                    value={formData.flightExperience}
                    onChange={(e) => onChange('flightExperience', e.target.value)}
                />
            </div>
        )}

        <div className="form-group">
            <label>Why do you want to join the 5th Expeditionary Group?</label>
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
        <h2>Fleet Standards</h2>

        <div className="agreement-item">
            <h4>Code of Conduct</h4>
            <p>As a member of the 5th Expeditionary Group, I agree to:</p>
            <ul>
                <li>Uphold the honor of the fleet</li>
                <li>Follow all operational directives</li>
                <li>Treat all crew members with respect</li>
                <li>Maintain professional conduct at all times</li>
            </ul>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="conduct"
                    checked={formData.conductAgreed}
                    onChange={(e) => onChange('conductAgreed', e.target.checked)}
                />
                <label htmlFor="conduct">I agree to the Code of Conduct</label>
            </div>
        </div>

        <div className="agreement-item">
            <h4>Operational Requirements</h4>
            <ul>
                <li>Minimum 2 operations/month (crew)</li>
                <li>Minimum 3 operations/month (officers)</li>
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
                <li>Complete Basic Flight Training</li>
                <li>Maintain specialization qualifications</li>
                <li>Participate in fleet exercises</li>
                <li>Pursue continuous improvement</li>
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

const SuccessStep = ({ formData, selectedBrigade, selectedPlatoon, selectedMOS }) => {
    const navigate = useNavigate();
    const applicationReference = localStorage.getItem('applicationReference') || `5EXG-2954-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return (
        <div className="success-container">
            <div className="success-message">
                <div className="success-icon">
                    <CheckCircle size={64} />
                </div>
                <h2>APPLICATION TRANSMITTED!</h2>
                <p>Welcome to the 5th Expeditionary Group recruitment pipeline</p>

                <div className="assignment-summary">
                    <h3>Your Assignment Request</h3>
                    <div className="assignment-details">
                        <p className="assignment-text">
                            {selectedPlatoon?.designation} - {selectedBrigade?.name} ({formData.selectedPath?.toUpperCase()} track)
                        </p>
                    </div>
                </div>

                {selectedMOS.length > 0 && (
                    <div className="mos-summary">
                        <h3>Specialization Preferences</h3>
                        <div className="mos-preferences">
                            {selectedMOS.map((mos, index) => (
                                <div key={index} className="mos-preference">
                                    <span className="priority">#{index + 1}</span>
                                    <strong>{mos.code}</strong> - {mos.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="next-steps">
                    <h3>Next Steps</h3>
                    <ol>
                        <li>Check Discord for recruitment officer contact (24-48 hours)</li>
                        <li>Complete your screening interview</li>
                        <li>Receive specialization confirmation</li>
                        <li>Report for Basic Flight Training</li>
                        <li>Complete advanced specialization training</li>
                        <li>Join your assigned squadron</li>
                    </ol>
                </div>

                <div className="reference-code">
                    <p>Application Reference:</p>
                    <code>{applicationReference}</code>
                </div>

                <div className="motto-box">
                    <p>"BEYOND THE STARS"</p>
                </div>

                <button
                    className="return-home-btn"
                    onClick={() => navigate('/')}
                >
                    RETURN TO BASE
                </button>
            </div>
        </div>
    );
};

export default ApplicationForm;
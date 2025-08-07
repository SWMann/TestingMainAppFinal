// src/components/pages/Application/Application.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Shield, ChevronRight, ChevronLeft, CheckCircle,
    Calendar, MapPin, Clock, Users, Award, Briefcase,
    AlertCircle, Target, Plane, Crosshair, Truck,
    Loader, Wrench, GraduationCap, Star, Rocket,
    Ship, Zap, Globe, Activity, Anchor, Save,
    Mail, User, Hash, FileText, Compass
} from 'lucide-react';
import api from "../../../services/api";
import './Application.css';

const ApplicationForm = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(state => state.auth);

    // Form state
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);

    // Application data
    const [applicationId, setApplicationId] = useState(null);
    const [recruitmentData, setRecruitmentData] = useState(null);
    const [primaryUnits, setPrimaryUnits] = useState([]);
    const [secondaryUnits, setSecondaryUnits] = useState([]);
    const [mosList, setMosList] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Note: We collect all form data locally and only create the application
    // at submission time since the API requires fields from multiple steps

    // Form data matching API structure
    const [formData, setFormData] = useState({
        // Basic Info (Step 2)
        first_name: '',
        last_name: '',
        email: '',
        timezone: '',
        country: '',

        // Branch & Units (Steps 3-5)
        branch: null,
        primary_unit: null, // Squadron/Company
        secondary_unit: null, // Division/Platoon

        // Career & MOS (Steps 6-7)
        career_track: null,
        primary_mos: null,

        // Experience (Step 8)
        previous_experience: '',
        reason_for_joining: '',

        // Role-specific (Step 9)
        weekly_availability_hours: null,
        can_attend_mandatory_events: true,
        leadership_experience: '',
        technical_experience: '',

        // Waivers (Step 10)
        accepted_waivers: []
    });

    /**
     * Application Form Component
     *
     * This form collects all application data locally across 10 steps,
     * then creates and submits the application to the server only when
     * all required fields are complete. This approach is necessary because
     * the API requires fields from multiple steps to create an application.
     */

    const totalSteps = 10;

    // Check if user is logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }
    }, [currentUser, navigate]);

    // Set user email when currentUser is available
    useEffect(() => {
        if (currentUser?.email && !formData.email) {
            setFormData(prev => ({ ...prev, email: currentUser.email }));
        }
    }, [currentUser]);

    // Initialize application
    useEffect(() => {
        if (currentUser) {
            console.log('Current user available, initializing application...', currentUser);
            initializeApplication();
        }
    }, [currentUser]);

    // Auto-save on form changes (debounced) - only if we have an application
    useEffect(() => {
        // Only auto-save if we have an application ID
        if (applicationId && !isLoading && !isSaving) {
            const saveTimer = setTimeout(() => {
                autoSaveProgress();
            }, 2000);
            return () => clearTimeout(saveTimer);
        }
    }, [formData, currentStep, applicationId, isLoading, isSaving]);

    // Load MOS options when career track changes
    useEffect(() => {
        if (formData.branch && formData.career_track && formData.primary_unit && currentStep === 7) {
            fetchMOSOptions();
        } else if (currentStep === 7) {
            // Clear MOS list if we don't have prerequisites
            setMosList([]);
        }
    }, [formData.career_track, formData.branch, formData.primary_unit, currentStep]);

    const initializeApplication = async () => {
        setIsLoading(true);
        try {
            // Get recruitment data first
            const recruitData = await api.get('/onboarding/applications/recruitment-data/');
            setRecruitmentData(recruitData.data);

            // Try to check for existing application by discord ID
            if (currentUser?.discord_id) {
                try {
                    // Use the simpler endpoint that might work better
                    const draftsResponse = await api.get('/onboarding/applications/my-drafts/');
                    console.log('My drafts response:', draftsResponse.data);

                    if (draftsResponse.data && draftsResponse.data.length > 0) {
                        // Get the most recent draft
                        const app = draftsResponse.data[0];
                        console.log('Found existing draft application:', app);

                        setApplicationId(app.id);

                        // Restore saved progress if exists - handle different data structures
                        const step = app.current_step || app.progress?.current_step || 1;
                        if (step > 1) {
                            setFormData({
                                first_name: app.first_name || '',
                                last_name: app.last_name || '',
                                email: app.email || currentUser.email || '',
                                timezone: app.timezone || '',
                                country: app.country || '',
                                branch: app.branch || null,
                                primary_unit: app.primary_unit || null,
                                secondary_unit: app.secondary_unit || null,
                                career_track: app.career_track || null,
                                primary_mos: app.primary_mos || null,
                                previous_experience: app.previous_experience || '',
                                reason_for_joining: app.reason_for_joining || '',
                                weekly_availability_hours: app.weekly_availability_hours || null,
                                can_attend_mandatory_events: app.can_attend_mandatory_events !== false,
                                leadership_experience: app.leadership_experience || '',
                                technical_experience: app.technical_experience || '',
                                accepted_waivers: app.waivers?.map(w => w.waiver_type || w.id) || []
                            });

                            // Resume from last step
                            setCurrentStep(step);

                            // If branch is already selected, load units for that branch
                            if (app.branch) {
                                await fetchPrimaryUnits(app.branch);

                                // If primary unit is selected, load secondary units
                                if (app.primary_unit) {
                                    await fetchSecondaryUnits(app.branch, app.primary_unit);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.log('My-drafts endpoint failed, trying status endpoint:', err.message);
                    // Try the status endpoint as a fallback
                    try {
                        const statusResponse = await api.get(`/onboarding/applications/status/${currentUser.discord_id}/`);
                        console.log('Application status check:', statusResponse.data);

                        // If we have a draft application, try to load it
                        if (statusResponse.data.status === 'draft' && statusResponse.data.application_id) {
                            try {
                                const appResponse = await api.get(`/onboarding/applications/${statusResponse.data.application_id}/`);
                                const app = appResponse.data;
                                console.log('Found existing draft application:', app);

                                setApplicationId(app.id);

                                // Restore saved progress if exists
                                const step = app.current_step || app.progress?.current_step || 1;
                                if (step > 1) {
                                    setFormData({
                                        first_name: app.first_name || '',
                                        last_name: app.last_name || '',
                                        email: app.email || currentUser.email || '',
                                        timezone: app.timezone || '',
                                        country: app.country || '',
                                        branch: app.branch || null,
                                        primary_unit: app.primary_unit || null,
                                        secondary_unit: app.secondary_unit || null,
                                        career_track: app.career_track || null,
                                        primary_mos: app.primary_mos || null,
                                        previous_experience: app.previous_experience || '',
                                        reason_for_joining: app.reason_for_joining || '',
                                        weekly_availability_hours: app.weekly_availability_hours || null,
                                        can_attend_mandatory_events: app.can_attend_mandatory_events !== false,
                                        leadership_experience: app.leadership_experience || '',
                                        technical_experience: app.technical_experience || '',
                                        accepted_waivers: app.waivers?.map(w => w.waiver_type || w.id) || []
                                    });

                                    // Resume from last step
                                    setCurrentStep(step);

                                    // If branch is already selected, load units for that branch
                                    if (app.branch) {
                                        await fetchPrimaryUnits(app.branch);

                                        // If primary unit is selected, load secondary units
                                        if (app.primary_unit) {
                                            await fetchSecondaryUnits(app.branch, app.primary_unit);
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log('Could not load draft application details:', err);
                            }
                        }
                    } catch (err) {
                        // No existing application found - this is fine
                        console.log('No existing application found for user');
                    }
                }
            } else {
                console.warn('User does not have discord_id set');
            }

            // If we don't have an application ID at this point, we'll create one when user starts filling the form
            if (!applicationId) {
                console.log('Ready to create new application when user begins');
            }

        } catch (err) {
            console.error('Error initializing application:', err);
            setError('Failed to initialize application. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const createApplication = async () => {
        console.log('Creating new application with all form data...');

        // Validate we have all required fields
        if (!formData.first_name || !formData.last_name || !formData.email) {
            throw new Error('Basic information is incomplete');
        }
        if (!formData.branch || !formData.career_track) {
            throw new Error('Branch and career track must be selected');
        }
        if (!formData.previous_experience || !formData.reason_for_joining) {
            throw new Error('Experience information is required');
        }
        if (!currentUser?.username) {
            throw new Error('Discord username is required');
        }

        try {
            const createData = {
                // Basic fields
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || currentUser?.email,
                discord_username: currentUser.username,
                timezone: formData.timezone,
                country: formData.country,

                // Selection fields
                branch: formData.branch,
                primary_unit: formData.primary_unit,
                secondary_unit: formData.secondary_unit,
                career_track: formData.career_track,
                primary_mos: formData.primary_mos,

                // Experience fields
                previous_experience: formData.previous_experience,
                reason_for_joining: formData.reason_for_joining,

                // Availability fields
                weekly_availability_hours: formData.weekly_availability_hours,
                can_attend_mandatory_events: formData.can_attend_mandatory_events,

                // Role-specific fields
                leadership_experience: formData.leadership_experience || '',
                technical_experience: formData.technical_experience || '',

                // Status fields
                current_step: currentStep,
                status: 'draft'
            };

            console.log('Creating application with data:', createData);
            const createResponse = await api.post('/onboarding/applications/', createData);

            if (createResponse.data && createResponse.data.id) {
                setApplicationId(createResponse.data.id);
                console.log('Application created with ID:', createResponse.data.id);
                setLastSaved(new Date());
                return createResponse.data.id;
            } else {
                console.error('Failed to create application - no ID returned');
                setError('Failed to create application. Please try again.');
                return null;
            }
        } catch (err) {
            console.error('Error creating application:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Error status:', err.response.status);

                // Show specific field errors from server
                if (err.response.data) {
                    const errors = [];
                    Object.entries(err.response.data).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            // Make field names more user-friendly
                            const friendlyField = field
                                .replace('_', ' ')
                                .replace('discord username', 'Discord username')
                                .replace('primary mos', 'MOS selection');
                            errors.push(`${friendlyField}: ${messages.join(', ')}`);
                        }
                    });
                    if (errors.length > 0) {
                        setError('Please fix the following: ' + errors.join('; '));
                        return null;
                    }
                }
            }
            setError('Failed to create application. Please try again.');
            return null;
        }
    };

    const autoSaveProgress = async () => {
        if (isSaving || !applicationId) return applicationId;

        setIsSaving(true);
        try {
            // Save progress to existing application
            const saveData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || currentUser?.email,
                timezone: formData.timezone,
                country: formData.country,
                branch: formData.branch,
                primary_unit: formData.primary_unit,
                secondary_unit: formData.secondary_unit,
                career_track: formData.career_track,
                primary_mos: formData.primary_mos,
                previous_experience: formData.previous_experience,
                reason_for_joining: formData.reason_for_joining,
                weekly_availability_hours: formData.weekly_availability_hours,
                can_attend_mandatory_events: formData.can_attend_mandatory_events,
                leadership_experience: formData.leadership_experience,
                technical_experience: formData.technical_experience,
                current_step: currentStep
            };

            // Try PATCH first, then POST if that fails
            try {
                await api.patch(`/onboarding/applications/${applicationId}/save-progress/`, saveData);
            } catch (patchErr) {
                if (patchErr.response?.status === 405) {
                    // Method not allowed, try POST
                    await api.post(`/onboarding/applications/${applicationId}/save-progress/`, saveData);
                } else {
                    throw patchErr;
                }
            }

            setLastSaved(new Date());
            return applicationId;
        } catch (err) {
            console.error('Auto-save failed:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Error status:', err.response.status);
            }

            // If it's a 404, the application might not exist
            if (err.response?.status === 404) {
                console.log('Application not found during save');
                // Don't clear the ID here, as it might cause issues
            }
            return applicationId;
        } finally {
            setIsSaving(false);
        }
    };

    const fetchPrimaryUnits = async (branchId) => {
        console.log('Fetching primary units for branch:', branchId);
        setIsLoadingData(true);
        setPrimaryUnits([]); // Clear existing units
        try {
            const response = await api.get('/onboarding/applications/get-units/', {
                params: {
                    branch_id: branchId,
                    unit_type: 'primary'
                }
            });
            console.log('Primary units response:', response.data);
            setPrimaryUnits(response.data);
            return response.data;
        } catch (err) {
            console.error('Error fetching primary units:', err);
            setError('Failed to load unit data.');
            setPrimaryUnits([]);
            return [];
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchSecondaryUnits = async (branchId, parentUnitId) => {
        setIsLoadingData(true);
        setSecondaryUnits([]); // Clear existing units
        try {
            const response = await api.get('/onboarding/applications/get-units/', {
                params: {
                    branch_id: branchId,
                    unit_type: 'secondary',
                    parent_unit_id: parentUnitId
                }
            });
            setSecondaryUnits(response.data);
            return response.data;
        } catch (err) {
            console.error('Error fetching secondary units:', err);
            setError('Failed to load unit data.');
            setSecondaryUnits([]);
            return [];
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchMOSOptions = async () => {
        if (!formData.branch || !formData.career_track || !formData.primary_unit) return;

        console.log('Fetching MOS options:', {
            branch_id: formData.branch,
            career_track: formData.career_track,
            unit_id: formData.primary_unit
        });

        setIsLoadingData(true);
        try {
            const response = await api.get('/onboarding/applications/get-mos-options/', {
                params: {
                    branch_id: formData.branch,
                    career_track: formData.career_track,
                    unit_id: formData.primary_unit  // Pass the primary unit to get slots
                }
            });
            console.log('MOS options response:', response.data);

            // Extract the mos_options array from the response
            if (response.data && response.data.mos_options) {
                setMosList(response.data.mos_options);
            } else if (Array.isArray(response.data)) {
                // Fallback if the API returns just an array
                setMosList(response.data);
            } else {
                console.error('Unexpected MOS options format:', response.data);
                setMosList([]);
            }
        } catch (err) {
            console.error('Error fetching MOS options:', err);
            // Don't show error, just set empty list
            setMosList([]);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBranchSelect = async (branchId) => {
        setFormData(prev => ({
            ...prev,
            branch: branchId,
            primary_unit: null,
            secondary_unit: null,
            primary_mos: null
        }));

        // Clear previous selections
        setPrimaryUnits([]);
        setSecondaryUnits([]);

        // Fetch primary units for this branch
        await fetchPrimaryUnits(branchId);
    };

    const handlePrimaryUnitSelect = async (unitId) => {
        setFormData(prev => ({
            ...prev,
            primary_unit: unitId,
            secondary_unit: null
        }));

        // Fetch secondary units for this primary unit
        await fetchSecondaryUnits(formData.branch, unitId);
    };

    const handleSecondaryUnitSelect = (unitId) => {
        setFormData(prev => ({ ...prev, secondary_unit: unitId }));
    };

    const handleCareerTrackSelect = async (track) => {
        setFormData(prev => ({
            ...prev,
            career_track: track,
            primary_mos: null
        }));
        // MOS will be fetched by useEffect
    };

    const handleMOSSelect = (mosId) => {
        setFormData(prev => ({ ...prev, primary_mos: mosId }));
    };

    const acceptWaiver = (waiverId) => {
        // Just add to local state - we'll save these when creating the application
        setFormData(prev => ({
            ...prev,
            accepted_waivers: [...prev.accepted_waivers, waiverId]
        }));
    };

    const validateStep = () => {
        setError(null);

        switch (currentStep) {
            case 2: // Basic Info
                if (!formData.first_name || !formData.last_name || !formData.email) {
                    setError('Please complete all required fields');
                    return false;
                }
                if (!formData.timezone || !formData.country) {
                    setError('Please select your timezone and country');
                    return false;
                }
                break;

            case 3: // Branch Selection
                if (!formData.branch) {
                    setError('Please select a branch');
                    return false;
                }
                break;

            case 4: // Primary Unit (Squadron/Company)
                if (!formData.primary_unit) {
                    setError('Please select a squadron or company');
                    return false;
                }
                break;

            case 5: // Secondary Unit (Division/Platoon)
                if (!formData.secondary_unit) {
                    setError('Please select a division or platoon');
                    return false;
                }
                break;

            case 6: // Career Track
                if (!formData.career_track) {
                    setError('Please select a career track');
                    return false;
                }
                break;

            case 7: // MOS Selection
                if (!formData.primary_mos) {
                    setError('Please select a Military Occupational Specialty (MOS)');
                    return false;
                }
                break;

            case 8: // Experience
                if (!formData.previous_experience || formData.previous_experience.length < 50) {
                    setError('Please provide your experience (minimum 50 characters)');
                    return false;
                }
                if (!formData.reason_for_joining || formData.reason_for_joining.length < 50) {
                    setError('Please explain why you want to join (minimum 50 characters)');
                    return false;
                }
                break;

            case 9: // Role-specific
                if (!formData.weekly_availability_hours) {
                    setError('Please indicate your weekly availability');
                    return false;
                }
                if (formData.career_track === 'officer' && !formData.leadership_experience) {
                    setError('Please describe your leadership experience');
                    return false;
                }
                if (formData.career_track === 'warrant' && !formData.technical_experience) {
                    setError('Please describe your technical/flight experience');
                    return false;
                }
                break;

            case 10: // Waivers
                const requiredWaivers = recruitmentData?.waivers?.filter(w => w.is_required) || [];
                const allAccepted = requiredWaivers.every(w =>
                    formData.accepted_waivers.includes(w.id)
                );
                if (!allAccepted) {
                    setError('Please accept all required acknowledgments');
                    return false;
                }
                break;
        }

        return true;
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        // Clear any previous errors
        setError(null);

        // Don't create application early since API requires fields from later steps
        // Just save locally and move to next step
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        // Clear any errors when going back
        setError(null);

        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Ensure we have an application ID
            let currentAppId = applicationId;

            if (!currentAppId) {
                console.log('Creating application with complete form data...');
                currentAppId = await createApplication();
                if (!currentAppId) {
                    throw new Error('Failed to create application for submission');
                }

                // If we have waivers to accept, do it now
                if (formData.accepted_waivers.length > 0) {
                    console.log('Accepting waivers for new application...');
                    for (const waiverId of formData.accepted_waivers) {
                        try {
                            await api.post(`/onboarding/applications/${currentAppId}/accept-waiver/`, {
                                waiver_type_id: waiverId
                            });
                        } catch (err) {
                            console.error('Failed to accept waiver:', waiverId, err);
                        }
                    }
                }
            } else {
                // Save any last-minute changes
                console.log('Saving final changes before submission...');
                await autoSaveProgress();
            }

            // Now submit the application
            console.log('Submitting application with ID:', currentAppId);

            const submitData = {
                confirm_submission: true,
                accept_all_waivers: true
            };

            console.log('Submit data:', submitData);

            const response = await api.post(`/onboarding/applications/${currentAppId}/submit/`, submitData);

            console.log('Application submitted successfully:', response.data);

            // Success! Redirect to profile
            navigate(`/profile/${currentUser.id}`);

        } catch (err) {
            console.error('Error in submission process:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Error status:', err.response.status);
            }

            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                if (typeof errors === 'object' && !Array.isArray(errors)) {
                    // If errors is an object with field-specific errors
                    const errorMessages = Object.entries(errors).map(([field, msgs]) =>
                        `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
                    );
                    setError(errorMessages.join('; '));
                } else if (Array.isArray(errors)) {
                    setError(errors.join(', '));
                } else {
                    setError('Failed to submit application. Please check all required fields.');
                }
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Failed to submit application. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Get branch type from abbreviation
    const getBranchType = (branchId) => {
        const branch = recruitmentData?.branches?.find(b => b.id === branchId);
        return branch?.abbreviation?.toLowerCase() || 'navy';
    };

    const getUnitTypeLabel = (isPrimary = true) => {
        const branchType = getBranchType(formData.branch);
        if (isPrimary) {
            return branchType === 'ueen' ? 'Squadron' : 'Company';
        } else {
            return branchType === 'ueen' ? 'Division' : 'Platoon';
        }
    };

    const progressPercentage = (currentStep / totalSteps) * 100;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <WelcomeStep />;
            case 2:
                return <BasicInfoStep
                    formData={formData}
                    onChange={handleInputChange}
                    currentUser={currentUser}
                />;
            case 3:
                return <BranchSelectionStep
                    branches={recruitmentData?.branches || []}
                    selectedBranch={formData.branch}
                    onSelect={handleBranchSelect}
                />;
            case 4:
                return <PrimaryUnitStep
                    units={primaryUnits}
                    selectedUnit={formData.primary_unit}
                    onSelect={handlePrimaryUnitSelect}
                    unitType={getUnitTypeLabel(true)}
                    isLoading={isLoadingData}
                />;
            case 5:
                return <SecondaryUnitStep
                    units={secondaryUnits}
                    selectedUnit={formData.secondary_unit}
                    onSelect={handleSecondaryUnitSelect}
                    unitType={getUnitTypeLabel(false)}
                    isLoading={isLoadingData}
                    primaryUnit={primaryUnits.find(u => u.id === formData.primary_unit)}
                />;
            case 6:
                return <CareerTrackStep
                    tracks={recruitmentData?.career_tracks || []}
                    selectedTrack={formData.career_track}
                    onSelect={handleCareerTrackSelect}
                />;
            case 7:
                return <MOSSelectionStep
                    mosList={mosList}
                    selectedMOS={formData.primary_mos}
                    onSelect={handleMOSSelect}
                    isLoading={isLoadingData}
                />;
            case 8:
                return <ExperienceStep
                    formData={formData}
                    onChange={handleInputChange}
                />;
            case 9:
                return <RoleSpecificStep
                    formData={formData}
                    careerTrack={formData.career_track}
                    onChange={handleInputChange}
                />;
            case 10:
                return <WaiversStep
                    waivers={recruitmentData?.waivers || []}
                    acceptedWaivers={formData.accepted_waivers}
                    onAccept={acceptWaiver}
                    formData={formData}
                    recruitmentData={recruitmentData}
                />;
            default:
                return null;
        }
    };

    // Display loading during initialization
    if (isLoading && currentStep === 1) {
        return (
            <div className="application-container">
                <div className="loading-container">
                    <Loader className="spinning" size={40} />
                    <p>INITIALIZING RECRUITMENT INTERFACE...</p>
                </div>
            </div>
        );
    }

    // Display full-screen loading during submission
    if (isLoading && currentStep === totalSteps && !applicationId) {
        return (
            <div className="application-container">
                <div className="loading-container">
                    <Loader className="spinning" size={40} />
                    <p>CREATING APPLICATION...</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Please wait while we process your information
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="application-container">
            {/* Header */}
            <div className="application-header">
                <div className="division-emblem">
                    <Rocket size={40} />
                </div>
                <h1>5TH EXPEDITIONARY GROUP</h1>
                <p>RECRUITMENT & ENLISTMENT PORTAL</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                </div>
                <div className="step-indicator">
                    PHASE {currentStep} OF {totalSteps}
                    {isSaving && (
                        <span className="save-indicator" style={{ marginLeft: '1rem', fontSize: '0.875rem', color: 'var(--rsi-cyan)' }}>
                            <Save size={14} /> Saving...
                        </span>
                    )}
                    {lastSaved && !isSaving && (
                        <span className="last-saved" style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Last saved: {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    {applicationId && (
                        <span className="app-id" style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--success-color)' }}>
                            ✓ Application ID: {applicationId.substring(0, 8)}...
                        </span>
                    )}
                    {!applicationId && currentStep > 1 && currentStep < totalSteps && (
                        <span className="local-save" style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ℹ Data saved locally
                        </span>
                    )}
                    {!applicationId && currentStep === totalSteps && (
                        <span className="no-app-id" style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--info-color)' }}>
                            ℹ Application will be created on submission
                        </span>
                    )}
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
                        disabled={isLoading || isLoadingData}
                    >
                        {currentStep === 1 ? 'Begin Enlistment' : 'Continue'}
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
                                {applicationId ? 'Submitting...' : 'Creating Application...'}
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
        <h2>ENLISTMENT PORTAL</h2>
        <p className="step-description">
            Welcome to the 5th Expeditionary Group recruitment system.
            Your application will be processed through our automated intake protocol.
        </p>

        <div className="features">
            <div className="feature-card">
                <h3><Shield size={24} className="feature-icon" />OPERATIONAL EXCELLENCE</h3>
                <p>Join an elite military simulation unit operating within the Star Citizen universe with tactical precision and strategic depth.</p>
            </div>
            <div className="feature-card">
                <h3><Users size={24} className="feature-icon" />STRUCTURED PROGRESSION</h3>
                <p>Clear rank structure, specialized training programs, and defined career paths from enlisted to officer tracks.</p>
            </div>
            <div className="feature-card">
                <h3><Target size={24} className="feature-icon" />MISSION FOCUSED</h3>
                <p>Regular operations, training exercises, and coordinated fleet actions across multiple star systems.</p>
            </div>
        </div>

        <div className="feature-card requirements">
            <h3><AlertCircle size={20} /> MINIMUM REQUIREMENTS</h3>
            <ul>
                <li>Active Star Citizen game package</li>
                <li>Discord account with voice capability</li>
                <li>Minimum age: 16 years</li>
                <li>English communication proficiency</li>
                <li>2+ operations per month commitment</li>
            </ul>
        </div>

        <div className="feature-card highlight">
            <h3><Compass size={20} /> APPLICATION PROCESS</h3>
            <p>This application consists of 10 phases. Your information is saved locally as you progress through each step.
                Your application will be created and submitted to our servers when you complete all steps and click submit.
                Upon completion, you will receive confirmation via Discord and gain access to your recruit profile.</p>
        </div>
    </div>
);

const BasicInfoStep = ({ formData, onChange, currentUser }) => (
    <div className="basic-info">
        <h2>PERSONNEL IDENTIFICATION</h2>
        <p className="step-description">Provide your basic identification and contact information</p>

        <div className="form-row">
            <div className="form-group">
                <label>First Name *</label>
                <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => onChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required
                />
            </div>
            <div className="form-group">
                <label>Last Name *</label>
                <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => onChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
                />
            </div>
        </div>

        <div className="form-group">
            <label>Email Address *</label>
            <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="your@email.com"
                required
            />
            <small>Used for important unit communications</small>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Timezone *</label>
                <select
                    value={formData.timezone}
                    onChange={(e) => onChange('timezone', e.target.value)}
                    required
                >
                    <option value="">Select timezone...</option>
                    <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
                    <option value="America/Denver">Mountain (MST/MDT)</option>
                    <option value="America/Chicago">Central (CST/CDT)</option>
                    <option value="America/New_York">Eastern (EST/EDT)</option>
                    <option value="Europe/London">GMT/BST</option>
                    <option value="Europe/Paris">Central European</option>
                    <option value="Australia/Sydney">Australian Eastern</option>
                    <option value="Asia/Tokyo">Japan Standard</option>
                </select>
            </div>
            <div className="form-group">
                <label>Country *</label>
                <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => onChange('country', e.target.value)}
                    placeholder="Your country"
                    required
                />
            </div>
        </div>

        <div className="info-card">
            <h4><User size={16} /> Discord Identity</h4>
            <p>Logged in as: <strong>{currentUser?.username}</strong></p>
            <p className="text-muted">Discord ID: {currentUser?.discord_id}</p>
        </div>
    </div>
);

const BranchSelectionStep = ({ branches, selectedBranch, onSelect }) => (
    <div className="branch-selection">
        <h2>SELECT BRANCH</h2>
        <p className="step-description">Choose your preferred military branch within the 5th Expeditionary Group</p>

        <div className="unit-cards">
            {branches.map(branch => (
                <div
                    key={branch.id}
                    className={`unit-card ${selectedBranch === branch.id ? 'selected' : ''}`}
                    onClick={() => onSelect(branch.id)}
                >
                    <div className="unit-header">
                        <div className={`unit-icon ${branch.abbreviation?.toLowerCase()}-icon`}>
                            {branch.abbreviation === 'UEEN' && <Anchor size={24} />}
                            {branch.abbreviation === 'UEEM' && <Shield size={24} />}
                            {branch.abbreviation === 'UEEA' && <Target size={24} />}
                            {!['UEEN', 'UEEM', 'UEEA'].includes(branch.abbreviation) && <Star size={24} />}
                        </div>
                        <div className="unit-info">
                            <h3>{branch.name}</h3>
                            <p>{branch.abbreviation}</p>
                        </div>
                    </div>
                    <div className="unit-details">
                        <p className="unit-description">{branch.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const PrimaryUnitStep = ({ units, selectedUnit, onSelect, unitType, isLoading }) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>LOADING {unitType.toUpperCase()} DATA...</p>
            </div>
        );
    }

    const openUnits = units.filter(u =>
        u.recruitment_status === 'open' || u.recruitment_status === 'limited'
    );

    return (
        <div className="brigade-selection">
            <h2>SELECT {unitType.toUpperCase()}</h2>
            <p className="step-description">Choose your primary operational {unitType.toLowerCase()}</p>

            {openUnits.length > 0 ? (
                <div className="unit-cards">
                    {openUnits.map(unit => (
                        <div
                            key={unit.id}
                            className={`unit-card ${selectedUnit === unit.id ? 'selected' : ''}`}
                            onClick={() => onSelect(unit.id)}
                        >
                            <div className="unit-header">
                                <div className="unit-icon">
                                    <Globe size={24} />
                                </div>
                                <div className="unit-info">
                                    <h3>{unit.name}</h3>
                                    {unit.motto && <p>"{unit.motto}"</p>}
                                </div>
                            </div>
                            <div className="unit-details">
                                <p className="unit-description">{unit.description}</p>
                                <div className="unit-stats">
                                    <div className="stat-item">
                                        <div>STATUS</div>
                                        <div className={`stat-value ${unit.recruitment_status}`}>
                                            {unit.recruitment_status?.toUpperCase() || 'OPEN'}
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div>SLOTS</div>
                                        <div className="stat-value">{unit.available_slots || 0}</div>
                                    </div>
                                </div>
                                {unit.recruitment_notes && (
                                    <p className="recruitment-notes">{unit.recruitment_notes}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-brigades-message">
                    <AlertCircle size={48} />
                    <h3>No {unitType}s Currently Recruiting</h3>
                    <p>All {unitType.toLowerCase()}s are at operational capacity. Please check back later or contact recruitment.</p>
                </div>
            )}
        </div>
    );
};

const SecondaryUnitStep = ({ units, selectedUnit, onSelect, unitType, isLoading, primaryUnit }) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>LOADING {unitType.toUpperCase()} ASSIGNMENTS...</p>
            </div>
        );
    }

    // Note: The API should already filter these, but double-check
    const availableUnits = units.filter(u =>
        (u.available_slots > 0 || u.recruitment_status === 'open')
    );

    return (
        <div className="platoon-selection">
            <h2>SELECT {unitType.toUpperCase()}</h2>
            <p className="step-description">Choose your {unitType.toLowerCase()} assignment within {primaryUnit?.name || 'your unit'}</p>

            <div className="platoon-grid">
                {availableUnits.map(unit => (
                    <div
                        key={unit.id}
                        className={`platoon-card ${selectedUnit === unit.id ? 'selected' : ''}`}
                        onClick={() => onSelect(unit.id)}
                    >
                        <div className="platoon-header">
                            <span className="platoon-designation">{unit.name || unit.designation}</span>
                            {unit.unit_type && <span className="platoon-type">{unit.unit_type}</span>}
                        </div>
                        <div className="platoon-info">
                            {unit.current_strength !== undefined && unit.max_strength !== undefined && (
                                <span className="platoon-strength">
                                    Strength: {unit.current_strength}/{unit.max_strength}
                                </span>
                            )}
                            <span className="platoon-slots slots-available">
                                {unit.available_slots || 0} slots available
                            </span>
                        </div>
                        {unit.leader && (
                            <div className="platoon-details">
                                Leader: {unit.leader}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {availableUnits.length === 0 && (
                <div className="no-brigades-message">
                    <AlertCircle size={48} />
                    <h3>No {unitType}s Available</h3>
                    <p>All {unitType.toLowerCase()}s are at capacity. Contact recruitment for assistance.</p>
                </div>
            )}
        </div>
    );
};

const CareerTrackStep = ({ tracks, selectedTrack, onSelect }) => (
    <div className="career-selection">
        <h2>SELECT CAREER TRACK</h2>
        <p className="step-description">Choose your service path within the 5th Expeditionary Group</p>

        <div className="career-paths">
            {tracks.map(track => (
                <div
                    key={track.value}
                    className={`career-card ${selectedTrack === track.value ? 'selected' : ''}`}
                    onClick={() => onSelect(track.value)}
                >
                    <div className="career-header">
                        <div className={`career-icon ${track.value}-icon`}>
                            {track.value === 'enlisted' && <Award size={24} />}
                            {track.value === 'warrant' && <Plane size={24} />}
                            {track.value === 'officer' && <Shield size={24} />}
                        </div>
                        <div className="career-info">
                            <h3>{track.label}</h3>
                        </div>
                    </div>
                    <div className="career-details">
                        <p>{track.description}</p>
                        {track.requirements.length > 0 && (
                            <div className="requirements">
                                <strong>Requirements:</strong>
                                <ul>
                                    {track.requirements.map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MOSSelectionStep = ({ mosList, selectedMOS, onSelect, isLoading }) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader className="spinning" size={40} />
                <p>LOADING AVAILABLE POSITIONS...</p>
            </div>
        );
    }

    // Sort by available slots if not already sorted
    const sortedMosList = [...mosList].sort((a, b) => (b.available_slots || 0) - (a.available_slots || 0));

    return (
        <div className="mos-selection">
            <h2>SELECT MILITARY OCCUPATIONAL SPECIALTY</h2>
            <p className="step-description">Choose from available positions in your selected unit</p>

            {sortedMosList.length > 0 ? (
                <div className="mos-grid">
                    {sortedMosList.map(mos => (
                        <div
                            key={mos.id}
                            className={`mos-card ${selectedMOS === mos.id ? 'selected' : ''}`}
                            onClick={() => onSelect(mos.id)}
                        >
                            <div className="mos-header">
                                <div className="mos-icon">
                                    <Briefcase size={20} />
                                </div>
                                <div className="mos-info">
                                    <h4>{mos.code}</h4>
                                    <p>{mos.title}</p>
                                </div>
                            </div>
                            {mos.description && (
                                <p className="mos-description">{mos.description}</p>
                            )}
                            <div className="mos-details">
                                <div className="mos-stat">
                                    <span className="stat-label">Open Slots:</span>
                                    <span className="stat-value" style={{
                                        color: mos.available_slots > 3 ? 'var(--success-color)' :
                                            mos.available_slots > 0 ? 'var(--warning-color)' :
                                                'var(--error-color)'
                                    }}>
                                        {mos.available_slots || 0}
                                    </span>
                                </div>
                                <div className="mos-stat">
                                    <span className="stat-label">Training:</span>
                                    <span className="stat-value">{mos.ait_weeks || 'TBD'} weeks</span>
                                </div>
                            </div>
                            {mos.roles && mos.roles.length > 0 && (
                                <div className="mos-positions">
                                    <span className="positions-label">Available roles:</span>
                                    <div className="roles-list">
                                        {mos.roles.map((role, idx) => (
                                            <div key={idx} className="role-item">{role}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {mos.available_slots === 1 && (
                                <div className="limited-availability">
                                    <AlertCircle size={14} />
                                    <span>Only 1 slot remaining</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-brigades-message">
                    <AlertCircle size={48} />
                    <h3>No Positions Available</h3>
                    <p>There are currently no open positions for your selected career track in this unit. Please try selecting a different unit or career track.</p>
                </div>
            )}
        </div>
    );
};

const ExperienceStep = ({ formData, onChange }) => (
    <div className="experience-info">
        <h2>SERVICE BACKGROUND</h2>
        <p className="step-description">Provide information about your experience and motivation</p>

        <div className="form-group">
            <label>Previous Military Simulation Experience *</label>
            <textarea
                placeholder="Describe any previous experience in military simulation games, organized units, or similar activities. Include specific games, units, ranks achieved, and time served... (minimum 50 characters)"
                value={formData.previous_experience}
                onChange={(e) => onChange('previous_experience', e.target.value)}
                rows={6}
            />
            <small>Character count: {formData.previous_experience.length}/50 minimum</small>
        </div>

        <div className="form-group">
            <label>Reason for Joining the 5th Expeditionary Group *</label>
            <textarea
                placeholder="Explain why you want to join our unit specifically. What attracted you to the 5th EXG? What are your goals within our organization?... (minimum 50 characters)"
                value={formData.reason_for_joining}
                onChange={(e) => onChange('reason_for_joining', e.target.value)}
                rows={6}
            />
            <small>Character count: {formData.reason_for_joining.length}/50 minimum</small>
        </div>
    </div>
);

const RoleSpecificStep = ({ formData, careerTrack, onChange }) => (
    <div className="role-specific-info">
        <h2>OPERATIONAL REQUIREMENTS</h2>
        <p className="step-description">Provide role-specific information and availability</p>

        <div className="form-group">
            <label>Weekly Availability (Hours) *</label>
            <select
                value={formData.weekly_availability_hours || ''}
                onChange={(e) => onChange('weekly_availability_hours', parseInt(e.target.value))}
            >
                <option value="">Select hours per week...</option>
                <option value="5">5-10 hours</option>
                <option value="10">10-15 hours</option>
                <option value="15">15-20 hours</option>
                <option value="20">20-30 hours</option>
                <option value="30">30+ hours</option>
            </select>
        </div>

        <div className="form-group">
            <label>
                <input
                    type="checkbox"
                    checked={formData.can_attend_mandatory_events}
                    onChange={(e) => onChange('can_attend_mandatory_events', e.target.checked)}
                />
                I can attend mandatory unit operations (minimum 2 per month)
            </label>
        </div>

        {careerTrack === 'officer' && (
            <div className="form-group">
                <label>Leadership Experience *</label>
                <textarea
                    placeholder="Describe your leadership experience in gaming communities, real life, or military service..."
                    value={formData.leadership_experience}
                    onChange={(e) => onChange('leadership_experience', e.target.value)}
                    rows={4}
                />
            </div>
        )}

        {careerTrack === 'warrant' && (
            <div className="form-group">
                <label>Technical/Flight Experience *</label>
                <textarea
                    placeholder="Describe your flight experience in Star Citizen or other simulation games. Include hours flown and aircraft types..."
                    value={formData.technical_experience}
                    onChange={(e) => onChange('technical_experience', e.target.value)}
                    rows={4}
                />
            </div>
        )}

        <div className="info-card requirements">
            <h4><AlertCircle size={16} /> Operational Commitments</h4>
            <ul>
                <li>Minimum 2 operations per month</li>
                <li>Weekly training participation encouraged</li>
                <li>Discord voice communications required</li>
                <li>Adherence to chain of command</li>
                <li>Professional conduct at all times</li>
            </ul>
        </div>
    </div>
);

const WaiversStep = ({ waivers, acceptedWaivers, onAccept, formData, recruitmentData }) => {
    const requiredWaivers = waivers.filter(w => w.is_required);
    const optionalWaivers = waivers.filter(w => !w.is_required);

    // Get labels for display
    const getBranchName = (branchId) => {
        const branch = recruitmentData?.branches?.find(b => b.id === branchId);
        return branch?.name || 'Unknown Branch';
    };

    const getCareerTrackLabel = (track) => {
        const trackData = recruitmentData?.career_tracks?.find(t => t.value === track);
        return trackData?.label || track;
    };

    return (
        <div className="agreement-section">
            <h2>ACKNOWLEDGMENTS & WAIVERS</h2>
            <p className="step-description">Review and accept the following acknowledgments</p>

            {/* Summary of Application */}
            <div className="info-card" style={{ marginBottom: '2rem' }}>
                <h4><FileText size={16} /> Application Summary</h4>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div><strong>Name:</strong> {formData.first_name} {formData.last_name}</div>
                    <div><strong>Branch:</strong> {formData.branch ? getBranchName(formData.branch) : 'Not selected'}</div>
                    <div><strong>Career Track:</strong> {formData.career_track ? getCareerTrackLabel(formData.career_track) : 'Not selected'}</div>
                    <div><strong>Weekly Availability:</strong> {formData.weekly_availability_hours || 0} hours</div>
                </div>
            </div>

            {requiredWaivers.map(waiver => (
                <div key={waiver.id} className="agreement-item">
                    <h4>{waiver.title} *</h4>
                    <p>{waiver.description}</p>
                    {waiver.content && (
                        <div className="waiver-content">
                            {waiver.content}
                        </div>
                    )}
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id={`waiver-${waiver.id}`}
                            checked={acceptedWaivers.includes(waiver.id)}
                            onChange={() => !acceptedWaivers.includes(waiver.id) && onAccept(waiver.id)}
                        />
                        <label htmlFor={`waiver-${waiver.id}`}>
                            I acknowledge and accept the {waiver.title}
                        </label>
                    </div>
                </div>
            ))}

            {optionalWaivers.length > 0 && (
                <>
                    <h3>Optional Acknowledgments</h3>
                    {optionalWaivers.map(waiver => (
                        <div key={waiver.id} className="agreement-item">
                            <h4>{waiver.title}</h4>
                            <p>{waiver.description}</p>
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id={`waiver-${waiver.id}`}
                                    checked={acceptedWaivers.includes(waiver.id)}
                                    onChange={() => !acceptedWaivers.includes(waiver.id) && onAccept(waiver.id)}
                                />
                                <label htmlFor={`waiver-${waiver.id}`}>
                                    I acknowledge the {waiver.title}
                                </label>
                            </div>
                        </div>
                    ))}
                </>
            )}

            <div className="info-card highlight">
                <h4><FileText size={16} /> Final Step</h4>
                <p>By submitting this application, you confirm that all information provided is accurate and that you understand the commitments required for service in the 5th Expeditionary Group.</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--rsi-blue)' }}>
                    <strong>Note:</strong> Your application will be created and submitted when you click the Submit button below.
                </p>
            </div>
        </div>
    );
};

export default ApplicationForm;
import React, { useState, useEffect } from 'react';
import {
    Clock, UserPlus, Ship, Truck, FileText, CheckCircle, XCircle,
    Eye, MessageSquare, Calendar, AlertCircle, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import './ManagementSections.css';

const PendingActions = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [pendingItems, setPendingItems] = useState({
        applications: [],
        ships: [],
        vehicles: [],
        opords: [],
        branchApplications: []
    });

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const fetchPendingItems = async () => {
        setLoading(true);
        try {
            const [
                applicationsRes,
                shipsRes,
                vehiclesRes,
                opordsRes,
                branchAppsRes
            ] = await Promise.all([
                api.get('/onboarding/applications/?status=Pending'),
                api.get('/ships/?approval_status=Pending'),
                api.get('/vehicles/?approval_status=Pending'),
                api.get('/operations/?approval_status=Pending'),
                api.get('/onboarding/branch-applications/?status=Pending')
            ]);

            setPendingItems({
                applications: applicationsRes.data.results || applicationsRes.data || [],
                ships: shipsRes.data.results || shipsRes.data || [],
                vehicles: vehiclesRes.data.results || vehiclesRes.data || [],
                opords: opordsRes.data.results || opordsRes.data || [],
                branchApplications: branchAppsRes.data.results || branchAppsRes.data || []
            });
        } catch (error) {
            console.error('Error fetching pending items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationAction = async (applicationId, action) => {
        try {
            await api.patch(`/onboarding/applications/${applicationId}/`, {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                reviewer_notes: `${action === 'approve' ? 'Approved' : 'Rejected'} by admin`
            });
            await fetchPendingItems();
            showNotification(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
        } catch (error) {
            console.error('Error updating application:', error);
            showNotification('Failed to update application', 'error');
        }
    };

    const handleShipAction = async (shipId, action) => {
        try {
            await api.post(`/ships/${shipId}/approve/`, {
                approval_status: action === 'approve' ? 'Approved' : 'Rejected'
            });
            await fetchPendingItems();
            showNotification(`Ship ${action === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
        } catch (error) {
            console.error('Error updating ship:', error);
            showNotification('Failed to update ship', 'error');
        }
    };

    const handleVehicleAction = async (vehicleId, action) => {
        try {
            await api.patch(`/vehicles/${vehicleId}/`, {
                approval_status: action === 'approve' ? 'Approved' : 'Rejected'
            });
            await fetchPendingItems();
            showNotification(`Vehicle ${action === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
        } catch (error) {
            console.error('Error updating vehicle:', error);
            showNotification('Failed to update vehicle', 'error');
        }
    };

    const handleOpordAction = async (opordId, action) => {
        try {
            await api.post(`/operations/${opordId}/approve/`, {
                approval_status: action === 'approve' ? 'Approved' : 'Rejected'
            });
            await fetchPendingItems();
            showNotification(`OPORD ${action === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
        } catch (error) {
            console.error('Error updating OPORD:', error);
            showNotification('Failed to update OPORD', 'error');
        }
    };

    const handleBranchApplicationAction = async (applicationId, action) => {
        try {
            await api.patch(`/onboarding/branch-applications/${applicationId}/`, {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                reviewer_notes: `${action === 'approve' ? 'Approved' : 'Rejected'} by admin`
            });
            await fetchPendingItems();
            showNotification(`Branch application ${action === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
        } catch (error) {
            console.error('Error updating branch application:', error);
            showNotification('Failed to update branch application', 'error');
        }
    };

    const showNotification = (message, type) => {
        // Implementation for showing notifications
        console.log(`${type}: ${message}`);
    };

    const getTotalPending = () => {
        return (
            pendingItems.applications.length +
            pendingItems.ships.length +
            pendingItems.vehicles.length +
            pendingItems.opords.length +
            pendingItems.branchApplications.length
        );
    };

    const tabs = [
        { id: 'all', label: 'All', count: getTotalPending() },
        { id: 'applications', label: 'Applications', count: pendingItems.applications.length, icon: UserPlus },
        { id: 'ships', label: 'Ships', count: pendingItems.ships.length, icon: Ship },
        { id: 'vehicles', label: 'Vehicles', count: pendingItems.vehicles.length, icon: Truck },
        { id: 'opords', label: 'OPORDs', count: pendingItems.opords.length, icon: FileText },
        { id: 'branch', label: 'Branch Apps', count: pendingItems.branchApplications.length, icon: MessageSquare }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading pending actions...</p>
            </div>
        );
    }

    return (
        <div className="pending-actions-section">
            <div className="pending-header">
                <div className="pending-title">
                    <Clock size={24} />
                    <h2>Pending Actions</h2>
                    <span className="total-badge">{getTotalPending()} items need attention</span>
                </div>
            </div>

            <div className="pending-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon && <tab.icon size={18} />}
                        <span>{tab.label}</span>
                        {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
                    </button>
                ))}
            </div>

            <div className="pending-content">
                {getTotalPending() === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} />
                        <h3>All caught up!</h3>
                        <p>No pending actions at this time</p>
                    </div>
                ) : (
                    <>
                        {(activeTab === 'all' || activeTab === 'applications') && pendingItems.applications.length > 0 && (
                            <div className="pending-section">
                                <h3 className="pending-section-title">
                                    <UserPlus size={20} />
                                    Pending Applications
                                </h3>
                                <div className="pending-cards">
                                    {pendingItems.applications.map(app => (
                                        <ApplicationCard
                                            key={app.id}
                                            application={app}
                                            onApprove={() => handleApplicationAction(app.id, 'approve')}
                                            onReject={() => handleApplicationAction(app.id, 'reject')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'all' || activeTab === 'ships') && pendingItems.ships.length > 0 && (
                            <div className="pending-section">
                                <h3 className="pending-section-title">
                                    <Ship size={20} />
                                    Pending Ships
                                </h3>
                                <div className="pending-cards">
                                    {pendingItems.ships.map(ship => (
                                        <ShipCard
                                            key={ship.id}
                                            ship={ship}
                                            onApprove={() => handleShipAction(ship.id, 'approve')}
                                            onReject={() => handleShipAction(ship.id, 'reject')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'all' || activeTab === 'vehicles') && pendingItems.vehicles.length > 0 && (
                            <div className="pending-section">
                                <h3 className="pending-section-title">
                                    <Truck size={20} />
                                    Pending Vehicles
                                </h3>
                                <div className="pending-cards">
                                    {pendingItems.vehicles.map(vehicle => (
                                        <VehicleCard
                                            key={vehicle.id}
                                            vehicle={vehicle}
                                            onApprove={() => handleVehicleAction(vehicle.id, 'approve')}
                                            onReject={() => handleVehicleAction(vehicle.id, 'reject')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'all' || activeTab === 'opords') && pendingItems.opords.length > 0 && (
                            <div className="pending-section">
                                <h3 className="pending-section-title">
                                    <FileText size={20} />
                                    Pending Operation Orders
                                </h3>
                                <div className="pending-cards">
                                    {pendingItems.opords.map(opord => (
                                        <OpordCard
                                            key={opord.id}
                                            opord={opord}
                                            onApprove={() => handleOpordAction(opord.id, 'approve')}
                                            onReject={() => handleOpordAction(opord.id, 'reject')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'all' || activeTab === 'branch') && pendingItems.branchApplications.length > 0 && (
                            <div className="pending-section">
                                <h3 className="pending-section-title">
                                    <MessageSquare size={20} />
                                    Pending Branch Applications
                                </h3>
                                <div className="pending-cards">
                                    {pendingItems.branchApplications.map(app => (
                                        <BranchApplicationCard
                                            key={app.id}
                                            application={app}
                                            onApprove={() => handleBranchApplicationAction(app.id, 'approve')}
                                            onReject={() => handleBranchApplicationAction(app.id, 'reject')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Card Components
const ApplicationCard = ({ application, onApprove, onReject }) => {
    return (
        <div className="pending-card">
            <div className="card-header">
                <h4>{application.username}</h4>
                <span className="time-badge">
                    <Calendar size={14} />
                    {new Date(application.submission_date).toLocaleDateString()}
                </span>
            </div>
            <div className="card-content">
                <div className="info-row">
                    <span className="label">Discord ID:</span>
                    <span className="value">{application.discord_id}</span>
                </div>
                <div className="info-row">
                    <span className="label">Preferred Branch:</span>
                    <span className="value">{application.preferred_branch_name || 'Any'}</span>
                </div>
                <div className="info-row">
                    <span className="label">Preferred Unit:</span>
                    <span className="value">{application.preferred_unit_name || 'Any'}</span>
                </div>
                <div className="motivation-preview">
                    <strong>Motivation:</strong>
                    <p>{application.motivation}</p>
                </div>
            </div>
            <div className="card-actions">
                <button className="action-btn approve" onClick={onApprove}>
                    <CheckCircle size={16} />
                    Approve
                </button>
                <button className="action-btn reject" onClick={onReject}>
                    <XCircle size={16} />
                    Reject
                </button>
                <button className="action-btn view">
                    <Eye size={16} />
                    View Details
                </button>
            </div>
        </div>
    );
};

const ShipCard = ({ ship, onApprove, onReject }) => {
    return (
        <div className="pending-card">
            <div className="card-header">
                <h4>{ship.name}</h4>
                <span className="class-badge">{ship.class_type}</span>
            </div>
            {ship.primary_image_url && (
                <img src={ship.primary_image_url} alt={ship.name} className="card-image" />
            )}
            <div className="card-content">
                <div className="info-row">
                    <span className="label">Owner:</span>
                    <span className="value">{ship.owner_username}</span>
                </div>
                <div className="info-row">
                    <span className="label">Manufacturer:</span>
                    <span className="value">{ship.manufacturer}</span>
                </div>
                <div className="info-row">
                    <span className="label">Primary Role:</span>
                    <span className="value">{ship.primary_role}</span>
                </div>
                {ship.is_flagship && <span className="flagship-badge">FLAGSHIP</span>}
            </div>
            <div className="card-actions">
                <button className="action-btn approve" onClick={onApprove}>
                    <CheckCircle size={16} />
                    Approve
                </button>
                <button className="action-btn reject" onClick={onReject}>
                    <XCircle size={16} />
                    Reject
                </button>
                <button className="action-btn view">
                    <Eye size={16} />
                    View Details
                </button>
            </div>
        </div>
    );
};

const VehicleCard = ({ vehicle, onApprove, onReject }) => {
    return (
        <div className="pending-card">
            <div className="card-header">
                <h4>{vehicle.name}</h4>
                <span className="type-badge">{vehicle.vehicle_type}</span>
            </div>
            {vehicle.image_url && (
                <img src={vehicle.image_url} alt={vehicle.name} className="card-image" />
            )}
            <div className="card-content">
                <div className="info-row">
                    <span className="label">Model:</span>
                    <span className="value">{vehicle.model}</span>
                </div>
                <div className="info-row">
                    <span className="label">Serial Number:</span>
                    <span className="value">{vehicle.serial_number}</span>
                </div>
                <div className="info-row">
                    <span className="label">Assigned Unit:</span>
                    <span className="value">{vehicle.assigned_unit_name || 'None'}</span>
                </div>
                <div className="info-row">
                    <span className="label">Crew Size:</span>
                    <span className="value">{vehicle.crew_size}</span>
                </div>
            </div>
            <div className="card-actions">
                <button className="action-btn approve" onClick={onApprove}>
                    <CheckCircle size={16} />
                    Approve
                </button>
                <button className="action-btn reject" onClick={onReject}>
                    <XCircle size={16} />
                    Reject
                </button>
                <button className="action-btn view">
                    <Eye size={16} />
                    View Details
                </button>
            </div>
        </div>
    );
};

const OpordCard = ({ opord, onApprove, onReject }) => {
    return (
        <div className="pending-card">
            <div className="card-header">
                <h4>{opord.operation_name}</h4>
                <span className="classification-badge">{opord.classification}</span>
            </div>
            <div className="card-content">
                <div className="info-row">
                    <span className="label">Creator:</span>
                    <span className="value">{opord.creator_username}</span>
                </div>
                <div className="info-row">
                    <span className="label">Event:</span>
                    <span className="value">{opord.event_title || 'No event linked'}</span>
                </div>
                <div className="info-row">
                    <span className="label">Version:</span>
                    <span className="value">v{opord.version}</span>
                </div>
                <div className="info-row">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(opord.created_at).toLocaleDateString()}</span>
                </div>
            </div>
            <div className="card-actions">
                <button className="action-btn approve" onClick={onApprove}>
                    <CheckCircle size={16} />
                    Approve
                </button>
                <button className="action-btn reject" onClick={onReject}>
                    <XCircle size={16} />
                    Reject
                </button>
                <button className="action-btn view">
                    <Eye size={16} />
                    View OPORD
                </button>
            </div>
        </div>
    );
};

const BranchApplicationCard = ({ application, onApprove, onReject }) => {
    return (
        <div className="pending-card">
            <div className="card-header">
                <h4>{application.user_username}</h4>
                <span className="type-badge">{application.application_type}</span>
            </div>
            <div className="card-content">
                <div className="info-row">
                    <span className="label">Branch:</span>
                    <span className="value">{application.branch_name}</span>
                </div>
                <div className="info-row">
                    <span className="label">Applied:</span>
                    <span className="value">{new Date(application.submission_date).toLocaleDateString()}</span>
                </div>
                <div className="motivation-preview">
                    <strong>Motivation:</strong>
                    <p>{application.motivation}</p>
                </div>
                {application.preferred_role && (
                    <div className="info-row">
                        <span className="label">Preferred Role:</span>
                        <span className="value">{application.preferred_role}</span>
                    </div>
                )}
            </div>
            <div className="card-actions">
                <button className="action-btn approve" onClick={onApprove}>
                    <CheckCircle size={16} />
                    Approve
                </button>
                <button className="action-btn reject" onClick={onReject}>
                    <XCircle size={16} />
                    Reject
                </button>
                <button className="action-btn view">
                    <Eye size={16} />
                    View Details
                </button>
            </div>
        </div>
    );
};

export default PendingActions;
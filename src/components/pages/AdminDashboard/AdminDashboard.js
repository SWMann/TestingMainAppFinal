import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Users, Calendar, GraduationCap, FileText, MessageSquare,
    Home, Settings, Bell, Search, Menu, X, ChevronRight, AlertCircle,
    Ship, Truck, ClipboardList, BookOpen, UserPlus, Activity,
    CheckCircle, Clock, XCircle, TrendingUp, TrendingDown, ChevronUp
} from 'lucide-react';
import './AdminDashboard.css';
import api from "../../../services/api";
import UserManagement from './sections/UserManagement';
import PendingActions from './sections/PendingActions';
import RankManagement from "./sections/RankManagement";
import UnitManagement from "./sections/UnitManagement";
import EventManagement from "./sections/EventManagement";
import OperationManagement from "./sections/OperationManagement";
// Import section components
// Note: Create these components in the admin/sections directory
// For now, we'll use placeholders
const TrainingManagement = () => <div>Training Management Section - To be implemented</div>;
const OperationsManagement = () => <div>Operations Management Section - To be implemented</div>;
const AnnouncementManagement = () => <div>Announcement Management Section - To be implemented</div>;
const ForumManagement = () => <div>Forum Management Section - To be implemented</div>;
const StandardsManagement = () => <div>Standards Management Section - To be implemented</div>;
const ShipManagement = () => <div>Ship Management Section - To be implemented</div>;
const VehicleManagement = () => <div>Vehicle Management Section - To be implemented</div>;
const OnboardingManagement = () => <div>Onboarding Management Section - To be implemented</div>;

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        pendingApplications: 0,
        pendingShips: 0,
        pendingVehicles: 0,
        totalUnits: 0,
        totalCertificates: 0,
        totalAnnouncements: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {

        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch statistics from various endpoints
            const [
                usersRes,
                eventsRes,
                applicationsRes,
                shipsRes,
                vehiclesRes,
                unitsRes,
                certificatesRes,
                announcementsRes
            ] = await Promise.all([
                api.get('/users/'),
                api.get('/events/'),
                api.get('/onboarding/applications/?status=Pending'),
                api.get('/ships/?approval_status=Pending'),
                api.get('/vehicles/?approval_status=Pending'),
                api.get('/units/'),
                api.get('/training/'),
                api.get('/announcements/')
            ]);

            const now = new Date();
            const activeUsers = usersRes.data.results?.filter(u => {
                const lastLogin = new Date(u.last_login);
                const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
                return daysSinceLogin <= 30;
            }).length || 0;

            const upcomingEvents = eventsRes.data.results?.filter(e =>
                new Date(e.start_time) > now
            ).length || 0;

            setStatistics({
                totalUsers: usersRes.data.count || usersRes.data.length || 0,
                activeUsers: activeUsers,
                totalEvents: eventsRes.data.count || eventsRes.data.length || 0,
                upcomingEvents: upcomingEvents,
                pendingApplications: applicationsRes.data.count || applicationsRes.data.length || 0,
                pendingShips: shipsRes.data.count || shipsRes.data.length || 0,
                pendingVehicles: vehiclesRes.data.count || vehiclesRes.data.length || 0,
                totalUnits: unitsRes.data.count || unitsRes.data.length || 0,
                totalCertificates: certificatesRes.data.count || certificatesRes.data.length || 0,
                totalAnnouncements: announcementsRes.data.count || announcementsRes.data.length || 0
            });

            // Simulate recent activity - in a real app, this would come from an activity log
            setRecentActivity([
                { id: 1, type: 'user', action: 'New user joined', user: 'John Doe', time: '5 minutes ago' },
                { id: 2, type: 'event', action: 'Event created', details: 'Operation Thunder', time: '1 hour ago' },
                { id: 3, type: 'promotion', action: 'User promoted', user: 'Jane Smith', details: 'to Sergeant', time: '2 hours ago' },
                { id: 4, type: 'application', action: 'New application', user: 'Mike Johnson', time: '3 hours ago' },
                { id: 5, type: 'ship', action: 'Ship approved', details: 'USS Victory', time: '5 hours ago' }
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'pending', label: 'Pending Actions', icon: Clock, badge: statistics.pendingApplications + statistics.pendingShips + statistics.pendingVehicles },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'ranks', label: 'Rank Management', icon: ChevronUp },
        { id: 'units', label: 'Units & Positions', icon: Shield },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'operations', label: 'Opord', icon: ClipboardList },
        { id: 'training', label: 'Training & Certs', icon: GraduationCap },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'forums', label: 'Forums', icon: MessageSquare },
        { id: 'standards', label: 'Standards & SOPs', icon: BookOpen },
        { id: 'ships', label: 'Ships', icon: Ship },
        { id: 'vehicles', label: 'Vehicles', icon: Truck },
        { id: 'onboarding', label: 'Onboarding', icon: UserPlus }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <OverviewSection statistics={statistics} recentActivity={recentActivity} loading={loading} />;
            case 'pending':
                return <PendingActions />;
            case 'users':
                return <UserManagement />;
            case 'units':
                return <UnitManagement />;
            case 'events':
                return <EventManagement />;
            case 'training':
                return <TrainingManagement />;
            case 'ranks':
                return <RankManagement />;
            case 'operations':
                return <OperationManagement />;
            case 'announcements':
                return <AnnouncementManagement />;
            case 'forums':
                return <ForumManagement />;
            case 'standards':
                return <StandardsManagement />;
            case 'ships':
                return <ShipManagement />;
            case 'vehicles':
                return <VehicleManagement />;
            case 'onboarding':
                return <OnboardingManagement />;
            default:
                return <OverviewSection statistics={statistics} recentActivity={recentActivity} loading={loading} />;
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>{sidebarOpen && 'Admin Panel'}</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <item.icon size={20} />
                            {sidebarOpen && (
                                <>
                                    <span>{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className="badge">{item.badge}</span>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </nav>

                {sidebarOpen && (
                    <div className="sidebar-footer">
                        <div className="admin-info">
                            <img src={user?.avatar_url} alt={user?.username} />
                            <div>
                                <div className="admin-name">{user?.username}</div>
                                <div className="admin-role">Administrator</div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>{menuItems.find(item => item.id === activeSection)?.label || 'Admin Dashboard'}</h1>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="header-button">
                            <Bell size={20} />
                        </button>
                        <button className="header-button">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

// Overview Section Component
const OverviewSection = ({ statistics, recentActivity, loading }) => {
    const statCards = [
        {
            label: 'Total Users',
            value: statistics.totalUsers,
            icon: Users,
            color: 'blue',
            subtext: `${statistics.activeUsers} active`
        },
        {
            label: 'Total Events',
            value: statistics.totalEvents,
            icon: Calendar,
            color: 'green',
            subtext: `${statistics.upcomingEvents} upcoming`
        },
        {
            label: 'Pending Applications',
            value: statistics.pendingApplications,
            icon: UserPlus,
            color: 'yellow',
            trend: 'up'
        },
        {
            label: 'Total Units',
            value: statistics.totalUnits,
            icon: Shield,
            color: 'purple'
        },
        {
            label: 'Training Certificates',
            value: statistics.totalCertificates,
            icon: GraduationCap,
            color: 'indigo'
        },
        {
            label: 'Pending Approvals',
            value: statistics.pendingShips + statistics.pendingVehicles,
            icon: Clock,
            color: 'orange',
            subtext: 'Ships & Vehicles'
        }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="overview-section">
            {/* Statistics Cards */}
            <div className="stat-cards-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                            {stat.subtext && <span className="stat-subtext">{stat.subtext}</span>}
                        </div>
                        {stat.trend && (
                            <div className={`stat-trend ${stat.trend}`}>
                                {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="overview-grid">
                <div className="activity-panel">
                    <div className="panel-header">
                        <h2>
                            <Activity size={20} />
                            Recent Activity
                        </h2>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className={`activity-icon ${activity.type}`}>
                                    {activity.type === 'user' && <Users size={16} />}
                                    {activity.type === 'event' && <Calendar size={16} />}
                                    {activity.type === 'promotion' && <ChevronRight size={16} />}
                                    {activity.type === 'application' && <UserPlus size={16} />}
                                    {activity.type === 'ship' && <Ship size={16} />}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-main">
                                        <span className="activity-action">{activity.action}</span>
                                        {activity.user && <span className="activity-user">{activity.user}</span>}
                                        {activity.details && <span className="activity-details">{activity.details}</span>}
                                    </div>
                                    <div className="activity-time">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="quick-actions-panel">
                    <div className="panel-header">
                        <h2>
                            <Settings size={20} />
                            Quick Actions
                        </h2>
                    </div>
                    <div className="quick-actions">
                        <button className="quick-action-btn">
                            <UserPlus size={20} />
                            <span>Add User</span>
                        </button>
                        <button className="quick-action-btn">
                            <Calendar size={20} />
                            <span>Create Event</span>
                        </button>
                        <button className="quick-action-btn">
                            <Bell size={20} />
                            <span>Post Announcement</span>
                        </button>
                        <button className="quick-action-btn">
                            <Shield size={20} />
                            <span>Create Unit</span>
                        </button>
                        <button className="quick-action-btn">
                            <GraduationCap size={20} />
                            <span>Issue Certificate</span>
                        </button>
                        <button className="quick-action-btn">
                            <FileText size={20} />
                            <span>Create OPORD</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="system-status-panel">
                <div className="panel-header">
                    <h2>
                        <AlertCircle size={20} />
                        System Status
                    </h2>
                </div>
                <div className="status-grid">
                    <div className="status-item success">
                        <CheckCircle size={20} />
                        <span>Database</span>
                        <span className="status-label">Operational</span>
                    </div>
                    <div className="status-item success">
                        <CheckCircle size={20} />
                        <span>API</span>
                        <span className="status-label">Online</span>
                    </div>
                    <div className="status-item success">
                        <CheckCircle size={20} />
                        <span>Discord Bot</span>
                        <span className="status-label">Connected</span>
                    </div>
                    <div className="status-item warning">
                        <AlertCircle size={20} />
                        <span>Game Server</span>
                        <span className="status-label">High Load</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
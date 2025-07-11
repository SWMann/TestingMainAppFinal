
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Home from './components/pages/Home/Home';
import DiscordCallback from './components/auth/DiscordCallback';
import NotFound from './components/pages/NotFound/NotFound';
import AdminDashboard from "./components/pages/AdminDashboard/AdminDashboard";
import ProfilePage from "./components/pages/ProfilePage/ProfilePage";
import OrganizationChart from "./components/pages/OrganizationChart/OrganizationChart";
import UserProfile from "./components/pages/ProfilePage/ProfilePage";
import UnitHierarchyEditorWrapper from "./components/pages/Test/ORBATPage";
import UnitHierarchyView from "./components/pages/UnitHierarchyPage/UnitHierarchyView"
import OperationsManager from "./components/pages/OperationViewer/OperationsPage";
import OperationsPage from "./components/pages/OperationViewer/OperationsPage";
import OperationDetailPage from "./components/pages/OperationViewer/OperationDetailPage";
import ORBATViewer from "./components/pages/Test/ORBATPage";
import ORBATPage from "./components/pages/Test/ORBATPage";
import ApplicationForm from "./components/pages/Application/Application";
import PositionsTablePage from "./components/pages/PositionsTablePage/PositionsTablePage";
import PositionTemplateManagement from "./components/pages/PositionTemplateManagement/PositionTemplateManagement";
import MOSListings from "./components/pages/MOSListings/MOSListings";
import TrainingPage from "./components/pages/TrainingPage/TrainingPage";
import RankViewer from "./components/pages/RankViewer/RankViewer";
// This will be expanded as you add more components
// For example: profile page, dashboard, settings, etc.

// Protected route wrapper - redirects to home if not authenticated
const ProtectedRoute = ({ isAuthenticated }) => {
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

// Routes configuration
const routes = (isAuthenticated) => [
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/auth/discord/callback',
        element: <DiscordCallback />
    },
    {
        path: '/AdminDashboard',
        element: <AdminDashboard />
    },
    {
        path: '/Chart',
        element: <UnitHierarchyEditorWrapper />
    },
    {
        path: '/profile',
        element: <UserProfile />  // Shows current user's profile
    },
    {
        path: '/profile/:serviceNumber',
        element: <UserProfile />  // Shows specific user's profile by service number
    },
    {
        path: '/organization-chart',
        element: <OrganizationChart />
    },
    {
        path: '/orbat',
        element: <ORBATPage />
    },
    {
        path: '/units/:unitId/orbat',
        element: <ORBATPage />
    },
    {
        path: '/operations',
        element: <OperationsPage />
    },
    {
        path: '/operations/:id',
        element: <OperationDetailPage />
    },
    {
        path: '/apply',
        element: <ApplicationForm />
    },
    {
        path: '/roster',
        element: <PositionsTablePage/>

    },
    {
        path: '/template-editor',
        element: <PositionTemplateManagement/>
    },
    {
        path: '/MOSList',
        element: <MOSListings/>
    },
    {
        path: '/training',
        element: <TrainingPage />
    },

    {
        path:'/ranks',
        element: <RankViewer/>
    },

    // Protected routes
    {
        element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
        children: [
            // Add protected routes here as you develop them
            // For example:
    // { path: '/settings', element: <Settings /> },
            // { path: '/events', element: <Events /> },
        ]
    },
    // 404 route - must be last
    {
        path: '*',
        element: <NotFound />
    }
];

export default routes;


import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Home from './components/pages/Home/Home';
import DiscordCallback from './components/auth/DiscordCallback';
import NotFound from './components/pages/NotFound/NotFound';
import AdminDashboard from "./components/pages/AdminDashboard/AdminDashboard";
import ProfilePage from "./components/pages/ProfilePage/ProfilePage";
import OrganizationChart from "./components/pages/OrganizationChart/OrganizationChart";
import UserProfile from "./components/pages/ProfilePage/ProfilePage";
import UnitHierarchyEditorWrapper from "./components/pages/Test/Dashboard";
import UnitHierarchyView from "./components/pages/UnitHierarchyPage/UnitHierarchyView"
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
        path: '/units/hierarchy',
        element: <UnitHierarchyView />
    },
    {
        path: '/units/hierarchy/:viewId',
        element: <UnitHierarchyView />
    },

    // Protected routes
    {
        element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
        children: [
            // Add protected routes here as you develop them
            // For example:
            // { path: '/profile', element: <Profile /> },
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

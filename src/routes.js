
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Home from './components/pages/Home/Home';
import DiscordCallback from './components/auth/DiscordCallback';
import NotFound from './components/pages/NotFound/NotFound';

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

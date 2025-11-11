// src/main/src/components/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // If not authenticated, save current location and redirect to login
    if (!isAuthenticated) {
        // Save the attempted URL for redirect after login
        const returnUrl = location.pathname + location.search;
        localStorage.setItem('returnUrl', returnUrl);
        
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;

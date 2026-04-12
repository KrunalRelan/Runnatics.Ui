// src/main/src/components/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models/Auth';
import { Box, CircularProgress } from '@mui/material';
import ForbiddenPage from '../../pages/ForbiddenPage';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** If provided, user's role must be in this list or a ForbiddenPage is shown. */
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        localStorage.setItem('returnUrl', location.pathname + location.search);
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return <ForbiddenPage />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

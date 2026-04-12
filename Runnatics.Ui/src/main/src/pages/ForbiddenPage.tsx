import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForbiddenPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                textAlign: 'center',
                px: 3,
            }}
        >
            <Box
                sx={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    bgcolor: 'error.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    opacity: 0.85,
                }}
            >
                <LockOutlinedIcon sx={{ fontSize: 44, color: 'error.contrastText' }} />
            </Box>

            <Typography variant="h3" fontWeight={700} gutterBottom>
                403
            </Typography>
            <Typography variant="h5" fontWeight={600} gutterBottom>
                Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 420 }}>
                You don't have permission to view this page. Contact your administrator if you
                believe this is a mistake.
            </Typography>

            <Button
                variant="contained"
                size="large"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            >
                {isAuthenticated ? 'Back to Dashboard' : 'Go to Login'}
            </Button>
        </Box>
    );
};

export default ForbiddenPage;

// src/main/src/pages/auth/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [error, setError] = useState<string>('');
    const [sessionExpired, setSessionExpired] = useState<boolean>(false);

    // Check if user was redirected due to session expiry
    useEffect(() => {
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
            setSessionExpired(true);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Call login which will automatically store the JWT token
            await login(formData);

            // Check if there's a return URL saved (from session expiry)
            const returnUrl = localStorage.getItem('returnUrl');
            
            if (returnUrl) {
                // Clear the return URL
                localStorage.removeItem('returnUrl');
                // Navigate back to where the user was
                navigate(returnUrl);
            } else {
                // Navigate to dashboard after successful login
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || 
                err.userMessage || 
                'Login failed. Please check your credentials.'
            );
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 400,
                    width: '100%',
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Sign In
                </Typography>
                
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Welcome back! Please login to your account.
                </Typography>

                {sessionExpired && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Your session has expired. Please login again to continue.
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        margin="normal"
                        disabled={isLoading}
                    />
                    
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        margin="normal"
                        disabled={isLoading}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                                    Sign Up
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default LoginPage;

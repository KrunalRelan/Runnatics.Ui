// src/main/src/pages/auth/RegisterPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Grid,
    InputAdornment,
    IconButton,
    LinearProgress,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Business,
    Person,
    ArrowBack,
    ArrowForward,
    CheckCircle,
} from '@mui/icons-material';
import { RegisterOrganizationRequest } from '../../models/Auth';

const STEPS = ['Organization', 'Your Account'];

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score: 20, label: 'Weak', color: '#EB0014' };
    if (score === 2) return { score: 40, label: 'Fair', color: '#DEA500' };
    if (score === 3) return { score: 60, label: 'Good', color: '#007FFF' };
    if (score === 4) return { score: 80, label: 'Strong', color: '#1AA251' };
    return { score: 100, label: 'Very strong', color: '#1AA251' };
}

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();

    const [activeStep, setActiveStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<RegisterOrganizationRequest & { confirmPassword: string }>({
        organizationName: '',
        organizationWebsite: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof typeof formData]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) setError('');
    };

    const validateStep1 = (): boolean => {
        const errors: Partial<Record<keyof typeof formData, string>> = {};
        if (!formData.organizationName.trim()) {
            errors.organizationName = 'Organization name is required.';
        }
        if (!formData.organizationWebsite.trim()) {
            errors.organizationWebsite = 'Website is required.';
        } else if (!/^https?:\/\/.+\..+/.test(formData.organizationWebsite)) {
            errors.organizationWebsite = 'Enter a valid URL (e.g. https://example.com).';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const errors: Partial<Record<keyof typeof formData, string>> = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
        if (!formData.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Enter a valid email address.';
        }
        if (!formData.password) {
            errors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password.';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (activeStep === 0 && validateStep1()) {
            setActiveStep(1);
        }
    };

    const handleBack = () => {
        setActiveStep(0);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;

        try {
            const { confirmPassword, ...payload } = formData;
            await register(payload);
            navigate('/dashboard');
        } catch (err: any) {
            const status = err?.response?.status;
            const msg = err?.response?.data;
            if (status === 409) {
                setError(typeof msg === 'string' ? msg : 'This organization or email is already registered.');
            } else if (status === 422) {
                setError(typeof msg === 'string' ? msg : 'Invalid organization domain.');
            } else {
                setError(err?.userMessage || 'Registration failed. Please try again.');
            }
        }
    };

    const strength = getPasswordStrength(formData.password);

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
                    p: { xs: 3, sm: 4 },
                    maxWidth: 520,
                    width: '100%',
                }}
            >
                {/* Header */}
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Create account
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Set up your organization on Runnatics
                </Typography>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {STEPS.map((label, index) => (
                        <Step key={label} completed={activeStep > index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Step 1 — Organization */}
                    {activeStep === 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Business color="primary" />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Organization details
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Organization name"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                error={!!fieldErrors.organizationName}
                                helperText={fieldErrors.organizationName}
                                required
                                margin="normal"
                                placeholder="Acme Running Club"
                                autoFocus
                            />

                            <TextField
                                fullWidth
                                label="Website"
                                name="organizationWebsite"
                                value={formData.organizationWebsite}
                                onChange={handleChange}
                                error={!!fieldErrors.organizationWebsite}
                                helperText={fieldErrors.organizationWebsite || 'Used to verify your organization domain'}
                                required
                                margin="normal"
                                placeholder="https://example.com"
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleNext}
                                endIcon={<ArrowForward />}
                                sx={{ mt: 3 }}
                            >
                                Continue
                            </Button>
                        </Box>
                    )}

                    {/* Step 2 — Account */}
                    {activeStep === 1 && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Person color="primary" />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Admin account
                                </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ mt: 0 }}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="First name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        error={!!fieldErrors.firstName}
                                        helperText={fieldErrors.firstName}
                                        required
                                        autoFocus
                                        autoComplete="given-name"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Last name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        error={!!fieldErrors.lastName}
                                        helperText={fieldErrors.lastName}
                                        required
                                        autoComplete="family-name"
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label="Work email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!fieldErrors.email}
                                helperText={fieldErrors.email}
                                required
                                margin="normal"
                                autoComplete="email"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                error={!!fieldErrors.password}
                                helperText={fieldErrors.password}
                                required
                                margin="normal"
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(p => !p)}
                                                edge="end"
                                                size="small"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password strength */}
                            {formData.password && (
                                <Box sx={{ mt: 0.5, mb: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={strength.score}
                                        sx={{
                                            height: 4,
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': { bgcolor: strength.color },
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600 }}>
                                        {strength.label}
                                    </Typography>
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                label="Confirm password"
                                name="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!fieldErrors.confirmPassword}
                                helperText={
                                    fieldErrors.confirmPassword ||
                                    (formData.confirmPassword && formData.password === formData.confirmPassword
                                        ? ''
                                        : '')
                                }
                                required
                                margin="normal"
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                                                <CheckCircle sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                                            ) : (
                                                <IconButton
                                                    onClick={() => setShowConfirm(p => !p)}
                                                    edge="end"
                                                    size="small"
                                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                                >
                                                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={handleBack}
                                    startIcon={<ArrowBack />}
                                    disabled={isLoading}
                                    sx={{ flex: 1 }}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isLoading}
                                    sx={{ flex: 2 }}
                                >
                                    {isLoading ? <CircularProgress size={22} /> : 'Create account'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </form>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                                Sign in
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default RegisterPage;

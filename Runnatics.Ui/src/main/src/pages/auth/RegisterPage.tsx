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

type FormData = RegisterOrganizationRequest & { confirmPassword: string };

const INITIAL_FORM: FormData = {
    organizationName: '',
    domain: '',
    phoneNumber: '',
    superAdminFirstName: '',
    superAdminLastName: '',
    superAdminEmail: '',
    superAdminPassword: '',
    confirmPassword: '',
};

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();

    const [activeStep, setActiveStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FormData]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) setError('');
    };

    const validateStep1 = (): boolean => {
        const errors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.organizationName.trim()) {
            errors.organizationName = 'Organization name is required.';
        }
        if (!formData.domain.trim()) {
            errors.domain = 'Domain is required.';
        } else if (formData.domain.trim().length < 3 || formData.domain.trim().length > 30) {
            errors.domain = 'Domain must be between 3 and 30 characters.';
        } else if (!/^[a-zA-Z0-9-]+$/.test(formData.domain.trim())) {
            errors.domain = 'Domain can only contain letters, numbers, and hyphens.';
        }
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required.';
        } else if (!/^\+?[0-9\s\-().]{7,20}$/.test(formData.phoneNumber.trim())) {
            errors.phoneNumber = 'Enter a valid phone number.';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const errors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.superAdminFirstName.trim()) errors.superAdminFirstName = 'First name is required.';
        if (!formData.superAdminLastName.trim()) errors.superAdminLastName = 'Last name is required.';
        if (!formData.superAdminEmail.trim()) {
            errors.superAdminEmail = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.superAdminEmail)) {
            errors.superAdminEmail = 'Enter a valid email address.';
        }
        if (!formData.superAdminPassword) {
            errors.superAdminPassword = 'Password is required.';
        } else if (formData.superAdminPassword.length < 8) {
            errors.superAdminPassword = 'Password must be at least 8 characters.';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password.';
        } else if (formData.superAdminPassword !== formData.confirmPassword) {
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
            const data = err?.response?.data;
            if (status === 409) {
                setError(typeof data === 'string' ? data : 'This organization or email is already registered.');
            } else if (status === 422) {
                setError(typeof data === 'string' ? data : 'Invalid organization domain.');
            } else if (status === 400 && data?.errors) {
                const messages = Object.values(data.errors as Record<string, string[]>).flat();
                setError(messages.join(' '));
            } else {
                setError(err?.userMessage || 'Registration failed. Please try again.');
            }
        }
    };

    const strength = getPasswordStrength(formData.superAdminPassword);
    const passwordsMatch =
        formData.confirmPassword.length > 0 &&
        formData.superAdminPassword === formData.confirmPassword;

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
                sx={{ p: { xs: 3, sm: 4 }, maxWidth: 520, width: '100%' }}
            >
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Create account
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Set up your organization on Runnatics
                </Typography>

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
                                label="Domain"
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                error={!!fieldErrors.domain}
                                helperText={fieldErrors.domain || '3–30 characters, letters/numbers/hyphens only'}
                                required
                                margin="normal"
                                placeholder="acme-running"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Typography variant="caption" color="text.secondary">
                                                .runnatics.com
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Phone number"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                error={!!fieldErrors.phoneNumber}
                                helperText={fieldErrors.phoneNumber}
                                required
                                margin="normal"
                                placeholder="+1 555 000 0000"
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

                    {/* Step 2 — Admin Account */}
                    {activeStep === 1 && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Person color="primary" />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Admin account
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="First name"
                                        name="superAdminFirstName"
                                        value={formData.superAdminFirstName}
                                        onChange={handleChange}
                                        error={!!fieldErrors.superAdminFirstName}
                                        helperText={fieldErrors.superAdminFirstName}
                                        required
                                        autoFocus
                                        autoComplete="given-name"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Last name"
                                        name="superAdminLastName"
                                        value={formData.superAdminLastName}
                                        onChange={handleChange}
                                        error={!!fieldErrors.superAdminLastName}
                                        helperText={fieldErrors.superAdminLastName}
                                        required
                                        autoComplete="family-name"
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label="Work email"
                                name="superAdminEmail"
                                type="email"
                                value={formData.superAdminEmail}
                                onChange={handleChange}
                                error={!!fieldErrors.superAdminEmail}
                                helperText={fieldErrors.superAdminEmail}
                                required
                                margin="normal"
                                autoComplete="email"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="superAdminPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.superAdminPassword}
                                onChange={handleChange}
                                error={!!fieldErrors.superAdminPassword}
                                helperText={fieldErrors.superAdminPassword}
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

                            {formData.superAdminPassword && (
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
                                helperText={fieldErrors.confirmPassword}
                                required
                                margin="normal"
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {passwordsMatch ? (
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

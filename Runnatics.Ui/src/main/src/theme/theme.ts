import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode } from '../models/theme';

// Professional color palette
const primaryColor = {
    main: '#2563eb', // Modern blue
    light: '#3b82f6',
    dark: '#1e40af',
};

const secondaryColor = {
    main: '#7c3aed', // Modern purple
    light: '#8b5cf6',
    dark: '#6d28d9',
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: primaryColor,
        secondary: secondaryColor,
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        divider: '#e2e8f0',
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.3,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 16,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
            },
        },
    },
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
        secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
        },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        divider: '#334155',
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
    },
    typography: lightThemeOptions.typography,
    shape: lightThemeOptions.shape,
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.24)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.16)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    ],
    components: {
        ...lightThemeOptions.components,
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 16,
                },
            },
        },
    },
};

export const getTheme = (mode: ThemeMode) => {
    return createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);
};


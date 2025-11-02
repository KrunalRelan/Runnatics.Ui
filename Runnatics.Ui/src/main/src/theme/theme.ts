import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode } from '../models/theme';


// MUI Website Theme - Exact Colors
// Primary Blue from MUI site
const muiBlue = {
    50: '#F0F7FF',
    100: '#C2E0FF',
    200: '#99CCF3',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF', // Main MUI blue
    600: '#0072E5',
    700: '#0059B2',
    800: '#004C99',
    900: '#003A75',
};

// Grey palette from MUI site
const muiGrey = {
    50: '#F3F6F9',
    100: '#E7EBF0',
    200: '#E0E3E7',
    300: '#CDD2D7',
    400: '#B2BAC2',
    500: '#A0AAB4',
    600: '#6F7E8C',
    700: '#3E5060',
    800: '#2D3843',
    900: '#1A2027',
};

// Light theme - MUI Website Style
const lightThemeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: muiBlue[500],
            light: muiBlue[400],
            dark: muiBlue[700],
            contrastText: '#fff',
        },
        secondary: {
            main: '#F50057',
            light: '#F73378',
            dark: '#C51162',
        },
        background: {
            default: '#fff',
            paper: '#fff',
        },
        text: {
            primary: muiGrey[900],
            secondary: muiGrey[700],
            disabled: muiGrey[500],
        },
        divider: muiGrey[200],
        grey: muiGrey,
        success: {
            main: '#1AA251',
            light: '#6AE79C',
            dark: '#1AA251',
            contrastText: '#fff',
        },
        error: {
            main: '#EB0014',
            light: '#FF99A2',
            dark: '#C70011',
            contrastText: '#fff',
        },
        warning: {
            main: '#DEA500',
            light: '#FFDC48',
            dark: '#AB6800',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        info: {
            main: muiBlue[500],
            light: muiBlue[300],
            dark: muiBlue[700],
            contrastText: '#fff',
        },
    },
    typography: {
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: {
            fontFamily: '"PlusJakartaSans-ExtraBold", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 'clamp(2.625rem, 1.2857rem + 3.5714vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1142857142857143,
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
        },
        h2: {
            fontFamily: '"PlusJakartaSans-ExtraBold", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 'clamp(1.5rem, 0.9643rem + 1.4286vw, 2.25rem)',
            fontWeight: 800,
            lineHeight: 1.2222222222222223,
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
        },
        h3: {
            fontSize: '2.25rem',
            lineHeight: 1.2222222222222223,
            letterSpacing: 0,
            fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
        },
        h4: {
            fontSize: '1.75rem',
            lineHeight: 1.5,
            letterSpacing: 0,
            fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
        },
        h5: {
            fontSize: '1.5rem',
            lineHeight: 1.5,
            letterSpacing: 0,
            fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
        },
        h6: {
            fontSize: '1.25rem',
            lineHeight: 1.5,
            letterSpacing: 0,
            fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 500,
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
        },
        button: {
            textTransform: 'initial',
            fontWeight: 700,
            letterSpacing: 0,
            fontSize: '0.875rem',
            lineHeight: 1.75,
        },
        subtitle1: {
            fontSize: '1.125rem',
            lineHeight: 1.3333333333333333,
            letterSpacing: 0,
            fontWeight: 500,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: 0,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: 0,
        },
        caption: {
            display: 'inline-block',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            letterSpacing: 0,
            fontWeight: 700,
        },
    },
    shape: {
        borderRadius: 10,
    },
    spacing: 8,
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
        '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
        '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
        '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
        '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
        '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
        '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
        '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
        '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
        '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
        '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
        '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
        '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
        '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
        '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
        '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
        '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
        '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
        '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: '10px',
                    textTransform: 'initial',
                },
                sizeLarge: {
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: muiGrey[200],
                    boxShadow: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: '8px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                outlined: {
                    display: 'block',
                    borderColor: muiGrey[200],
                    backgroundColor: 'transparent',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: muiGrey[200],
                },
            },
        },
    },
};

// Dark theme - MUI Website Style
const darkThemeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: muiBlue[400],
            light: muiBlue[300],
            dark: muiBlue[700],
            contrastText: muiGrey[900],
        },
        secondary: {
            main: '#F50057',
            light: '#F73378',
            dark: '#C51162',
        },
        background: {
            default: muiGrey[900],
            paper: '#001E3C',
        },
        text: {
            primary: '#fff',
            secondary: muiGrey[400],
            disabled: muiGrey[600],
        },
        divider: 'rgba(194, 224, 255, 0.08)',
        grey: muiGrey,
        success: {
            main: '#1DB45A',
            light: '#6AE79C',
            dark: '#1AA251',
            contrastText: muiGrey[900],
        },
        error: {
            main: '#FF4141',
            light: '#FF99A2',
            dark: '#C70011',
            contrastText: '#fff',
        },
        warning: {
            main: '#FFB600',
            light: '#FFDC48',
            dark: '#AB6800',
            contrastText: muiGrey[900],
        },
        info: {
            main: muiBlue[400],
            light: muiBlue[300],
            dark: muiBlue[700],
            contrastText: muiGrey[900],
        },
    },
    typography: lightThemeOptions.typography,
    shape: lightThemeOptions.shape,
    spacing: lightThemeOptions.spacing,
    shadows: lightThemeOptions.shadows,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: '10px',
                    textTransform: 'initial',
                },
                sizeLarge: {
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'rgba(194, 224, 255, 0.08)',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: '8px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#001E3C',
                },
                outlined: {
                    display: 'block',
                    borderColor: 'rgba(194, 224, 255, 0.08)',
                    backgroundColor: muiGrey[900],
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'rgba(194, 224, 255, 0.08)',
                    backgroundColor: '#001E3C',
                },
            },
        },
    },
};

export const getTheme = (mode: ThemeMode) => {
    return createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);
};
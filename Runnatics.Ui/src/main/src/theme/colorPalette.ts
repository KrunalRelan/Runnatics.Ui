import { alpha } from "@mui/material";

/**
 * Professional Color Palette for Participant Details and Analytics
 * Provides theme-aware colors for both light and dark modes
 */
export const getColorPalette = (isDark: boolean) => ({
  // Primary brand colors
  primary: {
    main: isDark ? '#60A5FA' : '#2563EB',
    light: isDark ? '#93C5FD' : '#3B82F6',
    dark: isDark ? '#3B82F6' : '#1D4ED8',
  },
  
  // Semantic colors
  success: {
    main: isDark ? '#34D399' : '#10B981',
    light: isDark ? '#6EE7B7' : '#34D399',
    dark: isDark ? '#10B981' : '#059669',
  },
  
  warning: {
    main: isDark ? '#FBBF24' : '#F59E0B',
    light: isDark ? '#FCD34D' : '#FBBF24',
    dark: isDark ? '#F59E0B' : '#D97706',
  },
  
  error: {
    main: isDark ? '#F87171' : '#EF4444',
    light: isDark ? '#FCA5A5' : '#F87171',
    dark: isDark ? '#EF4444' : '#DC2626',
  },
  
  // Specialty colors for metrics
  speed: {
    main: isDark ? '#A78BFA' : '#8B5CF6',
    light: isDark ? '#C4B5FD' : '#A78BFA',
    dark: isDark ? '#8B5CF6' : '#7C3AED',
  },
  
  pace: {
    main: isDark ? '#2DD4BF' : '#14B8A6',
    light: isDark ? '#5EEAD4' : '#2DD4BF',
    dark: isDark ? '#14B8A6' : '#0D9488',
  },
  
  rank: {
    main: isDark ? '#60A5FA' : '#3B82F6',
    light: isDark ? '#93C5FD' : '#60A5FA',
    dark: isDark ? '#3B82F6' : '#2563EB',
  },
  
  gender: {
    male: isDark ? '#60A5FA' : '#3B82F6',
    female: isDark ? '#F472B6' : '#EC4899',
  },
  
  // Background colors
  background: {
    paper: isDark ? '#1E293B' : '#FFFFFF',
    default: isDark ? '#0F172A' : '#F8FAFC',
    elevated: isDark ? '#334155' : '#FFFFFF',
    subtle: isDark ? alpha('#1E293B', 0.6) : '#F1F5F9',
  },
  
  // Border colors
  border: {
    main: isDark ? alpha('#60A5FA', 0.2) : alpha('#CBD5E1', 1),
    light: isDark ? alpha('#475569', 0.5) : alpha('#E2E8F0', 1),
    focus: isDark ? alpha('#60A5FA', 0.5) : alpha('#3B82F6', 0.5),
  },
  
  // Text colors
  text: {
    primary: isDark ? '#F1F5F9' : '#0F172A',
    secondary: isDark ? '#94A3B8' : '#64748B',
    disabled: isDark ? '#475569' : '#CBD5E1',
  },
  
  // Chart colors
  chart: {
    gradient1: isDark ? ['#60A5FA', '#3B82F6'] : ['#3B82F6', '#2563EB'],
    gradient2: isDark ? ['#34D399', '#10B981'] : ['#10B981', '#059669'],
    gradient3: isDark ? ['#A78BFA', '#8B5CF6'] : ['#8B5CF6', '#7C3AED'],
    gradient4: isDark ? ['#FBBF24', '#F59E0B'] : ['#F59E0B', '#D97706'],
  },
});

export type ColorPalette = ReturnType<typeof getColorPalette>;

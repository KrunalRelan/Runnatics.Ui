import { themeQuartz } from "ag-grid-community";

/**
 * AG Grid Light Theme - Using MUI theme colors
 *
 * Matches the application's light theme color scheme from theme.ts
 * - Primary Blue: #007FFF (muiBlue[500])
 * - Background: White (#ffffff)
 * - Grey palette: muiGrey (F3F6F9, E0E3E7, 1A2027, etc.)
 */
export const lightTheme = themeQuartz.withParams({
  accentColor: "#007FFF", // muiBlue[500] - Main MUI blue
  backgroundColor: "#ffffff",
  borderColor: "#E0E3E7", // muiGrey[200]
  borderRadius: 4,
  browserColorScheme: "light",
  chromeBackgroundColor: "#EDF1F5",
  columnBorder: false,
  fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 13,
  foregroundColor: "#1A2027", // muiGrey[900]
  headerBackgroundColor: "#DDE3EA",
  headerFontSize: 13,
  headerFontWeight: 600,
  headerTextColor: "#1A2027", // muiGrey[900]
  oddRowBackgroundColor: "#F5F9FF",
  rowBorder: true,
  rowHoverColor: "#EBF3FF",
  spacing: 3,
  cellHorizontalPaddingScale: 0.6,
});

/**
 * AG Grid Dark Theme - Modern Balanced Design
 *
 * Matches the improved application dark theme
 * - Balanced backgrounds that aren't too dark
 * - Good contrast for readability
 * - Professional and comfortable appearance
 */
export const darkTheme = themeQuartz.withParams({
  accentColor: "#3399FF", // Bright blue accent (matches MUI primary)
  backgroundColor: "#252D3D", // Balanced dark background (matches paper)
  borderColor: "rgba(255, 255, 255, 0.12)", // Subtle borders
  borderRadius: 6,
  browserColorScheme: "dark",
  chromeBackgroundColor: "#2C3547", // Slightly lighter header
  columnBorder: false,
  fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 13,
  foregroundColor: "#E8EAED", // Soft white text (matches theme)
  headerBackgroundColor: "#242C3C",
  headerFontSize: 13,
  headerFontWeight: 600,
  headerTextColor: "#E8EAED", // Match text color
  oddRowBackgroundColor: "#2A3341", // Very subtle zebra striping
  rowBorder: true,
  spacing: 3,
  cellHorizontalPaddingScale: 0.6,
  rowHoverColor: "#323A4D", // Subtle hover effect
  selectedRowBackgroundColor: "#2B5A8F", // Blue selection with good contrast
});

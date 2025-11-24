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
  chromeBackgroundColor: "#F3F6F9", // muiGrey[50]
  columnBorder: true,
  fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  foregroundColor: "#1A2027", // muiGrey[900]
  headerBackgroundColor: "#F3F6F9", // muiGrey[50]
  headerFontSize: 14,
  headerFontWeight: 600,
  headerTextColor: "#1A2027", // muiGrey[900]
  oddRowBackgroundColor: "#F0F7FF", // muiBlue[50]
  rowBorder: true,
  spacing: 4,
  cellHorizontalPaddingScale: 0.5,
});

/**
 * AG Grid Dark Theme - Modern Professional Design
 *
 * Inspired by LinkedIn, GitHub, and modern dark themes
 * - Soft backgrounds with good contrast
 * - Subtle borders for better visual hierarchy
 * - Clean, professional appearance
 */
export const darkTheme = themeQuartz.withParams({
  accentColor: "#0A66C2", // LinkedIn blue - professional and recognizable
  backgroundColor: "#1B1F23", // Rich dark gray (similar to GitHub)
  borderColor: "#2D333B", // Subtle borders for depth
  borderRadius: 6,
  browserColorScheme: "dark",
  chromeBackgroundColor: "#161A1E", // Darker header background
  columnBorder: true,
  fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  foregroundColor: "#E6EDF3", // Soft white for better readability
  headerBackgroundColor: "#161A1E", // Darker header for contrast
  headerFontSize: 14,
  headerFontWeight: 600,
  headerTextColor: "#E6EDF3", // Match text color
  oddRowBackgroundColor: "#22272E", // Subtle zebra striping
  rowBorder: true,
  spacing: 4,
  cellHorizontalPaddingScale: 0.5,
  // Additional modern dark theme enhancements
  rowHoverColor: "#2D333B", // Subtle hover effect
  selectedRowBackgroundColor: "#0D419D", // LinkedIn blue with opacity
});

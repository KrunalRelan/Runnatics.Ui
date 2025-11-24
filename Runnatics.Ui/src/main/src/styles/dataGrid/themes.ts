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
 * AG Grid Dark Theme - Using MUI theme colors
 *
 * Matches the application's dark theme color scheme from theme.ts
 * - Primary Blue: #3399FF (muiBlue[400])
 * - Background: #001E3C (MUI dark paper)
 * - Dark grey palette with blue tints
 */
export const darkTheme = themeQuartz.withParams({
  accentColor: "#3399FF", // muiBlue[400]
  backgroundColor: "#001E3C", // Paper background from MUI theme
  borderColor: "rgba(194, 224, 255, 0.08)", // Divider color from MUI theme
  borderRadius: 4,
  browserColorScheme: "dark",
  chromeBackgroundColor: "#0A1929", // Paper background from MUI theme
  columnBorder: true,
  fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  foregroundColor: "#ffffff",
  headerBackgroundColor: "#0A1929",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerTextColor: "#ffffff",
  oddRowBackgroundColor: "hsl(210, 14%, 9%)", // Slightly lighter than default background
  rowBorder: true,
  spacing: 4,
  cellHorizontalPaddingScale: 0.5,
});

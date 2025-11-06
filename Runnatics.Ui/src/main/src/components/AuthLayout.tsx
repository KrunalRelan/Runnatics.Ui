// src/main/src/components/AuthLayout.tsx
import { ReactNode } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
} from "@mui/material";
import ThemeSwitcher from "../theme/ThemeSwitcher";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Layout for authentication pages (login, register, etc.)
 * Shows only the header/top bar, no side navigation
 */
function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Top App Bar - Header Only */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Runnatics
          </Typography>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          pt: 8, // Padding top for fixed AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AuthLayout;

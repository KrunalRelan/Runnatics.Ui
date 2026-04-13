import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./main/src/theme";
import { AuthProvider } from "./main/src/contexts/AuthContext";
import DashboardLayout from "./main/src/components/DashboardLayout";
import AuthLayout from "./main/src/components/AuthLayout";
import LoginPage from "./main/src/pages/auth/LoginPage";
import RegisterPage from "./main/src/pages/auth/RegisterPage";
import Dashboard from "./main/src/pages/Dashboard";
import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { rfidRoutes } from "./main/src/pages/admin/rfid/Routes";
import { deviceRoutes } from "./main/src/pages/admin/devices/Routes";
import { supportRoutes } from "./main/src/pages/admin/support/Routes";
import ContactUsPage from "./main/src/pages/ContactUs/ContactUsPage";
import { ProtectedRoute } from "./main/src/components/auth/ProtectedRoute";
import ForbiddenPage from "./main/src/pages/ForbiddenPage";
import { ALL_ROLES } from "./main/src/models/Auth";
import { CircularProgress, Box } from "@mui/material";

// Layout wrapper for auth pages (header only, no side nav)
const AuthLayoutWrapper = () => {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

// Layout wrapper for protected routes (full dashboard with side nav)
// ProtectedRoute here enforces: authenticated + allowed role for ALL dashboard routes.
// For routes that need a more restrictive role (e.g. SuperAdmin only), wrap the
// individual route element with <ProtectedRoute allowedRoles={['SuperAdmin']}>.
const DashboardLayoutWrapper = () => {
  return (
    <ProtectedRoute allowedRoles={ALL_ROLES}>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - WITH HEADER ONLY (no side navigation) */}
            <Route element={<AuthLayoutWrapper />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />
            </Route>
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected routes - WITH FULL DASHBOARD (header + side nav) */}
            <Route element={<DashboardLayoutWrapper />}>
              {/* Dashboard home page */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Events routes */}
              {eventsRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element}>
                  {route.children?.map((child, childIndex) => (
                    <Route
                      key={childIndex}
                      path={child.path}
                      element={child.element}
                    />
                  ))}
                </Route>
              ))}

              {/* RFID routes */}
              {rfidRoutes.map((route, index) => (
                <Route
                  key={`rfid-${index}`}
                  path={`/${route.path}`}
                  element={
                    <ProtectedRoute>
                      <Suspense
                        fallback={
                          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                          </Box>
                        }
                      >
                        {route.element}
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              ))}

              {/* Device routes */}
              {deviceRoutes.map((route, index) => (
                <Route
                  key={`device-${index}`}
                  path={`/${route.path}`}
                  element={
                    <Suspense
                      fallback={
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                          <CircularProgress />
                        </Box>
                      }
                    >
                      {route.element}
                    </Suspense>
                  }
                />
              ))}

              {/* Support routes */}
              {supportRoutes.map((route, index) => (
                <Route
                  key={`support-${index}`}
                  path={`/${route.path}`}
                  element={
                    <Suspense
                      fallback={
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                          <CircularProgress />
                        </Box>
                      }
                    >
                      {route.element}
                    </Suspense>
                  }
                />
              ))}
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

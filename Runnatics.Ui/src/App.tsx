import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "../src/main/src/theme";
import { AuthProvider } from "../src/main/src/contexts/AuthContext";
import DashboardLayout from "../src/main/src/components/DashboardLayout";
import AuthLayout from "../src/main/src/components/AuthLayout";
import LoginPage from "../src/main/src/pages/auth/LoginPage";
import Dashboard from "../src/main/src/pages/Dashboard";
import { eventsRoutes } from "./main/src/pages/admin/events/Routes";

// Layout wrapper for auth pages (header only, no side nav)
const AuthLayoutWrapper = () => {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

// Layout wrapper for protected routes (full dashboard with side nav)
const DashboardLayoutWrapper = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes - WITH HEADER ONLY (no side navigation) */}
            <Route element={<AuthLayoutWrapper />}>
              <Route path="/login" element={<LoginPage />} />
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
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

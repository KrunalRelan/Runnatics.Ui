import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./main/src/theme";
import { AuthProvider } from "./main/src/contexts/AuthContext";
import DashboardLayout from "./main/src/components/DashboardLayout";
import AuthLayout from "./main/src/components/AuthLayout";
import LoginPage from "./main/src/pages/auth/LoginPage";
import Dashboard from "./main/src/pages/Dashboard";
import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { uploadsRoutes } from "./main/src/pages/uploads/Routes";

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

              {/* Uploads routes */}
              {uploadsRoutes.map((route, index) => (
                <Route key={`upload-${index}`} path={route.path} element={route.element} />
              ))}
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

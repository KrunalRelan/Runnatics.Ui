import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "../src/main/src/theme";
import { AuthProvider } from "../src/main/src/contexts/AuthContext";
import DashboardLayout from "../src/main/src/components/DashboardLayout";
import LoginPage from "../src/main/src/pages/auth/LoginPage";
import { eventsRoutes } from "./main/src/pages/admin/events/Routes";

// Layout wrapper component for routes with dashboard
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
            {/* Auth routes - NO LAYOUT (Full page, no nav) */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected routes - WITH LAYOUT (Dashboard with nav) */}
            <Route element={<DashboardLayoutWrapper />}>
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

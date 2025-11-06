import { RouteObject } from "react-router-dom";
import LoginPage from "./LoginPage";

// Auth routes are now handled directly in App.tsx
// These routes will NOT have the DashboardLayout wrapper
export const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];

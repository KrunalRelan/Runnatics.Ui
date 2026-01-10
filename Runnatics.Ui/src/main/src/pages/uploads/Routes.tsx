import { RouteObject } from "react-router-dom";
import UploadSelectionPage from "./UploadSelectionPage";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

export const uploadsRoutes: RouteObject[] = [
  {
    path: "/uploads",
    element: (
      <ProtectedRoute>
        <UploadSelectionPage />
      </ProtectedRoute>
    ),
  },
];

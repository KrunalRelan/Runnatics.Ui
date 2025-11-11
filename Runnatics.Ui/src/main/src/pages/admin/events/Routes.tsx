import { RouteObject } from "react-router-dom";
import EventsList from "./EventsList";
import { CreateEvent } from "./CreateEvent";
import { EditEvent } from "./EditEvent";
import ViewEvent from "./ViewEvent";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";

export const eventsRoutes: RouteObject[] = [
  {
    path: "/events",
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <EventsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit/:id",
        element: (
          <ProtectedRoute>
            <EditEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "detail/:eventId",
        element: (
          <ProtectedRoute>
            <ViewEvent />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

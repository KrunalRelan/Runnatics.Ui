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
        path: "events-dashboard",
        element: (
          <ProtectedRoute>
            <EventsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "events-create",
        element: (
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "events-edit/:id",
        element: (
          <ProtectedRoute>
            <EditEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "events-detail/:eventId",
        element: (
          <ProtectedRoute>
            <ViewEvent />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

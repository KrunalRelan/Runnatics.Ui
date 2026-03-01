import { RouteObject } from "react-router-dom";
import EventsList from "./EventsList";
import { CreateEvent } from "./CreateEvent";
import { EditEvent } from "./EditEvent";
import ViewEvent from "./ViewEvent";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";
import { AddRace } from "../races/AddRace";
import { EditRace } from "../races/EditRace";
import ViewRaces from "../races/ViewRaces";
import ParticipantDetail from "../participants/ParticipantDetail";

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
        path: "event-details/:eventId",
        element: (
          <ProtectedRoute>
            <ViewEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "event-details/:eventId/race/add",
        element: (
          <ProtectedRoute>
            <AddRace />
          </ProtectedRoute>
        ),
      },
      {
        path: "event-details/:eventId/race/edit/:raceId",
        element: (
          <ProtectedRoute>
            <EditRace />
          </ProtectedRoute>
        ),
      },
      {
        path: "event-details/:eventId/race/:raceId",
        element: (
          <ProtectedRoute>
            <ViewRaces />
          </ProtectedRoute>
        ),
      },
      {
        path: "event-details/:eventId/race/:raceId/participant/:participantId",
        element: (
          <ProtectedRoute>
            <ParticipantDetail />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

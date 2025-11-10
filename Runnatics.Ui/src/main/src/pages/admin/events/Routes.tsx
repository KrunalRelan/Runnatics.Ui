import { RouteObject } from "react-router-dom";
import EventsList from "./EventsList";
import { CreateEvent } from "./CreateEvent";
import { EditEvent } from "./EditEvent";
import ViewEvent from "./ViewEvent";

export const eventsRoutes: RouteObject[] = [
  {
    path: "/events",
    children: [
      {
        path: "events-dashboard",
        element: <EventsList />,
      },
      {
        path: "events-create",
        element: <CreateEvent />,
      },
      {
        path: "events-edit/:id",
        element: <EditEvent />,
      },
      {
        path: "events-detail/:eventId",
        element: <ViewEvent />,
      },
    ],
  },
];

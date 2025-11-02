import { RouteObject } from "react-router-dom";
import Dashboard from "./Dashboard";
import { CreateEvent } from "./CreateEvent";
import ViewEvent from "./ViewEvent";

export const eventsRoutes: RouteObject[] = [
  {
    path: "/events",
    children: [
      {
        path: "events-dashboard",
        element: <Dashboard />,
      },
      {
        path: "events-create",
        element: <CreateEvent />,
      },

      {
        path: "events-detail/:eventId",
        element: <ViewEvent />,
      },
    ],
  },
];

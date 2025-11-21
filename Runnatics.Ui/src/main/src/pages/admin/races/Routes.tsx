import { RouteObject } from "react-router-dom";
import { AddRace } from "./AddRace";
import { EditRace } from "./EditRace";

export const racesRoutes: RouteObject[] = [
  {
    path: "/events/event-details/:eventId/race/add",
    element: <AddRace />,
  },
  {
    path: "/events/event-details/:eventId/race/edit/:raceId",
    element: <EditRace />,
  }
];
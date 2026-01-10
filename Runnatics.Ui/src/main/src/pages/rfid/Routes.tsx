import { RouteObject } from "react-router-dom";
import RfidFileUploadPage from "./RfidFileUploadPage";
import ReaderDashboard from "./ReaderDashboard";

export const rfidRoutes: RouteObject[] = [
  {
    path: "/events/event-details/:eventId/race/:raceId/rfid-upload",
    element: <RfidFileUploadPage />,
  },
  {
    path: "/rfid/readers",
    element: <ReaderDashboard />,
  },
];

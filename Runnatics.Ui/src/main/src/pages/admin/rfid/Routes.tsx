import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Lazy load the RFID components
const RFIDFileUpload = lazy(() => import("./RFIDFileUpload"));

/**
 * RFID Routes Configuration
 * All routes require authentication
 */
export const rfidRoutes: RouteObject[] = [
  {
    path: "rfid/upload",
    element: <RFIDFileUpload />,
  },
];

export default rfidRoutes;

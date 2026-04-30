import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Lazy load the RFID components
const RFIDFileUpload = lazy(() => import("./RFIDFileUpload"));
const EPCMappingUpload = lazy(() => import("./EPCMappingUpload"));
const R700Simulator = lazy(() => import("../../../components/R700Simulator"));

/**
 * RFID Routes Configuration
 * All routes require authentication
 */
export const rfidRoutes: RouteObject[] = [
  {
    path: "rfid/upload",
    element: <RFIDFileUpload />,
  },
  {
    path: "rfid/epc-mapping",
    element: <EPCMappingUpload />,
  },
  {
    // Dev tool: browser-based R700 webhook simulator
    path: "rfid/simulator",
    element: <R700Simulator />,
  },
];

export default rfidRoutes;

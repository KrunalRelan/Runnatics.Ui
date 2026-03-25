import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { racesRoutes } from "./main/src/pages/admin/races/Routes";
import { authRoutes } from "./main/src/pages/auth/Routes";
import { certificatesRoutes } from "./main/src/pages/admin/certificates/Routes";
import { rfidRoutes } from "./main/src/pages/admin/rfid/Routes";
import { deviceRoutes } from "./main/src/pages/admin/devices/Routes";

const routes = [...eventsRoutes, ...authRoutes, ...racesRoutes, ...certificatesRoutes, ...rfidRoutes, ...deviceRoutes];

export default routes;

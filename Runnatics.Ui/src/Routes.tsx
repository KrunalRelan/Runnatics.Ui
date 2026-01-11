import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { racesRoutes } from "./main/src/pages/admin/races/Routes";
import { authRoutes } from "./main/src/pages/auth/Routes";
import { certificatesRoutes } from "./main/src/pages/admin/certificates/Routes";
import { rfidRoutes } from "./main/src/pages/rfid/Routes";
import { uploadsRoutes } from "./main/src/pages/uploads/Routes";

const routes = [...eventsRoutes, ...authRoutes, ...racesRoutes, ...certificatesRoutes, ...rfidRoutes, ...uploadsRoutes];

export default routes;

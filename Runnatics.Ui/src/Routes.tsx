import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { racesRoutes } from "./main/src/pages/admin/races/Routes";
import { authRoutes } from "./main/src/pages/auth/Routes";
import { certificatesRoutes } from "./main/src/pages/admin/certificates/Routes";

const routes = [...eventsRoutes, ...authRoutes, ...racesRoutes, ...certificatesRoutes];

export default routes;

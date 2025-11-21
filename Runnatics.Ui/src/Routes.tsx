import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { racesRoutes } from "./main/src/pages/admin/races/Routes";
import { authRoutes } from "./main/src/pages/auth/Routes";

const routes = [...eventsRoutes, ...authRoutes, ...racesRoutes];

export default routes;

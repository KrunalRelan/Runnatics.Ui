import { eventsRoutes } from "./main/src/pages/admin/events/Routes";
import { authRoutes } from "./main/src/pages/auth/Routes";

const routes = [...eventsRoutes, ...authRoutes];

export default routes;

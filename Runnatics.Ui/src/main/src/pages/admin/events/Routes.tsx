import { RouteObject } from "react-router-dom";
import Dashboard from "./Dashboard";

export const eventsRoutes :RouteObject[] = [
    {
        path: "/events",
        children: [
            {
                path: "events-dashboard",
                element: <Dashboard />
            }
        ]
    },
];

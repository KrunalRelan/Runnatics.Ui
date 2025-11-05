export const ServiceUrl = {
    login: () => "authentication/login",
    register: () => "authentication/register",
    logout: () => "authentication/logout",
    refreshToken: () => "auth/refresh-token",
    getCurrentUser: () => "auth/me",
    getAllEvents: () => "Events",
    getAppContext: () => "Sessions/app-context",
    searchEventService: () => "Events/search",
    createEvent: () => "Events/create",
    getEventOrganizer: () => "eventorganizers/event-organizer",
};


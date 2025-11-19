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
    editEvent: (id: string) => `Events/${id}/edit-event`,
    getEventById: (id: string) => `Events/${id}/event-details`,
    deleteEvent: (id: string) => `Events/${id}/delete-event`,
    getEventOrganizer: () => "EventOrganizer/all-event-organizers",
    createEventOrganizer: () => "EventOrganizer/create-event-organizer",
};


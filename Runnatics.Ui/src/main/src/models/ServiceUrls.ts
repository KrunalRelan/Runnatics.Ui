import { get } from "http";

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

    //races
    searchRaceService: (eventId: string) => `Races/${eventId}/search`,
    getRaceById: (eventId:string, id: string) => `Races/${eventId}/${id}/race-details`,
    createRace: (eventId: string) => `Races/${eventId}/create`,
    editRace: (eventId: string, id: string) => `Races/${eventId}/${id}/edit-race`,
    deleteRace: (eventId: string, id: string) => `Races/${eventId}/${id}/delete-race`,

    //participants
    uploadParticipantImport: (eventId: string) => `participants/${eventId}/import`,
    processParticipantImport: (eventId: string, importBatchId: string) => `participants/${eventId}/import/${importBatchId}/process`,
    searchParticipants: (eventId: string, raceId: string) => `participants/${eventId}/${raceId}/search`,
    addParticipant: (eventId: string, raceId: string) => `participants/${eventId}/${raceId}/add-participant`,
    editParticipant: (participantId: string) => `participants/${participantId}/edit-participant`,
    deleteParticipant: (participantId: string) => `participants/${participantId}/delete-participant`,

    //checkpoints
    searchCheckpoints: (eventId: string, raceId: string) => `checkpoints/${eventId}/${raceId}`,
    addCheckpoint: (eventId: string, raceId: string) => `checkpoints/${eventId}/${raceId}`,
    editCheckpoint: (eventId: string, raceId: string, checkpointId: string) => `checkpoints/${eventId}/${raceId}/${checkpointId}`,
    deleteCheckpoint: (eventId: string, raceId: string, checkpointId: string) => `checkpoints/${eventId}/${raceId}/${checkpointId}`,
    getCheckpointById: (eventId: string, raceId: string, checkpointId: string) => `checkpoints/${eventId}/${raceId}/${checkpointId}`,
    cloneCheckpoints: (eventId: string, sourceRaceId: string, destinationRaceId: string) => `checkpoints/${eventId}/${sourceRaceId}/${destinationRaceId}/clone`,

    //devices
    getAllDevices: () => "devices",

};


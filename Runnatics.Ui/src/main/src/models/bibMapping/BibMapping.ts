export interface CreateBibMappingRequest {
  raceId: string;
  bibNumber: string;
  epc: string;
}

export interface BibMappingResponse {
  id: string;
  chipId: string;
  participantId: string;
  eventId: string;
  raceId: string;
  bibNumber: string;
  epc: string;
  createdAt: string;
}

export interface DeleteBibMappingParams {
  chipId: string;
  participantId: string;
  eventId: string;
}

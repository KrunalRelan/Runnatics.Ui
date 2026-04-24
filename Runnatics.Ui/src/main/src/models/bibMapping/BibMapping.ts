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

export type EpcMappingStatusFilter = 'All' | 'Mapped' | 'Unmapped';

export interface GetEpcMappingRequest {
  pageNumber: number;
  pageSize: number;
  sortFieldName?: string;
  sortDirection?: number;
  searchString?: string;
  status?: EpcMappingStatusFilter;
}

export interface BibMappingParticipantResponse {
  participantId: string;
  bibNumber: string;
  participantName: string;
  epc?: string;
  isEpcMapped: boolean;
  chipId?: string;
  eventId?: string;
  createdAt?: string;
}

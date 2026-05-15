export interface ProcessParticipantResultResponse {
  participantId: string;
  status: string;
  chipTime: string | null;
  gunTime: string | null;
  splits: {
    checkpointId: string;
    checkpointName: string;
    splitTime: string | null;
    cumulativeTime: string | null;
  }[];
}

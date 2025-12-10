export interface AddParticipantRangeDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  eventId: string;
  raceId: string;
}

import React from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import BibMapping from './BibMapping';

/**
 * Route wrapper that extracts raceId from URL params
 * and passes it to the BibMapping component.
 */
const BibMappingPage: React.FC = () => {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();

  if (!eventId || !raceId) {
    return <Alert severity="error">Event and race IDs are required</Alert>;
  }

  return <BibMapping eventId={eventId} raceId={raceId} />;
};

export default BibMappingPage;

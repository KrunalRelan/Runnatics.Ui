import React from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import BibMapping from './BibMapping';

/**
 * Route wrapper that extracts raceId from URL params
 * and passes it to the BibMapping component.
 */
const BibMappingPage: React.FC = () => {
  const { raceId } = useParams<{ eventId: string; raceId: string }>();

  if (!raceId) {
    return <Alert severity="error">Race ID is required</Alert>;
  }

  return <BibMapping raceId={raceId} />;
};

export default BibMappingPage;

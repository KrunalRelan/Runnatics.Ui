import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { EventService } from '../../../services/EventService';
import { RaceService } from '../../../services/RaceService';

const BibMappingLanding: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ['events', 'future'],
    queryFn: () => EventService.getFutureEvents(),
  });

  const racesQuery = useQuery({
    queryKey: ['races', selectedEventId],
    queryFn: () => RaceService.getAllRaces({ eventId: selectedEventId! }),
    enabled: !!selectedEventId,
  });

  const events = eventsQuery.data?.message ?? [];
  const races = racesQuery.data?.message ?? [];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        BIB Mapping
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select an event and race to start mapping RFID chips to BIB numbers.
      </Typography>

      {/* Step 1: Select Event */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        {selectedEventId ? '1. Event Selected' : '1. Select Event'}
      </Typography>

      {eventsQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {eventsQuery.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load events
        </Alert>
      )}

      {events.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {events.map((event) => (
            <Card
              key={event.id}
              variant={selectedEventId === event.id ? 'elevation' : 'outlined'}
              sx={{
                minWidth: 220,
                flex: '1 1 220px',
                border: selectedEventId === event.id ? '2px solid' : undefined,
                borderColor: selectedEventId === event.id ? 'primary.main' : undefined,
              }}
            >
              <CardActionArea onClick={() => setSelectedEventId(event.id!)}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(event.eventDate).format('MMM D, YYYY')}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {!eventsQuery.isLoading && !eventsQuery.error && events.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 4 }}>No upcoming events found.</Typography>
      )}

      {/* Step 2: Select Race */}
      {selectedEventId && (
        <>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            2. Select Race
          </Typography>

          {racesQuery.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {racesQuery.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load races
            </Alert>
          )}

          {races.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {races.map((race) => (
                <Card key={race.id} variant="outlined" sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <CardActionArea
                    onClick={() =>
                      navigate(
                        `/events/event-details/${selectedEventId}/race/${race.id}/bib-mapping`
                      )
                    }
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {race.title}
                      </Typography>
                      {race.distance != null && (
                        <Chip label={`${race.distance} km`} size="small" sx={{ mt: 0.5 }} />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}

          {!racesQuery.isLoading && !racesQuery.error && races.length === 0 && (
            <Typography color="text.secondary">No races found for this event.</Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default BibMappingLanding;

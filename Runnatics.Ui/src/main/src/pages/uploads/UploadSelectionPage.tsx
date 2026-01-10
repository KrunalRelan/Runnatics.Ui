import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EventIcon from '@mui/icons-material/Event';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PageContainer from '../../components/PageContainer';
import { getColorPalette } from '../../theme/colorPalette';
import { EventService } from '../../services/EventService';
import { RaceService } from '../../services/RaceService';
import { Event } from '../../models/Event';
import { Race } from '../../models/races/Race';

const UploadSelectionPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getColorPalette(isDark);
  const navigate = useNavigate();

  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent double API calls in React StrictMode
  const eventsLoadedRef = useRef(false);

  // Load events on mount
  useEffect(() => {
    if (eventsLoadedRef.current) return;
    eventsLoadedRef.current = true;
    
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        setError(null);
        // Use getAllEvents to get all events for upload
        const response = await EventService.getAllEvents();
        setEvents(response.message || []);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  // Load races when event changes
  useEffect(() => {
    if (!selectedEvent?.id) {
      setRaces([]);
      setSelectedRaceId('');
      return;
    }

    const loadRaces = async () => {
      try {
        setLoadingRaces(true);
        setError(null);
        const response = await RaceService.getAllRaces({ eventId: selectedEvent.id! });
        setRaces(response.message || []);
        setSelectedRaceId(''); // Reset race selection
      } catch (err) {
        console.error('Failed to load races:', err);
        setError('Failed to load races. Please try again.');
      } finally {
        setLoadingRaces(false);
      }
    };
    loadRaces();
  }, [selectedEvent]);

  const handleEventChange = (event: Event | null) => {
    setSelectedEvent(event);
  };

  const handleRaceChange = (raceId: string) => {
    setSelectedRaceId(raceId);
  };

  const handleGoToUpload = () => {
    if (selectedEvent?.id && selectedRaceId) {
      navigate(`/events/event-details/${selectedEvent.id}/race/${selectedRaceId}/rfid-upload`);
    }
  };

  const selectedRace = races.find(r => r.id === selectedRaceId);

  return (
    <PageContainer title="RFID File Upload">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <UploadFileIcon sx={{ fontSize: 48, color: colors.primary.main, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text.primary }}>
            RFID File Upload
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 1 }}>
            Select an event and race to upload RFID data
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Selection Card */}
        <Card
          sx={{
            backgroundColor: colors.background.paper,
            border: `1px solid ${colors.border.main}`,
            borderRadius: 2,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Event Autocomplete with Search */}
            <Autocomplete
              fullWidth
              options={events}
              value={selectedEvent}
              onChange={(_event, newValue) => handleEventChange(newValue)}
              getOptionLabel={(option) => option.name}
              loading={loadingEvents}
              disabled={loadingEvents}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon fontSize="small" />
                      Select Event
                    </Box>
                  }
                  placeholder="Search events..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingEvents ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                      {option.venueName} • {new Date(option.eventDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText={loadingEvents ? 'Loading events...' : 'No events available'}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.background.paper,
                  '& fieldset': {
                    borderColor: colors.border.main,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.primary.main,
                  },
                },
              }}
            />

            {/* Race Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="race-select-label">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsRunIcon fontSize="small" />
                  Select Race
                </Box>
              </InputLabel>
              <Select
                labelId="race-select-label"
                id="race-select"
                value={selectedRaceId}
                label="Select Race"
                onChange={(e) => handleRaceChange(e.target.value)}
                disabled={!selectedEvent || loadingRaces}
                sx={{
                  backgroundColor: colors.background.paper,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.border.main,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main,
                  },
                }}
              >
                {loadingRaces ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      Loading races...
                    </Box>
                  </MenuItem>
                ) : !selectedEvent ? (
                  <MenuItem disabled>Select an event first</MenuItem>
                ) : races.length === 0 ? (
                  <MenuItem disabled>No races available for this event</MenuItem>
                ) : (
                  races.map((race) => (
                    <MenuItem key={race.id} value={race.id}>
                      <Typography variant="body1">{race.title}</Typography>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Selection Summary */}
            {selectedEvent && selectedRace && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 1,
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  border: `1px solid ${alpha(colors.primary.main, 0.3)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: colors.primary.main, mb: 1 }}>
                  Selected:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.primary }}>
                  <strong>Event:</strong> {selectedEvent.name}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.primary }}>
                  <strong>Race:</strong> {selectedRace.title}
                </Typography>
              </Box>
            )}

            {/* Go to Upload Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<UploadFileIcon />}
              onClick={handleGoToUpload}
              disabled={!selectedEvent || !selectedRaceId}
              sx={{
                py: 1.5,
                backgroundColor: colors.primary.main,
                '&:hover': {
                  backgroundColor: colors.primary.dark,
                },
                '&.Mui-disabled': {
                  backgroundColor: colors.border.main,
                  color: colors.text.secondary,
                },
              }}
            >
              Go to Upload Page
            </Button>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default UploadSelectionPage;

// src/pages/Events/EventsList.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Pagination,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { EventService } from "../../../services/EventService";
import { Event } from "../../../models/Event";
import { EventSearchRequest } from "../../../models/EventSearchRequest";
// Default search criteria with required pagination values
const defaultSearchCriteria: EventSearchRequest = {
  pageNumber: 1,
  pageSize: 10,
};

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<EventSearchRequest>(
    defaultSearchCriteria
  );
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
  }, [searchCriteria]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchCriteria.name) {
        setSearchCriteria((prev) => ({
          ...prev,
          name: searchQuery || undefined,
          pageNumber: 1, // Reset to first page on search
        }));
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchCriteria.name]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the API with search criteria wrapped in the correct format
      const response = await EventService.getAllEvents({ 
        searchCriteria: searchCriteria 
      });

      // Backend returns events directly in the message property as an array
      setEvents(response.message || []);
      setTotalRecords(response.totalCount || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch events");
      setEvents([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setSearchCriteria((prev) => ({ ...prev, pageNumber: page }));
  };

  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleEditEvent = (eventId: string | undefined) => {
    if (eventId) {
      navigate(`/events/edit/${eventId}`);
    }
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete || !eventToDelete.id) return;

    try {
      await EventService.deleteEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      // Refresh the list
      fetchEvents();
      alert("Event deleted successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pageSize = searchCriteria.pageSize || 10;
  const pageNumber = searchCriteria.pageNumber || 1;
  const totalPages = Math.ceil(totalRecords / pageSize);

  if (loading && events.length === 0) {
    return (
      <Container
        maxWidth="xl"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Events Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search events by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Events Table */}
      {events.length === 0 && !loading ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              {searchQuery
                ? "No events found matching your search"
                : "No events found"}
            </Typography>
            {!searchQuery && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateEvent}
                >
                  Create Your First Event
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell>
                    <strong>#</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Event Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Event Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Organizer</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Published</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event, index) => (
                    <TableRow
                      key={event.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>
                        {(pageNumber - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{formatDate(event.eventDate || event.startDate)}</TableCell>
                      <TableCell>{event.venueAddress || event.location || "N/A"}</TableCell>
                      <TableCell>{event.eventOrganizerName || event.organizerId || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.isActive ? "Yes" : "No"}
                          color={event.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditEvent(event.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(event)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {(pageNumber - 1) * pageSize + 1} to{" "}
              {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords}{" "}
              entries
            </Typography>

            <Pagination
              count={totalPages}
              page={pageNumber}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              disabled={loading}
            />
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the event "{eventToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventsList;

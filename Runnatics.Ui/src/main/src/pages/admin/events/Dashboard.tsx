// src/pages/Events/EventsList.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
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
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";
import { EventService } from "../../../services/EventService";
import { Event } from "../../../models/Event";
import { EventSearchRequest } from "../../../models/EventSearchRequest";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create custom theme based on Quartz
const myTheme = themeQuartz.withParams({
  accentColor: "#1976d2",
  backgroundColor: "#ffffff",
  borderColor: "#e0e0e0",
  borderRadius: 4,
  browserColorScheme: "light",
  chromeBackgroundColor: "#f5f5f5",
  columnBorder: true,
  fontFamily: "Roboto, sans-serif",
  fontSize: 14,
  foregroundColor: "#000000",
  headerBackgroundColor: "#f5f5f5",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerTextColor: "#000000",
  oddRowBackgroundColor: "#fafafa",
  rowBorder: true,
  spacing: 8,
});

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
      setTotalRecords(response.message?.length || 0);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.response?.data?.message || "Failed to fetch events");
      setEvents([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleEditEvent = (eventId: number | undefined) => {
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
      console.error("Error deleting event:", err);
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Actions cell renderer
  const ActionsCellRenderer = useCallback((props: any) => {
    const event = props.data;
    return (
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100%" }}
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
    );
  }, []);

  // Published status cell renderer
  const PublishedCellRenderer = useCallback((props: any) => {
    const published = props.value;
    return (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Chip
          label={published ? "Yes" : "No"}
          color={published ? "success" : "default"}
          size="small"
        />
      </Box>
    );
  }, []);

  // AG Grid column definitions
  const columnDefs: ColDef<Event>[] = useMemo(
    () => [
      {
        headerName: "#",
        valueGetter: (params) => {
          const pageSize = searchCriteria.pageSize || 10;
          const pageNumber = searchCriteria.pageNumber || 1;
          return (pageNumber - 1) * pageSize + (params.node?.rowIndex ?? 0) + 1;
        },
        width: 80,
        sortable: false,
        filter: false,
      },
      {
        field: "name",
        headerName: "Event Name",
        flex: 2,
        sortable: true,
        filter: true,
      },
      {
        field: "eventDate",
        headerName: "Event Date",
        flex: 1.5,
        sortable: true,
        filter: "agDateColumnFilter",
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        field: "venueAddress",
        headerName: "Address",
        flex: 2,
        sortable: true,
        filter: true,
        valueGetter: (params) => params.data?.venueAddress || "N/A",
      },
      {
        field: "eventOrganizerName",
        headerName: "Organizer",
        flex: 1.5,
        sortable: true,
        filter: true,
        valueGetter: (params) => params.data?.eventOrganizerName || "N/A",
      },
      {
        headerName: "Published",
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: PublishedCellRenderer,
        valueGetter: (params) => params.data?.eventSettings?.published || false,
      },
      {
        headerName: "Action",
        width: 140,
        sortable: false,
        filter: false,
        cellRenderer: ActionsCellRenderer,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    ],
    [searchCriteria, ActionsCellRenderer, PublishedCellRenderer]
  );

  // Default column definitions
  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  const onGridReady = useCallback((_params: GridReadyEvent) => {
    // Grid is ready - can be used for additional initialization if needed
  }, []);

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
          {/* AG Grid Table */}
          <Box
            sx={{
              height: "600px",
              width: "100%",
            }}
          >
            <AgGridReact<Event>
              theme={myTheme}
              rowData={events}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              pagination={false}
              domLayout="normal"
              animateRows={true}
              rowHeight={60}
              headerHeight={50}
              loading={loading}
              overlayLoadingTemplate={
                '<span class="ag-overlay-loading-center">Loading events...</span>'
              }
              overlayNoRowsTemplate={
                '<span class="ag-overlay-no-rows-center">No events to display</span>'
              }
            />
          </Box>

          {/* Custom Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              p: 2,
              backgroundColor: "background.paper",
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {events.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0}{" "}
              to {Math.min(pageNumber * pageSize, totalRecords)} of{" "}
              {totalRecords} entries
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber === 1 || loading}
                onClick={() =>
                  setSearchCriteria((prev) => ({ ...prev, pageNumber: 1 }))
                }
              >
                First
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber === 1 || loading}
                onClick={() =>
                  setSearchCriteria((prev) => ({
                    ...prev,
                    pageNumber: pageNumber - 1,
                  }))
                }
              >
                Previous
              </Button>
              <Typography
                variant="body2"
                sx={{ minWidth: "100px", textAlign: "center" }}
              >
                Page {pageNumber} of {totalPages || 1}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber >= totalPages || loading}
                onClick={() =>
                  setSearchCriteria((prev) => ({
                    ...prev,
                    pageNumber: pageNumber + 1,
                  }))
                }
              >
                Next
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber >= totalPages || loading}
                onClick={() =>
                  setSearchCriteria((prev) => ({
                    ...prev,
                    pageNumber: totalPages,
                  }))
                }
              >
                Last
              </Button>
            </Stack>
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

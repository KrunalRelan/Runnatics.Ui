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
  Clear as ClearIcon,
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  // Track if user has applied filters (to prevent auto-search)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  useEffect(() => {
    // Only fetch if filters have been applied or it's initial load
    if (hasAppliedFilters || !searchCriteria.name) {
      fetchEvents();
    }
  }, [searchCriteria, hasAppliedFilters]);

  // Auto-search when user types 3+ characters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        handleSearch();
      } else if (searchQuery.length === 0 && searchCriteria.name) {
        // Clear search when query is empty
        handleSearch();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Validate date range
  const validateDateRange = (start: string, end: string): boolean => {
    if (!start || !end) {
      setDateError("");
      return true;
    }
    
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    
    if (endDateObj < startDateObj) {
      setDateError("End date must be equal to or greater than start date");
      return false;
    }
    
    setDateError("");
    return true;
  };

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
    navigate("/events/events-create");
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

  const handleSearch = () => {
    // Validate date range before searching
    if (!validateDateRange(startDate, endDate)) {
      return; // Don't proceed with search if validation fails
    }
    
    const formattedStartDate = startDate ? new Date(startDate).toISOString() : undefined;
    const formattedEndDate = endDate ? new Date(endDate).toISOString() : undefined;
    
    setSearchCriteria({
      ...defaultSearchCriteria,
      name: searchQuery || undefined,
      eventDateFrom: formattedStartDate,
      eventDateTo: formattedEndDate,
      pageNumber: 1,
    });
    setHasAppliedFilters(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setDateError("");
    setSearchCriteria(defaultSearchCriteria);
    setHasAppliedFilters(true); // Trigger fetch with cleared filters
  };

  // Handle Enter key press in search field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle start date change with validation
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    validateDateRange(value, endDate);
  };

  // Handle end date change with validation
  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    validateDateRange(startDate, value);
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
          color={published ? "success" : "error"}
          size="small"
          variant={published ? "filled" : "outlined"}
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

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack spacing={2}>
          {/* Search and Date Range Filters */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="stretch">
            {/* Search Bar */}
            <TextField
              variant="outlined"
              placeholder="Search events by name... (auto-search after 3 chars)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              helperText={
                searchQuery.length > 0 && searchQuery.length < 3
                  ? `Type ${3 - searchQuery.length} more character${3 - searchQuery.length > 1 ? 's' : ''} to search`
                  : ''
              }
              sx={{ flex: { xs: 1, sm: 1 } }}
            />

            {/* Date Range Filters */}
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              onKeyPress={handleKeyPress}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ flex: { xs: 1, sm: 0.8 } }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!dateError}
              helperText={dateError}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ flex: { xs: 1, sm: 0.8 } }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
              sx={{ 
                minWidth: { xs: "100%", sm: "120px" },
                whiteSpace: "nowrap"
              }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={loading}
              sx={{ 
                minWidth: { xs: "100%", sm: "100px" },
                whiteSpace: "nowrap"
              }}
            >
              Clear
            </Button>
          </Stack>

          {/* Active Filters Display */}
          {(searchQuery || startDate || endDate) && (
            <Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Filters:
                </Typography>
                {searchQuery && (
                  <Chip
                    label={`Name: ${searchQuery}`}
                    size="small"
                    onDelete={() => setSearchQuery("")}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {startDate && (
                  <Chip
                    label={`From: ${new Date(startDate).toLocaleDateString()}`}
                    size="small"
                    onDelete={() => setStartDate("")}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {endDate && (
                  <Chip
                    label={`To: ${new Date(endDate).toLocaleDateString()}`}
                    size="small"
                    onDelete={() => setEndDate("")}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </Stack>
      </Card>

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
              position: "relative",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            {/* Overlay Loading Indicator */}
            {loading && events.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                  padding: 3,
                  boxShadow: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                  Loading events...
                </Typography>
              </Box>
            )}
            
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

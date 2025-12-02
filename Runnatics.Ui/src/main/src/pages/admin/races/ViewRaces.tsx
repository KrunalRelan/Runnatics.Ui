import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  SelectChangeEvent,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  FileUpload,
  FileDownload,
  Refresh,
  Edit,
  Delete,
  Dashboard,
  People,
  TrendingUp,
  Place,
  Timer,
  EmojiEvents,
} from "@mui/icons-material";
import DataGrid from "@/main/src/components/DataGrid";
import type { ColDef } from "ag-grid-community";
import { Race } from "@/main/src/models/races/Race";
import { Participant } from "@/main/src/models/races/Participant";
import {
  ParticipantFilters,
  defaultParticipantFilters,
} from "@/main/src/models/races/ParticipantFilters";
import { RaceService } from "@/main/src/services/RaceService";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import AddParticipant from "@/main/src/pages/admin/participants/AddParticipant";
import EditParticipant from "@/main/src/pages/admin/participants/EditParticipant";
import DeleteParticipant from "@/main/src/pages/admin/participants/DeleteParticipant";
import BulkUploadParticipants from "@/main/src/pages/admin/participants/BulkUploadParticipants";

const ViewRaces: React.FC = () => {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();
  const navigate = useNavigate();

  // State
  const [race, setRace] = useState<Race | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [participantsLoading, setParticipantsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedRaceId, setSelectedRaceId] = useState<string | undefined>(raceId);
  const [filters, setFilters] = useState<ParticipantFilters>(defaultParticipantFilters);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Add Participant Dialog State
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState<boolean>(false);

  // Edit Participant Dialog State
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Delete Participant Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);

  // Refs to track initial mount and prevent duplicate calls
  const isInitialMount = useRef(true);
  const isRaceChanging = useRef(false);

  const genderMap: Record<string, number> = {
    male: 1,
    female: 2,
    other: 3,
    all: 0,
  };

  const statusMap: Record<string, number> = {
    registered: 1,
    completed: 2,
    dnf: 3,
    noShow: 4,
    all: 0,
  };

  // Reusable function to fetch participants
  const fetchParticipants = async (
    evtId: string,
    rcId: string,
    currentFilters: ParticipantFilters
  ) => {
    try {
      setParticipantsLoading(true);

      const searchResponse = await ParticipantService.searchParticipants(
        evtId,
        rcId,
        {
          searchString: currentFilters.nameOrBib || "",
          status: currentFilters.status === "all" ? null : statusMap[String(currentFilters.status)],
          gender: currentFilters.gender === "all" ? null : genderMap[String(currentFilters.gender)],
          category: currentFilters.category === "all" ? null : currentFilters.category,
          sortFieldName: "bib",
          sortDirection: 0,
          pageNumber: currentFilters.pageNumber,
          pageSize: currentFilters.pageSize,
        }
      );

      // Handle the actual response structure from your API
      let participantData: any[] = [];
      let total = 0;

      // Your API returns: { message: [], totalCount: number }
      if (searchResponse.message && Array.isArray(searchResponse.message)) {
        participantData = searchResponse.message;
        total = searchResponse.totalCount || 0;
      }
      // Fallback for paginated response structure: { data: [], pagination: {} }
      else if (searchResponse.message && searchResponse.message) {
        participantData = searchResponse.message;
        total = searchResponse.totalCount || 0;
      }
      // Fallback for direct array response
      else if (Array.isArray(searchResponse)) {
        participantData = searchResponse;
        total = searchResponse.length;
      }
      else {
      }

      // Map the API response to the Participant interface
      const mappedParticipants = participantData.map((p: any) => ({
        id: p.id,
        bib: p.bib || "",
        name: p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
        fullName: p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        email: p.email || "",
        phone: p.phone || "",
        gender: p.gender || "",
        category: p.ageCategory || "",
        status: "Registered" as const,
        checkIn: false,
        chipId: "",
      }));



      setParticipants(mappedParticipants);
      setTotalRecords(total);
    } catch (err: any) {

      setParticipants([]);
      setTotalRecords(0);
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Fetch all races for the event on mount (only once)
  useEffect(() => {
    const fetchAllRaces = async () => {
      if (!eventId) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError(null);

        // Fetch all races for this event
        const racesResponse = await RaceService.getAllRaces({
          eventId,
          searchCriteria: {
            pageNumber: 1,
            pageSize: 100,
            sortFieldName: "startTime",
            sortDirection: 1,
          },
        });

        const fetchedRaces = racesResponse.message || [];
        setRaces(fetchedRaces);

        // Set the selected race (from URL parameter or first race)
        const currentRaceId = raceId || fetchedRaces[0]?.id;

        setSelectedRaceId(currentRaceId);
      } catch (err: any) {

        setError(err.response?.data?.message || "Failed to fetch races data");
        setLoading(false);
      }
    };

    fetchAllRaces();
  }, [eventId, raceId]); // Include raceId to prevent issues with URL changes

  // Fetch selected race details and participants when race changes
  useEffect(() => {
    const fetchRaceDetailsAndParticipants = async () => {
      if (!eventId || !selectedRaceId) {

        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the selected race details
        const raceResponse = await RaceService.getRaceById(eventId, selectedRaceId);
        const fetchedRace = raceResponse.message;
        setRace(fetchedRace);

        // Fetch participants - ONLY ONCE per race change
        await fetchParticipants(eventId, selectedRaceId, filters);

        // Mark that initial mount is complete
        isInitialMount.current = false;
        isRaceChanging.current = false;
      } catch (err: any) {

        setError(err.response?.data?.message || "Failed to fetch race details");
      } finally {
        setLoading(false);
      }
    };

    fetchRaceDetailsAndParticipants();
  }, [eventId, selectedRaceId]); // DO NOT include filters here

  // Fetch participants when filters change (but NOT on initial mount or race change)
  useEffect(() => {
    // Skip if initial mount (already fetched in previous effect)
    if (isInitialMount.current) {

      return;
    }

    // Skip if race is changing (already fetching in previous effect)
    if (isRaceChanging.current) {

      return;
    }

    // Skip if no eventId or selectedRaceId
    if (!eventId || !selectedRaceId || loading) {

      return;
    }

    const timeoutId = setTimeout(() => {
      fetchParticipants(eventId, selectedRaceId, filters);
    }, 300); // Debounce for search

    return () => clearTimeout(timeoutId);
  },
    [
      filters.pageNumber,
      filters.pageSize,
      filters.nameOrBib,
      filters.status,
      filters.gender,
      filters.category,
    ]); // DO NOT include eventId, selectedRaceId, or loading

  // Handlers
  const handleBack = () => {
    if (eventId) {
      navigate(`/events/event-details/${eventId}`);
    } else {
      navigate("/events/events-dashboard");
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    if (!eventId || !selectedRaceId) return;

    switch (newValue) {
      case 0:
        navigate("/events/events-dashboard");
        break;
      case 1:
        navigate(`/events/events-edit/${eventId}`);
        break;
      case 2:
        break;
      case 3:

        break;
      case 4:

        break;
      case 5:

        break;
      case 6:

        break;
      default:
        break;
    }
  };

  const handleRaceChange = (newRaceId: string) => {
    if (!eventId) return;

    // Set flag to prevent filter effect from running
    isRaceChanging.current = true;

    // Update selected race
    setSelectedRaceId(newRaceId);

    // Reset filters to default when changing race
    setFilters(defaultParticipantFilters);

    // Update URL to reflect selected race
    navigate(`/events/event-details/${eventId}/race/${newRaceId}`, {
      replace: true,
    });
  };

  const handleFilterChange = (
    field: keyof ParticipantFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      // Reset to page 1 when changing filters (except pagination)
      ...(field !== "pageNumber" && field !== "pageSize" ? { pageNumber: 1 } : {}),
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultParticipantFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handlePageSizeChange = (size: number) => {

    setFilters((prev) => ({
      ...prev,
      pageNumber: 1,
      pageSize: size,
    }));
  };

  const handleRefresh = () => {

    if (eventId && selectedRaceId) {
      fetchParticipants(eventId, selectedRaceId, filters);
    }
  };

  const handleEditParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedParticipant(null);
  };

  const handleUpdateParticipant = () => {
    // Refresh participant list after update
    if (eventId && selectedRaceId) {
      fetchParticipants(eventId, selectedRaceId, filters);
    }
  };

  const handleDeleteParticipant = (participant: Participant) => {
    setParticipantToDelete(participant);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setParticipantToDelete(null);
  };

  const handleConfirmDelete = () => {
    // Refresh participant list after delete
    if (eventId && selectedRaceId) {
      fetchParticipants(eventId, selectedRaceId, filters);
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddParticipant = () => {

    if (eventId && selectedRaceId) {
      fetchParticipants(eventId, selectedRaceId, filters);
    }
  };

  const handleOpenBulkUploadDialog = () => {
    setOpenBulkUploadDialog(true);
  };

  const handleCloseBulkUploadDialog = () => {
    setOpenBulkUploadDialog(false);
  };

  const handleBulkUploadComplete = async () => {

    if (eventId && selectedRaceId) {
      await fetchParticipants(eventId, selectedRaceId, filters);
    }
    handleCloseBulkUploadDialog();
  };

  // Calculate total pages
  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / filters.pageSize) : 1;

  // Loading state
  if (loading && !race) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Container>
    );
  }

  // No race found
  if (!race) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Race not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Container>
    );
  }

  // Define grid columns using AG Grid column definitions
  const columnDefs: ColDef<Participant>[] = [
    {
      field: "bib",
      headerName: "Bib",
      flex: 0.8,
      minWidth: 80,
      sortable: true,
      filter: true,
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1.5,
      minWidth: 150,
      sortable: true,
      filter: true,
      valueGetter: (params: any) =>
        params.data?.fullName || params.data?.name || "",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1.2,
      minWidth: 120,
      sortable: true,
      filter: true,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: true,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: true,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        if (!params.value) return null;
        const statusColors: Record<string, "success" | "warning" | "error"> = {
          Registered: "success",
          Pending: "warning",
          Cancelled: "error",
        };
        const color = statusColors[params.value] || "default";
        return (
          <Chip
            label={params.value}
            color={color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      field: "checkIn",
      headerName: "Check In",
      flex: 0.8,
      minWidth: 90,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (params.value ? "Yes" : "No"),
    },
    {
      field: "chipId",
      headerName: "Chip ID",
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      flex: 0.8,
      minWidth: 100,
      maxWidth: 120,
      cellRenderer: (params: any) => (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          sx={{ height: "100%", alignItems: "center" }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEditParticipant(params.data);
            }}
            title="Edit"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteParticipant(params.data);
            }}
            title="Delete"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
      sortable: false,
      filter: false,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Stack>

        <Typography variant="h4" component="h1" gutterBottom>
          {race.event?.name || "Event"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage race details, participants, and settings
        </Typography>

        {/* Race Selector */}
        {races.length > 0 && (
          <Card sx={{ p: 2.5, mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1.5,
              }}
            >
              {races.length > 1 ? "Select Race:" : "Race:"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {races.map((raceItem) => (
                <Chip
                  key={raceItem.id}
                  label={`${raceItem.distance ? `${raceItem.distance} KM` : ""
                    } - ${raceItem.title}`}
                  onClick={() => handleRaceChange(raceItem.id)}
                  color={selectedRaceId === raceItem.id ? "primary" : "default"}
                  variant={
                    selectedRaceId === raceItem.id ? "filled" : "outlined"
                  }
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    height: "40px",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                />
              ))}
            </Stack>
          </Card>
        )}

        {race.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {race.description}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 2,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.9375rem",
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<Dashboard />}
            iconPosition="start"
            label="Event Dashboard"
          />
          <Tab icon={<Edit />} iconPosition="start" label="Event Details" />
          <Tab icon={<People />} iconPosition="start" label="Participants" />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Dashboard" />
          <Tab icon={<Place />} iconPosition="start" label="Checkpoints (3)" />
          <Tab icon={<Timer />} iconPosition="start" label="Segments" />
          <Tab
            icon={<EmojiEvents />}
            iconPosition="start"
            label="Add Certificate"
          />
        </Tabs>
      </Paper>

      {/* Content Area */}
      <Card>
        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 3, flexWrap: "wrap" }}
            useFlexGap
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleOpenAddDialog}
            >
              Add Participant
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleOpenBulkUploadDialog}
            >
              Bulk Upload
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Export
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="primary"
              title="Refresh"
              onClick={handleRefresh}
              disabled={participantsLoading}
            >
              <Refresh />
            </IconButton>
          </Stack>

          {/* Filters Section */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Filters
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="Name or Bib"
                placeholder="Enter Name or Bib Number"
                value={filters.nameOrBib}
                onChange={(e) =>
                  handleFilterChange("nameOrBib", e.target.value)
                }
                sx={{ flex: 1, minWidth: 200 }}
                size="small"
              />
              <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange("status", e.target.value)
                  }
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="registered">Registered</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  {/* <MenuItem value="pending">Pending</MenuItem> */}
                  <MenuItem value="dnf">DNF</MenuItem>
                  <MenuItem value="noShow">No Show</MenuItem>
                  {/* <MenuItem value="cancelled">Cancelled</MenuItem> */}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange("gender", e.target.value)
                  }
                >
                  <MenuItem value="all">All Genders</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="veteran">Veteran</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: 200 }} size="small">
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={filters.pageSize.toString()}
                  label="Per Page"
                  onChange={(e: SelectChangeEvent) =>
                    handlePageSizeChange(parseInt(e.target.value))
                  }
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Reset
              </Button>
            </Stack>
          </Card>

          <Divider sx={{ mb: 0 }} />

          {/* DataGrid Component */}
          <Box sx={{ mt: 0, pb: 3 }}>
            <DataGrid<Participant>
              rowData={participants}
              columnDefs={columnDefs}
              pagination={false}
              domLayout="autoHeight"
              enableSorting={true}
              enableFiltering={true}
              animateRows={true}
              loading={participantsLoading}
              useCustomPagination={true}
              pageNumber={filters.pageNumber}
              totalRecords={totalRecords}
              totalPages={totalPages}
              paginationPageSize={filters.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add Participant Dialog */}
      <AddParticipant
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onAdd={handleAddParticipant}
        eventId={eventId}
        raceId={selectedRaceId}
      />

      {/* Edit Participant Dialog */}
      <EditParticipant
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onUpdate={handleUpdateParticipant}
        participant={selectedParticipant}
      />

      {/* Delete Participant Dialog */}
      <DeleteParticipant
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onDelete={handleConfirmDelete}
        participant={participantToDelete}
      />

      {/* Bulk Upload Participants Dialog */}
      {eventId && (
        <BulkUploadParticipants
          open={openBulkUploadDialog}
          onClose={handleCloseBulkUploadDialog}
          onComplete={handleBulkUploadComplete}
          eventId={eventId}
          raceId={selectedRaceId}
        />
      )}
    </Container>
  );
};

export default ViewRaces;
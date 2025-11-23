import React, { useState, useEffect } from "react";
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
import DataTable, {
  DataTableColumn,
  DataTableUtils,
} from "@/main/src/components/DataTable";
import { Race } from "@/main/src/models/races/Race";
import { Participant } from "@/main/src/models/races/Participant";
import {
  ParticipantFilters,
  defaultParticipantFilters,
} from "@/main/src/models/races/ParticipantFilters";
import { RaceService } from "@/main/src/services/RaceService";

const ViewRaces: React.FC = () => {
  const { eventId, id: raceId } = useParams<{ eventId: string; id: string }>();
  const navigate = useNavigate();

  // State
  const [race, setRace] = useState<Race | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedRaceId, setSelectedRaceId] = useState<string | undefined>(
    raceId
  );
  const [filters, setFilters] = useState<ParticipantFilters>(
    defaultParticipantFilters
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

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
            pageSize: 100, // Get all races
            sortFieldName: "startTime",
            sortDirection: 1,
          },
        });

        const fetchedRaces = racesResponse.message || [];
        setRaces(fetchedRaces);

        // Set the selected race (from URL parameter or first race)
        // This will trigger the second useEffect to fetch race details
        const currentRaceId = raceId || fetchedRaces[0]?.id;
        setSelectedRaceId(currentRaceId);
      } catch (err: any) {
        console.error("Error fetching races list:", err);
        setError(err.response?.data?.message || "Failed to fetch races data");
        setLoading(false);
      }
      // Don't set loading to false here - let the second useEffect handle it
    };

    fetchAllRaces();
  }, [eventId, raceId]); // Add raceId to dependencies to handle URL changes

  // Fetch selected race details when race changes
  useEffect(() => {
    const fetchRaceDetails = async () => {
      if (!eventId || !selectedRaceId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the selected race details
        const raceResponse = await RaceService.getRaceById(
          eventId,
          selectedRaceId
        );
        const fetchedRace = raceResponse.message;
        setRace(fetchedRace);

        // Check if race has participants data
        if (fetchedRace.participants && fetchedRace.participants.length > 0) {
          // Use real participants data from the race
          setParticipants(fetchedRace.participants);
          setTotalRecords(fetchedRace.participants.length);
        } else {
          // Fall back to mock data if no participants in the response
          const mockParticipants: Participant[] = [
            {
              bib: "1001",
              name: "John Doe",
              gender: "Male",
              category: "Open",
              status: "Registered",
              checkIn: true,
              chipId: "CHIP001",
            },
            {
              bib: "1002",
              name: "Jane Smith",
              gender: "Female",
              category: "Open",
              status: "Registered",
              checkIn: true,
              chipId: "CHIP002",
            },
            {
              bib: "1003",
              name: "Mike Johnson",
              gender: "Male",
              category: "Veteran",
              status: "Pending",
              checkIn: false,
              chipId: "CHIP003",
            },
            {
              bib: "1004",
              name: "Sarah Williams",
              gender: "Female",
              category: "Open",
              status: "Registered",
              checkIn: true,
              chipId: "CHIP004",
            },
            {
              bib: "1005",
              name: "Robert Brown",
              gender: "Male",
              category: "Junior",
              status: "Cancelled",
              checkIn: false,
              chipId: "CHIP005",
            },
          ];
          setParticipants(mockParticipants);
          setTotalRecords(mockParticipants.length);
        }
      } catch (err: any) {
        console.error("Error fetching race details:", err);
        setError(err.response?.data?.message || "Failed to fetch race details");
      } finally {
        setLoading(false);
      }
    };

    fetchRaceDetails();
  }, [eventId, selectedRaceId]); // Depend on selectedRaceId instead of raceId

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

    // Handle navigation based on tab index
    if (!eventId || !selectedRaceId) return;

    switch (newValue) {
      case 0: // Event Dashboard
        navigate("/events/events-dashboard");
        break;
      case 1: // Event Details
        navigate(`/events/event-details/${eventId}`);
        break;
      case 2: // Participants (current page)
        // Already on this page, no navigation needed
        break;
      case 3: // Dashboard
        // TODO: Add route when dashboard page is ready
        console.log("Navigate to race dashboard");
        break;
      // case 4: // Edit
      //   navigate(
      //     `/events/event-details/${eventId}/race/${selectedRaceId}`
      //   );
      //   break;
      case 4: // Checkpoints
        // TODO: Add route when checkpoints page is ready
        console.log("Navigate to checkpoints");
        break;
      case 5: // Segments
        // TODO: Add route when segments page is ready
        console.log("Navigate to segments");
        break;
      case 6: // Add Certificate
        // TODO: Add route when certificate page is ready
        console.log("Navigate to add certificate");
        break;
      default:
        break;
    }
  };

  const handleRaceChange = (raceId: string) => {
    if (!eventId) return;

    // Update selected race - this will trigger the second useEffect to fetch race details
    setSelectedRaceId(raceId);

    // Update URL to reflect selected race
    navigate(`/events/event-details/${eventId}/race/${raceId}`, {
      replace: true,
    });
  };

  const handleFilterChange = (
    field: keyof ParticipantFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultParticipantFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: 1, pageSize: size }));
  };

  const handleEditParticipant = (participant: Participant) => {
    console.log("Edit participant:", participant);
    // Navigate to edit page or open edit dialog
  };

  const handleDeleteParticipant = (participant: Participant) => {
    console.log("Delete participant:", participant);
    // Show confirmation dialog and delete
  };

  // Loading state
  if (loading) {
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

  const totalPages = Math.ceil(totalRecords / filters.pageSize);

  // Define table columns using the shared DataTable component
  const columns: DataTableColumn<Participant>[] = [
    {
      id: "bib",
      label: "Bib",
      field: "bib",
      width: 100,
    },
    {
      id: "name",
      label: "Name",
      field: "name",
      width: 200,
    },
    {
      id: "gender",
      label: "Gender",
      field: "gender",
      width: 120,
    },
    {
      id: "category",
      label: "Category",
      field: "category",
      width: 120,
    },
    {
      id: "status",
      label: "Status",
      width: 130,
      render: (row) => DataTableUtils.renderStatusChip(row.status),
    },
    {
      id: "checkIn",
      label: "Check In",
      width: 100,
      render: (row) => DataTableUtils.renderBoolean(row.checkIn),
    },
    {
      id: "chipId",
      label: "Chip ID",
      field: "chipId",
      width: 120,
    },
    {
      id: "actions",
      label: "Actions",
      width: 120,
      align: "center",
      render: (row) =>
        DataTableUtils.renderActions([
          {
            icon: <Edit fontSize="small" />,
            onClick: () => handleEditParticipant(row),
            tooltip: "Edit",
            color: "primary",
          },
          {
            icon: <Delete fontSize="small" />,
            onClick: () => handleDeleteParticipant(row),
            tooltip: "Delete",
            color: "error",
          },
        ]),
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

        {/* Race Selector - Only show if multiple races */}
        {races.length > 0 && (
          <Paper
            sx={{
              bgcolor: "#fafafa",
              border: "1px solid #e0e0e0",
              p: 2.5,
              mb: 2,
            }}
          >
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
                  label={`${
                    raceItem.distance ? `${raceItem.distance} KM` : ""
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
                      bgcolor:
                        selectedRaceId === raceItem.id ? undefined : "#f0f7ff",
                    },
                  }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* Current Race Title */}
        {/* <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, mb: 3 }}>
          {race.distance ? `${race.distance} KM` : 'Race'} -{' '}
          <Box
            component="span"
            sx={{ fontStyle: 'italic', color: 'text.secondary', fontWeight: 400 }}
          >
            {race.title}
          </Box>
        </Typography> */}
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
          {/* <Tab icon={<Edit />} iconPosition="start" label="Edit" /> */}
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
        <CardContent sx={{ p: 3 }}>
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
            >
              Add Participant
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              sx={{ textTransform: "none", fontWeight: 500 }}
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
            <IconButton color="primary" title="Refresh">
              <Refresh />
            </IconButton>
          </Stack>

          {/* Filters Section */}
          <Paper
            sx={{
              bgcolor: "#fafafa",
              border: "1px solid #e0e0e0",
              p: 3,
              mb: 3,
            }}
          >
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
                sx={{ flex: 1, minWidth: 200, bgcolor: "white" }}
                size="small"
              />
              <FormControl
                sx={{ flex: 1, minWidth: 200, bgcolor: "white" }}
                size="small"
              >
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
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                sx={{ flex: 1, minWidth: 200, bgcolor: "white" }}
                size="small"
              >
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
              <FormControl
                sx={{ flex: 1, minWidth: 200, bgcolor: "white" }}
                size="small"
              >
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
              <FormControl
                sx={{ flex: 1, minWidth: 200, bgcolor: "white" }}
                size="small"
              >
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
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* Shared DataTable Component */}
          <DataTable<Participant>
            columns={columns}
            data={participants}
            pagination={{
              page: filters.pageNumber,
              pageSize: filters.pageSize,
              totalRecords: totalRecords,
              totalPages: totalPages,
              onPageChange: handlePageChange,
            }}
            rowKey="bib"
            emptyMessage="No participants found"
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ViewRaces;

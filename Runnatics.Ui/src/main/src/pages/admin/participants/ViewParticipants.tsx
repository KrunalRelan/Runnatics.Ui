import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  SelectChangeEvent,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Add,
  FileUpload,
  FileDownload,
  Edit,
  Delete,
  ViewWeek,
} from "@mui/icons-material";
import DataGrid from "@/main/src/components/DataGrid";
import type { ColDef } from "ag-grid-community";
import { Participant } from "@/main/src/models/races/Participant";
import {
  ParticipantFilters,
  defaultParticipantFilters,
} from "@/main/src/models/races/ParticipantFilters";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import { Category } from "@/main/src/models/participants/Category";
import { CheckpointsService } from "@/main/src/services/CheckpointsService";
import { Checkpoint } from "@/main/src/models/checkpoints/Checkpoint";
import { RFIDService } from "@/main/src/services/RFIDService";

// LAZY LOAD DIALOG COMPONENTS - Only loaded when needed
const AddParticipant = lazy(
  () => import("@/main/src/pages/admin/participants/AddParticipant")
);
const EditParticipant = lazy(
  () => import("@/main/src/pages/admin/participants/EditParticipant")
);
const DeleteParticipant = lazy(
  () => import("@/main/src/pages/admin/participants/DeleteParticipant")
);
const BulkUploadParticipants = lazy(
  () => import("@/main/src/pages/admin/participants/BulkUploadParticipants")
);
const AddParticipantRangeDialog = lazy(
  () => import("@/main/src/pages/admin/participants/AddParticipantRangeDialog")
);
const UpdateParticipantsByBib = lazy(
  () => import("@/main/src/pages/admin/participants/UpdateParticipantsByBib")
);

// Loading fallback component for dialogs
const DialogLoader: React.FC = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1300,
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 4,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 24,
      }}
    >
      <CircularProgress />
      <Box sx={{ color: "text.secondary" }}>Loading...</Box>
    </Box>
  </Box>
);

interface ViewParticipantsProps {
  eventId: string;
  raceId: string;
}

const ViewParticipants: React.FC<ViewParticipantsProps> = ({
  eventId,
  raceId,
}) => {
  // State
  const [participantsLoading, setParticipantsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<ParticipantFilters>(defaultParticipantFilters);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Categories state for lazy loading
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);

  // Checkpoints state for dynamic columns
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  // Add Participant Dialog State
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState<boolean>(false);
  const [openAddRangeDialog, setOpenAddRangeDialog] = useState<boolean>(false);
  const [openUpdateByBibDialog, setOpenUpdateByBibDialog] = useState<boolean>(false);

  // Edit Participant Dialog State
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Delete Participant Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);

  // Process Results State
  const [processingResults, setProcessingResults] = useState<boolean>(false);
  const [hasProcessedResults, setHasProcessedResults] = useState<boolean>(false);

  // Refs to track initial mount and prevent duplicate calls
  const isInitialMount = useRef(true);
  const prevEventId = useRef<string | undefined>(undefined);
  const prevRaceId = useRef<string | undefined>(undefined);
  const prevFiltersRef = useRef<string>("");

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

  // Fetch categories function (lazy loading)
  const fetchCategories = async () => {
    if (categoriesLoaded || categoriesLoading) return;

    try {
      setCategoriesLoading(true);
      const categoryData = await ParticipantService.getCategories(eventId, raceId);
      setCategories(categoryData || []);
      setCategoriesLoaded(true);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Reset categories when eventId or raceId changes
  useEffect(() => {
    setCategoriesLoaded(false);
    setCategories([]);
  }, [eventId, raceId]);

  // Handler for category dropdown open
  const handleCategoryDropdownOpen = () => {
    if (!categoriesLoaded && !categoriesLoading) {
      fetchCategories();
    }
  };

  // Fetch checkpoints function
  const fetchCheckpoints = async () => {
    if (!eventId || !raceId) return;

    try {
      const response = await CheckpointsService.getAllCheckpoints({
        eventId,
        raceId
      });
      const checkpointData = response.message || [];
      // Sort checkpoints by distance from start
      const sortedCheckpoints = checkpointData.sort((a, b) =>
        (a.distanceFromStart || 0) - (b.distanceFromStart || 0)
      );
      setCheckpoints(sortedCheckpoints);
    } catch (err: any) {
      console.error("Failed to fetch checkpoints:", err);
      setCheckpoints([]);
    }
  };

  // Fetch checkpoints when component mounts or when eventId/raceId changes
  useEffect(() => {
    fetchCheckpoints();
  }, [eventId, raceId]);

  // Fetch participants function
  const fetchParticipants = async (currentFilters: ParticipantFilters) => {
    try {
      setParticipantsLoading(true);

      const searchResponse = await ParticipantService.searchParticipants(
        eventId,
        raceId,
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

      let participantData: any[] = [];
      let total = 0;

      if (searchResponse.message && Array.isArray(searchResponse.message)) {
        participantData = searchResponse.message;
        total = searchResponse.totalCount || 0;
      } else if (searchResponse.message && searchResponse.message) {
        participantData = searchResponse.message;
        total = searchResponse.totalCount || 0;
      } else if (Array.isArray(searchResponse)) {
        participantData = searchResponse;
        total = searchResponse.length;
      }

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
        category: p.category || "",
        status: p.status || "Registered" as const,
        checkIn: p.checkedIn || false,
        chipId: p.chipId || "",
        checkpointTimes: p.checkpointTimes || null,
      }));

      setParticipants(mappedParticipants);
      setTotalRecords(total);

      // Check if any participant has processed checkpoint times
      const hasResults = mappedParticipants.some(
        (p) => p.checkpointTimes && Object.keys(p.checkpointTimes).length > 0
      );
      setHasProcessedResults(hasResults);
    } catch (err: any) {
      setParticipants([]);
      setTotalRecords(0);
      setHasProcessedResults(false);
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Single useEffect to handle all fetch scenarios
  useEffect(() => {
    if (!eventId || !raceId) return;

    const eventOrRaceChanged =
      prevEventId.current !== eventId || prevRaceId.current !== raceId;

    const currentFiltersKey = JSON.stringify({
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      nameOrBib: filters.nameOrBib,
      status: filters.status,
      gender: filters.gender,
      category: filters.category,
    });

    const filtersChanged = prevFiltersRef.current !== currentFiltersKey;

    prevEventId.current = eventId;
    prevRaceId.current = raceId;

    if (isInitialMount.current || eventOrRaceChanged) {
      isInitialMount.current = false;
      prevFiltersRef.current = currentFiltersKey;
      fetchParticipants(filters);
      return;
    }

    if (filtersChanged) {
      const timeoutId = setTimeout(() => {
        prevFiltersRef.current = currentFiltersKey;
        fetchParticipants(filters);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    eventId,
    raceId,
    filters.pageNumber,
    filters.pageSize,
    filters.nameOrBib,
    filters.status,
    filters.gender,
    filters.category,
  ]);

  // Handlers
  const handleFilterChange = (
    field: keyof ParticipantFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
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

   const handleEditParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedParticipant(null);
  };

  const handleUpdateParticipant = () => {
    fetchParticipants(filters);
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
    fetchParticipants(filters);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddParticipant = () => {
    fetchParticipants(filters);
  };

  const handleOpenBulkUploadDialog = () => {
    setOpenBulkUploadDialog(true);
  };

  const handleCloseBulkUploadDialog = () => {
    setOpenBulkUploadDialog(false);
  };

  const handleBulkUploadComplete = async () => {
    await fetchParticipants(filters);
    handleCloseBulkUploadDialog();
  };

  const handleOpenAddRangeDialog = () => {
    setOpenAddRangeDialog(true);
  };

  const handleCloseAddRangeDialog = () => {
    setOpenAddRangeDialog(false);
  };

  const handleAddRangeComplete = async () => {
    await fetchParticipants(filters);
    handleCloseAddRangeDialog();
  };

  const handleOpenUpdateByBibDialog = () => {
    setOpenUpdateByBibDialog(true);
  };

  const handleCloseUpdateByBibDialog = () => {
    setOpenUpdateByBibDialog(false);
  };

  const handleUpdateByBibComplete = async () => {
    await fetchParticipants(filters);
    handleCloseUpdateByBibDialog();
  };

  const handleProcessResults = async () => {
    try {
      setProcessingResults(true);
      const response = await RFIDService.processAllResults(eventId, raceId, false);
      
      // Assuming a successful response is indicated by response.message === true
      if (response.message === true) {
        // Refresh participants data after processing
        await fetchParticipants(filters);
        alert("Results processed successfully!");
      } else {
        alert(`Failed to process results: ${response.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error processing results:", error);
      alert(`Error processing results: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingResults(false);
    }
  };

  const [clearingResults, setClearingResults] = useState<boolean>(false);

  const handleClearProcessedResults = async () => {
    if (!window.confirm("Are you sure you want to clear all processed results? This action cannot be undone.")) {
      return;
    }
    
    try {
      setClearingResults(true);
      const response = await RFIDService.clearProcessedData(eventId, raceId, true);
      
      if (response.message) {
        // Refresh participants data after clearing
        await fetchParticipants(filters);
        alert("Processed results cleared successfully!");
      } else {
        alert(`Failed to clear results: ${response.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error clearing results:", error);
      alert(`Error clearing results: ${error.message || "Unknown error"}`);
    } finally {
      setClearingResults(false);
    }
  };

  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / filters.pageSize) : 1;

  // Define static grid columns
  const staticColumns: ColDef<Participant>[] = [
    {
      headerName: "#",
      flex: 0.4,
      minWidth: 50,
      sortable: true,
      filter: true,
      valueGetter: (params: any) => {
        if (params.node?.rowIndex !== undefined && params.node?.rowIndex !== null) {
          return (filters.pageNumber - 1) * filters.pageSize + params.node.rowIndex + 1;
        }
        return "";
      },
    },
    {
      field: "bib",
      headerName: "Bib",
      flex: 0.8,
      minWidth: 70,
      sortable: true,
      filter: true,
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1.8,
      minWidth: 140,
      sortable: true,
      filter: true,
      valueGetter: (params: any) =>
        params.data?.fullName || params.data?.name || "",
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 0.9,
      minWidth: 90,
      sortable: true,
      filter: true,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1.2,
      minWidth: 110,
      sortable: true,
      filter: true,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.2,
      minWidth: 110,
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
      minWidth: 80,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (params.value ? "Yes" : "No"),
    },
    {
      field: "chipId",
      headerName: "Chip ID",
      flex: 1,
      minWidth: 90,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
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

  // Create dynamic checkpoint columns - only for parent checkpoints (those with parentDeviceName as "N/A")
  const checkpointColumns: ColDef<any>[] = checkpoints
    .filter((checkpoint) => !checkpoint.parentDeviceName || checkpoint.parentDeviceName === "N/A")
    .map((checkpoint) => ({
      headerName: checkpoint.name,
      flex: 0.9,
      minWidth: 90,
      sortable: false,
      filter: false,
    cellRenderer: (params: any) => {
      // Get checkpoint time from participant's checkpointTimes object
      const checkpointTimes = params.data?.checkpointTimes;
      const time = checkpointTimes && checkpointTimes[checkpoint.name];
      
      if (time) {
        return (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Chip
              label={time}
              size="small"
              color="success"
              variant="outlined"
              sx={{
                fontSize: "0.75rem",
                height: "22px",
                fontWeight: 500,
              }}
            />
          </Box>
        );
      }
      
      // Show placeholder for no data
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <Chip
            label="—"
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.75rem",
              height: "20px",
              color: "text.disabled",
              borderColor: "divider"
            }}
          />
        </Box>
      );
    },
    headerTooltip: `Checkpoint: ${checkpoint.name} (${checkpoint.distanceFromStart} KM)`,
  }));

  // Combine static columns with dynamic checkpoint columns
  // Insert checkpoint columns before the Actions column
  const actionsColumn = staticColumns[staticColumns.length - 1];
  const columnsBeforeActions = staticColumns.slice(0, -1);
  const columnDefs: ColDef<Participant>[] = [
    ...columnsBeforeActions,
    ...checkpointColumns,
    actionsColumn,
  ];

  return (
    <Card sx={{ width: "100%", maxWidth: "100%" }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header and Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Participants
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ flexWrap: "wrap" }}
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
              startIcon= {<ViewWeek/>}
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleOpenAddRangeDialog}
            >
              Add Participant Range
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
              startIcon={<FileUpload />}
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleOpenUpdateByBibDialog}
            >
              Update by Bib
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="success"
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleProcessResults}
              disabled={processingResults}
            >
              {processingResults ? "Processing..." : "Process Result"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={handleClearProcessedResults}
              disabled={clearingResults}
            >
              {clearingResults ? "Clearing..." : "Clear Processed Result"}
            </Button>
          </Stack>
        </Box>

        {/* Filters Section */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <TextField
              label="Name or Bib"
              placeholder="Enter Name or Bib Number"
              value={filters.nameOrBib}
              onChange={(e) => handleFilterChange("nameOrBib", e.target.value)}
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
                <MenuItem value="dnf">DNF</MenuItem>
                <MenuItem value="noShow">No Show</MenuItem>
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
                onOpen={handleCategoryDropdownOpen}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categoriesLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </MenuItem>
                )}
                {!categoriesLoading &&
                  categories.map((category) => (
                    <MenuItem key={category.categoryName} value={category.categoryName}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
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

        {/* DataGrid Component */}
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
      </CardContent>

      {/* LAZY LOADED DIALOGS - Only load component when dialog is opened */}

      {/* Add Participant Dialog */}
      {openAddDialog && (
        <Suspense fallback={<DialogLoader />}>
          <AddParticipant
            open={openAddDialog}
            onClose={handleCloseAddDialog}
            onAdd={handleAddParticipant}
            eventId={eventId}
            raceId={raceId}
          />
        </Suspense>
      )}

      {/* Edit Participant Dialog */}
      {openEditDialog && (
        <Suspense fallback={<DialogLoader />}>
          <EditParticipant
            open={openEditDialog}
            onClose={handleCloseEditDialog}
            onUpdate={handleUpdateParticipant}
            participant={selectedParticipant}
            eventId={eventId}
            raceId={raceId}
          />
        </Suspense>
      )}

      {/* Delete Participant Dialog */}
      {openDeleteDialog && (
        <Suspense fallback={<DialogLoader />}>
          <DeleteParticipant
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            onDelete={handleConfirmDelete}
            participant={participantToDelete}
          />
        </Suspense>
      )}

      {/* Bulk Upload Participants Dialog */}
      {openBulkUploadDialog && (
        <Suspense fallback={<DialogLoader />}>
          <BulkUploadParticipants
            open={openBulkUploadDialog}
            onClose={handleCloseBulkUploadDialog}
            onComplete={handleBulkUploadComplete}
            eventId={eventId}
            raceId={raceId}
          />
        </Suspense>
      )}

      {/* Add Participant Range Dialog */}
      {openAddRangeDialog && (
        <Suspense fallback={<DialogLoader />}>
          <AddParticipantRangeDialog
            open={openAddRangeDialog}
            onClose={handleCloseAddRangeDialog}
            onComplete={handleAddRangeComplete}
            eventId={eventId}
            raceId={raceId}
          />
        </Suspense>
      )}

      {/* Update Participants by Bib Dialog */}
      {openUpdateByBibDialog && (
        <Suspense fallback={<DialogLoader />}>
          <UpdateParticipantsByBib
            open={openUpdateByBibDialog}
            onClose={handleCloseUpdateByBibDialog}
            onComplete={handleUpdateByBibComplete}
            eventId={eventId}
            raceId={raceId}
          />
        </Suspense>
      )}
    </Card>
  );
};



export default ViewParticipants;
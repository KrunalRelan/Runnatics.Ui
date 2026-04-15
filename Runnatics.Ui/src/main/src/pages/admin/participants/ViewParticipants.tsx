import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
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
  Visibility,
  ViewColumn,
} from "@mui/icons-material";
import {
  Popover,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Divider as MuiDivider,
} from "@mui/material";
import DataGrid from "@/main/src/components/DataGrid";
import type { ColDef } from "ag-grid-community";
import { DataGridRef } from "@/main/src/models/dataGrid";
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
  // Navigation
  const navigate = useNavigate();

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
  
  // Grid ref for export functionality
  const gridRef = useRef<DataGridRef>(null);

  const genderMap: Record<string, number | null> = {
    male: 1,
    female: 2,
    other: null,  // "Other" gender not supported by numeric codes, use null to filter
    all: 0,
  };

  const reverseGenderMap: Record<number, string> = {
    1: "male",
    2: "female",
    4: "other",  // Changed from 3 to 4
  };

  // Alternative gender code mapping if backend uses different codes
  // Uncomment the appropriate one if code 3 doesn't work
  // const altGenderMap: Record<string, number> = {
  //   male: 1,
  //   female: 2,
  //   other: 0,  // Try 0 for other
  //   all: 0,
  // };
  // const altGenderMap: Record<string, number> = {
  //   male: 1,
  //   female: 2,
  //   other: 4,  // Try 4 for other
  //   all: 0,
  // };

  const statusMap: Record<string, number> = {
    registered: 1,
    completed: 2,
    dnf: 3,
    noShow: 4,
    all: 0,
  };

  const reverseStatusMap: Record<number, string> = {
    1: "registered",
    2: "completed",
    3: "dnf",
    4: "noShow",
    0: "all",
  };

  // Helper function to normalize gender value
  const normalizeGender = (genderValue: unknown): string => {
    if (!genderValue && genderValue !== 0) return "";
    
    let normalized = "";
    
    // If it's a number, convert to string using reverse map
    if (typeof genderValue === "number") {
      normalized = reverseGenderMap[genderValue] || "";
      return normalized;
    }
    
    // If it's a string, try multiple approaches
    if (typeof genderValue === "string") {
      const trimmed = genderValue.toLowerCase().trim();
      
      // Check if it's a numeric string (like "3")
      const numValue = parseInt(trimmed, 10);
      if (!isNaN(numValue) && reverseGenderMap[numValue]) {
        normalized = reverseGenderMap[numValue];
        return normalized;
      }
      
      // Direct string match
      if (["male", "female", "other"].includes(trimmed)) {
        return trimmed;
      }
      
      // Try reverse lookup for common variations
      if (trimmed === "m" || trimmed === "male") return "male";
      if (trimmed === "f" || trimmed === "female") return "female";
      if (trimmed === "o" || trimmed === "other") return "other";
      
      return trimmed;
    }
    
    return "";
  };

  // Helper function to normalize status value
  const normalizeStatus = (statusValue: unknown): string => {
    if (!statusValue) return "Registered";
    
    // If it's a number, convert to string using reverse map (capitalize first letter)
    if (typeof statusValue === "number") {
      const mapped = reverseStatusMap[statusValue];
      return mapped ? mapped.charAt(0).toUpperCase() + mapped.slice(1) : "Registered";
    }
    
    // If it's already a string, capitalize first letter
    if (typeof statusValue === "string") {
      return statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();
    }
    
    return "Registered";
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

  // Auto-fetch checkpoints when eventId/raceId change
  useEffect(() => {
    fetchCheckpoints();
  }, [eventId, raceId]);

  // Expose diagnostic function to window for console access
  useEffect(() => {
    (window as any).testGenderCodes = testGenderCodes;
    // No cleanup - keep function available throughout component lifetime
  }, []); // Empty deps - expose once on mount, never remove

  // Fetch participants function
  const fetchParticipants = async (currentFilters: ParticipantFilters) => {
    try {
      setParticipantsLoading(true);

      const genderValue = currentFilters.gender && currentFilters.gender !== "all" ? genderMap[currentFilters.gender] || null : null;
      const statusValue = currentFilters.status && currentFilters.status !== "all" ? statusMap[currentFilters.status] || null : null;
      
      const searchResponse = await ParticipantService.searchParticipants(
        eventId,
        raceId,
        {
          searchString: currentFilters.nameOrBib || "",
          status: statusValue,
          gender: genderValue,
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

      const mappedParticipants = participantData.map((p: unknown) => {
        const participant = p as Record<string, unknown>;
        const normalizedGender = normalizeGender(participant.gender);
        if (normalizedGender && normalizedGender !== "male" && normalizedGender !== "female") {
        }
        // Normalize checkpointTimes — handle both array [{checkpointName, time}] and object {name: time} formats
        let checkpointTimesObj: Record<string, string> = {};
        if (Array.isArray(participant.checkpointTimes)) {
          (participant.checkpointTimes as any[]).forEach((ct: any) => {
            if (ct.checkpointName && ct.time) {
              checkpointTimesObj[ct.checkpointName] = ct.time;
            }
          });
        } else if (participant.checkpointTimes && typeof participant.checkpointTimes === "object") {
          checkpointTimesObj = participant.checkpointTimes as Record<string, string>;
        }

        return {
          id: participant.id || "",
          bib: participant.bib || "",
          name: participant.fullName || `${participant.firstName || ""} ${participant.lastName || ""}`.trim(),
          fullName: participant.fullName || `${participant.firstName || ""} ${participant.lastName || ""}`.trim(),
          firstName: participant.firstName || "",
          lastName: participant.lastName || "",
          email: participant.email || "",
          phone: participant.phone || "",
          gender: normalizedGender,
          category: participant.category || "",
          status: normalizeStatus(participant.status),
          checkIn: participant.checkedIn || false,
          chipId: participant.chipId || "",
          checkpointTimes: checkpointTimesObj,
          gunTime: participant.gunTime || null,
          netTime: participant.netTime || null,
          overallRank: participant.overallRank ?? null,
          genderRank: participant.genderRank ?? null,
          categoryRank: participant.categoryRank ?? null,
        };
      }) as unknown as Participant[];

      // Client-side filtering for "other" gender since backend returns all participants when gender is null
      let filteredParticipants = mappedParticipants;
      if (currentFilters.gender === "other") {
        filteredParticipants = mappedParticipants.filter(p => p.gender === "other");
      }

      setParticipants(filteredParticipants);
      setTotalRecords(currentFilters.gender === "other" ? filteredParticipants.length : total);

      // Check if any participant has processed checkpoint times
      const hasResults = filteredParticipants.some(
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
      // Capture current values to avoid stale closure in setTimeout
      const capturedFilters = filters;
      const capturedFilterKey = currentFiltersKey;

      const timeoutId = setTimeout(() => {
        prevFiltersRef.current = capturedFilterKey;
        fetchParticipants(capturedFilters);
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
    // For text search, only trigger filter when 0 (cleared) or >= 3 characters
    if (field === "nameOrBib" && typeof value === "string" && value.length > 0 && value.length < 3) {
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field !== "pageNumber" && field !== "pageSize" ? { pageNumber: 1 } : {}),
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultParticipantFilters);
  };

  // DIAGNOSTIC FUNCTION - Test different gender codes
  const testGenderCodes = async () => {
    
    const codesToTest: (number | null)[] = [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    for (const code of codesToTest) {
      try {
        const response = await ParticipantService.searchParticipants(
          eventId,
          raceId,
          {
            searchString: "",
            status: null,
            gender: code,
            category: null,
            sortFieldName: "bib",
            sortDirection: 0,
            pageNumber: 1,
            pageSize: 100,
          }
        );
        
        let count = 0;
        if (response.message && Array.isArray(response.message)) {
          count = response.message.length;
        }
        
        
        // Log detail info about results
        if (count > 0 && response.message && Array.isArray(response.message)) {
          const samples = response.message.slice(0, 3).map(p => ({ 
            name: (p as any).fullName, 
            gender: (p as any).gender 
          }));
          
          // Highlight if we found "Other"
          if (samples.some(s => s.gender && s.gender.toLowerCase() === 'other')) {
          }
        }
      } catch (err) {
        console.error(`[DIAGNOSTIC] Error testing code ${code}:`, err);
      }
    }
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

  // Handler to view participant details
  const handleViewParticipant = (participant: Participant) => {
    if (participant.id) {
      navigate(`/events/event-details/${eventId}/race/${raceId}/participant/${participant.id}`);
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
    fetchParticipants(filters);
    // Reset categories so dropdown picks up any newly added category
    setCategoriesLoaded(false);
    setCategories([]);
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
    // Reset categories so dropdown picks up any newly added category
    setCategoriesLoaded(false);
    setCategories([]);
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

  const handleExportCsv = () => {
    if (gridRef.current) {
      const timestamp = new Date().toISOString().slice(0, 10);
      gridRef.current.exportToCsv(`participants_${timestamp}.csv`);
    }
  };

  const handleProcessResults = async () => {
    try {
      setProcessingResults(true);
      const response = await RFIDService.processAllResults(eventId, raceId, false);
      
      // Check if the response contains a valid processing result
      // The API returns message as an object with status, totalFinishers, etc.
      if (response.message && typeof response.message === 'object' && response.message.status === 'Completed') {
        // Refresh participants data after processing
        await fetchParticipants(filters);
        const result = response.message;
        alert(`Results processed successfully!\n${result.totalFinishers} finishers processed across ${result.checkpointsProcessed} checkpoints.`);
      } else if (response.message && typeof response.message === 'object') {
        // Processing completed but with a different status
        await fetchParticipants(filters);
        alert(`Processing completed with status: ${response.message.status || 'Unknown'}\n${response.message.message || ''}`);
      } else {
        alert(`Failed to process results: ${typeof response.message === 'string' ? response.message : "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error processing results:", error);
      alert(`Error processing results: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingResults(false);
    }
  };

  const [clearingResults, setClearingResults] = useState<boolean>(false);

  // Column visibility state — keys match staticColumns field/headerName
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [colVisAnchor, setColVisAnchor] = useState<null | HTMLElement>(null);

  const toggleColumnVisibility = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleClearProcessedResults = async () => {
    if (!window.confirm("Are you sure you want to clear all processed results? This action cannot be undone.")) {
      return;
    }
    
    try {
      setClearingResults(true);
      const response = await RFIDService.clearProcessedData(eventId, raceId, true);
      
      // Check if the response indicates success (message can be object or string)
      if (response.message) {
        // Refresh participants data after clearing
        await fetchParticipants(filters);
        const successMessage = typeof response.message === 'object' 
          ? (response.message.message || "Processed results cleared successfully!")
          : "Processed results cleared successfully!";
        alert(successMessage);
      } else {
        alert("Failed to clear results: Unknown error");
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
      sortable: false,
      filter: false,
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
      cellRenderer: (params: any) => {
        const participant = params.data as Participant;
        return (
          <Box
            component="span"
            sx={{
              color: "primary.main",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (participant?.id) {
                navigate(
                  `/events/event-details/${eventId}/race/${raceId}/participant/${participant.id}?mode=edit`
                );
              }
            }}
          >
            {params.value}
          </Box>
        );
      },
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
      cellStyle: {
        color: '#1976d2',
        cursor: 'pointer',
        textDecoration: 'none',
      },
      cellClass: 'participant-name-cell',
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
        const statusConfig: Record<string, { color: string; bgColor: string }> = {
          Finished: { color: "#2e7d32", bgColor: "#e8f5e9" },
          DNF: { color: "#d32f2f", bgColor: "#ffebee" },
          DNS: { color: "#ed6c02", bgColor: "#fff3e0" },
          Registered: { color: "#1976d2", bgColor: "#e3f2fd" },
          Pending: { color: "#ed6c02", bgColor: "#fff3e0" },
          Cancelled: { color: "#d32f2f", bgColor: "#ffebee" },
        };
        const config = statusConfig[params.value] || { color: "#757575", bgColor: "#f5f5f5" };
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontWeight: 600,
              color: config.color,
              backgroundColor: config.bgColor,
              borderColor: config.color,
              border: "1px solid",
            }}
          />
        );
      },
    },
    {
      headerName: "Actions",
      flex: 0.8,
      minWidth: 90,
      cellRenderer: (params: any) => (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          sx={{ height: "100%", alignItems: "center" }}
        >
          <IconButton
            size="small"
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              handleViewParticipant(params.data);
            }}
            title="View Details"
          >
            <Visibility fontSize="small" />
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
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "success.main",
                fontFamily: "monospace",
                letterSpacing: "0.5px",
              }}
            >
              {time}
            </Typography>
          </Box>
        );
      }
      
      // Show placeholder for no data
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.9rem",
              color: "text.disabled",
              fontFamily: "monospace",
            }}
          >
            —
          </Typography>
        </Box>
      );
    },
    headerTooltip: `Checkpoint: ${checkpoint.name} (${checkpoint.distanceFromStart} KM)`,
  }));

  // Timing columns (Gun Time & Chip Time)
  const timingColumns: ColDef<Participant>[] = [
    {
      field: "netTime",
      headerName: "Chip Time",
      flex: 0.9,
      minWidth: 90,
      sortable: true,
      filter: true,
      valueGetter: (params: any) => params.data?.netTime || "—",
    },
    {
      field: "gunTime",
      headerName: "Gun Time",
      flex: 0.9,
      minWidth: 90,
      sortable: true,
      filter: true,
      valueGetter: (params: any) => params.data?.gunTime || "—",
    }
  ];

  // Column visibility labels for the toggle popover (keys match col.field first, then col.headerName)
  const toggleableColumns = [
    { key: "gender", label: "Gender" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "netTime", label: "Chip Time" },
    { key: "gunTime", label: "Gun Time" },
  ];

  // Combine static columns with dynamic checkpoint columns
  // Insert checkpoint columns before the Actions column
  const actionsColumn = staticColumns[staticColumns.length - 1];
  const columnsBeforeActions = staticColumns.slice(0, -1);
  const allColumns: ColDef<Participant>[] = [
    ...columnsBeforeActions,
    ...timingColumns,
    ...checkpointColumns,
    actionsColumn,
  ];

  // Apply column visibility
  const columnDefs: ColDef<Participant>[] = allColumns.filter((col) => {
    const key = col.field || col.headerName || "";
    return !hiddenColumns.has(key);
  });

  return (
    <Card sx={{ 
      width: "100%", 
      maxWidth: "100%",
      '& .participant-name-cell:hover': {
        textDecoration: 'underline',
      }
    }}>
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
              onClick={handleExportCsv}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewColumn />}
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={(e) => setColVisAnchor(e.currentTarget)}
            >
              Columns
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
            <Button
              variant="outlined"
              color="warning"
              sx={{ textTransform: "none", fontWeight: 500, display: "none" }}
              onClick={testGenderCodes}
              title="Debug: Test all gender codes"
            >
              Test Gender Codes
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
          gridRef={gridRef}
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

      {/* Column Visibility Popover */}
      <Popover
        open={Boolean(colVisAnchor)}
        anchorEl={colVisAnchor}
        onClose={() => setColVisAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Toggle Columns
          </Typography>
          <MuiDivider sx={{ mb: 1 }} />
          {toggleableColumns.map((col) => (
            <Box key={col.key} sx={{ display: "block" }}>
              <MuiFormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={!hiddenColumns.has(col.key)}
                    onChange={() => toggleColumnVisibility(col.key)}
                  />
                }
                label={<Typography variant="body2">{col.label}</Typography>}
              />
            </Box>
          ))}
        </Box>
      </Popover>
    </Card>
  );
};



export default ViewParticipants;
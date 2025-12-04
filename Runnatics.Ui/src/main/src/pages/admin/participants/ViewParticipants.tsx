import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
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
  Chip,
} from "@mui/material";
import {
  Add,
  FileUpload,
  FileDownload,
  Refresh,
  Edit,
  Delete,
} from "@mui/icons-material";
import DataGrid from "@/main/src/components/DataGrid";
import type { ColDef } from "ag-grid-community";
import { Participant } from "@/main/src/models/races/Participant";
import {
  ParticipantFilters,
  defaultParticipantFilters,
} from "@/main/src/models/races/ParticipantFilters";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import AddParticipant from "@/main/src/pages/admin/participants/AddParticipant";
import EditParticipant from "@/main/src/pages/admin/participants/EditParticipant";
import DeleteParticipant from "@/main/src/pages/admin/participants/DeleteParticipant";
import BulkUploadParticipants from "@/main/src/pages/admin/participants/BulkUploadParticipants";

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
  const prevEventId = useRef<string | undefined>(undefined);
  const prevRaceId = useRef<string | undefined>(undefined);

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

  // Initial fetch on mount and when eventId or raceId changes
  useEffect(() => {
    if (!eventId || !raceId) return;

    // Only fetch if eventId or raceId actually changed
    const hasChanged =
      prevEventId.current !== eventId ||
      prevRaceId.current !== raceId;

    if (hasChanged) {
      prevEventId.current = eventId;
      prevRaceId.current = raceId;
      fetchParticipants(filters);
      isInitialMount.current = false;
    }
  }, [eventId, raceId]);

  // Fetch participants when filters change (with debounce)
  useEffect(() => {
    if (isInitialMount.current) return;

    const timeoutId = setTimeout(() => {
      fetchParticipants(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
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

  const handleRefresh = () => {
    fetchParticipants(filters);
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

  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / filters.pageSize) : 1;

  // Define grid columns
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

      {/* Add Participant Dialog */}
      <AddParticipant
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onAdd={handleAddParticipant}
        eventId={eventId}
        raceId={raceId}
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
      <BulkUploadParticipants
        open={openBulkUploadDialog}
        onClose={handleCloseBulkUploadDialog}
        onComplete={handleBulkUploadComplete}
        eventId={eventId}
        raceId={raceId}
      />
    </Card>
  );
};

export default ViewParticipants;
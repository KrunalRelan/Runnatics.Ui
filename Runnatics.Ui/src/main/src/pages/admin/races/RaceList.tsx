import React, { useMemo, useCallback, useState } from "react";
import { Box, IconButton, Tooltip, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Container } from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Sms as SmsIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { Race } from "@/main/src/models/races/Race";
import { RaceService } from "@/main/src/services/RaceService";
import DataGrid from "@/main/src/components/DataGrid";
import TablePagination from "@/main/src/components/TablePagination";

interface RaceListProps {
    races: Race[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    loading?: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onEdit?: (raceId: string) => void;
    onDelete?: (raceId: string) => void;
}

function formatTimeOnly(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export const RaceList: React.FC<RaceListProps> = ({
    races,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    loading = false,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
}) => {

    const navigate = useNavigate();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);

    // Snackbar for success/error messages
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleEditClick = (eventId: number | undefined, raceId: number | undefined) => {
        if (eventId) {
            navigate(`/events/event-details/${eventId}/race/edit/${raceId}`);
        }
    };

    const handleDeleteClick = (race: Race) => {
        setRaceToDelete(race);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!raceToDelete || !raceToDelete.id || raceToDelete.eventId === undefined) return;

        try {
            await RaceService.deleteRace(raceToDelete.eventId, raceToDelete.id);
            setDeleteDialogOpen(false);
            setRaceToDelete(null);

            setSnackbar({
                open: true,
                message: `Race "${raceToDelete.title}" deleted successfully!`,
                severity: 'success',
            });
        } catch (err: any) {
            console.error("Error deleting race:", err);
            setSnackbar({
                open: true,
                message: err.response?.data?.message || "Failed to delete race. Please try again.",
                severity: 'error',
            });
            setDeleteDialogOpen(false);
            setRaceToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setRaceToDelete(null);
    };

    // Race Title Cell Renderer
    const RaceTitleCellRenderer = useCallback((props: any) => {
        const race = props.data;
        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (race?.id && race.eventId) {
                navigate(`/events/event-details/${race.eventId}/race/${race.id}`);
            }
        };

        return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                <Typography
                    component="a"
                    href={`/events/event-details/${race.eventId}/race/${race.id}`}
                    onClick={handleClick}
                    sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                        "&:hover": {
                            textDecoration: "underline",
                        },
                    }}
                >
                    {props.value || "N/A"}
                </Typography>
            </Box>
        );
    }, [navigate]);

    // Time Cell Renderer
    const TimeCellRenderer = useCallback((props: any) => {
        const start = formatTimeOnly(props.data.startTime);
        const end = formatTimeOnly(props.data.endTime);
        return (
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 1,
            }}>
                <Typography component="span" sx={{ mr: 1 }}>
                    {start}
                </Typography>
                <Typography component="span" sx={{ mx: 0.5, color: "#888" }}>
                    —
                </Typography>
                <Typography component="span">
                    {end}
                </Typography>
            </Box>
        );
    }, []);

    // Actions Cell Renderer
    const ActionsCellRenderer = useCallback((props: any) => {
        const race = props.data;
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
                        onClick={() => handleEditClick(race.eventId, race.id)}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(race)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }, []);

    // Column Definitions - Updated with proper typing
    const columnDefs: ColDef<Race>[] = useMemo(
        () => [
            {
                field: "title",
                headerName: "Title",
                flex: 2,
                sortable: true,
                filter: true,
                cellRenderer: RaceTitleCellRenderer,
            },
            {
                field: "startTime",
                headerName: "Time",
                flex: 2,
                width: 220,
                sortable: true,
                filter: "agDateColumnFilter",
                cellRenderer: TimeCellRenderer,
            },
            {
                headerName: "Participants",
                field: "maxParticipants", //todo
                width: 150,
                sortable: true,
                filter: false,
            },
            {
                headerName: "Not Encoded",
                width: 150,
                sortable: true,
                filter: false,
            },
            {
                headerName: "SMS",
                field: "smsEnabled",
                width: 100,
                cellRenderer: (params: any) => (
                    <Tooltip title={params.value ? "SMS Sent" : "No SMS"}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            {params.value ? (
                                <SmsIcon color="success" fontSize="small" />
                            ) : (
                                <CancelIcon color="disabled" fontSize="small" />
                            )}
                        </Box>
                    </Tooltip>
                ),
                sortable: true,
                filter: false,
            },
            {
                headerName: "CheckPoints",
                field: "checkPoints",
                width: 130,
                cellRenderer: (params: any) => (
                    <Tooltip title={params.value > 0 ? `${params.value} CheckPoints` : "No CheckPoints"}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            {params.value > 0 ? (
                                <CheckCircleIcon color="primary" fontSize="small" />
                            ) : (
                                <CancelIcon color="disabled" fontSize="small" />
                            )}
                        </Box>
                    </Tooltip>
                ),
                sortable: true,
                filter: false,
            },
            {
                headerName: "Actions",
                width: 120,
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
        [RaceTitleCellRenderer, TimeCellRenderer, ActionsCellRenderer]
    );

    // Default Column Definition
    const defaultColDef = useMemo<ColDef>(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
        }),
        []
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box
                sx={{
                    width: "100%",
                    position: "relative",
                    opacity: loading ? 0.6 : 1,
                    transition: "opacity 0.3s ease-in-out",
                }}
            >

                <DataGrid<Race>
                    rowData={races}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    domLayout="normal"
                    height={400}
                    pagination={false}
                    animateRows={true}
                    rowHeight={50}
                    headerHeight={50}
                    loading={loading}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading events...</span>'
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No events to display</span>'
                />

                {/* Custom Pagination */}
                <Box sx={{ mt: 0 }}>
                    <TablePagination
                        pageNumber={pageNumber}
                        pageSize={pageSize}
                        totalRecords={totalRecords}
                        totalPages={totalPages}
                        loading={loading}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                    />
                </Box>

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
                            Are you sure you want to delete the race "{raceToDelete?.title}"? This action cannot
                            be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success/Error Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default RaceList;
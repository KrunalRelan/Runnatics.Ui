import React, { useMemo, useCallback, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Box, IconButton, Tooltip, Stack, Container, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from "@mui/material";
import TablePagination from "@/main/src/components/TablePagination";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Sms as SmsIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

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

import type { ColDef } from "ag-grid-community";
import { Race } from "@/main/src/models/races/Race";
import { useNavigate } from "react-router-dom";
import { RaceService } from "@/main/src/services/RaceService";

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

            // Show success message
            setSnackbar({
                open: true,
                message: `Race "${raceToDelete.title}" deleted successfully!`,
                severity: 'success',
            });

            // Refresh the list
            // fetchEvents(searchCriteria);
        } catch (err: any) {
            console.error("Error deleting event:", err);

            // Show error message
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


    // Actions cell renderer
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

    const columnDefs: ColDef<Race>[] = useMemo(() => [
        {
            headerName: "Title",
            field: "title" as keyof Race,
            flex: 1,
            cellRenderer: RaceTitleCellRenderer
        },
        {
            headerName: "Time",
            field: "startTime",
            flex: 1,
            valueGetter: (params: any) => {
                const start = formatTimeOnly(params.data.startTime);
                const end = formatTimeOnly(params.data.endTime);
                return start && end ? `${start} - ${end}` : start || end || "";
            },
        },
        { headerName: "Participants", field: "participants" as keyof Race, flex: 1 },
        { headerName: "Not Encoded", field: "notEncoded" as keyof Race, flex: 1 },
        {
            headerName: "SMS",
            field: "sms" as keyof Race,
            flex: 1,
            cellRenderer: (params: any) => (
                <Tooltip title={params.value ? "SMS Sent" : "No SMS"}>
                    {params.value ? <SmsIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                </Tooltip>
            ),
        },
        {
            headerName: "CheckPoints",
            field: "checkPoints" as keyof Race,
            flex: 1,
            cellRenderer: (params: any) => (
                <Tooltip title={params.value ? `${params.value} CheckPoints` : "No CheckPoints"}>
                    {params.value > 0 ? <CheckCircleIcon color="primary" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                </Tooltip>
            ),
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
    ], [ActionsCellRenderer, onEdit, onDelete]);

    const defaultColDef = useMemo<ColDef>(
        () => ({
            resizable: true,
            sortable: true,
            filter: true,
        }),
        []
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ width: "100%" }}>
                <div className="ag-theme-material" style={{ height: 400, width: "100%" }}>
                    <AgGridReact
                        rowData={races}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        domLayout="autoHeight"
                        suppressRowClickSelection
                        pagination={false}
                    />
                </div>
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
                        Are you sure you want to delete the race "{raceToDelete?.title}"?
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

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default RaceList;

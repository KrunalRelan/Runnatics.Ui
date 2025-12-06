import DataGrid from "@/main/src/components/DataGrid";
import { Checkpoint } from "@/main/src/models/checkpoints/Checkpoint";
import { Edit, Delete, Add as AddIcon, Refresh } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Typography, Snackbar, Alert } from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useCallback, useEffect, useState } from "react";
import { CheckpointsService } from "@/main/src/services/CheckpointsService";
import AddOrEditCheckpoint from "./AddOrEditCheckpoint";
import { useParams } from "react-router-dom";
import { CheckpointFilters, defaultCheckpointFilters } from "@/main/src/models/checkpoints/CheckpointFilters";

interface ViewCheckPointsProps {
    eventId: string;
    raceId: string;
}

const ViewCheckPoints: React.FC<ViewCheckPointsProps> = () => {
    const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();

    const [loading, setLoading] = useState<boolean>(false);
    const [localCheckpoints, setLocalCheckpoints] = useState<Checkpoint[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
    const [checkpointToEdit, setCheckpointToEdit] = useState<Checkpoint | null>(null);
    const [filters, setFilters] = useState<CheckpointFilters>(defaultCheckpointFilters);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);

    // Reusable function to fetch checkpoints
    const fetchCheckpoints = async () => {
        if (!eventId || !raceId) return;

        setLoading(true);
        try {
            const response = await CheckpointsService.getAllCheckpoints({
                eventId,
                raceId
            });
            const checkpoints = response.message || [];
            setLocalCheckpoints(checkpoints);
            setTotalCount(checkpoints.length);
            setTotalPages(1); // Or calculate based on pagination
        } catch (err) {
            console.error("Error fetching checkpoints:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch checkpoints on mount and when eventId or raceId changes
    useEffect(() => {
        const loadCheckpoints = async () => {
            if (!eventId || !raceId) return;

            setLoading(true);
            try {
                const response = await CheckpointsService.getAllCheckpoints({
                    eventId,
                    raceId
                });
                const checkpoints = response.message || [];
                setLocalCheckpoints(checkpoints);
                setTotalCount(checkpoints.length);
                setTotalPages(1);
            } catch (err) {
                console.error("Error fetching checkpoints:", err);
            } finally {
                setLoading(false);
            }
        };

        loadCheckpoints();
    }, [eventId, raceId]); // Only depends on eventId and raceId

    const handleAddOrEditCheckpoint = () => {
        // Show success message
        setSnackbar({
            open: true,
            message: checkpointToEdit
                ? "Checkpoint updated successfully!"
                : "Checkpoint added successfully!",
            severity: "success",
        });

        // Refresh checkpoints list
        fetchCheckpoints();
    };

    const handleRefresh = () => {
        fetchCheckpoints();
    };

    const handleDelete = (checkpoint: Checkpoint) => {
        if (!eventId || !raceId || !checkpoint.id) return;
        setLoading(true);
        CheckpointsService.deleteCheckpoint(eventId, raceId, checkpoint.id)
            .then(() => {
                setLocalCheckpoints((prev) => prev.filter(cp => cp.id !== checkpoint.id));
                setTotalCount((prev) => prev - 1);
            })
            .catch((err) => {
                // Optionally show error notification
                console.error('Failed to delete checkpoint:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const IsMandatoryCellRenderer = useCallback((props: any) => {
        const isMandatory = props.value;
        return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                <Chip
                    label={isMandatory ? "Yes" : "No"}
                    color={isMandatory ? "success" : "error"}
                    size="small"
                    variant={isMandatory ? "filled" : "outlined"}
                />
            </Box>
        );
    }, []);

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

    // Define grid columns
    const columnDefs: ColDef<Checkpoint>[] = [
        {
            headerName: "#",
            valueGetter: (params) => {
                const pageSize = filters.pageSize || 10;
                const pageNumber = filters.pageNumber || 1;
                return (pageNumber - 1) * pageSize + (params.node?.rowIndex ?? 0) + 1;
            },
            width: 80,
            sortable: false,
            filter: false,
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            field: "deviceId",
            headerName: "Device Name",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            valueGetter: (params: any) =>
                params.data?.deviceName || "N/A",
        },
        {
            headerName: "Is Mandatory",
            flex: 0.8,
            minWidth: 80,
            sortable: true,
            filter: true,
            cellRenderer: IsMandatoryCellRenderer,
            valueGetter: (params) => params.data?.isMandatory || false,
        },
        {
            field: "distanceFromStart",
            headerName: "Distance",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            field: "lastUpdateMode",
            headerName: "Last Update Mode",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            headerName: "Actions",
            flex: 1,
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
                            setCheckpointToEdit(params.data); // Set the checkpoint to edit
                            setOpenAddDialog(true);           // Open the dialog
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
                            handleDelete(params.data);
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
        <>
            <Card sx={{ p: 3 }}>
                <CardContent>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6">Checkpoints</Typography>
                        <Stack direction="row" spacing={1.5}>
                            <IconButton
                                color="primary"
                                title="Refresh"
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                <Refresh />
                            </IconButton>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddDialog}
                            >
                                Add Checkpoint
                            </Button>
                        </Stack>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                <DataGrid<Checkpoint>
                    rowData={localCheckpoints}
                    columnDefs={columnDefs}
                    pagination={false}
                    domLayout="autoHeight"
                    enableSorting={true}
                    enableFiltering={true}
                    animateRows={true}
                    loading={loading}
                    useCustomPagination={true}
                    pageNumber={filters.pageNumber}
                    totalRecords={totalCount}
                    totalPages={totalPages}
                    paginationPageSize={filters.pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </CardContent>
        </Card>

        {/* Add Checkpoint Dialog */}
        <AddOrEditCheckpoint
            open={openAddDialog}
            onClose={() => {
                handleCloseAddDialog();
                setCheckpointToEdit(null); // Reset after close
            }}
            onClick={handleAddOrEditCheckpoint}
            eventId={eventId}
            raceId={raceId}
            checkpointToEdit={checkpointToEdit ?? undefined}
        />

        {/* Success/Error Snackbar */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </>
    );
}

export default ViewCheckPoints;
import DataGrid from "@/main/src/components/DataGrid";
import { Checkpoint } from "@/main/src/models/checkpoints/Checkpoint";
import { Edit, Delete, Add as AddIcon, Refresh } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Typography, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useCallback, useEffect, useState } from "react";
import { CheckpointsService } from "@/main/src/services/CheckpointsService";
import AddOrEditCheckpoint from "./AddOrEditCheckpoint";
import { CheckpointFilters, defaultCheckpointFilters } from "@/main/src/models/checkpoints/CheckpointFilters";
import { Race } from "@/main/src/models/races/Race";

interface ViewCheckPointsProps {
    eventId: string;
    raceId: string;
    races: Race[];
}

const ViewCheckPoints: React.FC<ViewCheckPointsProps> = ({ eventId, raceId, races }) => {
    // Add Loop handler
    const handleAddLoop = async () => {
        // Find the selected race to get its distance
        const selectedRace = races.find(r => r.id === raceId);
        if (!selectedRace || !selectedRace.distance || localCheckpoints.length === 0) return;
        const raceDistance = Number(selectedRace.distance);
        // Calculate current loop count
        const checkpointsPerLoop = localCheckpoints.length;
        const currentLoopCount = Math.floor(localCheckpoints.length / checkpointsPerLoop);
        const newLoopNumber = currentLoopCount + 1;
        // Copy all current checkpoints as the new loop
        const newCheckpoints = localCheckpoints.map(cp => {
            const newDistance = (Number(cp.distanceFromStart) || 0) + raceDistance * currentLoopCount;
            return {
                ...cp,
                id: '', // New checkpoint, so no id
                distanceFromStart: newDistance,
                name: `${newDistance} KM`,
            };
        });
        // Optionally, call backend to persist new checkpoints here
        setLocalCheckpoints([...localCheckpoints, ...newCheckpoints]);
        setSnackbar({
            open: true,
            message: `Loop ${newLoopNumber} added!`,
            severity: 'success',
        });
    };

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeDrawerTab, setActiveDrawerTab] = useState(0); // 0: Loops, 1: Clone
    const [selectedRaceId, setSelectedRaceId] = useState("");

    // Reset selectedRaceId when opening drawer for Clone Checkpoints
    const handleOpenDrawer = (tab: number) => {
        setDrawerOpen(true);
        setActiveDrawerTab(tab);
        if (tab === 1) setSelectedRaceId("");
    };

    const [loading, setLoading] = useState<boolean>(false);
    const [localCheckpoints, setLocalCheckpoints] = useState<Checkpoint[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
    const [checkpointToEdit, setCheckpointToEdit] = useState<Checkpoint | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [checkpointToDelete, setCheckpointToDelete] = useState<Checkpoint | null>(null);
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

     // Clone checkpoints handler
    const handleCloneCheckpoints = async () => {
        if (!eventId || !selectedRaceId || !raceId) return;
        try {
            await CheckpointsService.cloneCheckpoints(eventId, selectedRaceId, raceId);
            setSnackbar({
                open: true,
                message: "Checkpoints cloned successfully!",
                severity: "success",
            });
            fetchCheckpoints();
        } catch (err) {
            setSnackbar({
                open: true,
                message: "Failed to clone checkpoints.",
                severity: "error",
            });
        }
    };

    const handleRefresh = () => {
        fetchCheckpoints();
    };

    const handleDelete = (checkpoint: Checkpoint) => {
        setCheckpointToDelete(checkpoint);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventId || !raceId || !checkpointToDelete?.id)
            return;

        setLoading(true);
        await CheckpointsService.deleteCheckpoint(eventId, raceId, checkpointToDelete.id)
            .then(() => {
                setLocalCheckpoints((prev) => prev.filter(cp => cp.id !== checkpointToDelete.id));
                setTotalCount((prev) => prev - 1);

                setSnackbar({
                    open: true,
                    message: `Checkpoint "${checkpointToDelete.name}" deleted successfully!`,
                    severity: "success",
                });
            })
            .catch((err) => {
                console.error('Failed to delete checkpoint:', err);
                setSnackbar({
                    open: true,
                    message:
                        err.response?.data?.message ||
                        "Failed to delete checkpoint. Please try again.",
                    severity: "error",
                });
            })
            .finally(() => {
                setLoading(false);
                setDeleteDialogOpen(false);
                setCheckpointToDelete(null);
            });
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setCheckpointToDelete(null);
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
            // field: "lastUpdateMode",
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
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddDialog}
                            >
                                Add Checkpoint
                            </Button>
                            {/* <Button
                                variant="outlined"
                                onClick={() => { handleOpenDrawer(0); }}
                                sx={{ minWidth: 120 }}
                            >
                                Add Loop
                            </Button> */}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddLoop}
                                sx={{ minWidth: 120 }}
                            >
                                Add Loop (Action)
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => handleOpenDrawer(1)}
                                sx={{ minWidth: 160 }}
                            >
                                Clone Checkpoints
                            </Button>
                        </Stack>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Side Drawer for Loops/Clone Checkpoints */}
                    <Drawer
                        anchor="right"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        PaperProps={{
                            sx: {
                                width: '50vw',
                                maxWidth: 500,
                                minWidth: 340,
                                top: '40%',
                                transform: 'translateY(-50%)',
                                height: 'auto',
                                maxHeight: '80vh',
                                borderRadius: 3,
                                p: 3,
                                overflowY: 'auto',
                            },
                        }}
                    >
                        <Tabs value={activeDrawerTab} onChange={(_, v) => setActiveDrawerTab(v)}>
                            <Tab label="Loops" />
                            <Tab label="Clone Checkpoints" />
                        </Tabs>
                        {activeDrawerTab === 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>Manage Loops</Typography>
                                <Select defaultValue={1} size="small" sx={{ minWidth: 120 }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <MenuItem key={n} value={n}>{n} Loops</MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        )}
                        {activeDrawerTab === 1 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>Clone Checkpoints</Typography>
                                <Select
                                    value={selectedRaceId}
                                    onChange={e => setSelectedRaceId(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 220, mb: 2 }}
                                    displayEmpty
                                    renderValue={selected => selected ? races.find(r => r.id === selected)?.title : "Select Race"}
                                >
                                    {races.filter(race => race.id !== raceId).map(race => (
                                        <MenuItem key={race.id} value={race.id}>{race.title}</MenuItem>
                                    ))}
                                </Select>
                                <Button
                                    variant="outlined"
                                    sx={{ minWidth: 120 }}
                                    disabled={!selectedRaceId}
                                    onClick={handleCloneCheckpoints}
                                >
                                    Clone
                                </Button>
                            </Box>
                        )}
                    </Drawer>
                    <DataGrid
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
                        columnDefs={columnDefs}
                        rowData={localCheckpoints}
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
                        Are you sure you want to delete the checkpoint "{checkpointToDelete?.name}"?
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
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
};

export default ViewCheckPoints;
import DataGrid from "@/main/src/components/DataGrid";
import { Checkpoint } from "@/main/src/models/checkpoints/Checkpoint";
import { Edit, Delete, Add as AddIcon, Refresh } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Stack,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Drawer,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    FormHelperText
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useCallback, useEffect, useState, useMemo } from "react";
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

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeDrawerTab, setActiveDrawerTab] = useState(0);
    const [selectedRaceId, setSelectedRaceId] = useState("");
    const [drawerLoopInput, setDrawerLoopInput] = useState<number>(1);

    const handleOpenDrawer = (tab: number) => {
        setDrawerOpen(true);
        setActiveDrawerTab(tab);
        if (tab === 1) {
            setSelectedRaceId("");
        }
        if (tab === 0) {
            setDrawerLoopInput(loopInput);
        }
    };

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedRace, setSelectedRace] = useState<Race>();
    const [localCheckpoints, setLocalCheckpoints] = useState<Checkpoint[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
    const [checkpointToEdit, setCheckpointToEdit] = useState<Checkpoint | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [checkpointToDelete, setCheckpointToDelete] = useState<Checkpoint | null>(null);
    const [filters, setFilters] = useState<CheckpointFilters>(defaultCheckpointFilters);
    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);
    const [loopInput, setLoopInput] = useState<number>(1);
    const [loopError, setLoopError] = useState<string | null>(null);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    // Memoized calculation of race parameters
    const raceParams = useMemo(() => {
        if (!selectedRace || !selectedRace.distance || !selectedRace.raceSettings?.loopLength) {
            return { raceDistance: 0, loopLength: 0, maxLoops: 0 };
        }
        const raceDistance = Number(selectedRace.distance);
        const loopLength = Number(selectedRace.raceSettings.loopLength);
        const maxLoops = loopLength > 0 ? Math.floor(raceDistance / loopLength) : 0;
        return { raceDistance, loopLength, maxLoops };
    }, [selectedRace]);

    // Consolidated reusable function to fetch checkpoints
    const fetchCheckpoints = useCallback(async () => {
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
            setSnackbar({
                open: true,
                message: "Failed to fetch checkpoints.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [eventId, raceId]);

    // Set selectedRace when component loads or races / raceId change
    useEffect(() => {
        setSelectedRace(races.find(r => r.id === raceId));
    }, [races, raceId]);

    // Fetch checkpoints on mount and when eventId or raceId changes
    useEffect(() => {
        fetchCheckpoints();
    }, [fetchCheckpoints]);

    // Update loopInput to maxLoops when race changes
    useEffect(() => {
        if (raceParams.maxLoops > 0) {
            setLoopInput(raceParams.maxLoops);
        }
    }, [raceParams.maxLoops]);

    const handleAddOrEditCheckpoint = () => {
        setSnackbar({
            open: true,
            message: checkpointToEdit
                ? "Checkpoint updated successfully!"
                : "Checkpoint added successfully!",
            severity: "success",
        });
        fetchCheckpoints();
    };

    // Check if race has finish checkpoint
    const hasFinishCheckpoint = useMemo(() => {
        if (!selectedRace?.distance) return false;
        return localCheckpoints.some(cp => Number(cp.distanceFromStart) === Number(selectedRace.distance));
    }, [localCheckpoints, selectedRace?.distance]);

    /**
     * SIMPLIFIED Add Loops Handler
     * - Takes the target number of loops from input
     * - Automatically calculates and adds all necessary checkpoints
     * - Uses first loop checkpoints as template
     */
    const handleAddLoops = async (targetLoops?: number) => {
        // Defensive guard: if race already has Finish, don't allow more loops
        if (hasFinishCheckpoint) {
            setSnackbar({
                open: true,
                message: "Race already has a Finish checkpoint. No more loops can be added.",
                severity: "info",
            });
            return;
        }

        const totalLoopsWanted = targetLoops ?? loopInput;
        setLoopError(null);

        // Validation
        if (!selectedRace || !selectedRace.distance) {
            setLoopError("Race configuration is missing.");
            return;
        }

        const { raceDistance, loopLength, maxLoops } = raceParams;

        if (loopLength <= 0) {
            setLoopError("Loop length is not configured for this race.");
            return;
        }

        if (totalLoopsWanted < 1) {
            setLoopError("Please enter at least 1 loop.");
            return;
        }

        if (totalLoopsWanted > maxLoops) {
            setLoopError(`Maximum ${maxLoops} loops allowed for this race (${raceDistance}km / ${loopLength}km per loop).`);
            return;
        }

        if (localCheckpoints.length === 0) {
            setLoopError("Please add at least one checkpoint for the first loop before adding more loops.");
            return;
        }

        // Get first loop checkpoints (checkpoints within the first loopLength distance)
        const firstLoopCheckpoints = [...localCheckpoints]
            .filter(cp => Number(cp.distanceFromStart) <= loopLength)
            .sort((a, b) => Number(a.distanceFromStart) - Number(b.distanceFromStart));

        if (firstLoopCheckpoints.length === 0) {
            setLoopError("No checkpoints found within the first loop distance. Please add checkpoints first.");
            return;
        }

        // Generate ALL checkpoints for the requested number of loops
        const newCheckpoints: any[] = [];
        const existingDistances = new Set(localCheckpoints.map(cp => Number(cp.distanceFromStart)));

        for (let loopIndex = 0; loopIndex < totalLoopsWanted; loopIndex++) {
            const baseDistance = loopIndex * loopLength;

            for (const checkpoint of firstLoopCheckpoints) {
                const originalDistance = Number(checkpoint.distanceFromStart);
                const newDistance = baseDistance + originalDistance;

                // Skip if beyond race distance
                if (newDistance > raceDistance) continue;

                // Skip if checkpoint already exists at this distance
                if (existingDistances.has(newDistance)) continue;

                // Determine checkpoint name
                let checkpointName: string;
                if (newDistance === 0) {
                    checkpointName = "Start";
                } else if (newDistance === raceDistance) {
                    checkpointName = "Finish";
                } else {
                    checkpointName = `${newDistance} KM`;
                }

                newCheckpoints.push({
                    name: checkpointName,
                    distanceFromStart: newDistance,
                    deviceId: checkpoint.deviceId || "",
                    parentDeviceId: checkpoint.parentDeviceId || "",
                    isMandatory: checkpoint.isMandatory || false,
                });

                // Track this distance to avoid duplicates within the same batch
                existingDistances.add(newDistance);
            }
        }

        // Add finish checkpoint if not exists and we're completing all loops
        if (!existingDistances.has(raceDistance) && totalLoopsWanted === maxLoops) {
            const templateCheckpoint = firstLoopCheckpoints[firstLoopCheckpoints.length - 1];
            newCheckpoints.push({
                name: "Finish",
                distanceFromStart: raceDistance,
                deviceId: templateCheckpoint?.deviceId || "",
                parentDeviceId: templateCheckpoint?.parentDeviceId || "",
                isMandatory: true,
            });
        }

        if (newCheckpoints.length === 0) {
            setSnackbar({
                open: true,
                message: "All checkpoints for the requested loops already exist.",
                severity: "info",
            });
            return;
        }

        // Save to database
        setLoading(true);
        try {
            await CheckpointsService.createCheckpoints(eventId, raceId, newCheckpoints);
            setSnackbar({
                open: true,
                message: `Successfully added ${newCheckpoints.length} checkpoint(s) for ${totalLoopsWanted} loop(s)!`,
                severity: "success",
            });
            fetchCheckpoints();
            setDrawerOpen(false);
        } catch (err: any) {
            console.error("Error adding loops:", err);
            setSnackbar({
                open: true,
                message: err.response?.data?.error || "Failed to save checkpoints.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Quick action: Add ALL remaining loops to complete the race
     */
    const handleAddAllLoops = async () => {
        await handleAddLoops(raceParams.maxLoops);
    };

    const handleLoopInputChange = (value: number) => {
        setLoopError(null);

        if (isNaN(value) || value < 1) {
            setLoopInput(1);
        } else if (value > raceParams.maxLoops && raceParams.maxLoops > 0) {
            setLoopInput(raceParams.maxLoops);
            setLoopError(`Maximum ${raceParams.maxLoops} loops allowed.`);
        } else {
            setLoopInput(value);
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
        if (!eventId || !raceId || !checkpointToDelete?.id) return;

        setLoading(true);
        try {
            await CheckpointsService.deleteCheckpoint(eventId, raceId, checkpointToDelete.id);
            setDeleteDialogOpen(false);
            setCheckpointToDelete(null);

            setSnackbar({
                open: true,
                message: `Checkpoint "${checkpointToDelete.name}" deleted successfully!`,
                severity: "success",
            });

            await fetchCheckpoints();
        } catch (err: any) {
            console.error("Error deleting checkpoint:", err);

            setSnackbar({
                open: true,
                message:
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Failed to delete checkpoint. Please try again.",
                severity: "error",
            });

            setDeleteDialogOpen(false);
            setCheckpointToDelete(null);
        } finally {
            setLoading(false);
        }
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

    // Check if Add Loops should be disabled
    const isAddLoopsDisabled = useMemo(() => {
        if (!selectedRace || !selectedRace.distance || raceParams.loopLength <= 0) return true;
        if (localCheckpoints.length === 0) return true;
        // Once finish checkpoint exists, we should not allow more loops
        if (hasFinishCheckpoint) return true;
        return false;
    }, [selectedRace, raceParams.loopLength, localCheckpoints.length, hasFinishCheckpoint]);

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
            headerName: "Distance (KM)",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            headerName: "Last Update Mode",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            valueGetter: () => "N/A",
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
                            setCheckpointToEdit(params.data);
                            setOpenAddDialog(true);
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
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        <Typography variant="h6">Checkpoints</Typography>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
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

                            {/* Loop Input Section */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TextField
                                    type="number"
                                    size="small"
                                    label="Total Loops"
                                    inputProps={{
                                        min: 1,
                                        max: raceParams.maxLoops || 99,
                                    }}
                                    value={loopInput}
                                    onChange={(e) => handleLoopInputChange(Number(e.target.value))}
                                    sx={{ width: 100 }}
                                    disabled={
                                        !selectedRace ||
                                        !selectedRace.distance ||
                                        raceParams.loopLength <= 0
                                    }
                                    error={!!loopError}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddLoops()}
                                    sx={{ minWidth: 120 }}
                                    disabled={isAddLoopsDisabled || loading}
                                >
                                    {loading ? "Adding..." : "Add Loops"}
                                </Button>
                            </Box>

                            <Button
                                variant="outlined"
                                onClick={() => handleOpenDrawer(1)}
                                sx={{ minWidth: 160 }}
                            >
                                Clone Checkpoints
                            </Button>
                        </Stack>
                    </Box>

                    {/* Error/Info messages */}
                    {loopError && (
                        <FormHelperText error sx={{ mb: 2 }}>{loopError}</FormHelperText>
                    )}

                    {/* Race info helper */}
                    {raceParams.loopLength > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Race: {raceParams.raceDistance} KM | Loop Length: {raceParams.loopLength} KM | Max Loops: {raceParams.maxLoops}
                            {hasFinishCheckpoint && " | ✓ Finish checkpoint exists"}
                        </Typography>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    {/* Side Drawer for Loops/Clone Checkpoints */}
                    <Drawer
                        anchor="right"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        PaperProps={{
                            sx: {
                                width: "50vw",
                                maxWidth: 500,
                                minWidth: 340,
                                top: "40%",
                                transform: "translateY(-50%)",
                                height: "auto",
                                maxHeight: "80vh",
                                borderRadius: 3,
                                p: 3,
                                overflowY: "auto",
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

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Race: {raceParams.raceDistance} KM | Loop: {raceParams.loopLength} KM | Max Loops: {raceParams.maxLoops}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Current checkpoints: {localCheckpoints.length}
                                </Typography>

                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <TextField
                                            type="number"
                                            size="small"
                                            label="Number of Loops"
                                            inputProps={{
                                                min: 1,
                                                max: raceParams.maxLoops || 99,
                                            }}
                                            value={drawerLoopInput}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setDrawerLoopInput(
                                                    Math.min(
                                                        Math.max(1, val),
                                                        raceParams.maxLoops || 99
                                                    )
                                                );
                                            }}
                                            sx={{ width: 150 }}
                                            disabled={loading}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => handleAddLoops(drawerLoopInput)}
                                            disabled={isAddLoopsDisabled || loading}
                                        >
                                            {loading ? "Adding..." : "Add Loops"}
                                        </Button>
                                    </Stack>

                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleAddAllLoops}
                                        disabled={isAddLoopsDisabled || loading || hasFinishCheckpoint}
                                        fullWidth
                                    >
                                        Add All Loops ({raceParams.maxLoops} loops to {raceParams.raceDistance} KM)
                                    </Button>

                                    {hasFinishCheckpoint && (
                                        <Alert severity="success">
                                            Race is complete! Finish checkpoint exists at {raceParams.raceDistance} KM.
                                        </Alert>
                                    )}

                                    {localCheckpoints.length === 0 && (
                                        <Alert severity="warning">
                                            Please add at least one checkpoint for the first loop before generating more loops.
                                        </Alert>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {activeDrawerTab === 1 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>Clone Checkpoints</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Copy all checkpoints from another race in this event.
                                </Typography>

                                <Select
                                    value={selectedRaceId}
                                    onChange={e => setSelectedRaceId(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 220, mb: 2 }}
                                    displayEmpty
                                    renderValue={selected => selected ? races.find(r => r.id === selected)?.title : "Select Source Race"}
                                >
                                    {races.filter(race => race.id !== raceId).map(race => (
                                        <MenuItem key={race.id} value={race.id}>{race.title}</MenuItem>
                                    ))}
                                </Select>

                                <Box>
                                    <Button
                                        variant="contained"
                                        sx={{ minWidth: 120 }}
                                        disabled={!selectedRaceId || loading}
                                        onClick={async () => {
                                            if (!eventId || !selectedRaceId || !raceId) return;

                                            setLoading(true);
                                            try {
                                                await CheckpointsService.cloneCheckpoints(
                                                    eventId,
                                                    selectedRaceId,
                                                    raceId
                                                );
                                                setSnackbar({
                                                    open: true,
                                                    message: "Checkpoints cloned successfully!",
                                                    severity: "success",
                                                });
                                                fetchCheckpoints();
                                                setDrawerOpen(false);
                                            } catch (err: any) {
                                                setSnackbar({
                                                    open: true,
                                                    message:
                                                        err.response?.data?.error ||
                                                        err.response?.data?.message ||
                                                        "Failed to clone checkpoints.",
                                                    severity: "error",
                                                });
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    >
                                        {loading ? "Cloning..." : "Clone"}
                                    </Button>
                                </Box>

                                {localCheckpoints.length > 0 && (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        Warning: This race already has {localCheckpoints.length} checkpoint(s).
                                        Cloning will add additional checkpoints.
                                    </Alert>
                                )}
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

            {/* Add/Edit Checkpoint Dialog */}
            <AddOrEditCheckpoint
                open={openAddDialog}
                onClose={() => {
                    handleCloseAddDialog();
                    setCheckpointToEdit(null);
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
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ViewCheckPoints;

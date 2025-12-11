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
    const [activeDrawerTab, setActiveDrawerTab] = useState(0); // 0: Loops, 1: Clone
    const [selectedRaceId, setSelectedRaceId] = useState("");
    // FIX: Added unified loop input state for drawer
    const [drawerLoopInput, setDrawerLoopInput] = useState<number>(1);

    // Reset selectedRaceId and drawerLoopInput when opening drawer
    const handleOpenDrawer = (tab: number) => {
        setDrawerOpen(true);
        setActiveDrawerTab(tab);
        if (tab === 1) {
            setSelectedRaceId("");
        }
        if (tab === 0) {
            // Reset drawer loop input to current loop count + 1
            const existingLoops = calculateExistingLoops();
            setDrawerLoopInput(existingLoops + 1);
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

    // FIX: Memoized calculation of race parameters
    const raceParams = useMemo(() => {
        if (!selectedRace || !selectedRace.distance || !selectedRace.raceSettings?.loopLength) {
            return { raceDistance: 0, loopLength: 1, maxLoops: 1 };
        }
        const raceDistance = Number(selectedRace.distance);
        const loopLength = selectedRace.raceSettings.loopLength;
        const maxLoops = Math.floor(raceDistance / loopLength);
        return { raceDistance, loopLength, maxLoops };
    }, [selectedRace]);

    // FIX: Calculate existing loops based on checkpoints - memoized with useCallback
    const calculateExistingLoops = useCallback(() => {
        if (localCheckpoints.length === 0 || raceParams.loopLength <= 0) return 0;
        const maxExistingDistance = Math.max(...localCheckpoints.map(cp => Number(cp.distanceFromStart)));
        return Math.floor(maxExistingDistance / raceParams.loopLength);
    }, [localCheckpoints, raceParams.loopLength]);

    // FIX: Consolidated reusable function to fetch checkpoints using useCallback
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

    // FIX: Single useEffect for fetching checkpoints instead of duplicate
    useEffect(() => {
        fetchCheckpoints();
    }, [fetchCheckpoints]);

    // FIX: Update loopInput when existing loops change
    useEffect(() => {
        const existingLoops = calculateExistingLoops();
        if (loopInput <= existingLoops && existingLoops > 0) {
            setLoopInput(existingLoops + 1);
        }
    }, [calculateExistingLoops, loopInput]);

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

        setLoading(true);
        try {
            await CheckpointsService.cloneCheckpoints(eventId, selectedRaceId, raceId);
            setSnackbar({
                open: true,
                message: "Checkpoints cloned successfully!",
                severity: "success",
            });
            fetchCheckpoints();
            setDrawerOpen(false);
        } catch (err: any) {
            // FIX: Better error extraction from API response
            setSnackbar({
                open: true,
                message: err.response?.data?.error || err.response?.data?.message || "Failed to clone checkpoints.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // FIX: Consolidated Add Loops handler with better validation
    const handleAddLoops = async (targetLoops?: number) => {
        const loopsToCreate = targetLoops ?? loopInput;

        if (!selectedRace || !selectedRace.distance || localCheckpoints.length === 0) {
            setLoopError("Race configuration or checkpoints missing.");
            return;
        }

        const { raceDistance, loopLength, maxLoops } = raceParams;

        // Validate loop input
        if (loopsToCreate < 1 || loopsToCreate > maxLoops) {
            setLoopError(`Loop count must be between 1 and ${maxLoops}`);
            return;
        }

        // Get the first loop's checkpoints (sorted by distance)
        const firstLoopCheckpoints = [...localCheckpoints]
            .filter(cp => Number(cp.distanceFromStart) <= loopLength)
            .sort((a, b) => Number(a.distanceFromStart) - Number(b.distanceFromStart));

        if (firstLoopCheckpoints.length === 0) {
            setLoopError('No checkpoints found for the first loop.');
            return;
        }

        // Calculate existing loops
        const existingLoops = calculateExistingLoops();

        // Calculate how many new loops to add
        const loopsToAdd = loopsToCreate - existingLoops;

        if (loopsToAdd <= 0) {
            setLoopError(`Already have ${existingLoops} loop(s). Enter a value greater than ${existingLoops}.`);
            return;
        }

        // Generate new checkpoints for the requested number of loops
        const newCheckpoints: any[] = [];

        for (let loopIndex = 0; loopIndex < loopsToAdd; loopIndex++) {
            const currentLoopNumber = existingLoops + loopIndex + 1;
            const baseDistance = (currentLoopNumber - 1) * loopLength;

            for (let i = 0; i < firstLoopCheckpoints.length; i++) {
                const checkpoint = firstLoopCheckpoints[i];
                const newDistance = baseDistance + Number(checkpoint.distanceFromStart);

                // Stop if we've reached or exceeded race distance
                if (newDistance >= raceDistance) {
                    // Only add Finish if it doesn't already exist
                    const finishExists = [...localCheckpoints, ...newCheckpoints].some(
                        cp => Number(cp.distanceFromStart) === raceDistance && cp.name === 'Finish'
                    );
                    if (!finishExists) {
                        newCheckpoints.push({
                            ...checkpoint,
                            id: '',
                            distanceFromStart: raceDistance,
                            name: 'Finish',
                        });
                    }
                    break;
                } else {
                    // Check if checkpoint at this distance already exists
                    const existsAlready = [...localCheckpoints, ...newCheckpoints].some(
                        cp => Number(cp.distanceFromStart) === newDistance
                    );

                    if (!existsAlready) {
                        newCheckpoints.push({
                            ...checkpoint,
                            id: '',
                            distanceFromStart: newDistance,
                            name: newDistance === raceDistance ? 'Finish' : `${newDistance} KM`,
                        });
                    }
                }
            }

            // Break if we've reached race distance
            if (newCheckpoints.some(cp => Number(cp.distanceFromStart) >= raceDistance)) {
                break;
            }
        }

        if (newCheckpoints.length > 0) {
            setLoading(true);
            try {
                await CheckpointsService.createCheckpoints(eventId, raceId, newCheckpoints);
                setSnackbar({
                    open: true,
                    message: `${newCheckpoints.length} checkpoint(s) added for ${loopsToAdd} loop(s)!`,
                    severity: 'success',
                });
                fetchCheckpoints();
                setLoopError(null);
                setDrawerOpen(false);
            } catch (err) {
                setSnackbar({
                    open: true,
                    message: 'Failed to save new checkpoints to DB.',
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        } else {
            setLoopError('No new checkpoints to add.');
        }
    };

    // FIX: Validate loop input with better UX - reusable for both main and drawer inputs
    const handleLoopInputChange = (value: number, setStateFn: (val: number) => void) => {
        const { maxLoops } = raceParams;
        const existingLoops = calculateExistingLoops();

        // Enforce hard limits
        if (value > maxLoops) {
            value = maxLoops;
            setLoopError(`Maximum ${maxLoops} loops allowed for this race distance`);
        } else if (value < 1 || isNaN(value)) {
            value = 1;
            setLoopError(null);
        } else if (value <= existingLoops) {
            setLoopError(`Already have ${existingLoops} loop(s). Enter a value greater than ${existingLoops}`);
        } else {
            setLoopError(null);
        }

        setStateFn(value);
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
            console.error('Error deleting checkpoint:', err);

            // FIX: Better error extraction from API response
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

    // FIX: Check if all checkpoints for race are present - memoized
    const isRaceComplete = useMemo(() => {
        if (!selectedRace?.distance) return false;
        return localCheckpoints.some(cp => Number(cp.distanceFromStart) === Number(selectedRace.distance));
    }, [localCheckpoints, selectedRace?.distance]);

    // FIX: Determine if Add Loops button should be disabled - memoized
    const isAddLoopsDisabled = useMemo(() => {
        if (!selectedRace || !selectedRace.distance || !selectedRace.raceSettings?.loopLength) return true;
        if (isRaceComplete) return true;
        if (localCheckpoints.length === 0) return true;

        const existingLoops = calculateExistingLoops();
        return loopInput < 1 || loopInput > raceParams.maxLoops || loopInput <= existingLoops;
    }, [selectedRace, isRaceComplete, localCheckpoints.length, loopInput, raceParams.maxLoops, calculateExistingLoops]);

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
            // FIX: Provide default value since field is commented out in the model
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

                            {/* FIX: Loop Input Section - replaced raw input with TextField */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    type="number"
                                    size="small"
                                    label="Total Loops"
                                    inputProps={{
                                        min: 1,
                                        max: raceParams.maxLoops,
                                    }}
                                    value={loopInput}
                                    onChange={(e) => handleLoopInputChange(Number(e.target.value), setLoopInput)}
                                    sx={{ width: 100 }}
                                    disabled={!selectedRace || !selectedRace.distance || isRaceComplete}
                                    error={!!loopError}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddLoops()}
                                    sx={{ minWidth: 120 }}
                                    disabled={isAddLoopsDisabled}
                                >
                                    Add Loops
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

                    {/* FIX: Display loop error below the buttons using proper MUI component */}
                    {loopError && (
                        <FormHelperText error sx={{ mb: 2 }}>{loopError}</FormHelperText>
                    )}

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

                        {/* FIX: Loops tab - connected to functional state */}
                        {activeDrawerTab === 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>Manage Loops</Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Current loops: {calculateExistingLoops()} / Max: {raceParams.maxLoops}
                                </Typography>

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        type="number"
                                        size="small"
                                        label="Target Total Loops"
                                        inputProps={{
                                            min: 1,
                                            max: raceParams.maxLoops,
                                        }}
                                        value={drawerLoopInput}
                                        onChange={(e) => handleLoopInputChange(Number(e.target.value), setDrawerLoopInput)}
                                        sx={{ width: 150 }}
                                        disabled={isRaceComplete}
                                        error={!!loopError}
                                        helperText={loopError || ""}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleAddLoops(drawerLoopInput)}
                                        disabled={
                                            isRaceComplete ||
                                            drawerLoopInput <= calculateExistingLoops() ||
                                            drawerLoopInput > raceParams.maxLoops
                                        }
                                    >
                                        Add Loops
                                    </Button>
                                </Stack>

                                {isRaceComplete && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        Race is complete. All checkpoints have been added up to the finish line.
                                    </Alert>
                                )}
                            </Box>
                        )}

                        {/* Clone Checkpoints tab */}
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
                                        onClick={handleCloneCheckpoints}
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
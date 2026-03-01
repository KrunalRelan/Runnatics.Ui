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
    const [raceCheckpointCounts, setRaceCheckpointCounts] = useState<Record<string, number>>({});

    const handleOpenDrawer = (tab: number) => {
        setDrawerOpen(true);
        setActiveDrawerTab(tab);
        if (tab === 1) {
            setSelectedRaceId("");
            // Fetch checkpoint counts for all races
            fetchRaceCheckpointCounts();
        }
        if (tab === 0) {
            setDrawerLoopInput(loopsToAddInput);
        }
    };

    const fetchRaceCheckpointCounts = async () => {
        if (!eventId) return;
        
        const counts: Record<string, number> = {};
        for (const race of races) {
            try {
                const response = await CheckpointsService.getAllCheckpoints({
                    eventId,
                    raceId: race.id
                });
                counts[race.id] = response.message?.length || 0;
            } catch (error) {
                console.error(`Failed to fetch checkpoints for race ${race.id}:`, error);
                counts[race.id] = 0;
            }
        }
        setRaceCheckpointCounts(counts);
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
    const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
    const [filters, setFilters] = useState<CheckpointFilters>(defaultCheckpointFilters);
    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);
    const [loopsToAddInput, setLoopsToAddInput] = useState<number>(1);
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

    // Get race distance
    const raceDistance = useMemo(() => {
        return selectedRace?.distance ? Number(selectedRace.distance) : 0;
    }, [selectedRace]);

    /**
     * Detect loop length by finding the repeating checkpoint pattern based on device IDs
     * Scenarios:
     * 1. Single checkpoint (stadium track): loop length = checkpoint distance
     * 2. Multiple checkpoints with device repetition: loop ends when first device appears again
     */
    const loopParams = useMemo(() => {
        if (!raceDistance || localCheckpoints.length === 0) {
            return { loopLength: 0, maxNewLoops: 0, currentLoopCount: 0, maxCheckpointDistance: 0 };
        }

        // Sort checkpoints by distance
        const sortedCheckpoints = [...localCheckpoints].sort((a, b) => 
            Number(a.distanceFromStart) - Number(b.distanceFromStart)
        );

        const sortedDistances = sortedCheckpoints.map(cp => Number(cp.distanceFromStart));
        const maxCheckpointDistance = sortedDistances[sortedDistances.length - 1];

        // Case 1: Single checkpoint - stadium/track scenario
        // The checkpoint distance is the loop length
        if (sortedCheckpoints.length === 1) {
            const loopLength = Number(sortedCheckpoints[0].distanceFromStart);
            const currentLoopCount = maxCheckpointDistance > 0 
                ? Math.ceil(maxCheckpointDistance / loopLength)
                : 1;
            
            let maxNewLoops = 0;
            if (maxCheckpointDistance < raceDistance && loopLength > 0) {
                const maxTotalLoops = Math.floor(raceDistance / loopLength);
                maxNewLoops = Math.max(0, maxTotalLoops - currentLoopCount);
            }
            
            return { 
                loopLength, 
                maxNewLoops, 
                currentLoopCount,
                maxCheckpointDistance 
            };
        }

        // Case 2: Two checkpoints
        // Only allow loops if both checkpoints use the SAME device (valid for stadium/track)
        // If different devices, it's not a valid loop pattern
        if (sortedCheckpoints.length === 2) {
            const firstDeviceId = sortedCheckpoints[0].deviceId;
            const secondDeviceId = sortedCheckpoints[1].deviceId;
            
            // Different devices = not a valid loop, can't add more
            if (firstDeviceId !== secondDeviceId) {
                return { 
                    loopLength: maxCheckpointDistance, 
                    maxNewLoops: 0, 
                    currentLoopCount: 1,
                    maxCheckpointDistance 
                };
            }
            
            // Same device = valid loop pattern
            const loopLength = maxCheckpointDistance;
            const currentLoopCount = 1;
            
            let maxNewLoops = 0;
            if (maxCheckpointDistance < raceDistance && loopLength > 0) {
                const maxTotalLoops = Math.floor(raceDistance / loopLength);
                maxNewLoops = Math.max(0, maxTotalLoops - currentLoopCount);
            }
            
            return { 
                loopLength, 
                maxNewLoops, 
                currentLoopCount,
                maxCheckpointDistance 
            };
        }

        // Case 3: Three or more checkpoints - detect loop by device repetition
        let detectedLoopLength = 0; // Start with 0 instead of maxCheckpointDistance
        let loopDetected = false;
        const firstDeviceId = sortedCheckpoints[0].deviceId;
        
        // Look for the first occurrence where the first device appears again
        for (let i = 2; i < sortedCheckpoints.length; i++) {
            if (sortedCheckpoints[i].deviceId === firstDeviceId) {
                const candidateLength = Number(sortedCheckpoints[i].distanceFromStart);
                
                // Verify there's at least one different device between start and this point
                const hasIntermediateDevice = sortedCheckpoints
                    .slice(1, i)
                    .some(cp => cp.deviceId !== firstDeviceId);
                
                if (hasIntermediateDevice) {
                    // Found a valid loop pattern - device repeats with different device(s) in between
                    detectedLoopLength = candidateLength;
                    loopDetected = true;
                    break;
                }
            }
        }

        // If no valid loop pattern was found (no device repetition detected)
        // Return maxNewLoops = 0 to disable Add Loops button
        if (!loopDetected) {
            return { 
                loopLength: maxCheckpointDistance, 
                maxNewLoops: 0, 
                currentLoopCount: 1,
                maxCheckpointDistance 
            };
        }

        // Calculate current loop count based on detected loop length
        const currentLoopCount = detectedLoopLength > 0 
            ? Math.ceil(maxCheckpointDistance / detectedLoopLength)
            : 1;
        
        // Calculate max new loops that can be added
        // Only allow adding loops if max checkpoint distance < race distance
        let maxNewLoops = 0;
        if (maxCheckpointDistance < raceDistance && detectedLoopLength > 0) {
            const maxTotalLoops = Math.floor(raceDistance / detectedLoopLength);
            maxNewLoops = Math.max(0, maxTotalLoops - currentLoopCount);
        }

        return { 
            loopLength: detectedLoopLength, 
            maxNewLoops, 
            currentLoopCount,
            maxCheckpointDistance 
        };
    }, [raceDistance, localCheckpoints]);

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
            // Sort checkpoints by distance from start, then by ID for stable ordering
            const sortedCheckpoints = [...checkpoints].sort((a, b) => {
                const distDiff = Number(a.distanceFromStart) - Number(b.distanceFromStart);
                if (distDiff !== 0) return distDiff;
                // Secondary sort by ID to maintain consistent order
                return a.id.localeCompare(b.id);
            });
            setLocalCheckpoints(sortedCheckpoints);
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

    // Reset loopsToAddInput when maxNewLoops changes
    useEffect(() => {
        if (loopParams.maxNewLoops > 0) {
            setLoopsToAddInput(Math.min(loopsToAddInput, loopParams.maxNewLoops));
        }
    }, [loopParams.maxNewLoops]);

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
            setSnackbar({
                open: true,
                message: err.response?.data?.error || err.response?.data?.message || "Failed to clone checkpoints.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Add Loops Handler - Based on existing checkpoints
     * 
     * Logic:
     * 1. Loop length = detected from checkpoint pattern
     * 2. For each new loop, replicate checkpoints with distance > 0 (from first loop)
     * 3. New checkpoint distance = baseDistance + originalDistance
     * 4. baseDistance for loop N = loopLength * (currentLoopCount + N - 1)
     * 
     * Example: Race 15 KM, existing checkpoints at 0, 2.5, 5 KM
     * - Loop length = 5 KM, currentLoopCount = 1
     * - Adding 2 loops:
     *   - Loop 2 (base=5): 5+2.5=7.5, 5+5=10
     *   - Loop 3 (base=10): 10+2.5=12.5, 10+5=15 (Finish)
     */
    const handleAddLoops = async (loopsToAdd?: number) => {
        const numLoopsToAdd = loopsToAdd ?? loopsToAddInput;
        setLoopError(null);

        // Validation
        if (!selectedRace || !raceDistance) {
            setLoopError("Race configuration is missing.");
            return;
        }

        if (localCheckpoints.length === 0) {
            setLoopError("Please add checkpoints for the first loop before adding more loops.");
            return;
        }

        const { loopLength, maxNewLoops, currentLoopCount } = loopParams;

        if (loopLength <= 0) {
            setLoopError("Cannot determine loop length. Please add checkpoints with distance > 0.");
            return;
        }

        if (numLoopsToAdd < 1) {
            setLoopError("Please enter at least 1 loop to add.");
            return;
        }

        if (numLoopsToAdd > maxNewLoops) {
            setLoopError(
                `Cannot add ${numLoopsToAdd} loop(s). Maximum ${maxNewLoops} loop(s) can be added. ` +
                `(Race: ${raceDistance} KM, Loop: ${loopLength} KM)`
            );
            return;
        }

        // Get first loop checkpoints (excluding start at 0)
        // Only replicate checkpoints with distance > 0 and within first loop
        const firstLoopCheckpoints = localCheckpoints
            .filter(cp => {
                const dist = Number(cp.distanceFromStart);
                return dist > 0 && dist <= loopLength;
            })
            .sort((a, b) => Number(a.distanceFromStart) - Number(b.distanceFromStart));

        if (firstLoopCheckpoints.length === 0) {
            setLoopError("No checkpoints found with distance > 0 in the first loop. Please add intermediate checkpoints.");
            return;
        }

        // Generate new checkpoints for the requested loops
        const newCheckpoints: any[] = [];
        const existingDistances = new Set(localCheckpoints.map(cp => Number(cp.distanceFromStart)));

        // Start from the current loop count (since we're adding NEW loops)
        for (let loopIndex = 0; loopIndex < numLoopsToAdd; loopIndex++) {
            const baseDistance = loopLength * (currentLoopCount + loopIndex);

            for (const checkpoint of firstLoopCheckpoints) {
                const originalDistance = Number(checkpoint.distanceFromStart);
                const newDistance = baseDistance + originalDistance;

                // Skip if beyond race distance
                if (newDistance > raceDistance) continue;

                // Skip if checkpoint already exists at this distance (with tolerance)
                const alreadyExists = [...existingDistances].some(d => Math.abs(d - newDistance) < 0.001);
                if (alreadyExists) continue;

                // Determine checkpoint name
                let checkpointName: string;
                if (Math.abs(newDistance - raceDistance) < 0.001) {
                    checkpointName = "Finish";
                } else {
                    checkpointName = `${newDistance} KM`;
                }

                newCheckpoints.push({
                    name: checkpointName,
                    distanceFromStart: newDistance,
                    deviceId: checkpoint.deviceId || "",
                    parentDeviceId: checkpoint.parentDeviceId || "",
                    isMandatory: Math.abs(newDistance - raceDistance) < 0.001 ? true : (checkpoint.isMandatory || false),
                });

                // Track this distance to avoid duplicates within the same batch
                existingDistances.add(newDistance);
            }
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
                message: `Successfully added ${newCheckpoints.length} checkpoint(s) for new loop(s)!`,
                severity: "success",
            });
            fetchCheckpoints();
            setDrawerOpen(false);
            setLoopsToAddInput(1); // Reset input
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
        await handleAddLoops(loopParams.maxNewLoops);
    };

    const handleLoopsToAddInputChange = (value: number) => {
        setLoopError(null);

        if (isNaN(value) || value < 1) {
            setLoopsToAddInput(1);
        } else if (value > loopParams.maxNewLoops && loopParams.maxNewLoops > 0) {
            setLoopsToAddInput(loopParams.maxNewLoops);
            setLoopError(`Maximum ${loopParams.maxNewLoops} loop(s) can be added.`);
        } else {
            setLoopsToAddInput(value);
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

    const handleDeleteAll = () => {
        setDeleteAllDialogOpen(true);
    };

    const handleDeleteAllConfirm = async () => {
        if (!eventId || !raceId || localCheckpoints.length === 0) return;

        setLoading(true);
        try {
            // Delete all checkpoints using the bulk delete endpoint
            await CheckpointsService.deleteAllCheckpoints(eventId, raceId);

            setDeleteAllDialogOpen(false);
            setSnackbar({
                open: true,
                message: `All ${localCheckpoints.length} checkpoints deleted successfully!`,
                severity: "success",
            });

            // Reload checkpoints
            fetchCheckpoints();
        } catch (error) {
            console.error("Failed to delete all checkpoints:", error);
            setSnackbar({
                open: true,
                message: "Failed to delete all checkpoints. Please try again.",
                severity: "error",
            });
            setDeleteAllDialogOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllCancel = () => {
        setDeleteAllDialogOpen(false);
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

    // Check if race has finish checkpoint (checkpoint at race distance)
    const hasFinishCheckpoint = useMemo(() => {
        if (!raceDistance) return false;
        return localCheckpoints.some(cp => Math.abs(Number(cp.distanceFromStart) - raceDistance) < 0.001);
    }, [localCheckpoints, raceDistance]);

    // Check if checkpoints cover the full race distance
    const isMissingFinish = useMemo(() => {
        if (!raceDistance || localCheckpoints.length === 0) return false;
        return loopParams.maxCheckpointDistance < raceDistance;
    }, [raceDistance, localCheckpoints.length, loopParams.maxCheckpointDistance]);

    // Calculate missing distance
    const missingDistance = useMemo(() => {
        if (!isMissingFinish) return 0;
        return Number((raceDistance - loopParams.maxCheckpointDistance).toFixed(2));
    }, [isMissingFinish, raceDistance, loopParams.maxCheckpointDistance]);

    // Check if Add Loops should be disabled
    const isAddLoopsDisabled = useMemo(() => {
        if (!selectedRace || !raceDistance) return true;
        if (localCheckpoints.length === 0) return true;
        if (loopParams.loopLength <= 0) return true;
        if (loopParams.maxNewLoops <= 0) return true;
        if (hasFinishCheckpoint) return true;
        return false;
    }, [selectedRace, raceDistance, localCheckpoints.length, loopParams.loopLength, loopParams.maxNewLoops, hasFinishCheckpoint]);

    // Define grid columns
    const columnDefs: ColDef<Checkpoint>[] = [
        {
            headerName: "#",
            valueGetter: (params) => {
                const pageSize = filters.pageSize || 10;
                const pageNumber = filters.pageNumber || 1;
                return (pageNumber - 1) * pageSize + (params.node?.rowIndex ?? 0) + 1;
            },
            flex: 0.5,
            minWidth: 60,
            sortable: false,
            filter: false,
        },
        {
            field: "name",
            headerName: "Name",
            flex: 2,
            minWidth: 150,
            sortable: true,
            filter: true,
        },
        {
            field: "deviceId",
            headerName: "Device Name",
            flex: 1.5,
            minWidth: 150,
            sortable: true,
            filter: true,
            valueGetter: (params: any) =>
                params.data?.deviceName || "N/A",
        },
        {
            field: "parentDeviceId",
            headerName: "Parent Device Name",
            flex: 1,
            minWidth: 120,
            sortable: true,
            filter: true,
            valueGetter: (params: any) =>
                params.data?.parentDeviceName || "N/A",
        },
        {
            headerName: "Is Mandatory",
            flex: 1,
            minWidth: 120,
            sortable: true,
            filter: true,
            cellRenderer: IsMandatoryCellRenderer,
            valueGetter: (params) => params.data?.isMandatory || false,
        },
        {
            field: "distanceFromStart",
            headerName: "Distance (KM)",
            flex: 1.2,
            minWidth: 120,
            sortable: true,
            filter: true,
        },
        {
            headerName: "Last Update Mode",
            flex: 1.5,
            minWidth: 150,
            sortable: true,
            filter: true,
            valueGetter: () => "N/A",
        },
        {
            headerName: "Actions",
            flex: 1.2,
            minWidth: 120,
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
            <Card sx={{ width: "100%", maxWidth: "100%", p: 3 }}>
                <CardContent sx={{ p: 0 }}>
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
                        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="flex-start">
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddDialog}
                                disabled={loading}
                                sx={{ mt: 0.5 }}
                            >
                                Add Checkpoint
                            </Button>

                            {/* Loop Input Section */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        type="number"
                                        size="small"
                                        label="Loops to Add"
                                        inputProps={{
                                            min: 1,
                                            max: loopParams.maxNewLoops || 1,
                                        }}
                                        value={loopsToAddInput}
                                        onChange={(e) => handleLoopsToAddInputChange(Number(e.target.value))}
                                        sx={{ width: 120 }}
                                        disabled={isAddLoopsDisabled}
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
                                {loopParams.maxNewLoops > 0 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                        Max: {loopParams.maxNewLoops}
                                    </Typography>
                                )}
                                {localCheckpoints.length === 0 && (
                                    <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                                        Add checkpoints first
                                    </Typography>
                                )}
                                {hasFinishCheckpoint && (
                                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                                        Race complete
                                    </Typography>
                                )}
                            </Box>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={handleDeleteAll}
                                disabled={localCheckpoints.length === 0 || loading}
                                sx={{ mt: 0.5 }}
                            >
                                Delete All
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => handleOpenDrawer(1)}
                                disabled={hasFinishCheckpoint || loading}
                                sx={{ minWidth: 160, mt: 0.5 }}
                            >
                                Clone Checkpoints
                            </Button>
                        </Stack>
                    </Box>

                    {/* Error/Info messages */}
                    {loopError && (
                        <FormHelperText error sx={{ mb: 2 }}>{loopError}</FormHelperText>
                    )}

                    {/* Warning for missing finish checkpoint */}
                    {isMissingFinish && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <strong>Missing Finish Checkpoint!</strong> Checkpoints cover up to {loopParams.maxCheckpointDistance} KM, 
                            but the race is {raceDistance} KM. Please add a checkpoint at {raceDistance} KM to cover the 
                            remaining {missingDistance} KM.
                        </Alert>
                    )}

                    {/* Race Complete indicator */}
                    {hasFinishCheckpoint && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            ✓ Race checkpoints complete! Finish checkpoint exists at {raceDistance} KM.
                        </Alert>
                    )}

                    {/* Race info helper */}
                    {raceDistance > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Race: {raceDistance} KM
                            {loopParams.loopLength > 0 && (
                                <>
                                    {" | "}Loop Length: {loopParams.loopLength} KM
                                    {" | "}Loop(s): {loopParams.currentLoopCount}
                                    {loopParams.maxNewLoops > 0 && ` | Can Add: ${loopParams.maxNewLoops} more loop(s)`}
                                </>
                            )}
                            {loopParams.maxCheckpointDistance > 0 && (
                                <>{" | "}Checkpoints: 0 - {loopParams.maxCheckpointDistance} KM</>
                            )}
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
                                top: "10%",
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

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Race Distance: {raceDistance} KM
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Loop Length: {loopParams.loopLength} KM
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Current Loops: {loopParams.currentLoopCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Checkpoints Coverage: 0 - {loopParams.maxCheckpointDistance} KM
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Loops Available to Add: {loopParams.maxNewLoops}
                                </Typography>

                                <Divider sx={{ mb: 2 }} />

                                {/* Warning for missing finish */}
                                {isMissingFinish && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        Checkpoints only cover up to {loopParams.maxCheckpointDistance} KM. 
                                        Missing {missingDistance} KM to reach finish at {raceDistance} KM.
                                    </Alert>
                                )}

                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <TextField
                                            type="number"
                                            size="small"
                                            label="Loops to Add"
                                            inputProps={{
                                                min: 1,
                                                max: loopParams.maxNewLoops || 1,
                                            }}
                                            value={drawerLoopInput}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                const maxVal = loopParams.maxNewLoops || 1;
                                                setDrawerLoopInput(Math.min(Math.max(1, val), maxVal));
                                            }}
                                            sx={{ width: 150 }}
                                            disabled={loading || isAddLoopsDisabled}
                                            helperText={loopParams.maxNewLoops > 0 ? `Max: ${loopParams.maxNewLoops}` : "No loops available"}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => handleAddLoops(drawerLoopInput)}
                                            disabled={isAddLoopsDisabled || loading}
                                        >
                                            {loading ? "Adding..." : "Add Loops"}
                                        </Button>
                                    </Stack>

                                    {loopParams.maxNewLoops > 0 && (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={handleAddAllLoops}
                                            disabled={isAddLoopsDisabled || loading}
                                            fullWidth
                                        >
                                            Add All {loopParams.maxNewLoops} Loop(s)
                                        </Button>
                                    )}

                                    {hasFinishCheckpoint && (
                                        <Alert severity="success">
                                            Race is complete! Finish checkpoint exists at {raceDistance} KM.
                                        </Alert>
                                    )}

                                    {localCheckpoints.length === 0 && (
                                        <Alert severity="warning">
                                            Please add checkpoints for the first loop before generating more loops.
                                        </Alert>
                                    )}

                                    {localCheckpoints.length > 0 && loopParams.loopLength <= 0 && (
                                        <Alert severity="warning">
                                            Please add checkpoints with distance greater than 0 to define the loop length.
                                        </Alert>
                                    )}

                                    {/* Preview of what will be added */}
                                    {loopParams.maxNewLoops > 0 && drawerLoopInput > 0 && !isAddLoopsDisabled && (
                                        <Alert severity="info">
                                            Adding {drawerLoopInput} loop(s) will create checkpoints up to{" "}
                                            {Math.min(loopParams.loopLength * (loopParams.currentLoopCount + drawerLoopInput), raceDistance)} KM.
                                            <br />
                                            Total loops after: {loopParams.currentLoopCount + drawerLoopInput}
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
                                    renderValue={selected => {
                                        if (!selected) return "Select Source Race";
                                        const race = races.find(r => r.id === selected);
                                        const count = raceCheckpointCounts[selected] || 0;
                                        return race ? `${race.title} (${count})` : "Select Source Race";
                                    }}
                                >
                                    {races
                                        .filter(race => race.id !== raceId && (raceCheckpointCounts[race.id] || 0) > 0)
                                        .map(race => {
                                            const count = raceCheckpointCounts[race.id] || 0;
                                            return (
                                                <MenuItem key={race.id} value={race.id}>
                                                    {race.title} ({count})
                                                </MenuItem>
                                            );
                                        })
                                    }
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
                existingCheckpoints={localCheckpoints}
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

            {/* Delete All Confirmation Dialog */}
            <Dialog
                open={deleteAllDialogOpen}
                onClose={handleDeleteAllCancel}
                aria-labelledby="delete-all-dialog-title"
                aria-describedby="delete-all-dialog-description"
            >
                <DialogTitle id="delete-all-dialog-title">Confirm Delete All</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-all-dialog-description">
                        Are you sure you want to delete all {localCheckpoints.length} checkpoint{localCheckpoints.length !== 1 ? 's' : ''}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteAllCancel} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAllConfirm}
                        color="error"
                        variant="contained"
                        autoFocus
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete All"}
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
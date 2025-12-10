
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

    //Set selectedRace when component loads or races / raceId change
    useEffect(() => {
        setSelectedRace(races.find(r => r.id === raceId));
    }, [races, raceId]);


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

    // Add Loops handler (bulk)
    const handleAddLoops = async () => {
        if (!selectedRace || !selectedRace.distance || localCheckpoints.length === 0) return;
        const raceDistance = Number(selectedRace.distance);
        const loopLength = selectedRace?.raceSettings?.loopLength || 1;
        const maxLoops = Math.floor(raceDistance / loopLength);
        
        // Validate loop input
        if (loopInput < 1 || loopInput > maxLoops) {
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

        // Calculate the total number of loops needed based on loopInput
        const totalLoopsNeeded = loopInput;
        
        // Find how many complete loops already exist
        const maxExistingDistance = Math.max(...localCheckpoints.map(cp => Number(cp.distanceFromStart)));
        const existingLoops = Math.floor(maxExistingDistance / loopLength);
        
        // Calculate how many new loops to add
        const loopsToAdd = totalLoopsNeeded - existingLoops;
        
        if (loopsToAdd <= 0) {
            setLoopError(`Already have ${existingLoops} loop(s). Cannot add more.`);
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
                    message: `${loopsToAdd} loop(s) added successfully!`,
                    severity: 'success',
                });
                fetchCheckpoints();
                setLoopError(null);
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

        try {
            await CheckpointsService.deleteCheckpoint(eventId, raceId, checkpointToDelete.id);
            setDeleteDialogOpen(false);
            setCheckpointToDelete(null);

            // Show success message
            setSnackbar({
                open: true,
                message: `Checkpoint "${checkpointToDelete.name}" deleted successfully!`,
                severity: "success",
            });

            // Refresh checkpoints list
            await fetchCheckpoints();
        } catch (err: any) {
            console.error('Error deleting checkpoint:', err);

            // Show error message
            setSnackbar({
                open: true,
                message:
                    err.response?.data?.message ||
                    "Failed to delete checkpoint. Please try again.",
                severity: "error",
            });

            setDeleteDialogOpen(false);
            setCheckpointToDelete(null);
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    type="number"
                                    min={1}
                                    max={selectedRace && selectedRace.distance && selectedRace.raceSettings?.loopLength ? Math.floor(Number(selectedRace.distance) / selectedRace.raceSettings.loopLength) : 1}
                                    value={loopInput}
                                    onChange={e => {
                                        let val = Number(e.target.value);
                                        
                                        if (!selectedRace || !selectedRace.distance || !selectedRace.raceSettings?.loopLength) {
                                            setLoopInput(val);
                                            return;
                                        }
                                        
                                        const raceDistance = Number(selectedRace.distance);
                                        const loopLength = selectedRace.raceSettings.loopLength;
                                        const maxLoopsForRace = Math.floor(raceDistance / loopLength);
                                        
                                        // Calculate existing loops based on max checkpoint distance
                                        const maxExistingDistance = localCheckpoints.length > 0 
                                            ? Math.max(...localCheckpoints.map(cp => Number(cp.distanceFromStart)))
                                            : 0;
                                        const existingLoops = Math.floor(maxExistingDistance / loopLength);
                                        
                                        // Enforce hard limits
                                        if (val > maxLoopsForRace) {
                                            val = maxLoopsForRace;
                                            setLoopError(`Maximum ${maxLoopsForRace} loops allowed for this race distance`);
                                        } else if (val < 1 || isNaN(val)) {
                                            val = 1;
                                            setLoopError(null);
                                        } else if (val <= existingLoops) {
                                            setLoopError(`Already have ${existingLoops} loop(s). Enter a value greater than ${existingLoops}`);
                                        } else {
                                            setLoopError(null);
                                        }
                                        
                                        setLoopInput(val);
                                    }}
                                    onBlur={e => {
                                        // Additional validation on blur
                                        const val = Number(e.target.value);
                                        if (!selectedRace || !selectedRace.distance || !selectedRace.raceSettings?.loopLength) return;
                                        
                                        const raceDistance = Number(selectedRace.distance);
                                        const loopLength = selectedRace.raceSettings.loopLength;
                                        const maxLoopsForRace = Math.floor(raceDistance / loopLength);
                                        
                                        if (isNaN(val) || val < 1) {
                                            setLoopInput(1);
                                            setLoopError(null);
                                        } else if (val > maxLoopsForRace) {
                                            setLoopInput(maxLoopsForRace);
                                            setLoopError(`Maximum ${maxLoopsForRace} loops allowed for this race distance`);
                                        }
                                    }}
                                    style={{ width: 60, padding: 4, fontSize: 16 }}
                                    disabled={!selectedRace || !selectedRace.distance }
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddLoops}
                                    sx={{ minWidth: 120 }}
                                    disabled={(() => {
                                        if (!selectedRace || !selectedRace.distance || !selectedRace.raceSettings?.loopLength) return true;
                                        const raceDistance = Number(selectedRace.distance);
                                        const loopLength = selectedRace.raceSettings.loopLength;
                                        
                                        // If all checkpoints for the race distance are already present, disable
                                        const allCheckpointsPresent = localCheckpoints.some(cp => Number(cp.distanceFromStart) === raceDistance);
                                        if (allCheckpointsPresent) return true;
                                        
                                        const maxLoops = Math.floor(raceDistance / loopLength);
                                        
                                        // Calculate existing loops based on max checkpoint distance
                                        const maxExistingDistance = localCheckpoints.length > 0 
                                            ? Math.max(...localCheckpoints.map(cp => Number(cp.distanceFromStart)))
                                            : 0;
                                        const existingLoops = Math.floor(maxExistingDistance / loopLength);
                                        
                                        // Disable if input is invalid or if input is less than or equal to existing loops
                                        return loopInput < 1 || loopInput > maxLoops || loopInput <= existingLoops;
                                    })()}
                                >
                                    Add Loops
                                </Button>
                            </Box>
                            {loopError && (
                                <Typography color="error" variant="body2" sx={{ ml: 1 }}>{loopError}</Typography>
                            )}
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
            </Card >

            {/* Add Checkpoint Dialog */}
            < AddOrEditCheckpoint
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
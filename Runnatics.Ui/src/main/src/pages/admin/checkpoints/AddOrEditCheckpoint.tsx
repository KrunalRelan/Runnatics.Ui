import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
    Divider,
    MenuItem,
} from "@mui/material";
import { Checkpoint } from "@/main/src/models/checkpoints/Checkpoint";
import { CheckpointsService } from "@/main/src/services/CheckpointsService";
import { Device } from "@/main/src/models/Device";
import { DevicesService } from "@/main/src/services/DevicesService";

interface AddOrEditCheckpointProps {
    open: boolean;
    onClose: () => void;
    onClick: (checkpoint: Checkpoint) => void;
    eventId?: string;
    raceId?: string;
    checkpointToEdit?: Checkpoint; // Optional for edit mode
    existingCheckpoints?: Checkpoint[]; // Existing checkpoints for parent selection
}

const AddOrEditCheckpoint: React.FC<AddOrEditCheckpointProps> = ({
    open,
    onClose,
    onClick,
    eventId,
    raceId,
    checkpointToEdit,
    existingCheckpoints = [],
}) => {
    const [formData, setFormData] = useState<Checkpoint>({
        id: "",
        name: "",
        deviceId: "",
        parentDeviceId: "",
        isMandatory: false,
        distanceFromStart: 0,
    });
    const [devices, setDevices] = useState<Device[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [selectedParentCheckpoint, setSelectedParentCheckpoint] = useState<Checkpoint | null>(null);
    const [selectedParentCheckpointId, setSelectedParentCheckpointId] = useState<string>("");

    // FIX: Only fetch devices when dialog is open
    useEffect(() => {
        const fetchDevices = async () => {
            if (!open) return;

            setLoadingDevices(true);
            try {
                const result = await DevicesService.getDevices();
                setDevices(result);
            } catch (err) {
                console.error("Error fetching devices:", err);
                setDevices([]);
            } finally {
                setLoadingDevices(false);
            }
        };
        fetchDevices();
    }, [open]);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize formData for edit mode
    useEffect(() => {
        if (open && checkpointToEdit) {
            let finalDeviceId = "";
            let finalParentDeviceId = "";

            // Match devices by name since the API returns deviceName and parentDeviceName
            // The deviceId from checkpoint API might be different from the devices API IDs
            if (devices.length > 0) {
                // Try to find device by name first (most reliable)
                if (checkpointToEdit.deviceName) {
                    const device = devices.find(d => d.name === checkpointToEdit.deviceName);
                    if (device) {
                        finalDeviceId = device.id;
                    }
                }

                // Try to find parent device by name
                if (checkpointToEdit.parentDeviceName) {
                    const parentDevice = devices.find(d => d.name === checkpointToEdit.parentDeviceName);
                    if (parentDevice) {
                        finalParentDeviceId = parentDevice.id;
                    }
                }

                // Fallback: If names didn't work, try matching by ID
                // (in case API returns matching IDs in the future)
                if (!finalDeviceId && checkpointToEdit.deviceId) {
                    const deviceById = devices.find(d => d.id === checkpointToEdit.deviceId);
                    if (deviceById) {
                        finalDeviceId = deviceById.id;
                    }
                }

                if (!finalParentDeviceId && checkpointToEdit.parentDeviceId) {
                    const parentDeviceById = devices.find(d => d.id === checkpointToEdit.parentDeviceId);
                    if (parentDeviceById) {
                        finalParentDeviceId = parentDeviceById.id;
                    }
                }
            }

            setFormData({
                ...checkpointToEdit,
                deviceId: finalDeviceId,
                parentDeviceId: finalParentDeviceId,
                // FIX: Ensure distanceFromStart is a number
                distanceFromStart: Number(checkpointToEdit.distanceFromStart) || 0,
            });
        } else if (open && !checkpointToEdit) {
            setFormData({
                id: "",
                name: "",
                deviceId: "",
                parentDeviceId: "",
                isMandatory: false,
                distanceFromStart: 0,
            });
        }
        setError(null);
    }, [open, checkpointToEdit, devices]);

    // Handle parent checkpoint selection
    const handleParentCheckpointChange = (checkpointId: string) => {
        if (!checkpointId) {
            setSelectedParentCheckpoint(null);
            setSelectedParentCheckpointId("");
            setFormData((prev) => ({
                ...prev,
                parentDeviceId: "",
                // Keep other fields as they are
            }));
            return;
        }

        const parentCheckpoint = existingCheckpoints.find(cp => cp.id === checkpointId);
        if (parentCheckpoint) {
            setSelectedParentCheckpoint(parentCheckpoint);
            setSelectedParentCheckpointId(checkpointId); // Track checkpoint ID for dropdown
            
            // Find the encrypted device ID from the devices list by matching the device name
            let parentDeviceId = "";
            if (parentCheckpoint.deviceName && devices.length > 0) {
                const device = devices.find(d => d.name === parentCheckpoint.deviceName);
                if (device) {
                    parentDeviceId = device.id; // This is the encrypted ID
                }
            }
            
            // Copy only distance and isMandatory from parent checkpoint
            // Keep the user's device selection intact
            setFormData((prev) => ({
                ...prev,
                parentDeviceId: parentDeviceId, // Store parent's encrypted device ID for API
                isMandatory: parentCheckpoint.isMandatory,
                distanceFromStart: parentCheckpoint.distanceFromStart || 0,
                name: "", // Clear name as it's optional when parent is selected
            }));
        }
    };

    // FIX: Proper type handling for different field types
    const handleFormChange = (
        field: keyof Checkpoint,
        value: string | boolean | number
    ) => {
        setFormData((prev) => {
            // Handle numeric fields
            if (field === "distanceFromStart") {
                const numValue = typeof value === "string" ? parseFloat(value) || 0 : typeof value === "number" ? value : 0;
                return { ...prev, [field]: numValue };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleReset = () => {
        setFormData({
            id: "",
            name: "",
            deviceId: "",
            parentDeviceId: "",
            isMandatory: false,
            distanceFromStart: 0,
        });
        setSelectedParentCheckpoint(null);
        setError(null);
    };

    const handleClose = () => {
        handleReset();
        setLoading(false);
        onClose();
    };

    // FIX: Consistent validation logic - extracted to reusable function
    const isFormValid = (): boolean => {
        // Device is always required
        if (!formData.deviceId || formData.deviceId.trim() === "") {
            return false;
        }

        // Name is required if no parent checkpoint is selected
        const hasValidName = formData.name && formData.name.trim() !== "";
        const hasParentCheckpoint = formData.parentDeviceId && formData.parentDeviceId.trim() !== "";

        // Either name OR parent checkpoint must be provided
        if (!hasValidName && !hasParentCheckpoint) {
            return false;
        }

        // Distance must be a valid non-negative number
        if ((formData.distanceFromStart ?? 0) < 0) {
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.deviceId || formData.deviceId.trim() === "") {
            setError("Device Name is required");
            return;
        }

        const hasValidName = formData.name && formData.name.trim() !== "";
        const hasParentCheckpoint = formData.parentDeviceId && formData.parentDeviceId.trim() !== "";

        if (!hasValidName && !hasParentCheckpoint) {
            setError("Please enter Checkpoint Name or select Parent Checkpoint");
            return;
        }

        if (!eventId || !raceId) {
            setError("Event ID or Race ID is missing");
            return;
        }

        // FIX: Validate distance is non-negative
        if ((formData.distanceFromStart ?? 0) < 0) {
            setError("Distance from start must be 0 or greater");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (checkpointToEdit) {
                // EDIT MODE
                await CheckpointsService.updateCheckpoint(eventId, raceId, formData.id, {
                    name: formData.name,
                    deviceId: formData.deviceId || undefined,
                    parentDeviceId: formData.parentDeviceId || undefined,
                    isMandatory: formData.isMandatory,
                    distanceFromStart: formData.distanceFromStart,
                });
                onClick(formData);
            } else {
                // ADD MODE
                await CheckpointsService.createCheckpoint(eventId, raceId, {
                    name: formData.name,
                    deviceId: formData.deviceId || undefined,
                    parentDeviceId: formData.parentDeviceId || undefined,
                    isMandatory: formData.isMandatory,
                    distanceFromStart: formData.distanceFromStart,
                });
                onClick(formData);
            }
            handleClose();
        } catch (err: any) {
            console.error("Error saving checkpoint:", err);

            let errorMessage = checkpointToEdit
                ? "Failed to update checkpoint. Please try again."
                : "Failed to add checkpoint. Please try again.";

            // FIX: Better error extraction from API response
            if (err.response?.data) {
                const data = err.response.data;
                if (data.errors && typeof data.errors === 'object') {
                    const validationErrors = Object.entries(data.errors)
                        .map(([field, messages]: [string, any]) => {
                            const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
                            return `${field}: ${msgs}`;
                        })
                        .join('; ');
                    errorMessage = validationErrors;
                } else if (data.title || data.detail) {
                    errorMessage = data.detail || data.title;
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.error) {
                    errorMessage = data.error;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Determine if name is required based on parent checkpoint selection
    const isNameRequired = !formData.parentDeviceId || formData.parentDeviceId.trim() === "";
    
    // Get available parent checkpoints
    // Show only root checkpoints (those without a parent)
    const availableParentCheckpoints = existingCheckpoints.filter(cp => {
        // Exclude the checkpoint being edited
        if (checkpointToEdit && cp.id === checkpointToEdit.id) {
            return false;
        }
        // Include checkpoints that don't have a parent
        // Parent is considered absent if it's null, undefined, empty string, "0", or "N/A"
        const hasParent = cp.parentDeviceId && 
                         cp.parentDeviceId.trim() !== "" && 
                         cp.parentDeviceId !== "0" &&
                         cp.parentDeviceId.toUpperCase() !== "N/A";
        
        // Return true only if it doesn't have a parent
        return !hasParent;
    });

    return (
        <Dialog
            open={open}
            onClose={(_event, reason) => {
                if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return;
                }
                handleClose();
            }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {checkpointToEdit ? "Edit Checkpoint" : "Add New Checkpoint"}
            </DialogTitle>
            <DialogContent>
                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setError(null)}>
                        <strong>Error:</strong> {error}
                    </Alert>
                )}
                <Stack spacing={2} sx={{ mt: error ? 0 : 2 }}>
                    <TextField
                        select
                        label="Device Name"
                        value={formData.deviceId}
                        onChange={(e) => handleFormChange("deviceId", e.target.value)}
                        fullWidth
                        required
                        size="small"
                        helperText="Required - Select a device for this checkpoint"
                        disabled={loadingDevices}
                        error={!formData.deviceId && error !== null}
                    >
                        <MenuItem value="">Select Device</MenuItem>
                        {devices.map((device) => (
                            <MenuItem key={device.id} value={device.id}>{device.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Parent Checkpoint"
                        value={selectedParentCheckpointId}
                        onChange={(e) => handleParentCheckpointChange(e.target.value)}
                        fullWidth
                        size="small"
                        helperText="Optional - Select an existing checkpoint to copy its settings"
                        disabled={loadingDevices}
                    >
                        <MenuItem value="">None (New Checkpoint)</MenuItem>
                        {availableParentCheckpoints.map((checkpoint) => (
                            <MenuItem key={checkpoint.id} value={checkpoint.id}>
                                {checkpoint.name || checkpoint.deviceName || checkpoint.deviceId}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Checkpoint Name"
                            value={formData.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                            fullWidth
                            required={isNameRequired}
                            size="small"
                            helperText={
                                isNameRequired
                                    ? "Required field"
                                    : "Optional when Parent Checkpoint is selected"
                            }
                            error={isNameRequired && !formData.name.trim() && error !== null}
                        />
                        <TextField
                            label="Distance From Start (km)"
                            type="number"
                            // FIX: Changed min to 0 since distance can be 0 for start checkpoint
                            // Added step for decimal values
                            inputProps={{ min: 0, step: 0.1 }}
                            value={formData.distanceFromStart}
                            onChange={(e) => handleFormChange("distanceFromStart", e.target.value)}
                            fullWidth
                            required
                            size="small"
                            helperText={selectedParentCheckpoint ? "Copied from parent checkpoint" : "Required field"}
                            disabled={!!selectedParentCheckpoint}
                        />
                    </Stack>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isMandatory}
                                onChange={(e) => handleFormChange("isMandatory", e.target.checked)}
                                disabled={!!selectedParentCheckpoint}
                            />
                        }
                        label={selectedParentCheckpoint ? "Is Mandatory (copied from parent)" : "Is Mandatory"}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} variant="outlined" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    // FIX: Use consistent validation function instead of just checking !formData.name
                    disabled={loading || !isFormValid()}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading
                        ? checkpointToEdit
                            ? "Updating..."
                            : "Adding..."
                        : checkpointToEdit
                            ? "Update Checkpoint"
                            : "Add Checkpoint"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddOrEditCheckpoint;
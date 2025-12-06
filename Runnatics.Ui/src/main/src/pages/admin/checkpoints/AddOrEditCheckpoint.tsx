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

interface AddOrEditCheckpointProps {
    open: boolean;
    onClose: () => void;
    onClick: (checkpoint: Checkpoint) => void;
    eventId?: string;
    raceId?: string;
    checkpointToEdit?: Checkpoint; // Optional for edit mode
}

const AddOrEditCheckpoint: React.FC<AddOrEditCheckpointProps> = ({
    open,
    onClose,
    onClick,
    eventId,
    raceId,
    checkpointToEdit,
}) => {
    const [formData, setFormData] = useState<Checkpoint>({
        id: "",
        name: "",
        deviceId: "",
        parentDeviceId: "",
        isMandatory: false,
        distanceFromStart: 0,
        // lastUpdateMode: "",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize formData for edit mode
    useEffect(() => {
        if (open && checkpointToEdit) {
            setFormData(checkpointToEdit);
        } else if (open) {
            setFormData({
                id: "",
                name: "",
                deviceId: "",
                parentDeviceId: "",
                isMandatory: false,
                distanceFromStart: 0,
                // lastUpdateMode: "",
            });
        }
        setError(null);
    }, [open, checkpointToEdit]);

    const handleFormChange = (
        field: keyof Checkpoint,
        value: string | boolean
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        setFormData({
            id: "",
            name: "",
            deviceId: "",
            parentDeviceId: "",
            isMandatory: false,
            distanceFromStart: 0,
            // lastUpdateMode: "",
        });
        setError(null);
    };

    const handleClose = () => {
        handleReset();
        setLoading(false);
        onClose();
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.parentDeviceId && (!formData.name || formData.name.trim() === "")) {
            setError("Please enter Checkpoint Name or select Parent Device Name");
            return;
        }

        if (!eventId || !raceId) {
            setError("Event ID or Race ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (checkpointToEdit) {
                // EDIT MODE
                await CheckpointsService.updateCheckpoint(eventId, raceId, formData.id, {
                    name: formData.name,
                    deviceId: formData.deviceId,
                    parentDeviceId: formData.parentDeviceId,
                    isMandatory: formData.isMandatory,
                    distanceFromStart: formData.distanceFromStart,
                    // lastUpdateMode: formData.lastUpdateMode
                });
                onClick(formData); // or use onUpdate if you want a separate callback
            } else {
                // ADD MODE
                await CheckpointsService.createCheckpoint(eventId, raceId, {
                    name: formData.name,
                    deviceId: formData.deviceId,
                    parentDeviceId: formData.parentDeviceId,
                    isMandatory: formData.isMandatory,
                    distanceFromStart: formData.distanceFromStart,
                    // lastUpdateMode: formData.lastUpdateMode
                });
                onClick(formData);
            }
            handleClose();
        } catch (err: any) {
            console.error("Error saving checkpoint:", err);

            let errorMessage = checkpointToEdit
                ? "Failed to update checkpoint. Please try again."
                : "Failed to add checkpoint. Please try again.";

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
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                <Stack direction="row" spacing={2}>
                    <TextField
                        select
                        label="Device Name"
                        value={formData.deviceId}
                        onChange={(e) => handleFormChange("deviceId", e.target.value)}
                        required
                        fullWidth
                        size="small"
                        helperText="Required field"
                    >
                        <MenuItem value="">Select Device</MenuItem>
                        <MenuItem value="1">Device 1</MenuItem>
                        <MenuItem value="2">Device 2</MenuItem>
                        <MenuItem value="3">Device 3</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Parent Device Name"
                        value={formData.parentDeviceId}
                        onChange={(e) => handleFormChange("parentDeviceId", e.target.value)}
                        fullWidth
                        size="small"
                    >
                        <MenuItem value="">Select Parent Device</MenuItem>
                        <MenuItem value="1">Parent Device 1</MenuItem>
                        <MenuItem value="2">Parent Device 2</MenuItem>
                        <MenuItem value="3">Parent Device 3</MenuItem>
                    </TextField>
                </Stack>

                <Stack spacing={2} sx={{ mt: error ? 1 : 2 }}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Checkpoint Name"
                            value={formData.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                            fullWidth
                            required={!formData.parentDeviceId}
                            size="small"
                            helperText={formData.parentDeviceId ? "Optional if Parent Device is selected" : "Required field"}
                        />
                        <TextField
                            label="Distance From Start"
                            type="number"
                            inputProps={{ min: 1 }}
                            value={formData.distanceFromStart}
                            onChange={(e) => handleFormChange("distanceFromStart", e.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Stack>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isMandatory}
                                onChange={(e) => handleFormChange("isMandatory", e.target.checked)}
                            />
                        }
                        label="Is Mandatory"
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
                    disabled={loading || !formData.name}
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
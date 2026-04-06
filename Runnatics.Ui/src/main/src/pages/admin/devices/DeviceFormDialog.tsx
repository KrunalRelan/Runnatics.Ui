import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import type { Device } from '../../../models/Device';
import type { DeviceFormData } from './DeviceManagement.types';
import { emptyFormData, toFormData } from './DeviceManagement.types';

interface DeviceFormDialogProps {
  open: boolean;
  editingDevice: Device | null;
  onClose: () => void;
  onSubmit: (data: DeviceFormData) => void;
  isSaving: boolean;
}

const DeviceFormDialog: React.FC<DeviceFormDialogProps> = ({
  open,
  editingDevice,
  onClose,
  onSubmit,
  isSaving,
}) => {
  const [form, setForm] = React.useState<DeviceFormData>(emptyFormData);
  const [nameError, setNameError] = React.useState('');

  useEffect(() => {
    if (open) {
      setForm(editingDevice ? toFormData(editingDevice) : emptyFormData);
      setNameError('');
    }
  }, [open, editingDevice]);

  const handleChange = (field: keyof DeviceFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === 'name') setNameError('');
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setNameError('Name is required');
      return;
    }
     const cleanedData = {
    ...form,
    name: form.name.trim(),
    hostname: form.hostname?.trim(),
    ipAddress: form.ipAddress?.trim(),
    deviceMacAddress: form.deviceMacAddress?.trim(),
    firmwareVersion: form.firmwareVersion?.trim(),
    readerModel: form.readerModel?.trim(),
  };
    onSubmit(cleanedData);
  };

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingDevice ? 'Edit Device' : 'Add Device'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Name"
              value={form.name}
              onChange={handleChange('name')}
              fullWidth
              required
              error={!!nameError}
              helperText={nameError}
              autoFocus
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="MAC Address"
              value={form.deviceMacAddress}
              onChange={handleChange('deviceMacAddress')}
              fullWidth
              placeholder="e.g. AA:BB:CC:DD:EE:FF"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Hostname"
              value={form.hostname}
              onChange={handleChange('hostname')}
              fullWidth
              placeholder="e.g. reader-001.local"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="IP Address"
              value={form.ipAddress}
              onChange={handleChange('ipAddress')}
              fullWidth
              placeholder="e.g. 192.168.1.100"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Firmware Version"
              value={form.firmwareVersion}
              onChange={handleChange('firmwareVersion')}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Reader Model"
              value={form.readerModel}
              onChange={handleChange('readerModel')}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving || !form.name.trim()}>
          {isSaving ? <CircularProgress size={22} color="inherit" /> : editingDevice ? 'Save Changes' : 'Add Device'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceFormDialog;

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Tooltip,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import { Pencil, Trash2, Plus, Wifi, WifiOff } from 'lucide-react';
import dayjs from 'dayjs';
import { useDeviceManagement } from './useDeviceManagement';
import DeviceFormDialog from './DeviceFormDialog';
import type { Device } from '../../../models/Device';
import { Snackbar } from '@mui/material';

type SortField = 'name' | 'hostname' | 'ipAddress' | 'deviceMacAddress' | 'readerModel' | 'firmwareVersion' | 'lastSeenAt' | 'isOnline';
type SortOrder = 'asc' | 'desc';

interface Column {
  id: SortField | 'actions';
  label: string;
  sortable: boolean;
  align?: 'left' | 'right';
}

const COLUMNS: Column[] = [
  { id: 'isOnline', label: 'Status', sortable: true },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'hostname', label: 'Hostname / IP', sortable: true },
  { id: 'deviceMacAddress', label: 'MAC Address', sortable: true },
  { id: 'readerModel', label: 'Model', sortable: true },
  { id: 'firmwareVersion', label: 'Firmware', sortable: true },
  { id: 'lastSeenAt', label: 'Last Seen', sortable: true },
  { id: 'actions', label: '', sortable: false, align: 'right' },
];

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function getValue(device: Device, field: SortField): string | number | boolean {
  const v = device[field];
  if (v == null) return '';
  if (field === 'lastSeenAt') return dayjs(v as string).valueOf();
  return v as string | boolean;
}

const DeviceManagement: React.FC = () => {
  const {
    devices,
    isLoading,
    error,
    isFormOpen,
    editingDevice,
    deleteConfirmId,
    submitError,
    openCreate,
    openEdit,
    closeForm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleSubmit,
    handleDelete,
    isSaving,
    isDeleting,
  } = useDeviceManagement();

  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const onlineCount = devices.filter((d) => d.isOnline).length;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      const av = getValue(a, sortField);
      const bv = getValue(b, sortField);
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [devices, sortField, sortOrder]);

  const paginatedDevices = useMemo(
    () => sortedDevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedDevices, page, rowsPerPage],
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ─── Header ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Device Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage RFID readers and timing devices for your organisation.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={openCreate}>
          Add Device
        </Button>
      </Box>

      {/* ─── Status Summary ─── */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          label={`${devices.length} device${devices.length !== 1 ? 's' : ''}`}
          size="small"
          variant="outlined"
        />
        <Chip
          icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', ml: '6px !important' }} />}
          label={`${onlineCount} online`}
          size="small"
          color="success"
          variant="outlined"
        />
        {devices.length - onlineCount > 0 && (
          <Chip
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336', ml: '6px !important' }} />}
            label={`${devices.length - onlineCount} offline`}
            size="small"
            color="error"
            variant="outlined"
          />
        )}
      </Paper>

      {/* ─── Device Table ─── */}
      <Paper sx={{ p: 3 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && devices.length === 0 && !error && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No devices found. Click "Add Device" to register your first device.
          </Typography>
        )}

        {!isLoading && devices.length > 0 && (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                  {COLUMNS.map((col) => (
                    <Box
                      component="th"
                      key={col.id}
                      sx={{ py: 1.5, px: 2, textAlign: col.align ?? 'left' }}
                    >
                      {col.sortable ? (
                        <TableSortLabel
                          active={sortField === col.id}
                          direction={sortField === col.id ? sortOrder : 'asc'}
                          onClick={() => handleSort(col.id as SortField)}
                        >
                          <Typography variant="subtitle2">{col.label}</Typography>
                        </TableSortLabel>
                      ) : (
                        <Typography variant="subtitle2">{col.label}</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {paginatedDevices.map((device, index) => (
                  <Box
                    component="tr"
                    key={device.id ?? `device-${index}`}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {/* Status */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Tooltip title={device.isOnline ? 'Online' : 'Offline'}>
                        {device.isOnline ? (
                          <Wifi size={18} color="#4caf50" />
                        ) : (
                          <WifiOff size={18} color="#bdbdbd" />
                        )}
                      </Tooltip>
                    </Box>

                    {/* Name */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {device.name}
                      </Typography>
                    </Box>

                    {/* Hostname / IP */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {device.hostname ?? '—'}
                      </Typography>
                      {device.ipAddress && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {device.ipAddress}
                        </Typography>
                      )}
                    </Box>

                    {/* MAC */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {device.deviceMacAddress ?? '—'}
                      </Typography>
                    </Box>

                    {/* Model */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2">{device.readerModel ?? '—'}</Typography>
                    </Box>

                    {/* Firmware */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {device.firmwareVersion ?? '—'}
                      </Typography>
                    </Box>

                    {/* Last Seen */}
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {device.lastSeenAt ? dayjs(device.lastSeenAt).format('DD MMM HH:mm') : '—'}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box component="td" sx={{ py: 1, px: 2, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(device)}>
                          <Pencil size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteConfirm(device.id)}
                          disabled={isDeleting}
                          sx={{ ml: 0.5 }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <TablePagination
              component="div"
              count={sortedDevices.length}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider' }}
            />
          </>
        )}
      </Paper>

      {/* ─── Add / Edit Dialog ─── */}
      <DeviceFormDialog
        open={isFormOpen}
        editingDevice={editingDevice}
        onClose={closeForm}
        onSubmit={(data) => {
          handleSubmit(data);
          setSnackbar({
            open: true,
            message: `Device "${data.name}" saved successfully`,
            severity: 'success',
          });
        }}
        isSaving={isSaving}
      //submitError={submitError}
      />

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog open={deleteConfirmId !== null} onClose={closeDeleteConfirm}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Device</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this device? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={isDeleting}>Cancel</Button>
          <Button
            onClick={() => {
              handleDelete();
              setSnackbar({
                open: true,
                message: 'Device deleted successfully',
                severity: 'success',
              });
            }}
            color="error"
            variant="contained"
            disabled={isDeleting}
          > Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
    </Box>
  );
};

export default DeviceManagement;

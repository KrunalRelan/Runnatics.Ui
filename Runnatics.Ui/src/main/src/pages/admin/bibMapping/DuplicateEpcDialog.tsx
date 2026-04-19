import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { AlertCircle } from 'lucide-react';
import type { DuplicateInfo } from './BibMapping.types';

interface Props {
  open: boolean;
  info: DuplicateInfo | null;
  working: boolean;
  onCancel: () => void;
  onKeepExisting: () => void;
  onOverride: () => void;
}

const DuplicateEpcDialog: React.FC<Props> = ({
  open,
  info,
  working,
  onCancel,
  onKeepExisting,
  onOverride,
}) => {
  return (
    <Dialog open={open && !!info} onClose={working ? undefined : onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ display: 'inline-flex', color: 'warning.main' }}>
          <AlertCircle size={22} />
        </Box>
        Chip already mapped
      </DialogTitle>
      <DialogContent dividers>
        {info && (
          <>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              This chip (EPC:{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {info.epc}
              </Box>
              ) is already mapped to{' '}
              <strong>BIB #{info.existingBib}</strong>
              {info.existingName ? ` (${info.existingName})` : ''}.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              You are trying to map it to{' '}
              <strong>BIB #{info.newBib}</strong>
              {info.newName ? ` (${info.newName})` : ''}.
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              What would you like to do?
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onCancel} variant="outlined" disabled={working}>
          Cancel
        </Button>
        <Button onClick={onKeepExisting} variant="outlined" color="primary" disabled={working}>
          Keep Existing
        </Button>
        <Button onClick={onOverride} variant="contained" color="error" disabled={working}>
          {working ? 'Overriding…' : 'Override Mapping'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicateEpcDialog;

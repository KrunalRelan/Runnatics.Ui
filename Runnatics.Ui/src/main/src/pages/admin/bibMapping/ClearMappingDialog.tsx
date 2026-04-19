import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface Props {
  open: boolean;
  bibNumber: string;
  working: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ClearMappingDialog: React.FC<Props> = ({ open, bibNumber, working, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={working ? undefined : onCancel}>
      <DialogTitle>Remove EPC mapping?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Remove the EPC mapping from <strong>BIB #{bibNumber}</strong>? You'll need to scan the chip
          again to re-map it.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={working}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={working}>
          {working ? 'Removing…' : 'Remove'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearMappingDialog;

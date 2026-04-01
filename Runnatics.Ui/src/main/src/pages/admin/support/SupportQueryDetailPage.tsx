import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { SupportService } from '../../../services/SupportService';
import {
  SupportQueryDetail,
  STATUS_OPTIONS,
  AdminUser,
  QueryTypeOption,
  AddCommentRequest,
} from '../../../models/support/Support';

const SupportQueryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [query, setQuery] = useState<SupportQueryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lookup data
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [queryTypes, setQueryTypes] = useState<QueryTypeOption[]>([]);

  // Add comment form
  const [commentText, setCommentText] = useState<string>('');
  const [commentStatusId, setCommentStatusId] = useState<number | ''>('');
  const [sendNotification, setSendNotification] = useState<boolean>(false);
  const [commentErrors, setCommentErrors] = useState<{ text?: string; status?: string }>({});
  const [commentSaving, setCommentSaving] = useState<boolean>(false);

  // Right panel (update query)
  const [updateStatusId, setUpdateStatusId] = useState<number | ''>('');
  const [updateAssignedToUserId, setUpdateAssignedToUserId] = useState<number | ''>('');
  const [updateQueryTypeId, setUpdateQueryTypeId] = useState<number | ''>('');
  const [updateSaving, setUpdateSaving] = useState<boolean>(false);

  // Delete comment confirm
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<boolean>(false);

  // Email sending
  const [emailSendingId, setEmailSendingId] = useState<number | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchQuery = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await SupportService.getQueryById(Number(id));
      setQuery(data);
      setUpdateStatusId(data.statusId);
      setUpdateAssignedToUserId(data.assignedToUserId ?? '');
      setUpdateQueryTypeId(data.queryTypeId ?? '');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to load query');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuery();
    SupportService.getAdminUsers().then(setAdminUsers).catch(() => {});
    SupportService.getQueryTypes().then(setQueryTypes).catch(() => {});
  }, [fetchQuery]);

  const validateComment = (): boolean => {
    const errs: { text?: string; status?: string } = {};
    if (!commentText.trim()) errs.text = 'Comment text is required';
    if (commentStatusId === '') errs.status = 'Ticket status is required';
    setCommentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveComment = async () => {
    if (!query || !validateComment()) return;
    const data: AddCommentRequest = {
      commentText: commentText.trim(),
      ticketStatusId: Number(commentStatusId),
      sendNotification,
    };
    try {
      setCommentSaving(true);
      await SupportService.addComment(query.id, data);
      setCommentText('');
      setCommentStatusId('');
      setSendNotification(false);
      setCommentErrors({});
      showSnackbar('Comment added', 'success');
      fetchQuery();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      showSnackbar(e.response?.data?.message || 'Failed to add comment', 'error');
    } finally {
      setCommentSaving(false);
    }
  };

  const handleSendEmail = async (commentId: number) => {
    try {
      setEmailSendingId(commentId);
      await SupportService.sendCommentEmail(commentId);
      showSnackbar('Email sent', 'success');
      fetchQuery();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      showSnackbar(e.response?.data?.message || 'Failed to send email', 'error');
    } finally {
      setEmailSendingId(null);
    }
  };

  const handleDeleteComment = async () => {
    if (deleteCommentId === null) return;
    try {
      setDeleteCommentLoading(true);
      await SupportService.deleteComment(deleteCommentId);
      setDeleteCommentId(null);
      showSnackbar('Comment deleted', 'success');
      fetchQuery();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      showSnackbar(e.response?.data?.message || 'Failed to delete comment', 'error');
    } finally {
      setDeleteCommentLoading(false);
    }
  };

  const handleUpdateQuery = async () => {
    if (!query) return;
    try {
      setUpdateSaving(true);
      await SupportService.updateQuery(query.id, {
        statusId: updateStatusId !== '' ? Number(updateStatusId) : query.statusId,
        assignedToUserId: updateAssignedToUserId !== '' ? Number(updateAssignedToUserId) : null,
        queryTypeId: updateQueryTypeId !== '' ? Number(updateQueryTypeId) : null,
      });
      showSnackbar('Query updated successfully', 'success');
      fetchQuery();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      showSnackbar(e.response?.data?.message || 'Failed to update query', 'error');
    } finally {
      setUpdateSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/support')}>
          Back to Support
        </Button>
      </Box>
    );
  }

  if (!query) return null;

  const sortedComments = [...query.comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* ─── LEFT COLUMN ─── */}
        <Box sx={{ flex: '0 0 70%', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header Bar */}
          <Paper
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
              {query.subject}
            </Typography>
            <Chip
              label={query.statusName}
              size="small"
              sx={{ bgcolor: 'primary.light', color: 'white' }}
            />
            {query.assignedToName && (
              <Chip
                label={`Assigned: ${query.assignedToName}`}
                size="small"
                sx={{ bgcolor: 'primary.dark', color: 'white' }}
              />
            )}
          </Paper>

          {/* Query Body */}
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
            >
              {query.body}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {query.submitterEmail}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Updated: {new Date(query.updatedAt).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(query.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          {/* Add Comment */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Add Comment
            </Typography>
            <TextField
              label="Enter your comments here"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              fullWidth
              multiline
              rows={4}
              error={!!commentErrors.text}
              helperText={commentErrors.text}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth required error={!!commentErrors.status} sx={{ mb: 2 }}>
              <InputLabel>* Ticket Status</InputLabel>
              <Select
                value={commentStatusId}
                label="* Ticket Status"
                onChange={(e) => setCommentStatusId(e.target.value as number | '')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
              {commentErrors.status && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {commentErrors.status}
                </Typography>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                />
              }
              label="Send notification"
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSaveComment}
                disabled={commentSaving}
              >
                {commentSaving ? <CircularProgress size={22} color="inherit" /> : 'Save Comment'}
              </Button>
            </Box>
          </Paper>

          {/* Past Comments */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Past Comments
            </Typography>
            {sortedComments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sortedComments.map((comment) => (
                  <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                      {comment.commentText}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(comment.createdAt).toLocaleString()}
                        {comment.createdByName ? ` by ${comment.createdByName}` : ''}
                      </Typography>
                      <Chip label={comment.ticketStatusName} size="small" variant="outlined" />
                      <Typography variant="caption" color={comment.notificationSent ? 'success.main' : 'text.disabled'}>
                        Notification: {comment.notificationSent ? 'Sent' : 'Not sent'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        disabled={comment.notificationSent || emailSendingId === comment.id}
                        onClick={() => handleSendEmail(comment.id)}
                      >
                        {emailSendingId === comment.id ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          'Send Email'
                        )}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => setDeleteCommentId(comment.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* ─── RIGHT COLUMN ─── */}
        <Box sx={{ flex: '0 0 28%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => navigate('/support')}
              fullWidth
            >
              Back
            </Button>

            <FormControl fullWidth size="small">
              <InputLabel>Query Status</InputLabel>
              <Select
                value={updateStatusId}
                label="Query Status"
                onChange={(e) => setUpdateStatusId(e.target.value as number | '')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={updateAssignedToUserId}
                label="Assigned To"
                onChange={(e) => setUpdateAssignedToUserId(e.target.value as number | '')}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {adminUsers.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Query Type</InputLabel>
              <Select
                value={updateQueryTypeId}
                label="Query Type"
                onChange={(e) => setUpdateQueryTypeId(e.target.value as number | '')}
              >
                <MenuItem value="">None</MenuItem>
                {queryTypes.map((qt) => (
                  <MenuItem key={qt.id} value={qt.id}>{qt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateQuery}
              disabled={updateSaving}
              fullWidth
            >
              {updateSaving ? <CircularProgress size={22} color="inherit" /> : 'Update'}
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Delete Comment Confirmation */}
      <Dialog open={deleteCommentId !== null} onClose={() => setDeleteCommentId(null)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentId(null)} disabled={deleteCommentLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteComment}
            color="error"
            variant="contained"
            disabled={deleteCommentLoading}
          >
            {deleteCommentLoading ? <CircularProgress size={22} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportQueryDetailPage;

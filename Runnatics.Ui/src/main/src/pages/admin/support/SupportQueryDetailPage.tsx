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
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { SupportService } from '../../../services/SupportService';
import {
  SupportQueryDetail,
  SupportQueryComment,
  STATUS_OPTIONS,
  AddCommentRequest,
} from '../../../models/support/Support';

const STATUS_VISUAL: Record<string, { light: { color: string; bg: string }; dark: { color: string; bg: string } }> = {
  'New Query':       { light: { color: '#1D4ED8', bg: '#EFF6FF' },  dark: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' } },
  'WIP':             { light: { color: '#B45309', bg: '#FFFBEB' },  dark: { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' } },
  'Closed':          { light: { color: '#065F46', bg: '#ECFDF5' },  dark: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' } },
  'Pending':         { light: { color: '#5B21B6', bg: '#F5F3FF' },  dark: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' } },
  'Not Yet Started': { light: { color: '#374151', bg: '#F9FAFB' },  dark: { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' } },
  'Rejected':        { light: { color: '#991B1B', bg: '#FEF2F2' },  dark: { color: '#F87171', bg: 'rgba(248,113,113,0.12)' } },
  'Duplicate':       { light: { color: '#9A3412', bg: '#FFF7ED' },  dark: { color: '#FB923C', bg: 'rgba(251,146,60,0.12)' } },
};

const getStatusVisual = (statusName: string, isDark: boolean) => {
  const v = STATUS_VISUAL[statusName];
  if (!v) return isDark
    ? { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' }
    : { color: '#374151', bg: '#F9FAFB' };
  return isDark ? v.dark : v.light;
};

const getInitials = (name: string | null) =>
  name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ── Comment Card ──────────────────────────────────────────────────────────────
interface CommentCardProps {
  comment: SupportQueryComment;
  isDark: boolean;
  emailSendingId: number | null;
  onSendEmail: (id: number) => void;
  onDelete: (id: number) => void;
  primaryColor: string;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment, isDark, emailSendingId, onSendEmail, onDelete, primaryColor,
}) => {
  const theme = useTheme();
  const sv = getStatusVisual(comment.ticketStatusName, isDark);

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Avatar sx={{
        width: 34, height: 34, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, mt: 0.5,
        bgcolor: alpha(primaryColor, 0.15), color: primaryColor,
      }}>
        {getInitials(comment.createdByName)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {comment.createdByName ?? 'System'}
          </Typography>
          <Chip label={comment.ticketStatusName} size="small"
            sx={{ bgcolor: sv.bg, color: sv.color, fontWeight: 700, fontSize: '0.65rem',
              border: `1px solid ${alpha(sv.color, 0.25)}`, height: 20 }} />
          {comment.notificationSent && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <CheckCircleIcon sx={{ fontSize: 13, color: 'success.main' }} />
              <Typography variant="caption" color="success.main" fontWeight={600}>Email sent</Typography>
            </Box>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
            {formatDate(comment.createdAt)}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{
          p: 2, borderRadius: 2,
          bgcolor: isDark ? alpha('#1E293B', 0.5) : alpha(primaryColor, 0.02),
          borderColor: isDark ? alpha(primaryColor, 0.12) : alpha(primaryColor, 0.08),
          mb: 1,
        }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {comment.commentText}
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={emailSendingId === comment.id ? <CircularProgress size={12} color="inherit" /> : <EmailIcon />}
            disabled={comment.notificationSent || emailSendingId === comment.id}
            onClick={() => onSendEmail(comment.id)}
            sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0.4,
              borderColor: 'success.main', color: 'success.main',
              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.08), borderColor: 'success.main' },
              '&:disabled': { opacity: 0.45 },
            }}
          >
            {comment.notificationSent ? 'Email Sent' : 'Send Email'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(comment.id)}
            color="error"
            sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0.4 }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SupportQueryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryColor = isDark ? '#60A5FA' : '#2563EB';

  const [query, setQuery] = useState<SupportQueryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState<string>('');
  const [commentStatusId, setCommentStatusId] = useState<number | ''>('');
  const [sendNotification, setSendNotification] = useState<boolean>(false);
  const [commentErrors, setCommentErrors] = useState<{ text?: string; status?: string }>({});
  const [commentSaving, setCommentSaving] = useState<boolean>(false);

  const [updateStatusId, setUpdateStatusId] = useState<number | ''>('');
  const [updateSaving, setUpdateSaving] = useState<boolean>(false);

  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<boolean>(false);
  const [emailSendingId, setEmailSendingId] = useState<number | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const fetchQuery = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await SupportService.getQueryById(Number(id));
      setQuery(data);
      setUpdateStatusId(data.statusId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to load query');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuery();
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
        assignedToUserId: query.assignedToUserId ?? null,
        queryTypeId: query.queryTypeId ?? null,
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

  // ── Loading & Error States ──
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate('/support')}
          sx={{ borderRadius: 2 }}>
          Back to Support
        </Button>
      </Box>
    );
  }

  if (!query) return null;

  const sortedComments = [...query.comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const statusVis = getStatusVisual(query.statusName, isDark);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>

      {/* ── Breadcrumb & Back ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/support')}
          sx={{ borderRadius: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Support Queries
        </Button>
        <Typography color="text.disabled">/</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Ticket #{id}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

        {/* ─── LEFT COLUMN ─── */}
        <Box sx={{ flex: '0 0 68%', display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>

          {/* Subject Header Card */}
          <Paper sx={{
            p: 3, borderRadius: 3,
            background: isDark
              ? `linear-gradient(135deg, ${alpha(primaryColor, 0.12)} 0%, ${alpha('#1E293B', 0.9)} 100%)`
              : `linear-gradient(135deg, ${alpha(primaryColor, 0.06)} 0%, ${alpha(primaryColor, 0.02)} 100%)`,
            border: `1px solid ${alpha(primaryColor, 0.15)}`,
          }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={query.statusName}
                size="small"
                sx={{
                  bgcolor: statusVis.bg,
                  color: statusVis.color,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: `1px solid ${alpha(statusVis.color, 0.3)}`,
                }}
              />
              {query.queryTypeName && (
                <Chip
                  icon={<LabelIcon sx={{ fontSize: '14px !important' }} />}
                  label={query.queryTypeName}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.72rem', height: 24 }}
                />
              )}
              {query.assignedToName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
                  <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700,
                    bgcolor: alpha(primaryColor, 0.15), color: primaryColor }}>
                    {getInitials(query.assignedToName)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {query.assignedToName}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="h5" fontWeight={800} letterSpacing={-0.5} sx={{ mb: 1, lineHeight: 1.3 }}>
              {query.subject}
            </Typography>
          </Paper>

          {/* Original Message */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar sx={{
                width: 38, height: 38, fontSize: '0.8rem', fontWeight: 700,
                bgcolor: isDark ? alpha('#0891B2', 0.2) : '#E0F2FE',
                color: isDark ? '#38BDF8' : '#0369A1',
              }}>
                {query.submitterEmail[0].toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" fontWeight={700}>{query.submitterEmail}</Typography>
                  <Typography variant="caption" color="text.disabled">Original Request</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">
                      Created {formatDate(query.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary' }}>
              {query.body}
            </Typography>
          </Paper>

          {/* Add Comment */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
              Add Comment
            </Typography>

            <TextField
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              fullWidth
              multiline
              rows={4}
              error={!!commentErrors.text}
              helperText={commentErrors.text}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <FormControl size="small" required error={!!commentErrors.status}
                sx={{ minWidth: 200, flex: '0 0 auto' }}>
                <InputLabel>Ticket Status *</InputLabel>
                <Select
                  value={commentStatusId}
                  label="Ticket Status *"
                  onChange={(e) => setCommentStatusId(e.target.value as number | '')}
                  sx={{ borderRadius: 2 }}
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
                  <Checkbox checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)}
                    size="small" />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    Send email notification
                  </Typography>
                }
                sx={{ mt: 0.5 }}
              />

              <Box sx={{ ml: 'auto' }}>
                <Button
                  variant="contained"
                  endIcon={commentSaving ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  onClick={handleSaveComment}
                  disabled={commentSaving}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {commentSaving ? 'Saving...' : 'Save Comment'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Activity / Past Comments */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>Activity</Typography>
              {sortedComments.length > 0 && (
                <Chip label={sortedComments.length} size="small"
                  sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontWeight: 700, height: 22 }} />
              )}
            </Box>

            {sortedComments.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(primaryColor, 0.08), display: 'inline-flex', mb: 1.5 }}>
                  <EmailIcon sx={{ fontSize: 28, color: alpha(primaryColor, 0.4) }} />
                </Box>
                <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                <Typography variant="caption" color="text.disabled">Be the first to add a comment above.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {sortedComments.map((comment, idx) => (
                  <React.Fragment key={comment.id}>
                    {idx > 0 && <Divider />}
                    <CommentCard
                      comment={comment}
                      isDark={isDark}
                      emailSendingId={emailSendingId}
                      onSendEmail={handleSendEmail}
                      onDelete={setDeleteCommentId}
                      primaryColor={primaryColor}
                    />
                  </React.Fragment>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* ─── RIGHT SIDEBAR ─── */}
        <Box sx={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', gap: 2.5, position: 'sticky', top: 24 }}>

          {/* Query Properties */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
              Query Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={updateStatusId} label="Status"
                  onChange={(e) => setUpdateStatusId(e.target.value as number | '')}
                  sx={{ borderRadius: 2 }}>
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpdateQuery}
                disabled={updateSaving}
                sx={{ borderRadius: 2, py: 1.25, fontWeight: 700 }}
              >
                {updateSaving ? <CircularProgress size={22} color="inherit" /> : 'Update Query'}
              </Button>
            </Box>
          </Paper>

          {/* Ticket Info */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Ticket Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                    Submitter
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>{query.submitterEmail}</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                    Created
                  </Typography>
                  <Typography variant="body2">{formatDate(query.createdAt)}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2">{formatDate(query.updatedAt)}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ── Delete Comment Confirmation ── */}
      <Dialog
        open={deleteCommentId !== null}
        onClose={() => setDeleteCommentId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex' }}>
              <DeleteIcon sx={{ fontSize: 20, color: 'error.main' }} />
            </Box>
            Delete Comment
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteCommentId(null)} disabled={deleteCommentLoading}
            sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteComment} color="error" variant="contained"
            disabled={deleteCommentLoading} sx={{ borderRadius: 2 }}>
            {deleteCommentLoading ? <CircularProgress size={22} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
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

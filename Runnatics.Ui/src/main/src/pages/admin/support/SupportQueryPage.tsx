import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  TableSortLabel,
  Snackbar,
  useTheme,
  alpha,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  SupportAgent as SupportAgentIcon,
  Inbox as InboxIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  Block as BlockIcon,
  ChatBubbleOutline as ChatIcon,
} from '@mui/icons-material';
import { SupportService } from '../../../services/SupportService';
import {
  SupportQueryListItem,
  SupportQueryCounts,
  STATUS_OPTIONS,
  ContactUsRequest,
} from '../../../models/support/Support';

interface TabConfig {
  label: string;
  statusId: number | undefined;
  countKey: keyof SupportQueryCounts;
}

const TABS: TabConfig[] = [
  { label: 'All',             statusId: undefined, countKey: 'total' },
  { label: 'New Query',       statusId: 1,         countKey: 'newQuery' },
  { label: 'WIP',             statusId: 2,         countKey: 'wip' },
  { label: 'Closed',          statusId: 3,         countKey: 'closed' },
  { label: 'Pending',         statusId: 4,         countKey: 'pending' },
  { label: 'Not Yet Started', statusId: 5,         countKey: 'notYetStarted' },
  { label: 'Rejected',        statusId: 6,         countKey: 'rejected' },
  { label: 'Duplicate',       statusId: 7,         countKey: 'duplicate' },
];

type SortField = 'subject' | 'commentCount' | 'lastUpdated' | 'assignedToName' | 'statusName';
type SortOrder = 'asc' | 'desc';

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

const STAT_CARDS = [
  { label: 'Total',   countKey: 'total'    as keyof SupportQueryCounts, color: '#2563EB', Icon: SupportAgentIcon },
  { label: 'New',     countKey: 'newQuery' as keyof SupportQueryCounts, color: '#0891B2', Icon: InboxIcon },
  { label: 'WIP',     countKey: 'wip'      as keyof SupportQueryCounts, color: '#D97706', Icon: BuildIcon },
  { label: 'Closed',  countKey: 'closed'   as keyof SupportQueryCounts, color: '#059669', Icon: CheckCircleIcon },
  { label: 'Pending', countKey: 'pending'  as keyof SupportQueryCounts, color: '#7C3AED', Icon: HourglassIcon },
  { label: 'Rejected',countKey: 'rejected' as keyof SupportQueryCounts, color: '#DC2626', Icon: BlockIcon },
];

const TABLE_COLUMNS: { label: string; field?: SortField; flex: string }[] = [
  { label: '#',           field: undefined,      flex: '0 0 56px' },
  { label: 'Subject',     field: 'subject',      flex: '1 1 0' },
  { label: 'Status',      field: 'statusName',   flex: '0 0 150px' },
  { label: 'Comments',    field: 'commentCount', flex: '0 0 100px' },
  { label: 'Last Updated',field: 'lastUpdated',  flex: '0 0 160px' },
  { label: 'Assigned To', field: 'assignedToName',flex: '0 0 160px' },
];

const SupportQueryPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();

  const [counts, setCounts] = useState<SupportQueryCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const [queries, setQueries] = useState<SupportQueryListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [queriesLoading, setQueriesLoading] = useState<boolean>(false);
  const [queriesError, setQueriesError] = useState<string | null>(null);

  const initialStatusId = searchParams.get('statusId') ? Number(searchParams.get('statusId')) : undefined;
  const initialTabIndex = initialStatusId ? TABS.findIndex((t) => t.statusId === initialStatusId) : 0;
  const [activeTab, setActiveTab] = useState<number>(initialTabIndex >= 0 ? initialTabIndex : 0);

  const [emailFilter, setEmailFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [newTicketOpen, setNewTicketOpen] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState<ContactUsRequest>({ subject: '', body: '', submitterEmail: '' });
  const [newTicketErrors, setNewTicketErrors] = useState<Partial<ContactUsRequest>>({});
  const [newTicketSaving, setNewTicketSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const fetchCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const data = await SupportService.getCounts();
      setCounts(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Failed to fetch support counts:', error.message);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      setQueriesLoading(true);
      setQueriesError(null);
      const tabStatusId = TABS[activeTab]?.statusId;
      const data = await SupportService.getQueries({
        submitterEmail: emailFilter || undefined,
        statusId: tabStatusId ?? (statusFilter !== '' ? Number(statusFilter) : undefined),
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setQueries(Array.isArray(data.items) ? data.items : []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setQueriesError(error.response?.data?.message || error.message || 'Failed to load support queries');
    } finally {
      setQueriesLoading(false);
    }
  }, [activeTab, emailFilter, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setStatusFilter('');
  };

  const handleSearch = () => { setPage(0); fetchQueries(); };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedQueries = [...queries].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    if (av < bv) return sortOrder === 'asc' ? -1 : 1;
    if (av > bv) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const validateNewTicket = (): boolean => {
    const errs: Partial<ContactUsRequest> = {};
    if (!newTicket.subject.trim()) errs.subject = 'Required';
    if (!newTicket.body.trim()) errs.body = 'Required';
    if (!newTicket.submitterEmail.trim()) {
      errs.submitterEmail = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTicket.submitterEmail)) {
      errs.submitterEmail = 'Invalid email';
    }
    setNewTicketErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNewTicketSubmit = async () => {
    if (!validateNewTicket()) return;
    try {
      setNewTicketSaving(true);
      await SupportService.submitContactUs(newTicket);
      setNewTicketOpen(false);
      setNewTicket({ subject: '', body: '', submitterEmail: '' });
      setSnackbar({ open: true, message: 'Ticket created successfully', severity: 'success' });
      fetchCounts();
      fetchQueries();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create ticket', severity: 'error' });
    } finally {
      setNewTicketSaving(false);
    }
  };

  const surfaceBg = isDark ? alpha('#1E293B', 0.6) : '#FFFFFF';
  const headerBg = isDark
    ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
    : 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)';

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Page Header ── */}
      <Paper sx={{
        p: 3, borderRadius: 3,
        background: headerBg,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5, borderRadius: 2.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              display: 'flex',
            }}>
              <SupportAgentIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
                Support Queries
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and respond to customer support tickets
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewTicketOpen(true)}
            sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}
          >
            New Ticket
          </Button>
        </Box>
      </Paper>

      {/* ── Stats Cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
        {STAT_CARDS.map(({ label, countKey, color, Icon }) => (
          <Paper key={label} sx={{
            p: 2.5, borderRadius: 3,
            borderTop: `3px solid ${color}`,
            bgcolor: surfaceBg,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(color, 0.1), display: 'flex' }}>
                <Icon sx={{ fontSize: 16, color }} />
              </Box>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.65rem' }}>
                {label}
              </Typography>
            </Box>
            {countsLoading ? (
              <CircularProgress size={22} sx={{ color }} />
            ) : (
              <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>
                {counts?.[countKey] ?? 0}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      {/* ── Status Tabs ── */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {countsLoading ? (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {TABS.map((tab, tabIdx) => (
              <Tab
                key={tab.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span>{tab.label}</span>
                    <Chip
                      label={counts?.[tab.countKey] ?? 0}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        minWidth: 24,
                        bgcolor: activeTab === tabIdx
                          ? 'primary.main'
                          : alpha(theme.palette.text.primary, 0.08),
                        color: activeTab === tabIdx ? 'primary.contrastText' : 'text.secondary',
                        '& .MuiChip-label': { px: '6px' },
                      }}
                    />
                  </Box>
                }
                sx={{ minHeight: 52, py: 1 }}
              />
            ))}
          </Tabs>
        )}
      </Paper>

      {/* ── Filter Bar ── */}
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 2 }}>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            placeholder="Search by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Query Status</InputLabel>
            <Select value={statusFilter} label="Query Status"
              onChange={(e) => setStatusFilter(e.target.value as number | '')}>
              <MenuItem value="">All</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch} sx={{ borderRadius: 2, px: 3 }}>
            Search
          </Button>
        </Box>
      </Paper>

      {/* ── Results Table ── */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {queriesLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {queriesError && (
          <Alert severity="error" sx={{ m: 2 }}>{queriesError}</Alert>
        )}

        {!queriesLoading && !queriesError && (
          <>
            {/* Table Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              px: 3,
              py: 1.25,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}>
              {TABLE_COLUMNS.map((col) => (
                <Box key={col.label} sx={{ flex: col.flex, pr: 1 }}>
                  {col.field ? (
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortOrder : 'asc'}
                      onClick={() => handleSort(col.field!)}
                    >
                      <Typography variant="caption" fontWeight={700}
                        sx={{ textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}>
                        {col.label}
                      </Typography>
                    </TableSortLabel>
                  ) : (
                    <Typography variant="caption" fontWeight={700}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}>
                      {col.label}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {/* Table Body */}
            {sortedQueries.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 2.5, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <SupportAgentIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="text.secondary">No queries found</Typography>
                <Typography variant="body2" color="text.disabled">
                  Try adjusting your filters or create a new ticket.
                </Typography>
              </Box>
            ) : (
              sortedQueries.map((q, index) => {
                const sv = getStatusVisual(q.statusName, isDark);
                return (
                  <Box
                    key={q.id}
                    onClick={() => navigate(`/support/${q.id}`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 3,
                      py: 2,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      borderLeft: `3px solid ${sv.color}`,
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.03) },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    {/* # */}
                    <Box sx={{ flex: '0 0 56px', pr: 1 }}>
                      <Typography variant="caption" color="text.disabled" fontWeight={700}>
                        #{String(page * rowsPerPage + index + 1).padStart(3, '0')}
                      </Typography>
                    </Box>

                    {/* Subject + Email */}
                    <Box sx={{ flex: '1 1 0', pr: 2, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}
                        sx={{ mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{q.submitterEmail}</Typography>
                    </Box>

                    {/* Status */}
                    <Box sx={{ flex: '0 0 150px', pr: 1 }}>
                      <Chip
                        label={q.statusName}
                        size="small"
                        sx={{
                          bgcolor: sv.bg,
                          color: sv.color,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          border: `1px solid ${alpha(sv.color, 0.25)}`,
                        }}
                      />
                    </Box>

                    {/* Comment count */}
                    <Box sx={{ flex: '0 0 100px', pr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ChatIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary">{q.commentCount}</Typography>
                    </Box>

                    {/* Last Updated */}
                    <Box sx={{ flex: '0 0 160px', pr: 1 }}>
                      <Typography variant="body2" color="text.secondary">{q.lastUpdated}</Typography>
                    </Box>

                    {/* Assigned To */}
                    <Box sx={{ flex: '0 0 160px', display: 'flex', alignItems: 'center', gap: 1 }}>
                      {q.assignedToName ? (
                        <>
                          <Avatar sx={{
                            width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: 'primary.main',
                          }}>
                            {q.assignedToName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.assignedToName}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Unassigned
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            />
          </>
        )}
      </Paper>

      {/* ── New Ticket Dialog ── */}
      <Dialog
        open={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex' }}>
              <AddIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>New Support Ticket</Typography>
              <Typography variant="caption" color="text.secondary">Fill in the details to create a ticket</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField
              label="Submitter Email"
              value={newTicket.submitterEmail}
              onChange={(e) => setNewTicket((p) => ({ ...p, submitterEmail: e.target.value }))}
              fullWidth
              required
              error={!!newTicketErrors.submitterEmail}
              helperText={newTicketErrors.submitterEmail}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))}
              fullWidth
              required
              error={!!newTicketErrors.subject}
              helperText={newTicketErrors.subject}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Message"
              value={newTicket.body}
              onChange={(e) => setNewTicket((p) => ({ ...p, body: e.target.value }))}
              fullWidth
              required
              multiline
              rows={4}
              error={!!newTicketErrors.body}
              helperText={newTicketErrors.body}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setNewTicketOpen(false)} disabled={newTicketSaving}
            sx={{ borderRadius: 2, px: 2.5 }}>
            Cancel
          </Button>
          <Button onClick={handleNewTicketSubmit} variant="contained" disabled={newTicketSaving}
            sx={{ borderRadius: 2, px: 3 }}>
            {newTicketSaving ? <CircularProgress size={22} color="inherit" /> : 'Create Ticket'}
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

export default SupportQueryPage;

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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { SupportService } from '../../../services/SupportService';
import {
  SupportQueryListItem,
  SupportQueryCounts,
  STATUS_OPTIONS,
  QueryTypeOption,
  AdminUser,
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

const SupportQueryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Counts
  const [counts, setCounts] = useState<SupportQueryCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState<boolean>(true);

  // Queries
  const [queries, setQueries] = useState<SupportQueryListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [queriesLoading, setQueriesLoading] = useState<boolean>(false);
  const [queriesError, setQueriesError] = useState<string | null>(null);

  // Tab
  const initialStatusId = searchParams.get('statusId') ? Number(searchParams.get('statusId')) : undefined;
  const initialTabIndex = initialStatusId
    ? TABS.findIndex((t) => t.statusId === initialStatusId)
    : 0;
  const [activeTab, setActiveTab] = useState<number>(initialTabIndex >= 0 ? initialTabIndex : 0);

  // Filters
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [queryTypeFilter, setQueryTypeFilter] = useState<number | ''>('');
  const [assignedFilter, setAssignedFilter] = useState<number | ''>('');

  // Lookup data
  const [queryTypes, setQueryTypes] = useState<QueryTypeOption[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Pagination & sorting
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // New ticket dialog
  const [newTicketOpen, setNewTicketOpen] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState<ContactUsRequest>({ subject: '', body: '', submitterEmail: '' });
  const [newTicketErrors, setNewTicketErrors] = useState<Partial<ContactUsRequest>>({});
  const [newTicketSaving, setNewTicketSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
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
        queryTypeId: queryTypeFilter !== '' ? Number(queryTypeFilter) : undefined,
        assignedToUserId: assignedFilter !== '' ? Number(assignedFilter) : undefined,
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
  }, [activeTab, emailFilter, statusFilter, queryTypeFilter, assignedFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchCounts();
    SupportService.getQueryTypes()
      .then(setQueryTypes)
      .catch(() => {/* non-critical */});
    SupportService.getAdminUsers()
      .then(setAdminUsers)
      .catch(() => {/* non-critical */});
  }, [fetchCounts]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setStatusFilter('');
  };

  const handleSearch = () => {
    setPage(0);
    fetchQueries();
  };

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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          Support Query
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewTicketOpen(true)}
        >
          New Ticket
        </Button>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ px: 1 }}>
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
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.label}
                label={`${tab.label} (${counts?.[tab.countKey] ?? 0})`}
              />
            ))}
          </Tabs>
        )}
      </Paper>

      {/* Filter Bar */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="Submitter's Email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Query Status</InputLabel>
            <Select
              value={statusFilter}
              label="Query Status"
              onChange={(e) => setStatusFilter(e.target.value as number | '')}
            >
              <MenuItem value="">All</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Query Type</InputLabel>
            <Select
              value={queryTypeFilter}
              label="Query Type"
              onChange={(e) => setQueryTypeFilter(e.target.value as number | '')}
            >
              <MenuItem value="">All</MenuItem>
              {queryTypes.map((qt) => (
                <MenuItem key={qt.id} value={qt.id}>{qt.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={assignedFilter}
              label="Assigned To"
              onChange={(e) => setAssignedFilter(e.target.value as number | '')}
            >
              <MenuItem value="">All</MenuItem>
              {adminUsers.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Paper>

      {/* Results Table */}
      <Paper sx={{ p: 2 }}>
        {queriesLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {queriesError && (
          <Alert severity="error" sx={{ mb: 2 }}>{queriesError}</Alert>
        )}

        {!queriesLoading && !queriesError && (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                  {(['#', 'Subject', '# Comments', 'Last Updated', 'Assigned To', 'Status'] as const).map((col, i) => {
                    const fieldMap: Record<string, SortField | undefined> = {
                      'Subject': 'subject',
                      '# Comments': 'commentCount',
                      'Last Updated': 'lastUpdated',
                      'Assigned To': 'assignedToName',
                      'Status': 'statusName',
                    };
                    const field = fieldMap[col];
                    return (
                      <Box component="th" key={i} sx={{ py: 1.5, px: 2, textAlign: 'left' }}>
                        {field ? (
                          <TableSortLabel
                            active={sortField === field}
                            direction={sortField === field ? sortOrder : 'asc'}
                            onClick={() => handleSort(field)}
                          >
                            <Typography variant="subtitle2">{col}</Typography>
                          </TableSortLabel>
                        ) : (
                          <Typography variant="subtitle2">{col}</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              <Box component="tbody">
                {sortedQueries.length === 0 ? (
                  <Box component="tr">
                    <Box component="td" colSpan={6} sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No queries found.</Typography>
                    </Box>
                  </Box>
                ) : (
                  sortedQueries.map((q, index) => (
                    <Box
                      component="tr"
                      key={q.id}
                      onClick={() => navigate(`/support/${q.id}`)}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2" fontWeight={600}>{q.subject}</Typography>
                        <Typography variant="caption" color="text.secondary">{q.submitterEmail}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2">{q.commentCount}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2">{q.lastUpdated}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2">{q.assignedToName ?? '—'}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Chip label={q.statusName} size="small" variant="outlined" />
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>

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
              sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider' }}
            />
          </>
        )}
      </Paper>

      {/* New Ticket Dialog */}
      <Dialog open={newTicketOpen} onClose={() => setNewTicketOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Submitter Email"
              value={newTicket.submitterEmail}
              onChange={(e) => setNewTicket((p) => ({ ...p, submitterEmail: e.target.value }))}
              fullWidth
              required
              error={!!newTicketErrors.submitterEmail}
              helperText={newTicketErrors.submitterEmail}
            />
            <TextField
              label="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))}
              fullWidth
              required
              error={!!newTicketErrors.subject}
              helperText={newTicketErrors.subject}
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTicketOpen(false)} disabled={newTicketSaving}>
            Cancel
          </Button>
          <Button onClick={handleNewTicketSubmit} variant="contained" disabled={newTicketSaving}>
            {newTicketSaving ? <CircularProgress size={22} color="inherit" /> : 'Create Ticket'}
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

export default SupportQueryPage;

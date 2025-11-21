import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  SelectChangeEvent,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  FileUpload,
  FileDownload,
  Refresh,
  Edit,
  Delete,
  Dashboard,
  People,
  TrendingUp,
  Place,
  Timer,
  EmojiEvents,
} from '@mui/icons-material';
import DataTable, { DataTableColumn, DataTableUtils } from '@/main/src/components/DataTable';

// Types
interface Race {
  id: string;
  name: string;
  distance: string;
}

interface Participant {
  bib: string;
  name: string;
  gender: string;
  category: string;
  status: 'Registered' | 'Pending' | 'Cancelled';
  checkIn: boolean;
  chipId: string;
}

interface Filters {
  nameOrBib: string;
  status: string;
  gender: string;
  category: string;
  perPage: number;
}

const ViewRaces: React.FC = () => {
  const { eventId, raceId } = useParams<{ eventId: string; raceId: string }>();
  const navigate = useNavigate();

  // State
  const [selectedRace, setSelectedRace] = useState<string>('10 KM - Fun Run');
  const [activeTab, setActiveTab] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    nameOrBib: '',
    status: 'all',
    gender: 'all',
    category: 'all',
    perPage: 25,
  });
  const [page, setPage] = useState<number>(1);

  // Data
  const races: Race[] = [
    { id: '1', name: '21.1 KM - Half Marathon', distance: '21.1 KM' },
    { id: '2', name: '10 KM - Fun Run', distance: '10 KM' },
    { id: '3', name: '5 KM - Kids Race', distance: '5 KM' },
  ];

  const participants: Participant[] = [
    {
      bib: '1001',
      name: 'John Doe',
      gender: 'Male',
      category: 'Open',
      status: 'Registered',
      checkIn: true,
      chipId: 'CHIP001',
    },
    {
      bib: '1002',
      name: 'Jane Smith',
      gender: 'Female',
      category: 'Open',
      status: 'Registered',
      checkIn: true,
      chipId: 'CHIP002',
    },
    {
      bib: '1003',
      name: 'Mike Johnson',
      gender: 'Male',
      category: 'Veteran',
      status: 'Pending',
      checkIn: false,
      chipId: 'CHIP003',
    },
    {
      bib: '1004',
      name: 'Sarah Williams',
      gender: 'Female',
      category: 'Open',
      status: 'Registered',
      checkIn: true,
      chipId: 'CHIP004',
    },
    {
      bib: '1005',
      name: 'Robert Brown',
      gender: 'Male',
      category: 'Junior',
      status: 'Cancelled',
      checkIn: false,
      chipId: 'CHIP005',
    },
  ];

  // Handlers
  const handleBack = () => {
    if (eventId) {
      navigate(`/events/event-details/${eventId}`);
    } else {
      navigate('/events/events-dashboard');
    }
  };

  const handleRaceChange = (raceName: string) => {
    setSelectedRace(raceName);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (field: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      nameOrBib: '',
      status: 'all',
      gender: 'all',
      category: 'all',
      perPage: 25,
    });
  };

  const handleEditParticipant = (participant: Participant) => {
    console.log('Edit participant:', participant);
    // Navigate to edit page or open edit dialog
  };

  const handleDeleteParticipant = (participant: Participant) => {
    console.log('Delete participant:', participant);
    // Show confirmation dialog and delete
  };

  const getCurrentRaceDetails = () => {
    const race = races.find((r) => r.name === selectedRace);
    if (race) {
      const [distance, type] = race.name.split(' - ');
      return { distance, type };
    }
    return { distance: '', type: '' };
  };

  const { distance, type } = getCurrentRaceDetails();

  // Define table columns using the shared DataTable component
  const columns: DataTableColumn<Participant>[] = [
    {
      id: 'bib',
      label: 'Bib',
      field: 'bib',
      width: 100,
    },
    {
      id: 'name',
      label: 'Name',
      field: 'name',
      width: 200,
    },
    {
      id: 'gender',
      label: 'Gender',
      field: 'gender',
      width: 120,
    },
    {
      id: 'category',
      label: 'Category',
      field: 'category',
      width: 120,
    },
    {
      id: 'status',
      label: 'Status',
      width: 130,
      render: (row) => DataTableUtils.renderStatusChip(row.status),
    },
    {
      id: 'checkIn',
      label: 'Check In',
      width: 100,
      render: (row) => DataTableUtils.renderBoolean(row.checkIn),
    },
    {
      id: 'chipId',
      label: 'Chip ID',
      field: 'chipId',
      width: 120,
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 120,
      align: 'center',
      render: (row) =>
        DataTableUtils.renderActions([
          {
            icon: <Edit fontSize="small" />,
            onClick: () => handleEditParticipant(row),
            tooltip: 'Edit',
            color: 'primary',
          },
          {
            icon: <Delete fontSize="small" />,
            onClick: () => handleDeleteParticipant(row),
            tooltip: 'Delete',
            color: 'error',
          },
        ]),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Stack>

        <Typography variant="h4" component="h1" gutterBottom>
          8th Gurugram Half Marathon
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage race details, participants, and settings
        </Typography>

        {/* Race Selector */}
        <Paper
          sx={{
            bgcolor: '#fafafa',
            border: '1px solid #e0e0e0',
            p: 2.5,
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'block',
              mb: 1.5,
            }}
          >
            Select Race:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {races.map((race) => (
              <Chip
                key={race.id}
                label={race.name}
                onClick={() => handleRaceChange(race.name)}
                color={selectedRace === race.name ? 'primary' : 'default'}
                variant={selectedRace === race.name ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  height: '40px',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor:
                      selectedRace === race.name ? undefined : '#f0f7ff',
                  },
                }}
              />
            ))}
          </Stack>
        </Paper>

        {/* Current Race Title */}
        <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, mb: 3 }}>
          {distance} -{' '}
          <Box
            component="span"
            sx={{ fontStyle: 'italic', color: 'text.secondary', fontWeight: 400 }}
          >
            {type}
          </Box>
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 2,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9375rem',
              minHeight: 64,
            },
          }}
        >
          <Tab icon={<Dashboard />} iconPosition="start" label="Event Dashboard" />
          <Tab icon={<People />} iconPosition="start" label="Participants" />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Dashboard" />
          <Tab icon={<Edit />} iconPosition="start" label="Edit" />
          <Tab icon={<Place />} iconPosition="start" label="Checkpoints (3)" />
          <Tab icon={<Timer />} iconPosition="start" label="Segments" />
          <Tab icon={<EmojiEvents />} iconPosition="start" label="Add Certificate" />
        </Tabs>
      </Paper>

      {/* Content Area */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 3, flexWrap: 'wrap' }}
            useFlexGap
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Add Participant
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Bulk Upload
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Export
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton color="primary" title="Refresh">
              <Refresh />
            </IconButton>
          </Stack>

          {/* Filters Section */}
          <Paper
            sx={{
              bgcolor: '#fafafa',
              border: '1px solid #e0e0e0',
              p: 3,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Filters
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="Name or Bib"
                placeholder="Enter Name or Bib Number"
                value={filters.nameOrBib}
                onChange={(e) => handleFilterChange('nameOrBib', e.target.value)}
                sx={{ flex: 1, minWidth: 200, bgcolor: 'white' }}
                size="small"
              />
              <FormControl sx={{ flex: 1, minWidth: 200, bgcolor: 'white' }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange('status', e.target.value)
                  }
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="registered">Registered</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: 200, bgcolor: 'white' }} size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange('gender', e.target.value)
                  }
                >
                  <MenuItem value="all">All Genders</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: 200, bgcolor: 'white' }} size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange('category', e.target.value)
                  }
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="veteran">Veteran</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: 200, bgcolor: 'white' }} size="small">
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={filters.perPage.toString()}
                  label="Per Page"
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange('perPage', parseInt(e.target.value))
                  }
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Reset
              </Button>
            </Stack>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* Shared DataTable Component */}
          <DataTable<Participant>
            columns={columns}
            data={participants}
            pagination={{
              page: page,
              pageSize: filters.perPage,
              totalRecords: 145,
              totalPages: Math.ceil(145 / filters.perPage),
              onPageChange: setPage,
            }}
            rowKey="bib"
            emptyMessage="No participants found"
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ViewRaces;
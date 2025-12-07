// src/main/src/pages/Dashboard.tsx
import { Box, Typography, Paper, Card, CardContent, Button, Divider, Avatar, Stack, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { DashboardService } from '../services/DashboardService';
import { DashboardStatsResponse } from '../models/Dashboard/DashboardStatsResponse';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      // Prevent duplicate calls in React Strict Mode
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        setError(null);
        const data = await DashboardService.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.response?.data?.error?.message || err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login even if logout fails
      navigate('/login');
    }
  };

  const cards = [
    {
      title: 'Events',
      value: loading ? '...' : (stats?.totalEvents?.toString() || '0'),
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/events/events-dashboard',
    },
    {
      title: 'Participants',
      value: loading ? '...' : (stats?.totalParticipants?.toString() || '0'),
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/participants',
    },
    {
      title: 'Reports',
      value: loading ? '...' : (stats?.totalReports?.toString() || '0'),
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/reports',
    },
    {
      title: 'Growth',
      value: loading ? '...' : (stats?.growthPercentage ? `+${stats.growthPercentage}%` : '0%'),
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/analytics',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Error Message */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}

      {/* Header with User Info and Logout */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName || user?.email || 'User'}!
          </Typography>
        </Box>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
          </Avatar>
          <Stack spacing={0}>
            <Typography variant="body2" fontWeight="bold">
              {user?.firstName || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
          >
            Logout
          </Button>
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {cards.map((card, index) => (
          <Box key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: card.color,
                      color: 'white',
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Event Statistics
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight="500">Active Events</Typography>
                  <Typography variant="h6" color="success.main">{stats?.activeEvents || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight="500">Upcoming Events</Typography>
                  <Typography variant="h6" color="primary.main">{stats?.upcomingEvents || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight="500">Completed Events</Typography>
                  <Typography variant="h6" color="text.secondary">{stats?.completedEvents || 0}</Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/events/events-create')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" />
                    <Typography variant="body1">Create New Event</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/events/events-dashboard')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" />
                    <Typography variant="body1">View All Events</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate('/profile')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Typography variant="body1">My Profile</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Divider />
              <Card
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                  transition: 'all 0.2s'
                }}
                onClick={handleLogout}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LogoutIcon color="error" />
                    <Typography variant="body1" color="error">Logout</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

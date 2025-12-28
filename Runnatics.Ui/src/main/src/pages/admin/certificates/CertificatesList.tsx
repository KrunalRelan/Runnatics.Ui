import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { CertificateTemplate } from '../../../models/Certificate';
import { CertificateService } from '../../../services/CertificateService';

export const CertificatesList: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [eventId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (eventId) {
        const data = await CertificateService.getTemplatesByEvent(eventId);
        setTemplates(data);
      } else {
        // Load all templates if no event specified
        // You might need to add this endpoint to the service
        setTemplates([]);
      }
    } catch (err) {
      setError('Failed to load certificate templates');
      console.error('Load templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate template?')) {
      return;
    }

    try {
      await CertificateService.deleteTemplate(templateId);
      loadTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Delete template error:', err);
    }
  };

  const handlePreview = async (template: CertificateTemplate) => {
    try {
      const previewUrl = await CertificateService.previewCertificate(template);
      window.open(previewUrl, '_blank');
    } catch (err) {
      setError('Failed to generate preview');
      console.error('Preview error:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Certificate Templates
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage certificate templates for races
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/certificates/add')}
          >
            Create Template
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Race</TableCell>
              <TableCell>Fields</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No certificate templates found. Create your first template to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.description || '-'}</TableCell>
                  <TableCell>{template.raceId || 'Event-wide'}</TableCell>
                  <TableCell>{template.fields.length} fields</TableCell>
                  <TableCell>
                    <Chip
                      label={template.isActive ? 'Active' : 'Inactive'}
                      color={template.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(template)}
                      title="Preview"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/certificates/edit/${template.id}`)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(template.id!)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { CertificateTemplate, CertificateField, CertificateFieldType, FIELD_TYPE_METADATA } from '../../../models/Certificate';
import { CertificateService } from '../../../services/CertificateService';
import { CertificateCanvas } from '../../../components/CertificateEditor/CertificateCanvas';
import { FieldPropertiesPanel } from '../../../components/CertificateEditor/FieldPropertiesPanel';
import { v4 as uuidv4 } from 'uuid';

const SAMPLE_DATA = {
  participant_name: 'Chetan Lohani',
  bib_number: '2101',
  race_category: '21.1 KM',
  race_distance: '21.1 KM',
  chip_timing: '02:01:58',
  gun_timing: '02:03:45',
  rank_overall: '42',
  rank_category: '5',
  rank_gender: '38',
  event_name: '4th Gurugram City Half Marathon 2025',
  event_date: 'December 21, 2025'
};

interface AddOrEditCertificateProps {
  eventId?: string;
  raceId?: string;
}

export const AddOrEditCertificate: React.FC<AddOrEditCertificateProps> = ({ eventId: propsEventId, raceId: propsRaceId }) => {
  const { id, eventId: paramEventId, raceId: paramRaceId } = useParams<{ id: string; eventId: string; raceId: string }>();
  const navigate = useNavigate();
  
  // Use props if provided, otherwise use URL params
  const eventId = propsEventId || paramEventId || '';
  const raceId = propsRaceId || paramRaceId;
  const isEditMode = !!id;

  const [template, setTemplate] = useState<CertificateTemplate>({
    eventId: eventId,
    raceId: raceId,
    name: '',
    description: '',
    width: 1754, // A4 landscape at 150 DPI
    height: 1240,
    fields: [],
    isActive: true
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [addFieldMenuAnchor, setAddFieldMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (isEditMode && id) {
      loadTemplate(id);
    }
  }, [id, isEditMode]);

  // Update template when eventId or raceId change
  useEffect(() => {
    setTemplate(prev => ({
      ...prev,
      eventId: eventId,
      raceId: raceId
    }));
  }, [eventId, raceId]);

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await CertificateService.getTemplate(templateId);
      setTemplate(data);
    } catch (error) {
      showSnackbar('Failed to load template', 'error');
      console.error('Load template error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      showSnackbar('Please enter a template name', 'error');
      return;
    }

    if (!template.eventId) {
      showSnackbar('Please select an event', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode && id) {
        await CertificateService.updateTemplate(id, template);
        showSnackbar('Template updated successfully', 'success');
      } else {
        await CertificateService.createTemplate(template);
        showSnackbar('Template created successfully', 'success');
        // If embedded in ViewRaces, don't navigate away
        if (!propsEventId && !propsRaceId) {
          navigate('/admin/certificates');
        }
      }
    } catch (error) {
      showSnackbar('Failed to save template', 'error');
      console.error('Save template error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTemplate(prev => ({ ...prev, backgroundImageData: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddField = (fieldType: CertificateFieldType) => {
    const metadata = FIELD_TYPE_METADATA.find(m => m.type === fieldType);
    
    const newField: CertificateField = {
      id: uuidv4(),
      fieldType,
      content: metadata?.placeholder || '',
      xCoordinate: 100,
      yCoordinate: 100,
      font: 'Eurostile',
      fontSize: 24,
      fontColor: '000000',
      alignment: 'left',
      fontWeight: 'normal',
      fontStyle: 'normal'
    };

    setTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedFieldId(newField.id);
    setAddFieldMenuAnchor(null);
  };

  const handleFieldUpdate = (updatedField: CertificateField) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === updatedField.id ? updatedField : f)
    }));
  };

  const handleFieldMove = (fieldId: string, x: number, y: number) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId 
          ? { ...f, xCoordinate: Math.round(x), yCoordinate: Math.round(y) }
          : f
      )
    }));
  };

  const handleFieldDelete = (fieldId: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
    setSelectedFieldId(null);
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const previewUrl = await CertificateService.previewCertificate(template);
      window.open(previewUrl, '_blank');
    } catch (error) {
      showSnackbar('Failed to generate preview', 'error');
      console.error('Preview error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const selectedField = template.fields.find(f => f.id === selectedFieldId) || null;

  return (
    <Box>
      {/* Header */}
      {!propsEventId && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <IconButton onClick={() => navigate('/admin/certificates')}>
              <BackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {isEditMode ? 'Edit Certificate Template' : 'Create Certificate Template'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Design and customize certificate templates for race participants
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={handlePreview}
          disabled={!template.backgroundImageData && !template.backgroundImageUrl}
        >
          Preview
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </Stack>

      <Stack direction="row" spacing={3} sx={{ height: 700 }}>
        {/* Left Panel - Template Info */}
        <Box sx={{ width: 400 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ overflow: 'auto', height: '100%' }}>
              <Typography variant="h6" gutterBottom>Template Settings</Typography>
              <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              label="Template Name"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={template.description || ''}
              onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            {!propsEventId && (
              <TextField
                fullWidth
                label="Event ID"
                value={template.eventId}
                onChange={(e) => setTemplate(prev => ({ ...prev, eventId: e.target.value }))}
                sx={{ mb: 2 }}
                required
                disabled={!!propsEventId}
              />
            )}

            {!propsRaceId && (
              <TextField
                fullWidth
                label="Race ID"
                value={template.raceId || ''}
                onChange={(e) => setTemplate(prev => ({ ...prev, raceId: e.target.value }))}
                sx={{ mb: 2 }}
                required={!propsRaceId}
                disabled={!!propsRaceId}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={template.isActive}
                  onChange={(e) => setTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Certificate Size</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Width (px)"
                value={template.width}
                onChange={(e) => setTemplate(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                size="small"
              />
              <TextField
                fullWidth
                type="number"
                label="Height (px)"
                value={template.height}
                onChange={(e) => setTemplate(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                size="small"
              />
            </Stack>

            <Button
              fullWidth
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Background
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleBackgroundUpload}
              />
            </Button>

            {template.backgroundImageData || template.backgroundImageUrl ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Background image uploaded
              </Alert>
            ) : null}

            <Divider sx={{ my: 3 }} />

            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={(e) => setAddFieldMenuAnchor(e.currentTarget)}
            >
              Add Field
            </Button>

            <Menu
              anchorEl={addFieldMenuAnchor}
              open={Boolean(addFieldMenuAnchor)}
              onClose={() => setAddFieldMenuAnchor(null)}
            >
              {FIELD_TYPE_METADATA.map(meta => (
                <MenuItem key={meta.type} onClick={() => handleAddField(meta.type)}>
                  <ListItemIcon>
                    <TextFieldsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={meta.label}
                    secondary={meta.placeholder}
                  />
                </MenuItem>
              ))}
            </Menu>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fields: {template.fields.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click on a field to edit its properties
              </Typography>
            </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Center Panel - Canvas */}
        <Box sx={{ flex: 1, maxWidth: 700 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', bgcolor: 'grey.50' }}>
              <CertificateCanvas
                template={template}
                selectedFieldId={selectedFieldId || undefined}
                onFieldSelect={setSelectedFieldId}
                onFieldMove={handleFieldMove}
                sampleData={SAMPLE_DATA}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Right Panel - Field Properties */}
        <Box sx={{ width: 340 }}>
          <Card sx={{ height: '100%' }}>
            <FieldPropertiesPanel
              field={selectedField}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
            />
          </Card>
        </Box>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

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
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { CertificateTemplate, CertificateField, CertificateFieldType, FIELD_TYPE_METADATA } from '../../../models/Certificate';
import { CertificateService } from '../../../services/CertificateService';
import { CertificateCanvas } from '../../../components/CertificateEditor/CertificateCanvas';
import { FieldPropertiesPanel } from '../../../components/CertificateEditor/FieldPropertiesPanel';
import { v4 as uuidv4 } from 'uuid';

const SAMPLE_DATA = {
  ParticipantName: '[name]',
  BibNumber: '[bib]',
  RaceCategory: '[race_category]',
  Category: '[category]',
  RaceDistance: '[race_distance]',
  ChipTiming: '[chip_time]',
  GunTiming: '[gun_time]',
  TimeHrs: '[time_hrs]',
  TimeMins: '[time_mins]',
  TimeSecs: '[time_secs]',
  RankOverall: '[overall_rank]',
  RankCategory: '[category_rank]',
  RankGender: '[gender_rank]',
  OverallGenderRank: '[overall_gender_rank]',
  Gender: '[gender]',
  Distance: '[distance]',
  Photo: '[photo]',
  EventName: '[event_name]',
  EventDate: '[event_date]',
  CustomText: ''
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
  const [selectedFieldType, setSelectedFieldType] = useState<CertificateFieldType | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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
    if (!template.eventId) {
      showSnackbar('Please select an event', 'error');
      return;
    }

    if (!template.backgroundImageData && !template.backgroundImageUrl) {
      showSnackbar('Please upload a background image', 'error');
      return;
    }

    // Auto-generate template name if not provided
    const templateToSave = {
      ...template,
      name: template.name || `Certificate_${template.eventId}${template.raceId ? `_${template.raceId}` : ''}_${Date.now()}`,
      description: template.description || ''
    };

    try {
      setLoading(true);
      if (isEditMode && id) {
        await CertificateService.updateTemplate(id, templateToSave);
        showSnackbar('Template updated successfully', 'success');
      } else {
        await CertificateService.createTemplate(templateToSave);
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
      fontSize: 30,
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
  };

  const handleRemoveFieldsByType = (fieldType: CertificateFieldType) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.fieldType !== fieldType)
    }));
    // Clear selection if the selected field was removed
    if (selectedFieldId) {
      const selectedField = template.fields.find(f => f.id === selectedFieldId);
      if (selectedField?.fieldType === fieldType) {
        setSelectedFieldId(null);
      }
    }
  };

  const handleFieldTypeClick = (fieldType: CertificateFieldType) => {
    setSelectedFieldType(fieldType);
    // If this field type is already added, select the first instance on the canvas
    const addedField = template.fields.find(f => f.fieldType === fieldType);
    if (addedField) {
      setSelectedFieldId(addedField.id);
    } else {
      setSelectedFieldId(null);
    }
  };

  const handleAddOrRemoveField = (e: React.MouseEvent, fieldType: CertificateFieldType, isAdded: boolean) => {
    e.stopPropagation();
    if (isAdded) {
      handleRemoveFieldsByType(fieldType);
    } else {
      handleAddField(fieldType);
    }
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
      
      // Generate client-side preview
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = template.width;
      previewCanvas.height = template.height;
      const ctx = previewCanvas.getContext('2d');
      
      if (!ctx) {
        showSnackbar('Failed to generate preview', 'error');
        return;
      }

      // Draw background
      if (template.backgroundImageData || template.backgroundImageUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, template.width, template.height);
          
          // Draw all fields
          template.fields.forEach(field => {
            const text = (SAMPLE_DATA as Record<string, string>)[field.fieldType] || field.content || `[${field.fieldType}]`;
            ctx.font = `${field.fontStyle || 'normal'} ${field.fontWeight || 'normal'} ${field.fontSize}px ${field.font}`;
            ctx.fillStyle = `#${field.fontColor}`;
            ctx.textAlign = field.alignment || 'left';
            ctx.fillText(text, field.xCoordinate, field.yCoordinate);
          });

          // Open preview in new window
          previewCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const win = window.open(url, '_blank');
              if (win) {
                win.onload = () => URL.revokeObjectURL(url);
              }
            }
          });
        };
        img.onerror = () => {
          showSnackbar('Failed to load background image', 'error');
        };
        img.src = template.backgroundImageData || template.backgroundImageUrl || '';
      } else {
        showSnackbar('Please upload a background image first', 'error');
      }
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
      {/* Header Section with Title and Action Buttons */}
      {!propsEventId && (
        <IconButton 
          onClick={() => navigate('/admin/certificates')} 
          sx={{ mb: 1 }}
        >
          <BackIcon />
        </IconButton>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {/* Left Side - Title */}
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Certificate Template' : 'Certificate'}
          </Typography>

          {/* Right Side - Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              component="label"
              disabled={loading}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Upload Background
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleBackgroundUpload}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              disabled={!template.backgroundImageData && !template.backgroundImageUrl || loading}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!template.backgroundImageData && !template.backgroundImageUrl || loading}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content in Card */}
      <Card>
        <CardContent>
          <Stack direction="row" spacing={3}>
            {/* Left Panel - Template Info */}
            <Box sx={{ width: 380, flexShrink: 0 }}>
              <Box sx={{ maxHeight: '600px', overflow: 'auto', pt: 2, pr: 1 }}>
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

                <Typography variant="h6" gutterBottom>Available Fields</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Click + to add field to certificate
                </Typography>

                <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fields: {template.fields.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click on a field to edit its properties
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 1 
                }}>
                  {FIELD_TYPE_METADATA.map(meta => {
                    const isAdded = template.fields.some(f => f.fieldType === meta.type);
                    const isSelected = selectedFieldType === meta.type;
                    return (
                      <Box
                        key={meta.type}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          p: 1,
                          border: 1,
                          borderColor: isAdded ? 'success.main' : isSelected ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          bgcolor: isAdded ? 'rgba(46, 125, 50, 0.12)' : isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          '&:hover': {
                            bgcolor: isAdded ? 'rgba(46, 125, 50, 0.18)' : isSelected ? 'rgba(25, 118, 210, 0.12)' : 'action.hover',
                            cursor: 'pointer'
                          },
                          minHeight: '65px'
                        }}
                        onClick={() => handleFieldTypeClick(meta.type)}
                      >
                        <Box sx={{ flex: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="medium" color={isAdded ? 'success.main' : isSelected ? 'primary.main' : 'text.primary'} sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                            {meta.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
                            {meta.placeholder}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color={isAdded ? 'error' : 'primary'}
                          onClick={(e) => handleAddOrRemoveField(e, meta.type, isAdded)}
                          sx={{ alignSelf: 'flex-end', p: 0.5 }}
                        >
                          {isAdded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Center Panel - Canvas */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ height: '100%', bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
                {/* Certificate Size Controls */}
                <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Size:</Typography>
                  <TextField
                    type="number"
                    label="Width (px)"
                    value={template.width}
                    onChange={(e) => setTemplate(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    size="small"
                    sx={{ width: 100 }}
                    InputLabelProps={{ sx: { fontSize: '0.75rem' } }}
                    inputProps={{ sx: { fontSize: '0.75rem' } }}
                  />
                  <TextField
                    type="number"
                    label="Height (px)"
                    value={template.height}
                    onChange={(e) => setTemplate(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    size="small"
                    sx={{ width: 100 }}
                    InputLabelProps={{ sx: { fontSize: '0.75rem' } }}
                    inputProps={{ sx: { fontSize: '0.75rem' } }}
                  />
                </Stack>
                
                <CertificateCanvas
                  template={template}
                  selectedFieldId={selectedFieldId || undefined}
                  onFieldSelect={setSelectedFieldId}
                  onFieldMove={handleFieldMove}
                  sampleData={SAMPLE_DATA}
                />
              </Box>
            </Box>

            {/* Right Panel - Field Properties */}
            <Box sx={{ width: 320, flexShrink: 0 }}>
              <FieldPropertiesPanel
                field={selectedField}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

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

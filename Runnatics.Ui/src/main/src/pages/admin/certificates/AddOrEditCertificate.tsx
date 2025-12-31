import React, { useState, useEffect, useRef } from 'react';
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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as BackIcon,
  EmojiEvents
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
    isActive: true,
    isDefault: false
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<CertificateFieldType | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading certificate template...');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [existingTemplateId, setExistingTemplateId] = useState<string | null>(null);
  const [showBackgroundChangeDialog, setShowBackgroundChangeDialog] = useState(false);
  const [pendingBackgroundFile, setPendingBackgroundFile] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isViewingDefaultTemplate, setIsViewingDefaultTemplate] = useState(false);
  const hasLoadedRef = useRef(false);
  const currentLoadingRaceRef = useRef<string | undefined>(raceId);

  // Load template on mount
  useEffect(() => {
    // Prevent double loading in React Strict Mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    if (isEditMode && id) {
      loadTemplate(id);
    } else if (eventId) {
      // Load existing template for this event/race if available
      currentLoadingRaceRef.current = raceId;
      loadExistingTemplate(raceId);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload template when raceId changes (when user switches race from dropdown)
  useEffect(() => {
    // Skip on initial mount (handled by the above useEffect)
    if (!hasLoadedRef.current) return;
    
    console.log('Race ID changed, resetting template...', { newRaceId: raceId });
    
    // Only reload if not in edit mode (edit mode loads specific template by ID)
    if (!isEditMode && eventId) {
      resetAndLoadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId, propsRaceId]); // Include propsRaceId to ensure effect triggers

  const resetAndLoadTemplate = async () => {
    // Track which race we're loading
    const targetRaceId = raceId;
    currentLoadingRaceRef.current = targetRaceId;
    
    console.log('Resetting and loading template for race:', targetRaceId);
    
    // Reset ALL state to initial values
    setSelectedFieldId(null);
    setSelectedFieldType(null);
    setExistingTemplateId(null);
    setIsViewingDefaultTemplate(false);
    
    // Reset template to initial blank state
    const initialTemplate = {
      eventId: eventId,
      raceId: targetRaceId,
      name: '',
      description: '',
      width: 1754,
      height: 1240,
      fields: [],
      isActive: true,
      isDefault: false
    };
    setTemplate(initialTemplate);

    // Use the existing loadExistingTemplate function which has all the default template logic
    await loadExistingTemplate(targetRaceId);
  };

  const loadExistingTemplate = async (targetRaceId: string | undefined) => {
    if (!eventId) return;

    console.log('loadExistingTemplate called with:', { eventId, targetRaceId });

    try {
      setLoadingMessage('Loading certificate template...');
      setLoading(true);
      const existingTemplate = await CertificateService.getTemplateByEventAndRace(eventId, targetRaceId);
      
      console.log('Backend returned template:', existingTemplate);
      
      // Only update if we're still loading this race
      if (currentLoadingRaceRef.current === targetRaceId) {
        if (existingTemplate) {
          // Check if this is the race's own template or a default template from another race/event
          const isOwnTemplate = existingTemplate.raceId === targetRaceId;
          const isDefaultTemplate = existingTemplate.isDefault && !isOwnTemplate;
          
          console.log('Template analysis:', {
            templateRaceId: existingTemplate.raceId,
            targetRaceId,
            isOwnTemplate,
            isDefaultTemplate,
            templateIsDefault: existingTemplate.isDefault,
            willSetViewingDefault: isDefaultTemplate
          });
          
          // Set template with correct raceId for current race
          const templateToSet = {
            ...existingTemplate,
            raceId: targetRaceId, // Always use the current race ID
            id: isDefaultTemplate ? undefined : existingTemplate.id, // Clear ID if it's a default template
            isDefault: isDefaultTemplate ? false : existingTemplate.isDefault // Keep isDefault for own template, clear for default template
          };
          
          setTemplate(templateToSet);
          
          if (isDefaultTemplate) {
            // Viewing default template - don't set existingTemplateId so saving creates new
            setExistingTemplateId(null);
            setIsViewingDefaultTemplate(true);
            console.log('✅ SET isViewingDefaultTemplate to TRUE');
            showSnackbar('Showing default template. Click Update to create a copy for this race.', 'info');
          } else {
            // Viewing own template
            setExistingTemplateId(existingTemplate.id || null);
            setIsViewingDefaultTemplate(false);
            console.log('❌ SET isViewingDefaultTemplate to FALSE - own template');
            showSnackbar('Existing template loaded. You can edit and update it.', 'success');
          }
        } else {
          console.log('No template returned from backend');
          setIsViewingDefaultTemplate(false);
        }
      }
    } catch (error) {
      if (currentLoadingRaceRef.current === targetRaceId) {
        console.log('Error loading template:', error);
        setIsViewingDefaultTemplate(false);
        // No error message needed - it's normal to not have a template yet
      }
    } finally {
      if (currentLoadingRaceRef.current === targetRaceId) {
        setLoading(false);
      }
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      setLoadingMessage('Loading certificate template...');
      setLoading(true);
      const data = await CertificateService.getTemplate(templateId);
      setTemplate(data);
      setExistingTemplateId(templateId);
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

    if (!template.fields || template.fields.length === 0) {
      showSnackbar('Please add at least one field to the certificate', 'error');
      return;
    }

    // Auto-generate template name if not provided
    const templateToSave = {
      ...template,
      raceId: raceId, // Ensure we use the current race ID, not from a default template
      name: template.name || `Certificate_${template.eventId}${template.raceId ? `_${template.raceId}` : ''}_${Date.now()}`,
      description: template.description || '',
      isDefault: template.isDefault || false
    };

    try {
      if (isEditMode && id) {
        setLoadingMessage('Updating certificate template...');
        setLoading(true);
        await CertificateService.updateTemplate(id, templateToSave);
        showSnackbar('Template updated successfully', 'success');
      } else if (existingTemplateId && !isViewingDefaultTemplate) {
        // Update existing template ONLY if not viewing default
        setLoadingMessage('Updating certificate template...');
        setLoading(true);
        await CertificateService.updateTemplate(existingTemplateId, templateToSave);
        showSnackbar('Template updated successfully', 'success');
      } else {
        // Create new template (includes when viewing default template)
        setLoadingMessage('Creating certificate template...');
        setLoading(true);
        const created = await CertificateService.createTemplate(templateToSave);
        setExistingTemplateId(created.id || null);
        setIsViewingDefaultTemplate(false);
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

  const handleCreateCustomTemplate = () => {
    // Clear the default template flag and allow user to create new
    setIsViewingDefaultTemplate(false);
    setExistingTemplateId(null);
    // Reset to blank template for this race
    setTemplate({
      eventId: eventId,
      raceId: raceId,
      name: '',
      description: '',
      width: 1754,
      height: 1240,
      fields: [],
      isActive: true,
      isDefault: false
    });
    showSnackbar('Ready to create custom template. Upload a background to begin.', 'info');
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if background exists and fields are added
    const hasBackground = !!(template.backgroundImageData || template.backgroundImageUrl);
    const hasFields = template.fields.length > 0;

    if (hasBackground && hasFields) {
      // Show warning dialog
      setPendingBackgroundFile(file);
      setShowBackgroundChangeDialog(true);
    } else {
      // Proceed with upload
      processBackgroundUpload(file);
    }

    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  const processBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTemplate(prev => ({ ...prev, backgroundImageData: result }));
      showSnackbar('Background image updated', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmBackgroundChange = () => {
    if (pendingBackgroundFile) {
      processBackgroundUpload(pendingBackgroundFile);
      setPendingBackgroundFile(null);
    }
    setShowBackgroundChangeDialog(false);
  };

  const handleCancelBackgroundChange = () => {
    setPendingBackgroundFile(null);
    setShowBackgroundChangeDialog(false);
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
    // For custom text, only remove the last added instance
    if (fieldType === CertificateFieldType.CUSTOM_TEXT) {
      const customTextFields = template.fields.filter(f => f.fieldType === CertificateFieldType.CUSTOM_TEXT);
      if (customTextFields.length > 0) {
        const lastField = customTextFields[customTextFields.length - 1];
        setTemplate(prev => ({
          ...prev,
          fields: prev.fields.filter(f => f.id !== lastField.id)
        }));
        // Clear selection if the removed field was selected
        if (selectedFieldId === lastField.id) {
          setSelectedFieldId(null);
        }
      }
    } else {
      // For other field types, remove all instances (though there should only be one)
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
    }
  };

  const handleFieldTypeClick = (fieldType: CertificateFieldType) => {
    setSelectedFieldType(fieldType);
    // If this field type is already added, select the last instance on the canvas
    const fieldsOfType = template.fields.filter(f => f.fieldType === fieldType);
    if (fieldsOfType.length > 0) {
      // Select the last added field of this type
      setSelectedFieldId(fieldsOfType[fieldsOfType.length - 1].id);
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

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClearAllFields = () => {
    setTemplate(prev => ({ ...prev, fields: [] }));
    setSelectedFieldId(null);
    setSelectedFieldType(null);
    setShowClearAllDialog(false);
    showSnackbar('All fields removed', 'success');
  };

  const handleDeleteTemplate = async () => {
    if (!existingTemplateId) return;

    try {
      setLoading(true);
      await CertificateService.deleteTemplate(existingTemplateId);
      
      // Reset template to initial state
      setTemplate({
        eventId: eventId,
        raceId: raceId,
        name: '',
        description: '',
        width: 1754,
        height: 1240,
        fields: [],
        isActive: true,
        isDefault: false
      });
      setExistingTemplateId(null);
      setSelectedFieldId(null);
      setSelectedFieldType(null);
      setShowDeleteDialog(false);
      showSnackbar('Template deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete template', 'error');
      console.error('Delete template error:', error);
    } finally {
      setLoading(false);
    }
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
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4" component="h1">
              {isEditMode ? 'Edit Certificate Template' : 'Certificate'}
            </Typography>
            {template.isDefault && (
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                Default
              </Box>
            )}
          </Stack>

          {/* Right Side - Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              component="label"
              disabled={loading}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              {template.backgroundImageData || template.backgroundImageUrl ? 'Change Background' : 'Upload Background'}
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
            {existingTemplateId && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!template.backgroundImageData && !template.backgroundImageUrl || loading}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              {isEditMode || existingTemplateId ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content in Card */}
      <Card sx={{ position: 'relative' }}>
        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography variant="h6" color="text.primary">{loadingMessage}</Typography>
            </Stack>
          </Box>
        )}
        
        <CardContent>
          {/* Show message when viewing default template instead of the actual template */}
          {isViewingDefaultTemplate ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '500px',
                p: 4
              }}
            >
              <Card sx={{ maxWidth: 600, textAlign: 'center', p: 4 }}>
                <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  No Custom Certificate Template
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  This race doesn't have a specific certificate template yet.
                </Typography>
                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>Default template will be used:</strong> When certificates are generated for this race,
                    the default template from this event will be automatically applied.
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<UploadIcon />}
                  onClick={handleCreateCustomTemplate}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  Create Custom Template for This Race
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Creating a custom template will override the default for this race only
                </Typography>
              </Card>
            </Box>
          ) : (
          <Stack direction="row" spacing={3}>
            {/* Left Panel - Template Info */}
            <Box sx={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ overflow: 'auto', pt: 2, pr: 1, flex: 1 }}>
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Fields: {template.fields.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click on a field to edit its properties
                      </Typography>
                    </Box>
                    {template.fields.length > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setShowClearAllDialog(true)}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Clear All
                      </Button>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 1 
                }}>
                  {FIELD_TYPE_METADATA.map(meta => {
                    // Allow multiple custom text fields, but only one of each other type
                    const isAdded = meta.type !== CertificateFieldType.CUSTOM_TEXT 
                      ? template.fields.some(f => f.fieldType === meta.type)
                      : false;
                    const isSelected = selectedFieldType === meta.type;
                    const fieldCount = template.fields.filter(f => f.fieldType === meta.type).length;
                    const showCount = meta.type === CertificateFieldType.CUSTOM_TEXT && fieldCount > 0;
                    
                    return (
                      <Box
                        key={meta.type}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          p: 1,
                          border: 1,
                          borderColor: isAdded ? 'success.main' : isSelected ? 'primary.main' : 'grey.300',
                          borderRadius: 1,
                          bgcolor: isAdded ? 'rgba(46, 125, 50, 0.08)' : isSelected ? 'rgba(25, 118, 210, 0.05)' : 'grey.50',
                          '&:hover': {
                            bgcolor: isAdded ? 'rgba(46, 125, 50, 0.15)' : isSelected ? 'rgba(25, 118, 210, 0.10)' : 'rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer',
                            borderColor: isAdded ? 'success.dark' : isSelected ? 'primary.dark' : 'grey.400',
                          },
                          minHeight: '50px',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => handleFieldTypeClick(meta.type)}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="600" 
                            color={isAdded ? 'success.main' : isSelected ? 'primary.main' : 'text.primary'} 
                            sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}
                          >
                            {meta.label}
                            {showCount && (
                              <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 'bold' }}>
                                ({fieldCount})
                              </Typography>
                            )}
                          </Typography>
                          <IconButton
                            size="small"
                            color={isAdded ? 'error' : 'primary'}
                            onClick={(e) => handleAddOrRemoveField(e, meta.type, isAdded)}
                            sx={{ p: 0.25 }}
                          >
                            {isAdded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                          </IconButton>
                        </Stack>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.68rem', 
                            lineHeight: 1.2,
                            color: isAdded ? 'success.dark' : isSelected ? 'primary.dark' : 'text.secondary',
                            fontStyle: 'italic'
                          }}
                        >
                          {meta.placeholder}
                        </Typography>
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

                {/* Default Template Toggle - Show only when background is uploaded */}
                {(template.backgroundImageData || template.backgroundImageUrl) && (
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.isDefault || false}
                          onChange={(e) => setTemplate(prev => ({ ...prev, isDefault: e.target.checked }))}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                          Set as Default Template
                        </Typography>
                      }
                    />
                  </Box>
                )}
                
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
            <Box sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <FieldPropertiesPanel
                field={selectedField}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
              />
            </Box>
          </Stack>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Template Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Certificate Template?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this certificate template?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            <strong>Warning:</strong> This action cannot be undone. All {template.fields.length} field{template.fields.length !== 1 ? 's' : ''} and the background image will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteTemplate} variant="contained" color="error">
            Delete Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Background Change Warning Dialog */}
      <Dialog
        open={showBackgroundChangeDialog}
        onClose={handleCancelBackgroundChange}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Background Image?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to change the background image. Your existing fields will remain at their current positions.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> If the new background has different dimensions ({template.width} x {template.height} px), 
            you may need to reposition your {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelBackgroundChange} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmBackgroundChange} variant="contained" color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Fields Confirmation Dialog */}
      <Dialog
        open={showClearAllDialog}
        onClose={() => setShowClearAllDialog(false)}
      >
        <DialogTitle>Clear All Fields?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove all {template.fields.length} field{template.fields.length !== 1 ? 's' : ''} from the certificate? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearAllDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleClearAllFields} variant="contained" color="error">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

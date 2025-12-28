import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    IconButton,
    Divider,
    Stack,
    SelectChangeEvent,
    CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { CertificateField, FIELD_TYPE_METADATA } from '../../models/Certificate';

interface FieldPropertiesPanelProps {
    field: CertificateField | null;
    onFieldUpdate: (field: CertificateField) => void;
    onFieldDelete: (fieldId: string) => void;
}

const FONT_OPTIONS = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
    'Eurostile'
];

export const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
    field,
    onFieldUpdate,
    onFieldDelete
}) => {
    if (!field) {
        return (
            <CardContent>
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body1">
                        Select a field to edit its properties
                    </Typography>
                </Box>
            </CardContent>
        );
    }

    const handleChange = (property: keyof CertificateField, value: any) => {
        onFieldUpdate({ ...field, [property]: value });
    };

    const handleSelectChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;
        handleChange(name as keyof CertificateField, value);
    };

    const fieldMetadata = FIELD_TYPE_METADATA.find(m => m.type === field.fieldType);

    return (
        <CardContent sx={{ height: '100%', overflow: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Field Properties</Typography>
                <IconButton
                    color="error"
                    onClick={() => onFieldDelete(field.id)}
                    title="Delete Field"
                    size="small"
                >
                    <DeleteIcon />
                </IconButton>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Field Type */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Field Type</InputLabel>
                <Select
                    name="fieldType"
                    value={field.fieldType}
                    label="Field Type"
                    onChange={handleSelectChange}
                >
                    {FIELD_TYPE_METADATA.map(meta => (
                        <MenuItem key={meta.type} value={meta.type}>
                            {meta.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Content */}
            <TextField
                fullWidth
                label="Content"
                value={field.content}
                onChange={(e) => handleChange('content', e.target.value)}
                helperText={fieldMetadata?.description || 'Field content or placeholder'}
                sx={{ mb: 2 }}
            />

            {/* Position */}
            {/* <Stack direction="row" spacing={2} sx={{ mb: 2 }}> */}
            <TextField
                fullWidth
                type="number"
                label="X Coordinate"
                value={field.xCoordinate}
                onChange={(e) => handleChange('xCoordinate', parseFloat(e.target.value))}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                type="number"
                label="Y Coordinate"
                value={field.yCoordinate}
                onChange={(e) => handleChange('yCoordinate', parseFloat(e.target.value))}
                sx={{ mb: 2 }}
            />
            {/* </Stack> */}

            {/* Font */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Font</InputLabel>
                <Select
                    name="font"
                    value={field.font}
                    label="Font"
                    onChange={handleSelectChange}
                >
                    {FONT_OPTIONS.map(font => (
                        <MenuItem key={font} value={font}>
                            {font}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Font Size */}
            <TextField
                fullWidth
                type="number"
                label="Font Size"
                value={field.fontSize}
                onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                inputProps={{ min: 8, max: 200, step: 1 }}
                sx={{ mb: 2 }}
            />

            {/* Font Color */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Font Color (HEX)"
                    value={field.fontColor}
                    onChange={(e) => handleChange('fontColor', e.target.value.replace('#', ''))}
                    placeholder="000000"
                    InputProps={{
                        startAdornment: (
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    backgroundColor: `#${field.fontColor}`,
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    mr: 1
                                }}
                            />
                        )
                    }}
                />
                <input
                    type="color"
                    value={`#${field.fontColor}`}
                    onChange={(e) => handleChange('fontColor', e.target.value.replace('#', ''))}
                    style={{ width: '100%', height: 40, marginTop: 8, cursor: 'pointer' }}
                />
            </Box>

            {/* Alignment */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Alignment</InputLabel>
                <Select
                    name="alignment"
                    value={field.alignment || 'left'}
                    label="Alignment"
                    onChange={handleSelectChange}
                >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                </Select>
            </FormControl>

            {/* Font Weight */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Font Weight</InputLabel>
                <Select
                    name="fontWeight"
                    value={field.fontWeight || 'normal'}
                    label="Font Weight"
                    onChange={handleSelectChange}
                >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="bold">Bold</MenuItem>
                </Select>
            </FormControl>

            {/* Font Style */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Font Style</InputLabel>
                <Select
                    name="fontStyle"
                    value={field.fontStyle || 'normal'}
                    label="Font Style"
                    onChange={handleSelectChange}
                >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="italic">Italic</MenuItem>
                </Select>
            </FormControl>

            {/* Dimensions (Optional) */}
            {/* <Stack direction="row" spacing={2}> */}
            <TextField
                fullWidth
                type="number"
                label="Width (optional)"
                value={field.width || ''}
                onChange={(e) => handleChange('width', e.target.value ? parseFloat(e.target.value) : undefined)}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                type="number"
                label="Height (optional)"
                value={field.height || ''}
                onChange={(e) => handleChange('height', e.target.value ? parseFloat(e.target.value) : undefined)}
                sx={{ mb: 2 }}
            />
            {/* </Stack> */}
        </CardContent>
    );
};

import React, { useEffect, useRef, useState } from 'react';
import { CertificateField, CertificateTemplate, CertificateFieldType } from '../../models/Certificate';
import { Box, Paper } from '@mui/material';

interface CertificateCanvasProps {
  template: CertificateTemplate;
  selectedFieldId?: string;
  onFieldSelect?: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, x: number, y: number) => void;
  sampleData?: Record<string, string>;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  template,
  selectedFieldId,
  onFieldSelect,
  onFieldMove,
  sampleData = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(1);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Render background to off-screen canvas once
  useEffect(() => {
    renderBackground();
  }, [template.backgroundImageUrl, template.backgroundImageData, template.width, template.height]);

  useEffect(() => {
    renderCertificate();
  }, [template.fields, selectedFieldId, sampleData]);

  useEffect(() => {
    // Adjust scale to fit container
    const updateScale = () => {
      if (containerRef.current && template.width > 0) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const newScale = Math.min(containerWidth / template.width, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [template.width]);

  const renderBackground = () => {
    // Create off-screen canvas for background
    if (!backgroundCanvasRef.current) {
      backgroundCanvasRef.current = document.createElement('canvas');
    }
    
    const bgCanvas = backgroundCanvasRef.current;
    bgCanvas.width = template.width;
    bgCanvas.height = template.height;
    const bgCtx = bgCanvas.getContext('2d');
    if (!bgCtx) return;

    // Draw background
    if (template.backgroundImageUrl || template.backgroundImageData) {
      const img = new Image();
      img.onload = () => {
        bgCtx.drawImage(img, 0, 0, template.width, template.height);
        renderCertificate();
      };
      img.src = template.backgroundImageData || template.backgroundImageUrl || '';
    } else {
      // Default background
      bgCtx.fillStyle = '#f5f5f5';
      bgCtx.fillRect(0, 0, template.width, template.height);
      renderCertificate();
    }
  };

  const renderCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cached background from off-screen canvas
    if (backgroundCanvasRef.current) {
      ctx.drawImage(backgroundCanvasRef.current, 0, 0);
    }
    
    // Draw fields on top
    drawFields(ctx);
  };

  const drawFields = (ctx: CanvasRenderingContext2D) => {
    template.fields.forEach(field => {
      const text = getFieldText(field);
      
      ctx.font = `${field.fontStyle || 'normal'} ${field.fontWeight || 'normal'} ${field.fontSize}px ${field.font}`;
      ctx.fillStyle = `#${field.fontColor}`;
      ctx.textAlign = field.alignment || 'left';
      
      ctx.fillText(text, field.xCoordinate, field.yCoordinate);

      // Highlight selected field
      if (field.id === selectedFieldId) {
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 2;
        const metrics = ctx.measureText(text);
        ctx.strokeRect(
          field.xCoordinate - 5,
          field.yCoordinate - field.fontSize - 5,
          metrics.width + 10,
          field.fontSize + 10
        );
      }
    });
  };

  const getFieldText = (field: CertificateField): string => {
    if (field.fieldType === CertificateFieldType.CUSTOM_TEXT) {
      return field.content;
    }

    // Get sample data or placeholder
    return sampleData[field.fieldType] || field.content || `[${field.fieldType}]`;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Find clicked field
    const clickedField = findFieldAtPosition(x, y);
    if (clickedField && onFieldSelect) {
      onFieldSelect(clickedField.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const field = findFieldAtPosition(x, y);
    if (field) {
      setDraggingField(field.id);
      setDragOffset({
        x: x - field.xCoordinate,
        y: y - field.yCoordinate
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingField || !onFieldMove) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    onFieldMove(draggingField, x - dragOffset.x, y - dragOffset.y);
  };

  const handleMouseUp = () => {
    setDraggingField(null);
  };

  const findFieldAtPosition = (x: number, y: number): CertificateField | null => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return null;

    // Search in reverse order (top fields first)
    for (let i = template.fields.length - 1; i >= 0; i--) {
      const field = template.fields[i];
      const text = getFieldText(field);
      
      ctx.font = `${field.fontStyle || 'normal'} ${field.fontWeight || 'normal'} ${field.fontSize}px ${field.font}`;
      const metrics = ctx.measureText(text);
      
      const fieldLeft = field.xCoordinate - 5;
      const fieldTop = field.yCoordinate - field.fontSize - 5;
      const fieldWidth = metrics.width + 10;
      const fieldHeight = field.fontSize + 10;

      if (x >= fieldLeft && x <= fieldLeft + fieldWidth &&
          y >= fieldTop && y <= fieldTop + fieldHeight) {
        return field;
      }
    }
    return null;
  };

  return (
    <Box ref={containerRef} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
      <Paper
        elevation={2}
        sx={{
          display: 'inline-block',
          backgroundColor: '#fff',
          cursor: draggingField ? 'grabbing' : 'default',
          border: 1,
          borderColor: 'divider'
        }}
      >
        <canvas
          ref={canvasRef}
          width={template.width}
          height={template.height}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: template.width * scale,
            height: template.height * scale,
            display: 'block'
          }}
        />
      </Paper>
    </Box>
  );
};

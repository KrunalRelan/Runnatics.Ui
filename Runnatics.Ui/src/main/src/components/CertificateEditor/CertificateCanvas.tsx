import React, { useEffect, useRef, useState } from 'react';
import { CertificateField, CertificateTemplate, CertificateFieldType } from '../../models/Certificate';
import { Box, Paper } from '@mui/material';
import { fieldBounds, layoutField } from './fieldLayout';

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
      // Clear background (transparent)
      bgCtx.clearRect(0, 0, template.width, template.height);
      
      // Draw "No background added" text
      bgCtx.fillStyle = '#999';
      bgCtx.font = '32px Arial';
      bgCtx.textAlign = 'center';
      bgCtx.textBaseline = 'middle';
      bgCtx.fillText('No background added', template.width / 2, template.height / 2);
      
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

      // layoutField sets ctx.font (post-shrink) and resolves the anchor inside the width box
      const laid = layoutField(ctx, field, text);
      ctx.fillStyle = `#${field.fontColor}`;
      ctx.textAlign = field.alignment || 'left';

      ctx.fillText(laid.text, laid.drawX, field.yCoordinate);

      // Highlight selected field with bright, visible border
      if (field.id === selectedFieldId) {
        const bounds = fieldBounds(ctx, field, text);

        // Show the width box itself, so the operator can see what the text is aligned inside
        if (field.width && field.width > 0) {
          ctx.save();
          ctx.strokeStyle = 'rgba(33, 150, 243, 0.45)';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 8]);
          ctx.strokeRect(
            field.xCoordinate,
            field.yCoordinate - field.fontSize,
            field.width,
            field.fontSize
          );
          ctx.restore();
        }

        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'rgba(33, 150, 243, 0.5)';
        ctx.shadowBlur = 8;
        ctx.strokeRect(
          bounds.left - 5,
          bounds.top - 5,
          bounds.width + 10,
          bounds.height + 10
        );
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
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
      const bounds = fieldBounds(ctx, field, getFieldText(field));

      const fieldLeft = bounds.left - 5;
      const fieldTop = bounds.top - 5;
      const fieldWidth = bounds.width + 10;
      const fieldHeight = bounds.height + 10;

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
        elevation={0}
        sx={{
          display: 'inline-block',
          backgroundColor: 'background.default',
          cursor: draggingField ? 'grabbing' : 'default'
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

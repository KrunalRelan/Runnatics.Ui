import type { CertificateField } from '../../models/Certificate';

/**
 * Canvas-side mirror of the server renderer (CertificatesService.RenderToPng / FitTextToWidth).
 * Keep the two in step — if they diverge, the editor preview stops predicting the PNG the
 * participant actually receives.
 */

/** Smallest fraction of the configured font size that auto-shrink may fall back to. */
export const MIN_AUTO_SHRINK_SCALE = 0.6;

const ELLIPSIS = '…';

export const fieldFont = (field: CertificateField, fontSize: number): string =>
  `${field.fontStyle || 'normal'} ${field.fontWeight || 'normal'} ${fontSize}px ${field.font}`;

export interface LaidOutField {
  /** The string to draw — ellipsis-truncated only if it would not fit even at the shrink floor. */
  text: string;
  /** The x to pass to fillText, given ctx.textAlign is set to the field's alignment. */
  drawX: number;
  /** The font size actually used after any auto-shrink. */
  fontSize: number;
}

/**
 * A field with a width is a BOX spanning [x, x+width]: the text is anchored inside it per
 * alignment and fitted to it. A field with no width keeps the legacy behaviour — x is the
 * anchor and nothing is fitted. Leaves ctx.font set to the size actually used.
 */
export const layoutField = (
  ctx: CanvasRenderingContext2D,
  field: CertificateField,
  text: string
): LaidOutField => {
  ctx.font = fieldFont(field, field.fontSize);

  if (!field.width || field.width <= 0) {
    return { text, drawX: field.xCoordinate, fontSize: field.fontSize };
  }

  const boxWidth = field.width;
  const align = field.alignment || 'left';
  const drawX =
    align === 'center' ? field.xCoordinate + boxWidth / 2 :
    align === 'right' ? field.xCoordinate + boxWidth :
    field.xCoordinate;

  const measured = ctx.measureText(text).width;
  if (measured <= boxWidth) {
    return { text, drawX, fontSize: field.fontSize };
  }

  // Glyph advances scale linearly with font size, so one ratio gets us essentially there.
  const floor = field.fontSize * MIN_AUTO_SHRINK_SCALE;
  let fontSize = Math.max(field.fontSize * (boxWidth / measured), floor);
  ctx.font = fieldFont(field, fontSize);

  while (ctx.measureText(text).width > boxWidth && fontSize > floor) {
    fontSize = Math.max(fontSize - 0.5, floor);
    ctx.font = fieldFont(field, fontSize);
  }

  if (ctx.measureText(text).width <= boxWidth) {
    return { text, drawX, fontSize };
  }

  // Still over at the shrink floor: trim characters and mark the cut.
  for (let len = text.length - 1; len > 0; len--) {
    const candidate = `${text.slice(0, len).trimEnd()}${ELLIPSIS}`;
    if (ctx.measureText(candidate).width <= boxWidth) {
      return { text: candidate, drawX, fontSize };
    }
  }

  return { text: ELLIPSIS, drawX, fontSize };
};

/**
 * The drawn text's bounding box, for the selection outline and hit-testing. Accounts for
 * alignment and auto-shrink, so the outline tracks what is actually painted.
 */
export const fieldBounds = (
  ctx: CanvasRenderingContext2D,
  field: CertificateField,
  text: string
): { left: number; top: number; width: number; height: number } => {
  const laid = layoutField(ctx, field, text);
  const textWidth = ctx.measureText(laid.text).width;
  const align = field.alignment || 'left';

  const left =
    align === 'center' ? laid.drawX - textWidth / 2 :
    align === 'right' ? laid.drawX - textWidth :
    laid.drawX;

  return {
    left,
    top: field.yCoordinate - laid.fontSize,
    width: textWidth,
    height: laid.fontSize
  };
};

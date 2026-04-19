import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const APP_TIMEZONE = 'Asia/Kolkata';
const IST_SUFFIX = ' IST';
const EMPTY = '—';

type MaybeDateInput = string | Date | null | undefined;
type MaybeLocalInput = dayjs.Dayjs | Date | string | null | undefined;

/** UTC from the API → IST dayjs for display. Returns null on invalid/empty input. */
export const fromUtcToLocal = (utcString: MaybeDateInput): dayjs.Dayjs | null => {
  if (utcString === null || utcString === undefined || utcString === '') return null;
  const d = dayjs.utc(utcString);
  return d.isValid() ? d.tz(APP_TIMEZONE) : null;
};

/**
 * Local (IST) date/time from a form → UTC ISO string for the API.
 *
 * The value's wall-clock time is always interpreted as being in IST,
 * regardless of the browser's timezone. Accepts dayjs objects, Date
 * objects, or naive ISO-like strings (e.g. "2026-01-25T06:30:00").
 */
export const fromLocalToUtc = (localDate: MaybeLocalInput): string | null => {
  if (localDate === null || localDate === undefined || localDate === '') return null;
  const d = dayjs.tz(localDate as any, APP_TIMEZONE);
  return d.isValid() ? d.utc().toISOString() : null;
};

/** Formats a UTC value as an IST date. Returns a dash for empty input. */
export const formatDate = (utcString: MaybeDateInput, format = 'DD MMM YYYY'): string => {
  const d = fromUtcToLocal(utcString);
  return d ? d.format(format) : EMPTY;
};

/** Formats a UTC value as an IST datetime and appends " IST". */
export const formatDateTime = (utcString: MaybeDateInput, format = 'DD MMM YYYY, HH:mm'): string => {
  const d = fromUtcToLocal(utcString);
  return d ? d.format(format) + IST_SUFFIX : EMPTY;
};

/** Formats a UTC value as an IST time only (no date, no suffix). */
export const formatTime = (utcString: MaybeDateInput, format = 'HH:mm:ss'): string => {
  const d = fromUtcToLocal(utcString);
  return d ? d.format(format) : EMPTY;
};

// ── String helpers for native <TextField type="date|time|datetime-local"> ──

/** UTC ISO → "YYYY-MM-DD" (IST) for `type="date"` inputs. */
export const utcToInputDate = (utcString: MaybeDateInput): string => {
  const d = fromUtcToLocal(utcString);
  return d ? d.format('YYYY-MM-DD') : '';
};

/** UTC ISO → "HH:mm:ss" (IST) for `type="time"` inputs. */
export const utcToInputTime = (utcString: MaybeDateInput): string => {
  const d = fromUtcToLocal(utcString);
  return d ? d.format('HH:mm:ss') : '';
};

/** UTC ISO → "YYYY-MM-DDTHH:mm:ss" (IST) for `type="datetime-local"` inputs. */
export const utcToInputDateTime = (utcString: MaybeDateInput): string => {
  const d = fromUtcToLocal(utcString);
  return d ? d.format('YYYY-MM-DDTHH:mm:ss') : '';
};

/** Combine "YYYY-MM-DD" + "HH:mm[:ss]" IST parts → UTC ISO. */
export const inputPartsToUtc = (datePart: string, timePart: string): string | null => {
  if (!datePart) return null;
  const tp = timePart || '00:00:00';
  return fromLocalToUtc(`${datePart}T${tp}`);
};

/** "YYYY-MM-DDTHH:mm[:ss]" datetime-local string (IST) → UTC ISO. */
export const inputDateTimeToUtc = (local: string | null | undefined): string | null => {
  return fromLocalToUtc(local);
};

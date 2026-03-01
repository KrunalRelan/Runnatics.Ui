/**
 * Timezone conversion utilities for handling event and race dates
 * 
 * These utilities handle:
 * 1. Converting Local Time (selected in UI) → UTC (for storage in DB)
 * 2. Converting UTC (from API) → Local Time (for display in UI)
 * 3. Formatting datetime for HTML datetime-local inputs
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert a local datetime string to UTC ISO string for API storage
 * 
 * Example:
 * Input: "2026-01-25T06:00" (user selected time in IST)
 * Timezone: "Asia/Kolkata" (UTC+5:30)
 * Output: "2026-01-25T00:30:00Z" (UTC equivalent)
 * 
 * @param localDateTimeString - ISO datetime string from HTML datetime-local input (e.g., "2026-01-25T06:00")
 * @param timeZone - IANA timezone string (e.g., "Asia/Kolkata")
 * @returns UTC ISO string for API (e.g., "2026-01-25T00:30:00Z")
 */
export function convertLocalToUTC(
  localDateTimeString: string, 
  timeZone: string
): string {
  if (!localDateTimeString || !timeZone) {
    return '';
  }

  try {
    // Parse the input as a naive datetime (no timezone info in the string)
    // Use keepLocalTime flag (true) to treat the input as local time in the specified timezone
    // Then convert to UTC for API storage
    const utcTime = dayjs(localDateTimeString)
      .tz(timeZone, true)  // keepLocalTime: true - input is local time in this timezone
      .utc()
      .toISOString();

    return utcTime;
  } catch (error) {
    console.error('Error converting local to UTC:', error);
    return '';
  }
}

/**
 * Convert UTC datetime from API to local timezone string suitable for HTML datetime-local input
 * 
 * Example:
 * Input: "2026-01-25T00:30:00Z" (UTC from API)
 * Timezone: "Asia/Kolkata" (UTC+5:30)
 * Output: "2026-01-25T06:00" (local time, suitable for datetime-local input)
 * 
 * @param utcDateTimeString - UTC ISO string from API (e.g., "2026-01-25T00:30:00Z")
 * @param timeZone - IANA timezone string (e.g., "Asia/Kolkata")
 * @returns Local datetime string suitable for HTML datetime-local input (e.g., "2026-01-25T06:00")
 */
export function convertUTCToLocal(
  utcDateTimeString: string,
  timeZone: string
): string {
  if (!utcDateTimeString || !timeZone) {
    return '';
  }

  try {
    // Explicitly parse as UTC, then convert to target timezone
    // Format as datetime-local format (YYYY-MM-DDTHH:mm)
    const localTime = dayjs.utc(utcDateTimeString)
      .tz(timeZone)
      .format('YYYY-MM-DDTHH:mm');

    return localTime;
  } catch (error) {
    console.error('Error converting UTC to local:', error);
    return '';
  }
}

/**
 * Format a UTC datetime for human-readable display in the selected timezone
 * 
 * Example:
 * Input: "2026-01-25T00:30:00Z" (UTC from API)
 * Timezone: "Asia/Kolkata"
 * Output: "Jan 25, 2026 06:00 AM" (displayed in IST)
 * 
 * @param utcDateTimeString - UTC ISO string from API
 * @param timeZone - IANA timezone string
 * @param format - dayjs format string (default: "MMM DD, YYYY hh:mm A")
 * @returns Formatted datetime string in the specified timezone
 */
export function formatDateTimeInTimeZone(
  utcDateTimeString: string,
  timeZone: string,
  format: string = 'MMM DD, YYYY hh:mm A'
): string {
  if (!utcDateTimeString || !timeZone) {
    return 'N/A';
  }

  try {
    // Explicitly parse as UTC, then convert to target timezone
    return dayjs.utc(utcDateTimeString)
      .tz(timeZone)
      .format(format);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid Date';
  }
}

/**
 * Get the current time in a specific timezone formatted for datetime-local input
 * 
 * @param timeZone - IANA timezone string
 * @returns Current time as "YYYY-MM-DDTHH:mm"
 */
export function getCurrentTimeInTimeZone(timeZone: string): string {
  try {
    return dayjs()
      .tz(timeZone)
      .format('YYYY-MM-DDTHH:mm');
  } catch (error) {
    console.error('Error getting current time:', error);
    return '';
  }
}

/**
 * Check if a datetime string is valid
 * 
 * @param dateTimeString - ISO datetime string
 * @returns true if valid, false otherwise
 */
export function isValidDateTime(dateTimeString: string): boolean {
  if (!dateTimeString) return false;
  
  try {
    const date = dayjs(dateTimeString);
    return date.isValid();
  } catch {
    return false;
  }
}

/**
 * Get UTC offset for a timezone
 * 
 * Example: "UTC+05:30" for Asia/Kolkata
 * 
 * @param timeZone - IANA timezone string
 * @returns UTC offset string or "N/A"
 */
export function getUTCOffset(timeZone: string): string {
  try {
    const offset = dayjs().tz(timeZone).format('Z');
    return offset;
  } catch {
    return 'N/A';
  }
}

/**
 * Convert datetime between two timezones
 * 
 * @param dateTimeString - ISO datetime string
 * @param fromTimeZone - Source timezone
 * @param toTimeZone - Target timezone
 * @returns Formatted datetime string in target timezone
 */
export function convertBetweenTimeZones(
  dateTimeString: string,
  fromTimeZone: string,
  toTimeZone: string
): string {
  if (!dateTimeString || !fromTimeZone || !toTimeZone) {
    return '';
  }

  try {
    // Parse the datetime as if it's in the fromTimeZone
    // Then convert to toTimeZone
    const result = dayjs(dateTimeString)
      .tz(fromTimeZone)
      .tz(toTimeZone)
      .format('YYYY-MM-DDTHH:mm');

    return result;
  } catch (error) {
    console.error('Error converting between timezones:', error);
    return '';
  }
}

/**
 * Format a date range with timezone awareness
 * 
 * @param startDateTime - Start UTC datetime
 * @param endDateTime - End UTC datetime
 * @param timeZone - Display timezone
 * @param format - Optional custom format
 * @returns Formatted date range string
 */
export function formatDateTimeRange(
  startDateTime: string,
  endDateTime: string,
  timeZone: string,
  format: string = 'MMM DD, YYYY hh:mm A'
): string {
  if (!startDateTime || !endDateTime || !timeZone) {
    return 'N/A';
  }

  try {
    const startFormatted = formatDateTimeInTimeZone(startDateTime, timeZone, format);
    const endFormatted = formatDateTimeInTimeZone(endDateTime, timeZone, format);
    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Invalid Date Range';
  }
}

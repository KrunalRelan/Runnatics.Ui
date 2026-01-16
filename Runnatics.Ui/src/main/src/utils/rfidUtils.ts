import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { FileProcessingStatus, ReadRecordStatus } from '../models';
import { AlertSeverity } from '../models/ReaderAlert';

/**
 * Convert bytes to human readable format
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1 KB", "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Parse and format duration string (HH:MM:SS.fff format)
 * @param duration - Duration string or null
 * @returns Formatted string like "1h 30m 45s" or "5m 30s" or "2.5s"
 */
export function formatDuration(duration: string | null): string {
  if (!duration) return 'N/A';
  
  // Parse HH:MM:SS.fff format
  const parts = duration.split(':');
  if (parts.length !== 3) return duration;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  
  const result: string[] = [];
  
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);
  if (seconds > 0 || result.length === 0) {
    result.push(seconds % 1 === 0 ? `${seconds}s` : `${seconds.toFixed(1)}s`);
  }
  
  return result.join(' ');
}

/**
 * Format time ago from date string
 * @param dateString - ISO date string or null
 * @returns Formatted string like "5s ago", "2m ago", "3h ago", "5d ago"
 */
export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
}

/**
 * Get Tailwind color classes for file processing status
 * @param status - File processing status
 * @returns Tailwind CSS classes for badge
 */
export function getStatusColor(status: FileProcessingStatus): string {
  switch (status) {
    case FileProcessingStatus.Completed:
      return 'text-green-600 bg-green-100';
    case FileProcessingStatus.PartiallyCompleted:
      return 'text-yellow-600 bg-yellow-100';
    case FileProcessingStatus.Failed:
      return 'text-red-600 bg-red-100';
    case FileProcessingStatus.Processing:
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get icon component for file processing status
 * @param status - File processing status
 * @returns React icon component
 */
export function getStatusIcon(status: FileProcessingStatus): React.ReactNode {
  switch (status) {
    case FileProcessingStatus.Completed:
      return React.createElement(CheckCircle, { className: "w-4 h-4" });
    case FileProcessingStatus.PartiallyCompleted:
      return React.createElement(AlertTriangle, { className: "w-4 h-4" });
    case FileProcessingStatus.Failed:
      return React.createElement(XCircle, { className: "w-4 h-4" });
    case FileProcessingStatus.Processing:
      return React.createElement(Loader2, { className: "w-4 h-4 animate-spin" });
    default:
      return React.createElement(Clock, { className: "w-4 h-4" });
  }
}

/**
 * Get Tailwind color classes for alert severity
 * @param severity - Alert severity level
 * @returns Tailwind CSS classes for alert badge
 */
export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case AlertSeverity.Critical:
      return 'text-red-600 bg-red-100 border-red-200';
    case AlertSeverity.Warning:
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case AlertSeverity.Info:
      return 'text-blue-600 bg-blue-100 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

/**
 * Get Tailwind color classes for read record status
 * @param status - Read record status
 * @returns Tailwind CSS classes for status badge
 */
export function getRecordStatusColor(status: ReadRecordStatus): string {
  switch (status) {
    case ReadRecordStatus.Processed:
      return 'text-green-600 bg-green-100';
    case ReadRecordStatus.Valid:
      return 'text-blue-600 bg-blue-100';
    case ReadRecordStatus.Duplicate:
      return 'text-yellow-600 bg-yellow-100';
    case ReadRecordStatus.UnknownChip:
      return 'text-orange-600 bg-orange-100';
    case ReadRecordStatus.InvalidEpc:
    case ReadRecordStatus.InvalidTimestamp:
    case ReadRecordStatus.OutOfRaceWindow:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

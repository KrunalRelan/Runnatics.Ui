import React from 'react';
import { FileUploadStatusDto } from '../../models/FileUpload';
import { getStatusIcon, getStatusColor, formatFileSize, formatTimeAgo } from '../../utils/rfidUtils';
import { Eye, Trash2 } from 'lucide-react';

interface BatchListItemProps {
  batch: FileUploadStatusDto;
  onViewDetails: () => void;
  onDelete?: () => void;
}

export const BatchListItem: React.FC<BatchListItemProps> = ({
  batch,
  onViewDetails,
  onDelete
}) => {
  return (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(batch.status)}
            <h3 className="font-medium text-gray-900 truncate">{batch.fileName}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
            <div>
              <span className="text-gray-500">Checkpoint:</span>{' '}
              <span className="font-medium">{batch.checkpointName}</span>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>{' '}
              <span className="font-medium">{formatFileSize(batch.fileSize)}</span>
            </div>
            <div>
              <span className="text-gray-500">Records:</span>{' '}
              <span className="font-medium">{batch.totalRecords}</span>
            </div>
            <div>
              <span className="text-gray-500">Uploaded:</span>{' '}
              <span className="font-medium">{formatTimeAgo(batch.uploadedAt)}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
            {batch.status}
          </div>

          {/* Progress Stats */}
          {batch.processedRecords > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              <div className="flex gap-3">
                <span className="text-green-600">✓ {batch.successCount} success</span>
                {batch.duplicateCount > 0 && (
                  <span className="text-yellow-600">⚠ {batch.duplicateCount} duplicates</span>
                )}
                {batch.errorCount > 0 && (
                  <span className="text-red-600">✗ {batch.errorCount} errors</span>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {batch.errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              {batch.errorMessage}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  accept = '.csv,.txt',
  multiple = true,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}
      `}
    >
      <input
        type="file"
        id="file-upload"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
      
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-200'}`}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-blue-600" />
          ) : (
            <FileText className="w-8 h-8 text-gray-600" />
          )}
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragging ? 'Drop files here' : 'Drop files or click to browse'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: CSV, TXT
          </p>
        </div>
      </label>
    </div>
  );
};

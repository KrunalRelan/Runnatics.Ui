import React from 'react';
import { FileUploadRecordDto } from '../../models';
import { getRecordStatusColor } from '../../utils/rfidUtils';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface RecordsModalProps {
  batchId?: number;  // Optional for future use
  fileName: string;
  records: FileUploadRecordDto[];
  onClose: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  fileName,
  records,
  onClose
}) => {
  const [expandedRecord, setExpandedRecord] = React.useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Read Records</h2>
            <p className="text-sm text-gray-500">{fileName} • {records.length} records</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-6">
          {records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No records found
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record, index) => (
                <div
                  key={record.id || index}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                  >
                    <div className="flex-1 grid grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">EPC:</span>{' '}
                        <span className="font-mono">{record.epc}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>{' '}
                        <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Antenna:</span>{' '}
                        <span>{record.antennaPort}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRecordStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                    {expandedRecord === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {expandedRecord === index && (
                    <div className="p-3 bg-gray-50 border-t text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-gray-500">Full EPC:</span>
                          <p className="font-mono text-xs mt-1 break-all">{record.epc}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Timestamp:</span>
                          <p className="mt-1">{new Date(record.timestamp).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">RSSI:</span>
                          <p className="mt-1">{record.rssi} dBm</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Read Count:</span>
                          <p className="mt-1">{record.readCount}</p>
                        </div>
                        {record.participantBib && (
                          <div>
                            <span className="text-gray-500">Participant:</span>
                            <p className="mt-1">#{record.participantBib} - {record.participantName}</p>
                          </div>
                        )}
                      </div>
                      
                      {record.validationMessage && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <span className="font-medium">Validation:</span> {record.validationMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ReaderStatusDto } from '../../models/ReaderStatus';
import { X, Wifi, WifiOff, Signal, Thermometer, Activity, Upload } from 'lucide-react';
import { formatTimeAgo } from '../../utils/rfidUtils';

interface ReaderDetailModalProps {
  reader: ReaderStatusDto;
  onClose: () => void;
}

export const ReaderDetailModal: React.FC<ReaderDetailModalProps> = ({ reader, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{reader.name}</h2>
            <p className="text-sm text-gray-500">{reader.ipAddress}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {reader.isOnline ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Connection</p>
                  <p className="font-medium">
                    {reader.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Signal className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Antennas</p>
                  <p className="font-medium">{reader.antennas?.length || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Thermometer className={`w-6 h-6 ${(reader.cpuTemperatureCelsius || 0) > 70 ? 'text-red-600' : 'text-orange-600'}`} />
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className={`font-medium ${(reader.cpuTemperatureCelsius || 0) > 70 ? 'text-red-600' : ''}`}>
                    {reader.cpuTemperatureCelsius || 0}°C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Upload className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">Alerts</p>
                  <p className="font-medium">{reader.unacknowledgedAlerts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Reads Today</span>
                </div>
                <span className="font-semibold text-lg">{reader.totalReadsToday.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Last Read</span>
                <span className="font-medium">{formatTimeAgo(reader.lastReadTimestamp)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Last Seen</span>
                <span className="font-medium">{formatTimeAgo(reader.lastHeartbeat)}</span>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Device Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Checkpoint</span>
                <span className="font-medium">{reader.checkpointName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Serial Number</span>
                <span className="font-medium">{reader.serialNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Firmware Version</span>
                <span className="font-medium">{reader.firmwareVersion || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">IP Address</span>
                <span className="font-medium">{reader.ipAddress}</span>
              </div>
            </div>
          </div>
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

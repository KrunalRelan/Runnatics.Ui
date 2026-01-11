import React from 'react';
import { ReaderStatusDto } from '../../models/ReaderStatus';
import { Wifi, WifiOff, Signal, Thermometer, Activity } from 'lucide-react';
import { formatTimeAgo } from '../../utils/rfidUtils';

interface ReaderCardProps {
  reader: ReaderStatusDto;
  onClick: () => void;
}

export const ReaderCard: React.FC<ReaderCardProps> = ({ reader, onClick }) => {
  const isOnline = reader.isOnline;
  const temperature = reader.cpuTemperatureCelsius || 0;
  const hasWarning = temperature > 70;

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isOnline ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'
      } ${hasWarning ? 'border-yellow-300' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{reader.name}</h3>
          <p className="text-sm text-gray-500">{reader.ipAddress}</p>
        </div>
        <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Antennas</p>
            <p className="text-sm font-medium">{reader.antennas?.length || 0}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Thermometer className={`w-4 h-4 ${temperature > 70 ? 'text-red-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-xs text-gray-500">Temp</p>
            <p className={`text-sm font-medium ${temperature > 70 ? 'text-red-600' : ''}`}>
              {temperature}°C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Reads Today</p>
            <p className="text-sm font-medium">{reader.totalReadsToday.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${reader.unacknowledgedAlerts > 0 ? 'bg-red-400' : 'bg-gray-300'}`} />
          <div>
            <p className="text-xs text-gray-500">Alerts</p>
            <p className={`text-sm font-medium ${reader.unacknowledgedAlerts > 0 ? 'text-red-600' : ''}`}>
              {reader.unacknowledgedAlerts}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Last seen: {formatTimeAgo(reader.lastHeartbeat)}
        </p>
      </div>
    </div>
  );
};

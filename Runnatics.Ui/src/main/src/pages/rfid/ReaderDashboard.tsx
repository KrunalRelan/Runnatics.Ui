import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  WifiOff,
  Thermometer,
  Activity,
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  RefreshCw,
  Upload,
  Loader2,
  Server,
  Signal
} from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { ReaderService } from '../../services/ReaderService';
import { ReaderStatusDto } from '../../models/ReaderStatus';
import { ReaderAlertDto, AlertSeverity } from '../../models/ReaderAlert';
import { RfidDashboardDto } from '../../models/RfidDashboard';

// Utility functions
const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.Critical: return 'text-red-600 bg-red-100 border-red-200';
    case AlertSeverity.Warning: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case AlertSeverity.Info: return 'text-blue-600 bg-blue-100 border-blue-200';
    default: return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const getSeverityIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case AlertSeverity.Critical: return <AlertCircle className="w-4 h-4" />;
    case AlertSeverity.Warning: return <AlertTriangle className="w-4 h-4" />;
    case AlertSeverity.Info: return <Bell className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'text-gray-600', subtitle }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Reader Card Component
interface ReaderCardProps {
  reader: ReaderStatusDto;
  onClick: () => void;
}

const ReaderCard: React.FC<ReaderCardProps> = ({ reader, onClick }) => {
  const temperatureColor = reader.cpuTemperatureCelsius 
    ? reader.cpuTemperatureCelsius > 70 
      ? 'text-red-600' 
      : reader.cpuTemperatureCelsius > 55 
        ? 'text-yellow-600' 
        : 'text-green-600'
    : 'text-gray-400';

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${reader.isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {reader.isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{reader.name}</h3>
            <p className="text-xs text-gray-500">{reader.serialNumber || 'No serial'}</p>
          </div>
        </div>
        
        {reader.unacknowledgedAlerts > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            {reader.unacknowledgedAlerts} alert{reader.unacknowledgedAlerts > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {reader.totalReadsToday.toLocaleString()} reads
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Thermometer className={`w-4 h-4 ${temperatureColor}`} />
          <span className={`text-sm ${temperatureColor}`}>
            {reader.cpuTemperatureCelsius?.toFixed(1) ?? '--'}°C
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatTimeAgo(reader.lastHeartbeat)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {reader.ipAddress || 'No IP'}
          </span>
        </div>
      </div>

      {reader.checkpointName && (
        <div className="text-xs text-gray-500 mb-3">
          Checkpoint: <span className="font-medium">{reader.checkpointName}</span>
        </div>
      )}

      {/* Antenna Status */}
      <div className="flex gap-1 flex-wrap">
        {reader.antennas.map(antenna => (
          <div
            key={antenna.id}
            className={`px-2 py-1 rounded text-xs ${
              antenna.isEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}
            title={`Port ${antenna.port}: ${antenna.name || 'Unnamed'} - ${antenna.txPowerCdBm / 100} dBm`}
          >
            P{antenna.port}
          </div>
        ))}
      </div>
    </div>
  );
};

// Alert Item Component
interface AlertItemProps {
  alert: ReaderAlertDto;
  onAcknowledge: (alertId: number) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge }) => (
  <div className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-2">
        {getSeverityIcon(alert.severity)}
        <div>
          <p className="font-medium text-sm">{alert.readerName}</p>
          <p className="text-sm opacity-80">{alert.message}</p>
          <p className="text-xs opacity-60 mt-1">
            {new Date(alert.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      
      {!alert.isAcknowledged && (
        <button
          onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
          title="Acknowledge"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

// Reader Detail Modal
interface ReaderDetailModalProps {
  reader: ReaderStatusDto;
  onClose: () => void;
}

const ReaderDetailModal: React.FC<ReaderDetailModalProps> = ({ reader, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${reader.isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                {reader.isOnline ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{reader.name}</h2>
                <p className="text-gray-500">{reader.serialNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">IP Address</p>
              <p className="font-semibold">{reader.ipAddress || '-'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Firmware</p>
              <p className="font-semibold">{reader.firmwareVersion || '-'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">CPU Temperature</p>
              <p className="font-semibold">{reader.cpuTemperatureCelsius?.toFixed(1) ?? '-'}°C</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Reads Today</p>
              <p className="font-semibold">{reader.totalReadsToday.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Last Heartbeat</p>
              <p className="font-semibold">{formatTimeAgo(reader.lastHeartbeat)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Last Read</p>
              <p className="font-semibold">{formatTimeAgo(reader.lastReadTimestamp)}</p>
            </div>
          </div>

          {reader.checkpointName && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Assigned Checkpoint</h3>
              <p className="text-gray-600">{reader.checkpointName}</p>
            </div>
          )}

          <h3 className="font-semibold mb-3">Antennas</h3>
          <div className="space-y-2">
            {reader.antennas.map(antenna => (
              <div 
                key={antenna.id}
                className={`p-3 rounded-lg border ${antenna.isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Port {antenna.port}</span>
                    {antenna.name && <span className="text-gray-500 ml-2">({antenna.name})</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      TX Power: {(antenna.txPowerCdBm / 100).toFixed(1)} dBm
                    </span>
                    {antenna.position && (
                      <span className="text-sm text-gray-500">
                        Position: {antenna.position}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      antenna.isEnabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {antenna.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export const ReaderDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<RfidDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReader, setSelectedReader] = useState<ReaderStatusDto | null>(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    loadDashboard();
    setupSignalR();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    
    return () => {
      clearInterval(interval);
      hubConnectionRef.current?.stop();
    };
  }, []);

  const setupSignalR = async () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/race')
      .withAutomaticReconnect()
      .build();

    connection.on('ReaderStatusChange', (status: ReaderStatusDto) => {
      setDashboard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          readers: prev.readers.map(r => r.id === status.id ? status : r),
          onlineReaders: prev.readers.filter(r => r.id === status.id ? status.isOnline : r.isOnline).length,
          offlineReaders: prev.readers.filter(r => r.id === status.id ? !status.isOnline : !r.isOnline).length
        };
      });
    });

    connection.on('ReaderAlert', (alert: ReaderAlertDto) => {
      setDashboard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          recentAlerts: [alert, ...prev.recentAlerts.slice(0, 9)],
          unacknowledgedAlerts: prev.unacknowledgedAlerts + 1
        };
      });
    });

    try {
      await connection.start();
      await connection.invoke('JoinReaderMonitoring');
      hubConnectionRef.current = connection;
    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await ReaderService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await ReaderService.acknowledgeAlert(alertId);
      loadDashboard();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load dashboard
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">RFID Reader Dashboard</h1>
        <button
          onClick={loadDashboard}
          className="p-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <StatsCard
          title="Total Readers"
          value={dashboard.totalReaders}
          icon={<Server className="w-5 h-5" />}
        />
        <StatsCard
          title="Online"
          value={dashboard.onlineReaders}
          icon={<Wifi className="w-5 h-5" />}
          color="text-green-600"
        />
        <StatsCard
          title="Offline"
          value={dashboard.offlineReaders}
          icon={<WifiOff className="w-5 h-5" />}
          color={dashboard.offlineReaders > 0 ? "text-red-600" : "text-gray-600"}
        />
        <StatsCard
          title="Reads Today"
          value={dashboard.totalReadsToday.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          color="text-blue-600"
        />
        <StatsCard
          title="Pending Uploads"
          value={dashboard.pendingUploads + dashboard.processingUploads}
          icon={<Upload className="w-5 h-5" />}
          color={dashboard.pendingUploads > 0 ? "text-yellow-600" : "text-gray-600"}
          subtitle={dashboard.processingUploads > 0 ? `${dashboard.processingUploads} processing` : undefined}
        />
        <StatsCard
          title="Alerts"
          value={dashboard.unacknowledgedAlerts}
          icon={dashboard.unacknowledgedAlerts > 0 ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          color={dashboard.unacknowledgedAlerts > 0 ? "text-red-600" : "text-gray-600"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readers Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Readers</h2>
          {dashboard.readers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No readers configured</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.readers.map(reader => (
                <ReaderCard
                  key={reader.id}
                  reader={reader}
                  onClick={() => setSelectedReader(reader)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
            <button
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showAllAlerts ? 'Show unacknowledged' : 'Show all'}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            {dashboard.recentAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No recent alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentAlerts
                  .filter(a => showAllAlerts || !a.isAcknowledged)
                  .slice(0, 5)
                  .map(alert => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeAlert}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reader Detail Modal */}
      {selectedReader && (
        <ReaderDetailModal
          reader={selectedReader}
          onClose={() => setSelectedReader(null)}
        />
      )}
    </div>
  );
};

export default ReaderDashboard;

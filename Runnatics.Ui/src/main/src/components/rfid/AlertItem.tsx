import React from 'react';
import { ReaderAlertDto } from '../../models/ReaderAlert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getSeverityColor, formatTimeAgo } from '../../utils/rfidUtils';

interface AlertItemProps {
  alert: ReaderAlertDto;
  onAcknowledge: (alertId: number) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge }) => {
  return (
    <div className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{alert.message}</p>
            <p className="text-xs opacity-75 mt-1">
              {alert.readerName} • {formatTimeAgo(alert.createdAt)}
            </p>
            {alert.acknowledgedAt && (
              <p className="text-xs opacity-60 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Acknowledged {formatTimeAgo(alert.acknowledgedAt)}
              </p>
            )}
          </div>
        </div>
        
        {!alert.acknowledgedAt && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="text-xs px-2 py-1 rounded hover:bg-white/50 transition-colors whitespace-nowrap"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
};

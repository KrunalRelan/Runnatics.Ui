import { 
  ReaderStatusDto, 
  ReaderAlertDto, 
  RfidDashboardDto 
} from '../models/Reader';

const API_BASE_URL = '/api';

export const ReaderService = {
  /**
   * Get the RFID reader dashboard overview
   */
  async getDashboard(): Promise<RfidDashboardDto> {
    const response = await fetch(`${API_BASE_URL}/reader/dashboard`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to get dashboard');
    return response.json();
  },

  /**
   * Get all readers
   */
  async getReaders(): Promise<ReaderStatusDto[]> {
    const response = await fetch(`${API_BASE_URL}/reader`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to get readers');
    return response.json();
  },

  /**
   * Get reader alerts
   */
  async getAlerts(unacknowledgedOnly = true): Promise<ReaderAlertDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/reader/alerts?unacknowledgedOnly=${unacknowledgedOnly}`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error('Failed to get alerts');
    return response.json();
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: number, notes?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reader/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes || ''),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to acknowledge alert');
  }
};

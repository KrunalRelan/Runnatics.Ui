import { ReaderStatusDto } from '../models/ReaderStatus';
import { ReaderAlertDto } from '../models/ReaderAlert';
import { RfidDashboardDto } from '../models/RfidDashboard';
import config from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export const ReaderService = {
  /**
   * Get the RFID reader dashboard overview
   */
  async getDashboard(): Promise<RfidDashboardDto> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Reader/dashboard`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to get dashboard');
    return response.json();
  },

  /**
   * Get all readers
   */
  async getReaders(): Promise<ReaderStatusDto[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Reader`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to get readers');
    return response.json();
  },

  /**
   * Get reader alerts
   */
  async getAlerts(unacknowledgedOnly = true): Promise<ReaderAlertDto[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_BASE_URL}/Reader/alerts?unacknowledgedOnly=${unacknowledgedOnly}`,
      { 
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include' 
      }
    );
    if (!response.ok) throw new Error('Failed to get alerts');
    return response.json();
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: number, notes?: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Reader/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(notes || ''),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to acknowledge alert');
  }
};

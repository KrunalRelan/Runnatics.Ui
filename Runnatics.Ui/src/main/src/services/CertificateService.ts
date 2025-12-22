import axios from 'axios';
import { CertificateTemplate, CertificateGenerationRequest, CertificateGenerationResponse } from '../models/Certificate';
import config from '../config/environment';

const API_BASE = `${config.apiBaseUrl}/certificates`;

export class CertificateService {
  /**
   * Get all certificate templates for an event
   */
  static async getTemplatesByEvent(eventId: string): Promise<CertificateTemplate[]> {
    const response = await axios.get(`${API_BASE}/templates/event/${eventId}`);
    return response.data;
  }

  /**
   * Get a specific certificate template
   */
  static async getTemplate(templateId: string): Promise<CertificateTemplate> {
    const response = await axios.get(`${API_BASE}/templates/${templateId}`);
    return response.data;
  }

  /**
   * Create a new certificate template
   */
  static async createTemplate(template: CertificateTemplate): Promise<CertificateTemplate> {
    const formData = new FormData();
    
    // Handle background image upload if present
    if (template.backgroundImageData) {
      const blob = this.dataURLtoBlob(template.backgroundImageData);
      formData.append('backgroundImage', blob, 'background.png');
      delete template.backgroundImageData;
    }
    
    formData.append('template', JSON.stringify(template));
    
    const response = await axios.post(`${API_BASE}/templates`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Update an existing certificate template
   */
  static async updateTemplate(templateId: string, template: CertificateTemplate): Promise<CertificateTemplate> {
    const formData = new FormData();
    
    // Handle background image upload if present
    if (template.backgroundImageData) {
      const blob = this.dataURLtoBlob(template.backgroundImageData);
      formData.append('backgroundImage', blob, 'background.png');
      delete template.backgroundImageData;
    }
    
    formData.append('template', JSON.stringify(template));
    
    const response = await axios.put(`${API_BASE}/templates/${templateId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Delete a certificate template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    await axios.delete(`${API_BASE}/templates/${templateId}`);
  }

  /**
   * Generate certificate for a participant
   */
  static async generateCertificate(request: CertificateGenerationRequest): Promise<CertificateGenerationResponse> {
    const response = await axios.post(`${API_BASE}/generate`, request);
    return response.data;
  }

  /**
   * Generate certificates for all participants in a race
   */
  static async generateBulkCertificates(templateId: string, raceId: string): Promise<void> {
    await axios.post(`${API_BASE}/generate/bulk`, { templateId, raceId });
  }

  /**
   * Preview certificate with sample data
   */
  static async previewCertificate(template: CertificateTemplate): Promise<string> {
    const response = await axios.post(`${API_BASE}/preview`, template, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  }

  /**
   * Helper: Convert data URL to Blob
   */
  private static dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}

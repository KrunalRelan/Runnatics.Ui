import { CertificateTemplate, CertificateGenerationRequest, CertificateGenerationResponse } from '../models/Certificate';
import config from '../config/environment';
import { apiClient } from '../utils/axios.config';

const API_BASE = `${config.apiBaseUrl}/certificates`;

export class CertificateService {
  /**
   * Get all certificate templates for an event
   */
  static async getTemplatesByEvent(eventId: string): Promise<CertificateTemplate[]> {
    const response = await apiClient.get(`${API_BASE}/templates/event/${eventId}`);
    return response.data;
  }

  /**
   * Get certificate template for an event and optionally a race
   */
  static async getTemplateByEventAndRace(eventId: string, raceId?: string): Promise<CertificateTemplate | null> {
    try {
      const url = raceId 
        ? `${API_BASE}/templates/event/${eventId}/race/${raceId}`
        : `${API_BASE}/templates/event/${eventId}`;
      const response = await apiClient.get(url);
      
      // If multiple templates, return the first active one
      if (Array.isArray(response.data)) {
        return response.data.find((t: CertificateTemplate) => t.isActive) || response.data[0] || null;
      }
      return response.data || null;
    } catch (error) {
      // Return null if no template found
      return null;
    }
  }

  /**
   * Get a specific certificate template
   */
  static async getTemplate(templateId: string): Promise<CertificateTemplate> {
    const response = await apiClient.get(`${API_BASE}/templates/${templateId}`);
    return response.data;
  }

  /**
   * Create a new certificate template
   */
  static async createTemplate(template: CertificateTemplate): Promise<CertificateTemplate> {
    // Transform to match C# PascalCase contract
    const payload = {
      EventId: template.eventId,
      RaceId: template.raceId || null,
      Name: template.name,
      Description: template.description || null,
      BackgroundImageData: template.backgroundImageData || null,
      Width: template.width,
      Height: template.height,
      IsActive: template.isActive,
      Fields: template.fields.map(field => ({
        FieldType: field.fieldType,
        Content: field.content,
        XCoordinate: field.xCoordinate,
        YCoordinate: field.yCoordinate,
        Font: field.font,
        FontSize: field.fontSize,
        FontColor: field.fontColor,
        Width: field.width || null,
        Height: field.height || null,
        Alignment: field.alignment || 'left',
        FontWeight: field.fontWeight || 'normal',
        FontStyle: field.fontStyle || 'normal'
      }))
    };
    const response = await apiClient.post(`${API_BASE}/templates`, payload);
    return response.data;
  }

  /**
   * Update an existing certificate template
   */
  static async updateTemplate(templateId: string, template: CertificateTemplate): Promise<CertificateTemplate> {
    // Transform to match C# PascalCase contract
    const payload = {
      EventId: template.eventId,
      RaceId: template.raceId || null,
      Name: template.name,
      Description: template.description || null,
      BackgroundImageData: template.backgroundImageData || null,
      Width: template.width,
      Height: template.height,
      IsActive: template.isActive,
      Fields: template.fields.map(field => ({
        FieldType: field.fieldType,
        Content: field.content,
        XCoordinate: field.xCoordinate,
        YCoordinate: field.yCoordinate,
        Font: field.font,
        FontSize: field.fontSize,
        FontColor: field.fontColor,
        Width: field.width || null,
        Height: field.height || null,
        Alignment: field.alignment || 'left',
        FontWeight: field.fontWeight || 'normal',
        FontStyle: field.fontStyle || 'normal'
      }))
    };
    const response = await apiClient.put(`${API_BASE}/templates/${templateId}`, payload);
    return response.data;
  }

  /**
   * Delete a certificate template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/templates/${templateId}`);
  }

  /**
   * Generate certificate for a participant
   */
  static async generateCertificate(request: CertificateGenerationRequest): Promise<CertificateGenerationResponse> {
    const response = await apiClient.post(`${API_BASE}/generate`, request);
    return response.data;
  }

  /**
   * Generate certificates for all participants in a race
   */
  static async generateBulkCertificates(templateId: string, raceId: string): Promise<void> {
    await apiClient.post(`${API_BASE}/generate/bulk`, { templateId, raceId });
  }

  /**
   * Preview certificate with sample data
   */
  static async previewCertificate(template: CertificateTemplate): Promise<string> {
    const response = await apiClient.post(`${API_BASE}/preview`, template, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  }

}

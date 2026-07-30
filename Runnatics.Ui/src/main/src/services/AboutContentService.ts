// src/main/src/services/AboutContentService.ts
// SuperAdmin editor API for the public About page (story copy + founders tiles).

import { apiClient } from '../utils/axios.config';
import { ResponseBase } from '../models/ResponseBase';

export interface FounderDto {
  id: string; // encrypted
  name: string;
  role?: string | null;
  bio?: string | null;
  photoBase64?: string | null;
  displayOrder: number;
}

export interface AboutContentDto {
  whoWeAre?: string | null;
  mission?: string | null;
  storyImageBase64?: string | null;
  founders: FounderDto[];
}

export interface UpdateAboutContentRequest {
  whoWeAre?: string | null;
  mission?: string | null;
  storyImageBase64?: string | null;
}

export interface SaveFounderRequest {
  name: string;
  role?: string | null;
  bio?: string | null;
  photoBase64?: string | null;
  displayOrder: number;
}

const BASE = 'aboutcontent';

export class AboutContentService {
  static async getContent(): Promise<AboutContentDto> {
    const response = await apiClient.get<ResponseBase<AboutContentDto>>(BASE);
    return response.data.message;
  }

  static async updateContent(request: UpdateAboutContentRequest): Promise<void> {
    await apiClient.put<ResponseBase<unknown>>(BASE, request);
  }

  static async createFounder(request: SaveFounderRequest): Promise<FounderDto> {
    const response = await apiClient.post<ResponseBase<FounderDto>>(`${BASE}/founders`, request);
    return response.data.message;
  }

  static async updateFounder(id: string, request: SaveFounderRequest): Promise<FounderDto> {
    const response = await apiClient.put<ResponseBase<FounderDto>>(`${BASE}/founders/${id}`, request);
    return response.data.message;
  }

  static async deleteFounder(id: string): Promise<void> {
    await apiClient.delete<ResponseBase<unknown>>(`${BASE}/founders/${id}`);
  }
}

export default AboutContentService;

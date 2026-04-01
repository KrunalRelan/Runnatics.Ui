import apiClient from '../utils/axios.config';
import {
  SupportQueryCounts,
  SupportQueryListItem,
  SupportQueryDetail,
  SupportQueryComment,
  AddCommentRequest,
  UpdateQueryRequest,
  ContactUsRequest,
  AdminUser,
  QueryTypeOption,
} from '../models/support/Support';
import { ServiceUrl } from '../models/ServiceUrls';

export interface GetQueriesParams {
  submitterEmail?: string;
  statusId?: number;
  queryTypeId?: number;
  assignedToUserId?: number;
  page?: number;
  pageSize?: number;
}

export interface GetQueriesResponse {
  items: SupportQueryListItem[];
  totalCount: number;
}

export class SupportService {
  static async getCounts(): Promise<SupportQueryCounts> {
    const response = await apiClient.get<SupportQueryCounts>(ServiceUrl.supportCounts());
    return response.data;
  }

  static async getQueries(params: GetQueriesParams): Promise<GetQueriesResponse> {
    const response = await apiClient.get<GetQueriesResponse>(ServiceUrl.supportQueries(), { params });
    return response.data;
  }

  static async getQueryById(id: number): Promise<SupportQueryDetail> {
    const response = await apiClient.get<SupportQueryDetail>(ServiceUrl.supportQueryById(id));
    return response.data;
  }

  static async updateQuery(id: number, data: UpdateQueryRequest): Promise<void> {
    await apiClient.put(ServiceUrl.supportQueryById(id), data);
  }

  static async addComment(id: number, data: AddCommentRequest): Promise<SupportQueryComment> {
    const response = await apiClient.post<SupportQueryComment>(ServiceUrl.supportComments(id), data);
    return response.data;
  }

  static async sendCommentEmail(commentId: number): Promise<void> {
    await apiClient.post(ServiceUrl.supportCommentEmail(commentId));
  }

  static async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(ServiceUrl.supportComment(commentId));
  }

  static async submitContactUs(data: ContactUsRequest): Promise<void> {
    await apiClient.post(ServiceUrl.supportContactUs(), data);
  }

  static async getAdminUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>(ServiceUrl.adminUsers());
    return response.data;
  }

  static async getQueryTypes(): Promise<QueryTypeOption[]> {
    const response = await apiClient.get<QueryTypeOption[]>(ServiceUrl.supportQueryTypes());
    return response.data;
  }
}

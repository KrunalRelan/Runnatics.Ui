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
    const response = await apiClient.get<any>(ServiceUrl.supportCounts());
    const payload = response.data?.message ?? response.data;
    return {
      total: payload?.total ?? 0,
      newQuery: payload?.newQuery ?? 0,
      wip: payload?.wip ?? 0,
      closed: payload?.closed ?? 0,
      pending: payload?.pending ?? 0,
      notYetStarted: payload?.notYetStarted ?? 0,
      rejected: payload?.rejected ?? 0,
      duplicate: payload?.duplicate ?? 0,
    };
  }

  static async getQueries(params: GetQueriesParams): Promise<GetQueriesResponse> {
    const response = await apiClient.get<any>(ServiceUrl.supportQueries(), { params });
    // Handle ResponseBase<T> envelope ({ message: ... }) used throughout this codebase
    const payload = response.data?.message ?? response.data;
    return {
      items: Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []),
      totalCount: payload?.totalCount ?? 0,
    };
  }

  static async getQueryById(id: number): Promise<SupportQueryDetail> {
    const response = await apiClient.get<any>(ServiceUrl.supportQueryById(id));
    return response.data?.message ?? response.data;
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
    try {
      const response = await apiClient.get<any>(ServiceUrl.adminUsers());
      const payload = response.data?.message ?? response.data;
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  }

  static async getQueryTypes(): Promise<QueryTypeOption[]> {
    try {
      const response = await apiClient.get<any>(ServiceUrl.supportQueryTypes());
      const payload = response.data?.message ?? response.data;
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  }
}

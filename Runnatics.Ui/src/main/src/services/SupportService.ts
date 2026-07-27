import apiClient from '../utils/axios.config';
import {
  SupportQueryCounts,
  SupportQueryListItem,
  SupportQueryDetail,
  SupportQueryComment,
  AddCommentRequest,
  UpdateQueryRequest,
  ContactUsRequest,
  SupportLookup,
  SupportAssignee,
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
    // ResponseBase<T> envelope: { message: T, totalCount: n }. TotalCount lives on the
    // ENVELOPE, not inside message — message is the bare array. Reading it off the array
    // (as this used to) always yielded 0, which broke pagination past page 1.
    const envelope = response.data ?? {};
    const payload = envelope.message ?? envelope;
    const items = Array.isArray(payload?.items)
      ? payload.items
      : (Array.isArray(payload) ? payload : []);
    return {
      items,
      totalCount: envelope.totalCount ?? payload?.totalCount ?? items.length,
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

  static async getStatuses(): Promise<SupportLookup[]> {
    const response = await apiClient.get<any>(ServiceUrl.supportStatuses());
    const payload = response.data?.message ?? response.data;
    return Array.isArray(payload) ? payload : [];
  }

  /** Query types are optional — an empty list is a legitimate result, not an error. */
  static async getQueryTypes(): Promise<SupportLookup[]> {
    const response = await apiClient.get<any>(ServiceUrl.supportQueryTypes());
    const payload = response.data?.message ?? response.data;
    return Array.isArray(payload) ? payload : [];
  }

  static async getAssignees(): Promise<SupportAssignee[]> {
    const response = await apiClient.get<any>(ServiceUrl.supportAssignees());
    const payload = response.data?.message ?? response.data;
    return Array.isArray(payload) ? payload : [];
  }
}

export interface SupportQueryListItem {
  id: number;
  subject: string;
  submitterEmail: string;
  commentCount: number;
  lastUpdated: string;
  assignedToName: string | null;
  statusName: string;
}

export interface SupportQueryDetail {
  id: number;
  subject: string;
  body: string;
  submitterEmail: string;
  statusId: number;
  statusName: string;
  assignedToUserId: number | null;
  assignedToName: string | null;
  queryTypeId: number | null;
  queryTypeName: string | null;
  createdAt: string;
  updatedAt: string;
  comments: SupportQueryComment[];
}

export interface SupportQueryComment {
  id: number;
  commentText: string;
  ticketStatusId: number;
  ticketStatusName: string;
  notificationSent: boolean;
  createdAt: string;
  createdByName: string | null;
}

export interface SupportQueryCounts {
  total: number;
  newQuery: number;
  wip: number;
  closed: number;
  pending: number;
  notYetStarted: number;
  rejected: number;
  duplicate: number;
}

export interface ContactUsRequest {
  subject: string;
  body: string;
  submitterEmail: string;
}

export interface AddCommentRequest {
  commentText: string;
  ticketStatusId: number;
  sendNotification: boolean;
}

export interface UpdateQueryRequest {
  statusId: number;
  assignedToUserId: number | null;
  queryTypeId: number | null;
}

export interface StatusOption { id: number; name: string; }
export interface AdminUser { id: number; fullName: string; }
export interface QueryTypeOption { id: number; name: string; }

export const STATUS_OPTIONS: StatusOption[] = [
  { id: 1, name: 'New Query' },
  { id: 2, name: 'WIP' },
  { id: 3, name: 'Closed' },
  { id: 4, name: 'Pending' },
  { id: 5, name: 'Not Yet Started' },
  { id: 6, name: 'Rejected' },
  { id: 7, name: 'Duplicate' },
];

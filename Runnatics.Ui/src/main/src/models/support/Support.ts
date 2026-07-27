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

/**
 * A support lookup row (status or query type), served from the DB.
 * `name` is the RAW stored value ("new_query") — match on it, never display it.
 * `displayName` is the human label ("New Query"), derived server-side so the
 * raw -> display mapping lives in exactly one place.
 */
export interface SupportLookup {
  id: number;
  name: string;
  displayName: string;
}

/** A user who can be assigned a ticket. */
export interface SupportAssignee {
  id: number;
  fullName: string;
  email: string;
}

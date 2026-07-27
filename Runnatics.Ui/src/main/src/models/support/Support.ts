export interface SupportQueryListItem {
  id: number;
  subject: string;
  submitterEmail: string;
  commentCount: number;
  lastUpdated: string;
  assignedToName: string | null;
  /** Bind the row badge to this, not to statusName — labels are DB-defined. */
  statusId: number;
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

/** One status bucket. Cards, tabs and row badges all bind to `statusId`. */
export interface SupportStatusCount {
  statusId: number;
  /** Raw stored value ("new_query", "Open"). Never render this directly. */
  name: string;
  displayName: string;
  colorHex: string;
  count: number;
  /** Ticket rows reference this id but the lookup table has no such row. */
  isUnknown: boolean;
}

/**
 * Counts keyed by status ID. `total` is the SUM of `statuses` — the previous shape
 * had a fixed property per seeded status name and computed total independently, so
 * a DB holding different names showed "Total 14" with every bucket at 0.
 */
export interface SupportQueryCounts {
  total: number;
  statuses: SupportStatusCount[];
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
  /** Resolved server-side so every surface uses the same colour for a status. */
  colorHex: string;
}

/** A user who can be assigned a ticket. */
export interface SupportAssignee {
  id: number;
  fullName: string;
  email: string;
}

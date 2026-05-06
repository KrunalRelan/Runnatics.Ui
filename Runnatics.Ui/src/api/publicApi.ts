/**
 * Public-facing API client for the Runnatics public site.
 * Base URL from VITE_PUBLIC_API_URL env variable.
 * All endpoints are AllowAnonymous — no Authorization header needed.
 * Response envelope: { Message: <data>, Error?: { Message: string } }
 */

const BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const PUBLIC_API_KEY: string = import.meta.env.VITE_PUBLIC_API_KEY ?? '';

// ASP.NET ResponseBase<T> envelope — check both PascalCase and camelCase to be safe
interface ApiEnvelope<T> {
  Message?: T;
  message?: T;
  Error?: { Message?: string; message?: string };
  error?: { Message?: string; message?: string };
}

class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function req<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Public-Key': PUBLIC_API_KEY,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // Attempt JSON parse even on error (error body may contain detail)
  let json: ApiEnvelope<T> = {};
  try {
    json = await res.json();
  } catch {
    // ignore parse failure for non-JSON responses
  }

  if (!res.ok) {
    const msg =
      json?.Error?.Message ??
      json?.Error?.message ??
      json?.error?.Message ??
      json?.error?.message ??
      `API error ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  // Unwrap envelope — handle both PascalCase and camelCase
  const data = json.Message ?? json.message;
  return data as T;
}

const GET = <T>(path: string, signal?: AbortSignal) =>
  req<T>('GET', path, undefined, signal);

const POST = <T>(path: string, body: unknown, signal?: AbortSignal) =>
  req<T>('POST', path, body, signal);

// ── Request types ─────────────────────────────────────────────────

export interface SearchCriteriaBase {
  searchString?: string;
  sortFieldName?: string;
  sortDirection?: 'Ascending' | 'Descending';
  pageNumber?: number;
  pageSize?: number;
}

export interface GetPublicEventResultsRequest extends SearchCriteriaBase {
  race?: string;
  gender?: string;
}

export interface GetPublicLeaderboardRequest {
  search?: string;
  gender?: string;
  category?: string;
  showAll?: boolean;
}

export interface PublicContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  eventName?: string;
}

// ── Response types ────────────────────────────────────────────────

export interface PublicEventCategoryItem {
  id?: string;
  raceId?: string;
  encryptedRaceId?: string;
  name: string;
  distance: string;
  price: string;
  count: number;
}

export interface PublicEventSponsorItem {
  tier: string;
  name: string;
}

export interface PublicEventDetailItem {
  id?: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  venue: string;
  description: string;
  categories: PublicEventCategoryItem[];
  participants: number;
  sponsors: PublicEventSponsorItem[];
  registrationUrl?: string;
  registrationOpen: boolean;
  bannerBase64?: string | null;
}

export interface PublicResultSplit {
  checkpointName: string;
  time: string;
  rank: number;
}

export interface PublicResultItem {
  participantId?: string;
  overallRank?: number;
  bibNumber: string;
  participantName: string;
  raceName: string;
  gender?: string;
  ageGroup?: string;
  gunTime?: string;
  netTime?: string;
  categoryRank?: number;
  genderRank?: number;
  splits?: PublicResultSplit[];
}

export interface PublicResultsPage {
  results: PublicResultItem[];
  races: string[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isPublished: boolean;
  statusMessage?: string;
}

export interface PublicLeaderboardEntry {
  rank: number;
  participantId: string;
  bib: string;
  fullName: string;
  gender: string;
  category?: string;
  gunTime?: string;
  netTime?: string;
  overallRank?: number;
  genderRank?: number;
  categoryRank?: number;
  averagePaceFormatted?: string;
  status: string;
}

export interface PublicLeaderboardDisplaySettings {
  showSplitTimes: boolean;
  showPace: boolean;
  showMedalIcon: boolean;
  rankOnNet: boolean;
  sortTimeField: string;
  maxResultsOverall?: number;
  maxResultsCategory?: number;
}

export interface PublicLeaderboardResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  eventName?: string;
  raceName?: string;
  raceDistance?: number;
  results: PublicLeaderboardEntry[];
  displaySettings: PublicLeaderboardDisplaySettings;
}

export interface PublicParticipantSplit {
  checkpointName?: string;
  distance?: string;
  distanceKm?: number;
  splitTime?: string;
  cumulativeTime?: string;
  pace?: string;
  speed?: number;
  overallRank?: number;
  genderRank?: number;
  categoryRank?: number;
}

export interface PublicParticipantDetailResponse {
  id?: string;
  bibNumber?: string;
  fullName: string;
  gender?: string;
  ageCategory?: string;
  status?: string;
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  raceId?: string;
  raceName?: string;
  raceDistance?: number;
  chipTime?: string;
  gunTime?: string;
  performance?: {
    averagePace?: string;
    averageSpeed?: number;
  };
  rankings?: {
    overallRank?: number;
    totalParticipants?: number;
    overallPercentage?: number;
    genderRank?: number;
    totalInGender?: number;
    genderPercentage?: number;
    categoryRank?: number;
    totalInCategory?: number;
    categoryPercentage?: number;
  };
  splitTimes?: PublicParticipantSplit[];
}

export interface PublicStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

// ── API object ────────────────────────────────────────────────────

export const publicApi = {
  /** Get full event details by encrypted event ID. */
  getEventBySlug: (slug: string, signal?: AbortSignal): Promise<PublicEventDetailItem> =>
    GET<PublicEventDetailItem>(`/api/public/events/${encodeURIComponent(slug)}`, signal),

  /** Search event results (paginated). POST body supports searchString, race, gender. */
  getEventResults: (
    slug: string,
    request: GetPublicEventResultsRequest = {},
    signal?: AbortSignal,
  ): Promise<PublicResultsPage> =>
    POST<PublicResultsPage>(`/api/public/events/${encodeURIComponent(slug)}/results`, request, signal),

  /** Look up a single result by bib number. */
  getResultByBib: (slug: string, bib: string, signal?: AbortSignal): Promise<PublicResultItem> =>
    GET<PublicResultItem>(`/api/public/events/${encodeURIComponent(slug)}/results/${encodeURIComponent(bib)}`, signal),

  /** Get leaderboard grouped by gender + category. Pass showAll: true to skip top-N limits. */
  getGroupedLeaderboard: (
    eventId: string,
    raceId: string,
    request: GetPublicLeaderboardRequest = {},
    signal?: AbortSignal,
  ): Promise<PublicLeaderboardResponse> =>
    POST<PublicLeaderboardResponse>(
      `/api/public/${encodeURIComponent(eventId)}/${encodeURIComponent(raceId)}/leaderboard`,
      request,
      signal,
    ),

  /** Get full participant details including timing, ranks, and splits. */
  getParticipantDetail: (
    participantId: string,
    signal?: AbortSignal,
  ): Promise<PublicParticipantDetailResponse> =>
    GET<PublicParticipantDetailResponse>(`/api/public/participant/${encodeURIComponent(participantId)}`, signal),

  /** Submit a contact/enquiry form. */
  submitContact: (request: PublicContactRequest, signal?: AbortSignal): Promise<void> =>
    POST<void>('/api/public/contact', request, signal),

  /** Get platform-level stats (total events, upcoming, past). */
  getStats: (signal?: AbortSignal): Promise<PublicStats> =>
    GET<PublicStats>('/api/public/stats', signal),
};

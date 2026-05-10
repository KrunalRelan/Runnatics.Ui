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

  // Unwrap envelope — handle both PascalCase and camelCase.
  // If neither key is present the backend returned the data directly (no wrapper).
  const data = json.Message ?? json.message ?? (json as unknown as T);
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
  hasResults?: boolean;
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
  leaderboardSettings: PublicLeaderboardDisplaySettings;
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

export interface GroupedLeaderboardParticipant {
  rank: number;
  name: string;
  bib: string;
  chipTime?: string;
  gunTime?: string;
  participantDetailUrl: string;
}

export interface GroupedLeaderboardCategory {
  categoryName: string;
  rankBy: string;
  participants: GroupedLeaderboardParticipant[];
}

export interface GroupedLeaderboardGender {
  gender: string;
  categories: GroupedLeaderboardCategory[];
}

export interface GroupedLeaderboardResponse {
  eventName?: string;
  raceName?: string;
  raceDate?: string;
  raceDistance?: number;
  rankBy?: string;
  genderCategories: GroupedLeaderboardGender[];
  totalFinishers?: number;
  totalParticipants?: number;
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

/** Maps to the actual /api/public/participant/:id response shape */
export interface ParticipantInfo {
  name: string;
  bib: string;
  gender: string;
  category: string;
  distance: string;
}

export interface ParticipantTimeDetail {
  time: string;
  averagePace?: string;
  overallRank?: number;
  totalOverall?: number;
  genderRank?: number;
  totalGender?: number;
  categoryRank?: number;
  totalCategory?: number;
}

export interface ParticipantSplit {
  checkpoint: string;
  splitTime: string;
  raceTime: string;
  splitDist: number;
  speed?: number;
}

export interface ParticipantDetailResponse {
  eventName?: string;
  raceDate?: string;
  participant: ParticipantInfo;
  chipTime?: ParticipantTimeDetail;
  gunTime?: ParticipantTimeDetail;
  splits?: ParticipantSplit[];
}

export interface PublicStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

/** Maps to Runnatics.Models.Client.Public.PublicRaceCategoryDto */
export interface PublicRaceCategory {
  encryptedRaceId: string;
  name: string;
  distance: string | null;
  price: number | null;
  participantLimit: number | null;
  registeredCount: number | null;
  hasResults: boolean;
}

/** Maps to Runnatics.Models.Client.Public.PublicEventDetailDto (extends PublicEventSummaryDto) */
export interface PublicEventDetail {
  encryptedId: string;
  name: string;
  city: string | null;
  state?: string | null;
  eventDate: string;
  heroImageUrl?: string | null;
  bannerBase64: string | null;
  description?: string | null;
  raceCategories: string[];
  participantCount: number | null;
  registrationOpen: boolean;
  registrationUrl?: string | null;
  venue: string | null;
  hasPublishedResults: boolean;
  // PublicEventDetailDto extensions
  fullDescription?: string | null;
  schedule?: string | null;
  routeMapUrl?: string | null;
  races?: PublicRaceCategory[];
  registrationDeadline?: string | null;
  contactEmail?: string | null;
  showResultSummary?: boolean;
  showBanner?: boolean;
}

// ── API object ────────────────────────────────────────────────────

export const publicApi = {
  /** Get full event details by encrypted event ID. */
  getEventBySlug: (slug: string, signal?: AbortSignal): Promise<PublicEventDetailItem> =>
    GET<PublicEventDetailItem>(`/api/public/events/${encodeURIComponent(slug)}`, signal),

  /** Get full event detail (including per-race results info) for the /e/:eventId page. */
  getEventDetail: (eventId: string, signal?: AbortSignal): Promise<PublicEventDetail> =>
    GET<PublicEventDetail>(`/api/public/events/${encodeURIComponent(eventId)}`, signal),

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
  ): Promise<GroupedLeaderboardResponse> =>
    POST<GroupedLeaderboardResponse>(
      `/api/public/${encodeURIComponent(eventId)}/${encodeURIComponent(raceId)}/leaderboard`,
      request,
      signal,
    ),

  /** Get full participant details including timing, ranks, and splits. */
  getParticipantDetail: (
    participantId: string,
    signal?: AbortSignal,
  ): Promise<ParticipantDetailResponse> =>
    GET<ParticipantDetailResponse>(`/api/public/participant/${encodeURIComponent(participantId)}`, signal),

  /** Submit a contact/enquiry form. */
  submitContact: (request: PublicContactRequest, signal?: AbortSignal): Promise<void> =>
    POST<void>('/api/public/contact', request, signal),

  /** Get platform-level stats (total events, upcoming, past). */
  getStats: (signal?: AbortSignal): Promise<PublicStats> =>
    GET<PublicStats>('/api/public/stats', signal),
};

/**
 * Public-facing API client for Runnatics public site.
 * Completely separate from the admin API services.
 */

// VITE_API_BASE_URL ends with /api (e.g. https://…azurewebsites.net/api).
// Strip the trailing /api so we can build /api/public/… paths ourselves.
const BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL ?? '').replace(/\/api$/, '');

// API envelope: { message: <payload>, totalCount?: number }
// "message" holds the actual data (not "data", no "success" flag).
interface ApiEnvelope<T> {
  message: T;
  totalCount?: number;
}

// Paged list shape returned inside message for list endpoints
interface ApiPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

async function fetchPublicApi<T>(
  path: string,
  signal?: AbortSignal,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/public${path}`, {
    signal,
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });

  if (!res.ok) {
    throw new Error(`Public API error: ${res.status} ${res.statusText}`);
  }

  const json: ApiEnvelope<T> = await res.json();
  return json.message;
}

// ── Events ────────────────────────────────────────────────────────

// ── Raw shapes from API ───────────────────────────────────────────

interface ApiEvent {
  slug?: string;
  name: string;
  city?: string;
  state?: string;
  eventDate: string;       // ISO string e.g. "2026-04-22T14:19:00"
  description?: string;
  raceCategories?: string[];
  registrationOpen: boolean;
  venue?: string;
  bannerBase64?: string | null;
  hasPublishedResults?: boolean;
}

// ── Normalised shapes used by components ──────────────────────────

export interface PublicEvent {
  slug: string;
  name: string;
  date: string;            // human-readable e.g. "22 Apr 2026"
  city: string;
  categories: string[];
  registrationOpen: boolean;
  isPast: boolean;
  bannerBase64?: string | null;
  /** True when at least one published race has ShowResultTable enabled. */
  hasPublishedResults: boolean;
}

export interface PublicEventCategory {
  name: string;
  distance: string;
  price: string;
  count: number;
}

export interface PublicEventSponsor {
  tier: string;
  name: string;
}

export interface PublicEventDetail {
  slug: string;
  name: string;
  date: string;
  city: string;
  venue: string;
  description: string;
  categories: PublicEventCategory[];
  participants: number;
  sponsors: PublicEventSponsor[];
  registrationUrl?: string;
  registrationOpen: boolean;
  bannerBase64?: string | null;
}

function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function normaliseEvent(e: ApiEvent): PublicEvent {
  return {
    slug: e.slug ?? '',
    name: e.name,
    date: formatEventDate(e.eventDate),
    city: e.city ?? e.state ?? '',
    categories: e.raceCategories ?? [],
    registrationOpen: e.registrationOpen,
    isPast: new Date(e.eventDate) < new Date(),
    bannerBase64: e.bannerBase64 ?? null,
    hasPublishedResults: e.hasPublishedResults ?? false,
  };
}

export interface GetEventsParams {
  status?: 'upcoming' | 'past' | 'recent';
  take?: number;
  page?: number;
  pageSize?: number;
  city?: string;
  q?: string;
}

export async function getEvents(params: GetEventsParams = {}, signal?: AbortSignal): Promise<PublicEvent[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.take) qs.set('take', String(params.take));
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params.city) qs.set('city', params.city);
  if (params.q) qs.set('q', params.q);
  const page = await fetchPublicApi<ApiPage<ApiEvent>>(`/events?${qs.toString()}`, signal);
  return page.items.map(normaliseEvent);
}

export async function getUpcomingEvents(signal?: AbortSignal): Promise<PublicEvent[]> {
  return getEvents({ status: 'upcoming', take: 5 }, signal);
}

export async function getPastEvents(signal?: AbortSignal): Promise<PublicEvent[]> {
  return getEvents({ status: 'past', take: 10 }, signal);
}

export function getEventDetail(slug: string, signal?: AbortSignal): Promise<PublicEventDetail> {
  return fetchPublicApi<PublicEventDetail>(`/events/${slug}`, signal);
}

// ── Results ───────────────────────────────────────────────────────

export interface ResultSplit {
  checkpointName: string;
  time: string;      // TimeSpan serialised as "HH:mm:ss"
  rank: number;
}

/** Matches PublicResultDto (camelCase serialised by ASP.NET Core). */
export interface ResultRow {
  overallRank?: number;
  bibNumber: string;
  participantName: string;
  raceName: string;
  gender?: string;
  ageGroup?: string;
  gunTime?: string;   // "HH:mm:ss" or null
  netTime?: string;   // "HH:mm:ss" or null
  categoryRank?: number;
  genderRank?: number;
  splits?: ResultSplit[];
}

export interface PublicLeaderboardSettings {
  showOverallResults: boolean;
  showCategoryResults: boolean;
  showGenderResults: boolean;
  showAgeGroupResults: boolean;
  sortByOverallChipTime: boolean;
  sortByOverallGunTime: boolean;
  sortByCategoryChipTime: boolean;
  sortByCategoryGunTime: boolean;
  enableLiveLeaderboard: boolean;
  showSplitTimes: boolean;
  showPace: boolean;
  showTeamResults: boolean;
  showMedalIcon: boolean;
  autoRefreshIntervalSec: number;
  maxDisplayedRecords: number;
  numberOfResultsToShowOverall: number;
  numberOfResultsToShowCategory: number;
}

const DEFAULT_LEADERBOARD_SETTINGS: PublicLeaderboardSettings = {
  showOverallResults: true,
  showCategoryResults: true,
  showGenderResults: false,
  showAgeGroupResults: false,
  sortByOverallChipTime: true,
  sortByOverallGunTime: false,
  sortByCategoryChipTime: true,
  sortByCategoryGunTime: false,
  enableLiveLeaderboard: false,
  showSplitTimes: false,
  showPace: false,
  showTeamResults: false,
  showMedalIcon: true,
  autoRefreshIntervalSec: 30,
  maxDisplayedRecords: 0,
  numberOfResultsToShowOverall: 0,
  numberOfResultsToShowCategory: 0,
};

/** Matches PublicResultsResponseDto (camelCase). */
export interface ResultsResponse {
  results: ResultRow[];
  races: string[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  leaderboardSettings: PublicLeaderboardSettings;
  isPublished: boolean;
  statusMessage?: string;
}

export interface ResultsParams {
  race?: string;
  gender?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function getEventResults(
  slug: string,
  params?: ResultsParams,
  signal?: AbortSignal,
): Promise<ResultsResponse> {
  const qs = new URLSearchParams();
  if (params?.race && params.race !== 'All') qs.set('race', params.race);
  if (params?.gender && params.gender !== 'All') qs.set('gender', params.gender);
  if (params?.search?.trim()) qs.set('search', params.search.trim());
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const query = qs.toString();
  return fetchPublicApi<ResultsResponse>(
    `/events/${slug}/results${query ? `?${query}` : ''}`,
    signal,
  );
}

export { DEFAULT_LEADERBOARD_SETTINGS };

// ── Gallery ───────────────────────────────────────────────────────

export interface GalleryImage {
  id: string | number;
  url: string;
  thumbnailUrl?: string;
  event: string;
  eventSlug?: string;
  caption?: string;
}

export interface GalleryResponse {
  images: GalleryImage[];
  events: string[];
}

export function getGallery(eventSlug?: string, signal?: AbortSignal): Promise<GalleryResponse> {
  const qs = eventSlug && eventSlug !== 'All' ? `?event=${encodeURIComponent(eventSlug)}` : '';
  return fetchPublicApi<GalleryResponse>(`/gallery${qs}`, signal);
}

// ── Platform stats ─────────────────────────────────────────────────

export interface PublicStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

export function getPublicStats(signal?: AbortSignal): Promise<PublicStats> {
  return fetchPublicApi<PublicStats>('/stats', signal);
}

// ── Contact ───────────────────────────────────────────────────────

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  event?: string;
  message: string;
}

export async function submitContactForm(
  payload: ContactFormPayload,
  signal?: AbortSignal,
): Promise<void> {
  await fetchPublicApi<void>('/contact', signal, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

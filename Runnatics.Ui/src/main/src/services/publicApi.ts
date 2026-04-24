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
  bannerUrl?: string | null;
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
  bannerUrl?: string | null;
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
  bannerUrl?: string | null;
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
    bannerUrl: e.bannerUrl ? `${BASE_URL}${e.bannerUrl}` : null,
  };
}

export async function getUpcomingEvents(signal?: AbortSignal): Promise<PublicEvent[]> {
  const page = await fetchPublicApi<ApiPage<ApiEvent>>('/events?status=upcoming', signal);
  return page.items.map(normaliseEvent);
}

export async function getPastEvents(signal?: AbortSignal): Promise<PublicEvent[]> {
  const page = await fetchPublicApi<ApiPage<ApiEvent>>('/events?status=past', signal);
  return page.items.map(normaliseEvent);
}

export function getEventDetail(slug: string, signal?: AbortSignal): Promise<PublicEventDetail> {
  return fetchPublicApi<PublicEventDetail>(`/events/${slug}`, signal);
}

// ── Results ───────────────────────────────────────────────────────

export interface ResultSplit {
  checkpoint: string;
  time: string;
  rank: number;
}

export interface ResultRow {
  rank: number;
  bib: string;
  name: string;
  race: string;
  gender: string;
  gunTime: string;
  netTime: string;
  catRank: number;
  genderRank: number;
  splits: ResultSplit[];
}

export interface ResultsResponse {
  results: ResultRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  races: string[];
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

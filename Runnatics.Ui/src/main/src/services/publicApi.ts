/**
 * Public-facing API client for Runnatics public site.
 * Completely separate from the admin API services.
 */

// VITE_API_BASE_URL ends with /api (e.g. https://…azurewebsites.net/api).
// Strip the trailing /api so we can build /api/public/… paths ourselves.
const BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL ?? '').replace(/\/api$/, '');

interface ResponseBase<T> {
  data: T;
  success: boolean;
  message?: string;
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

  const json: ResponseBase<T> = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Unknown API error');
  return json.data;
}

// ── Events ────────────────────────────────────────────────────────

export interface PublicEvent {
  slug: string;
  name: string;
  date: string;
  city: string;
  categories: string[];
  registrationOpen: boolean;
  isPast: boolean;
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
}

export function getUpcomingEvents(signal?: AbortSignal): Promise<PublicEvent[]> {
  return fetchPublicApi<PublicEvent[]>('/events?status=upcoming', signal);
}

export function getPastEvents(signal?: AbortSignal): Promise<PublicEvent[]> {
  return fetchPublicApi<PublicEvent[]>('/events?status=past', signal);
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
  totalParticipants: number;
  totalCities: number;
  timingAccuracy: string;
  foundedYear: number;
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

/**
 * Public-facing API client for Runnatics public site.
 * Completely separate from the admin API services.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

interface ResponseBase<T> {
  data: T;
  success: boolean;
  message?: string;
}

async function fetchPublicApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1/public${path}`, {
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

export async function getUpcomingEvents(): Promise<PublicEvent[]> {
  return fetchPublicApi<PublicEvent[]>('/events?status=upcoming');
}

export async function getPastEvents(): Promise<PublicEvent[]> {
  return fetchPublicApi<PublicEvent[]>('/events?status=past');
}

export async function getEventDetail(slug: string): Promise<PublicEventDetail> {
  return fetchPublicApi<PublicEventDetail>(`/events/${slug}`);
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

export async function getEventResults(
  slug: string,
  params?: ResultsParams,
): Promise<ResultsResponse> {
  const qs = new URLSearchParams();
  if (params?.race && params.race !== 'All') qs.set('race', params.race);
  if (params?.gender && params.gender !== 'All') qs.set('gender', params.gender);
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const query = qs.toString();
  return fetchPublicApi<ResultsResponse>(`/events/${slug}/results${query ? `?${query}` : ''}`);
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

export async function getGallery(eventSlug?: string): Promise<GalleryResponse> {
  const qs = eventSlug && eventSlug !== 'All' ? `?event=${encodeURIComponent(eventSlug)}` : '';
  return fetchPublicApi<GalleryResponse>(`/gallery${qs}`);
}

// ── Platform stats ─────────────────────────────────────────────────

export interface PublicStats {
  totalEvents: number;
  totalParticipants: number;
  totalCities: number;
  timingAccuracy: string;
  foundedYear: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  return fetchPublicApi<PublicStats>('/stats');
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

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  await fetchPublicApi<void>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

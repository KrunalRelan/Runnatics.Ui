import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Section, Container, Heading, Button } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';
import { GalleryComingSoon, ErrorState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { getGallery, type GalleryImage } from '../../services/publicApi';

function GalleryPage() {
  const [filterEvent, setFilterEvent] = useState('All');
  const [lightboxId, setLightboxId] = useState<string | number | null>(null);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) => getGallery(undefined, signal),
    [],
  );

  const allImages: GalleryImage[] = data?.images ?? [];
  const eventOptions: string[] = ['All', ...(data?.events ?? [])];

  const filtered = filterEvent === 'All' ? allImages : allImages.filter((p) => p.event === filterEvent);
  const currentIdx = lightboxId !== null ? filtered.findIndex((p) => p.id === lightboxId) : -1;
  const current = currentIdx >= 0 ? filtered[currentIdx] : null;

  const closeLightbox = () => setLightboxId(null);
  const prev = () => { if (currentIdx > 0) setLightboxId(filtered[currentIdx - 1].id); };
  const next = () => { if (currentIdx < filtered.length - 1) setLightboxId(filtered[currentIdx + 1].id); };

  return (
    <>
      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
        <Container>
          <Heading level={1} style={{ color: '#fff' }}>Race Moments &amp; Event Highlights</Heading>
        </Container>
      </Section>

      {/* Filters — only shown when images exist */}
      {!loading && !error && allImages.length > 0 && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', padding: '1rem 0' }}>
          <Container>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {eventOptions.map((name) => (
                <button
                  key={name}
                  onClick={() => setFilterEvent(name)}
                  aria-pressed={filterEvent === name}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: filterEvent === name ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: filterEvent === name ? 'var(--color-accent)' : 'transparent',
                    color: filterEvent === name ? '#fff' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: filterEvent === name ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Grid */}
      <Section tone="light">
        <Container>
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: '10px', background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ))}
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          )}

          {!loading && error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && allImages.length === 0 && <GalleryComingSoon />}

          {!loading && !error && allImages.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              No photos for this event yet.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {filtered.map((photo) => (
                  <div
                    key={photo.id}
                    role="button"
                    aria-label={`View photo from ${photo.event}`}
                    tabIndex={0}
                    onClick={() => setLightboxId(photo.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setLightboxId(photo.id)}
                    style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#D1D5DB' }}
                  >
                    {photo.thumbnailUrl || photo.url ? (
                      <img
                        src={photo.thumbnailUrl ?? photo.url}
                        alt={photo.caption ?? photo.event}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={28} color="#9CA3AF" />
                      </div>
                    )}
                    <div
                      style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,18,32,0)', display: 'flex', alignItems: 'flex-end', padding: '0.75rem', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(10,18,32,0.65)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(10,18,32,0)'; }}
                    >
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: '#fff' }}>{photo.caption ?? photo.event}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <Button variant="outline" href="/contact">Submit Your Photos</Button>
              </div>
            </>
          )}
        </Container>
      </Section>

      {/* Lightbox */}
      {lightboxId !== null && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeLightbox}
          onKeyDown={(e) => { if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }}
          tabIndex={-1}
        >
          <button aria-label="Close" onClick={closeLightbox} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
            <X size={28} />
          </button>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} disabled={currentIdx === 0} style={{ position: 'absolute', left: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: currentIdx === 0 ? 'rgba(255,255,255,0.3)' : '#fff' }}>
            <ChevronLeft size={36} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(800px, 90vw)', maxHeight: '85vh', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151' }}>
            {current.url ? (
              <img src={current.url} alt={current.caption ?? current.event} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
            ) : (
              <Camera size={60} color="#6B7280" />
            )}
          </div>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} disabled={currentIdx === filtered.length - 1} style={{ position: 'absolute', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: currentIdx === filtered.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff' }}>
            <ChevronRight size={36} />
          </button>
        </div>
      )}

      <CTABanner title="Organise Your Race Event" subtitle="Let Racetik handle timing, results, and memories." />
    </>
  );
}

export default GalleryPage;

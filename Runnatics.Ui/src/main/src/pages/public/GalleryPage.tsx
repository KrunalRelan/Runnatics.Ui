import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Section, Container, Heading, Button } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';

const eventNames = ['All', 'Delhi Marathon 2025', 'Mumbai Night Run', 'Bengaluru 10K'];

const photos = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  event: eventNames[(i % 3) + 1],
  label: `Race Moment #${i + 1}`,
}));

function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'All' ? photos : photos.filter((p) => p.event === filter);
  const current = lightbox !== null ? filtered.findIndex((p) => p.id === lightbox) : -1;

  const closeLightbox = () => setLightbox(null);
  const prev = () => { if (current > 0) setLightbox(filtered[current - 1].id); };
  const next = () => { if (current < filtered.length - 1) setLightbox(filtered[current + 1].id); };

  return (
    <>
      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
        <Container>
          <Heading level={1} style={{ color: '#fff' }}>Race Moments &amp; Event Highlights</Heading>
        </Container>
      </Section>

      {/* Filters */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', padding: '1rem 0' }}>
        <Container>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {eventNames.map((name) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                aria-pressed={filter === name}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: filter === name ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: filter === name ? 'var(--color-accent)' : 'transparent',
                  color: filter === name ? '#fff' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: filter === name ? 600 : 400,
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

      {/* Grid */}
      <Section tone="light">
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {filtered.map((photo) => (
              <div
                key={photo.id}
                role="button"
                aria-label={`View ${photo.label}`}
                tabIndex={0}
                onClick={() => setLightbox(photo.id)}
                onKeyDown={(e) => e.key === 'Enter' && setLightbox(photo.id)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  backgroundColor: '#D1D5DB',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={28} color="#9CA3AF" />
                </div>
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,18,32,0)', display: 'flex', alignItems: 'flex-end', padding: '0.75rem', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(10,18,32,0.65)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(10,18,32,0)'; }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: '#fff' }}>{photo.event}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Button variant="outline" href="/contact">Submit Your Photos</Button>
          </div>
        </Container>
      </Section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeLightbox}
          onKeyDown={(e) => { if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }}
          tabIndex={-1}
        >
          <button aria-label="Close" onClick={closeLightbox} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={28} /></button>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} disabled={current === 0} style={{ position: 'absolute', left: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: current === 0 ? 'rgba(255,255,255,0.3)' : '#fff' }}><ChevronLeft size={36} /></button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(600px, 90vw)', aspectRatio: '4/3', backgroundColor: '#374151', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Camera size={60} color="#6B7280" />
          </div>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} disabled={current === filtered.length - 1} style={{ position: 'absolute', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: current === filtered.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff' }}><ChevronRight size={36} /></button>
        </div>
      )}

      <CTABanner title="Organise Your Race Event" subtitle="Let Runnatics handle timing, results, and memories." />
    </>
  );
}

export default GalleryPage;

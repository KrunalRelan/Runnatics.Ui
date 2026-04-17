import { ImageOff } from 'lucide-react';
import { Section, Container, Heading } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';

function OurStory() {
  const ref = useScrollReveal();
  return (
    <Section tone="light">
      <Container>
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          <div>
            <Heading level={2}>Our Story</Heading>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.75, marginTop: '1.25rem' }}>
              Runnatics was born in 2013 when a group of avid runners grew frustrated with
              inaccurate finisher times at community races in Delhi. Combining a passion for
              running with a background in embedded systems, the founding team built India's
              first affordable RFID-based race timing solution from scratch.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.75, marginTop: '1rem' }}>
              Over the next decade, Runnatics expanded from local park runs to national
              marathons. Today we power over 1,000 events annually — from intimate 500-person
              charity 5Ks to 50,000-participant city marathons — across 50+ cities in India
              and neighbouring countries.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.75, marginTop: '1rem' }}>
              Our mission remains unchanged: give every runner an accurate time, a beautiful
              digital certificate, and the moment of pride they deserve at the finish line.
            </p>
          </div>

          <div
            style={{
              aspectRatio: '4/3',
              backgroundColor: '#E5E7EB',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageOff size={40} color="#9CA3AF" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default OurStory;

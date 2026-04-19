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
            <Heading level={2}>Who We Are</Heading>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.75, marginTop: '1.25rem' }}>
              Racetik Timing Solution is committed to delivering precise, reliable, and
              end-to-end event timing and management services. With a focus on innovation,
              scalability, and client collaboration, we ensure seamless execution and a
              superior experience for every event—making us a trusted partner for
              organizers seeking accuracy, efficiency, and excellence.
            </p>

            <div style={{ marginTop: '2.5rem' }}>
              <Heading level={3}>Our Mission</Heading>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.75, marginTop: '1rem' }}>
                Our mission is to provide every organizer and athlete with an{' '}
                <strong style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                  uncompromising record
                </strong>{' '}
                of performance. By combining deep industry expertise with collaborative
                partnerships, we empower event organizers to deliver seamless, world-class
                experiences. We believe in{' '}
                <strong style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                  shared success
                </strong>
                : as the events we support reach new heights, we grow alongside them.
              </p>
            </div>
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

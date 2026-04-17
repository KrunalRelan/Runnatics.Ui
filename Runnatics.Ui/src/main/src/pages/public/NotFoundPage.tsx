import { Link } from 'react-router-dom';
import { Button } from '../../components/public/ui';

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          color: 'var(--color-accent)',
          lineHeight: 1,
          marginBottom: '0.5rem',
        }}
      >
        404
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          color: 'var(--color-text)',
          margin: '0 0 1rem',
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          maxWidth: '400px',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}
      >
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on course.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="primary" size="lg" href="/">
          Go Home
        </Button>
        <Link
          to="/events"
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--color-accent)',
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
            paddingTop: '0.875rem',
          }}
        >
          Browse Events
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

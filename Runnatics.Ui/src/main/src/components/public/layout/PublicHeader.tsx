import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import RacetikLogo from '../../RacetikLogo';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact Us', to: '/contact' },
];

function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        @keyframes header-logo-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .header-logo {
          animation: header-logo-in 0.5s ease-out both;
          transition: transform 0.2s ease;
          height: 40px !important;
          width: auto !important;
        }
        .header-logo-link:hover .header-logo { transform: scale(1.03); }
        .pub-nav-desktop { display: none; }
        .pub-nav-hamburger { display: flex; }
        @media (min-width: 768px) {
          .pub-nav-desktop { display: flex; }
          .pub-nav-hamburger { display: none; }
          .header-logo { height: 40px !important; }
        }
        @media (max-width: 767px) {
          .header-logo { height: 32px !important; }
        }
      `}</style>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(8px)',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} className="header-logo-link">
            <RacetikLogo variant="png" width={160} className="header-logo" />
          </Link>

          {/* Desktop nav — visibility controlled by CSS class only (no inline display override) */}
          <nav className="pub-nav-desktop" style={{ alignItems: 'center', gap: '0.25rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color: isActive(link.to) ? 'var(--color-accent)' : 'var(--color-text)',
                  textDecoration: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  transition: 'color 0.15s',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Results — blue filled */}
            <Link
              to="/results"
              style={{
                marginLeft: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: '#fff',
                backgroundColor: '#1a56db',
                textDecoration: 'none',
                padding: '0.4375rem 1rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1e40af'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1a56db'; }}
            >
              Results
            </Link>

            {/* Log In — outline */}
            <Link
              to="/login"
              style={{
                marginLeft: '0.375rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                textDecoration: 'none',
                padding: '0.4375rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--color-primary)'; el.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'var(--color-border)'; el.style.color = 'var(--color-text)'; }}
            >
              Log In
            </Link>

            {/* Get Started — orange */}
            <Link
              to="/contact"
              style={{
                marginLeft: '0.375rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: '#fff',
                backgroundColor: 'var(--color-accent)',
                textDecoration: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-accent-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-accent)'; }}
            >
              Get Started
            </Link>
          </nav>

          {/* Hamburger — visibility controlled by CSS class */}
          <button
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((o) => !o)}
            className="pub-nav-hamburger"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              padding: '0.5rem',
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            style={{
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              borderTop: '1px solid var(--color-border)',
              padding: '1rem 1.5rem 1.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color: isActive(link.to) ? 'var(--color-accent)' : 'var(--color-text)',
                  textDecoration: 'none',
                  padding: '0.625rem 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Results */}
            <Link
              to="/results"
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1a56db',
                textDecoration: 'none',
                padding: '0.625rem 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              Results
            </Link>

            {/* Log In */}
            <Link
              to="/login"
              style={{
                display: 'block',
                marginTop: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--color-text)',
                border: '1.5px solid var(--color-border)',
                textDecoration: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              Log In
            </Link>

            {/* Get Started */}
            <Link
              to="/contact"
              style={{
                display: 'block',
                marginTop: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '1rem',
                color: '#fff',
                backgroundColor: 'var(--color-accent)',
                textDecoration: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Spacer so content isn't hidden under fixed header */}
      <div style={{ height: '64px' }} />
    </>
  );
}

export default PublicHeader;

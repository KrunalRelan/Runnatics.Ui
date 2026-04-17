import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Events', to: '/events' },
  { label: 'Results', to: '/results' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
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

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
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
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.5px',
            }}
          >
            Runnatics
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
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
            <Link
              to="/contact"
              style={{
                marginLeft: '0.75rem',
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
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-accent-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-accent)';
              }}
            >
              Get Started
            </Link>
          </nav>

          {/* Hamburger */}
          <button
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              padding: '0.5rem',
            }}
            className="md:hidden"
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
            <Link
              to="/contact"
              style={{
                display: 'block',
                marginTop: '1rem',
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

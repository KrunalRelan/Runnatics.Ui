import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import RacetikLogo from '../../RacetikLogo';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Results', to: '/results' },
  { label: 'Contact', to: '/contact' },
];

const services = [
  'Race Timing',
  'Event Registration',
  'Digital Certificates',
  'Photography & Video',
];

function PublicFooter() {
  return (
    <footer style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)' }}>
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '4rem 1.5rem 2rem',
        }}
      >
        {/* 4-col grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1 — Brand */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <RacetikLogo variant="png-white" width={144} />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Racetik — Cure Milestones
              <br />
              Race Timing & Event Management
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '1rem',
              }}
            >
              Quick Links
            </h4>
            {quickLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  marginBottom: '0.5rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)'; }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Col 3 — Services */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '1rem',
              }}
            >
              Services
            </h4>
            {services.map((s) => (
              <p
                key={s}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'rgba(255,255,255,0.75)',
                  margin: '0 0 0.5rem',
                }}
              >
                {s}
              </p>
            ))}
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '1rem',
              }}
            >
              Contact
            </h4>
            {[
              { icon: <Mail size={15} />, text: 'info@racetik.com' },
              { icon: <Phone size={15} />, text: '+91 98765 43210' },
              { icon: <MapPin size={15} />, text: 'New Delhi, India' },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'rgba(255,255,255,0.75)',
                  marginBottom: '0.625rem',
                }}
              >
                <span style={{ opacity: 0.6, flexShrink: 0 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.45)',
              margin: 0,
            }}
          >
            © 2026 Racetik. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[Twitter, Instagram, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label={['Twitter', 'Instagram', 'Facebook'][i]}
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;

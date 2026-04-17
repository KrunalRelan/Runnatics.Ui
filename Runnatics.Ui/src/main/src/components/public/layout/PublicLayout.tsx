import { Outlet } from 'react-router-dom';
import '../../../styles/public.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

function PublicLayout() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--color-accent)',
          color: '#fff',
          fontFamily: 'var(--font-body)',
          textDecoration: 'none',
        }}
        onFocus={(e) => { (e.currentTarget as HTMLAnchorElement).style.left = '1rem'; }}
        onBlur={(e) => { (e.currentTarget as HTMLAnchorElement).style.left = '-9999px'; }}
      >
        Skip to content
      </a>
      <PublicHeader />
      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;

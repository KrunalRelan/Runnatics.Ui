import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const AboutPageEditor = lazy(() => import('./AboutPageEditor'));

// SuperAdmin only — the public About page is platform-level content.
export const aboutContentRoutes: RouteObject[] = [
  {
    path: 'site/about',
    element: (
      <ProtectedRoute allowedRoles={['SuperAdmin']}>
        <AboutPageEditor />
      </ProtectedRoute>
    ),
  },
];

export default aboutContentRoutes;

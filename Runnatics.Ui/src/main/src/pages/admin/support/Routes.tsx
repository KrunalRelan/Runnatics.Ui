import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const SupportQueryPage = lazy(() => import('./SupportQueryPage'));
const SupportQueryDetailPage = lazy(() => import('./SupportQueryDetailPage'));

export const supportRoutes: RouteObject[] = [
  {
    path: 'support',
    element: (
      <ProtectedRoute>
        <SupportQueryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'support/:id',
    element: (
      <ProtectedRoute>
        <SupportQueryDetailPage />
      </ProtectedRoute>
    ),
  },
];

export default supportRoutes;

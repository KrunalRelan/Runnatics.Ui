import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

const DeviceManagement = lazy(() => import('./DeviceManagement'));

export const deviceRoutes: RouteObject[] = [
  {
    path: 'devices',
    element: (
      <ProtectedRoute>
        <DeviceManagement />
      </ProtectedRoute>
    ),
  },
];

export default deviceRoutes;

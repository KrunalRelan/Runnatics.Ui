import { RouteObject } from "react-router-dom";
import { AddOrEditCertificate } from "./AddOrEditCertificate";
import { CertificatesList } from "./CertificatesList";

export const certificatesRoutes: RouteObject[] = [
  {
    path: "/admin/certificates",
    element: <CertificatesList />,
  },
  {
    path: "/admin/certificates/add",
    element: <AddOrEditCertificate />,
  },
  {
    path: "/admin/certificates/edit/:id",
    element: <AddOrEditCertificate />,
  },
  {
    path: "/events/:eventId/races/:raceId/certificates/add",
    element: <AddOrEditCertificate />,
  },
  {
    path: "/events/:eventId/races/:raceId/certificates/edit/:id",
    element: <AddOrEditCertificate />,
  },
];

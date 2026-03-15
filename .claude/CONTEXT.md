# Runnatics.Ui — Shared Context

> **READ this file before starting any task. UPDATE it after completing any task.**
> This is the shared memory between Claude Code sessions for the Runnatics.Ui project.

---

## Project Overview

**Runnatics.Ui** is a race management SPA for organizing running events, managing participants, tracking RFID chip crossings in real-time, and generating results/certificates.

- **Stack**: React 19 + TypeScript 5.9 (strict) + Vite (port 5173)
- **UI**: MUI 7, Tailwind CSS 4, AG Grid 34, Lucide React
- **State**: React Query (server), Zustand (client), AuthContext (auth)
- **API**: Axios via centralized `apiClient` with JWT interceptor → backend at `localhost:5286/api`
- **Real-time**: SignalR via `useRaceHub` hook → hub at `localhost:5000/hubs/race`
- **Forms**: React Hook Form + Yup
- **Dates**: dayjs (UTC + timezone, default Asia/Kolkata)
- **Path alias**: `@/` → `src/`

---

## Architecture Rules

1. **No `any`** — TypeScript strict mode, always define proper types
2. **All IDs are encrypted strings** — never `number` for API IDs
3. **API calls only in services** — `src/main/src/services/`, never in components
4. **Services use static class methods** on centralized `apiClient`
5. **API responses wrapped** in `ResponseBase<T>` or `SearchResponse<T>`
6. **React Query for server state** — not useState + useEffect for data fetching
7. **Zustand for client-only state** — modals, filters, UI selections
8. **Component folder structure**: `Name.tsx`, `Name.types.ts`, `useName.ts`, `index.ts`
9. **MUI for layout/primitives**, AG Grid `<DataGrid>` for tables
10. **dayjs for all dates** — never raw `Date` or `new Date()`

---

## Existing Components

### Pages (src/main/src/pages/)
| Page | Path | Service Used |
|------|------|-------------|
| Dashboard | `pages/admin/Dashboard.tsx` | DashboardService |
| EventsList | `pages/admin/events/EventsList.tsx` | EventService |
| CreateEvent | `pages/admin/events/CreateEvent.tsx` | EventService |
| EditEvent | `pages/admin/events/EditEvent.tsx` | EventService |
| ViewEvent | `pages/admin/events/ViewEvent.tsx` | EventService, RaceService |
| AddRace | `pages/admin/races/AddRace.tsx` | RaceService |
| EditRace | `pages/admin/races/EditRace.tsx` | RaceService |
| ViewRaces | `pages/admin/races/ViewRaces.tsx` | RaceService (tabbed) |
| RaceDashboard | `pages/admin/races/RaceDashboard.tsx` | useRaceHub, useRaceControl |
| ViewParticipants | `pages/admin/participants/ViewParticipants.tsx` | ParticipantService |
| AddParticipant | `pages/admin/participants/AddParticipant.tsx` | ParticipantService |
| EditParticipant | `pages/admin/participants/EditParticipant.tsx` | ParticipantService |
| DeleteParticipant | `pages/admin/participants/DeleteParticipant.tsx` | ParticipantService |
| ParticipantDetail | `pages/admin/participants/ParticipantDetail.tsx` | ParticipantService |
| BulkUploadParticipants | `pages/admin/participants/BulkUploadParticipants.tsx` | ParticipantService |
| UpdateParticipantsByBib | `pages/admin/participants/UpdateParticipantsByBib.tsx` | ParticipantService |
| AddParticipantRangeDialog | `pages/admin/participants/AddParticipantRangeDialog.tsx` | ParticipantService |
| ViewCheckPoints | `pages/admin/checkpoints/ViewCheckPoints.tsx` | CheckpointsService |
| AddOrEditCheckpoint | `pages/admin/checkpoints/AddOrEditCheckpoint.tsx` | CheckpointsService |
| Leaderboard | `pages/admin/leaderboard/Leaderboard.tsx` | LeaderboardService |
| RFIDFileUpload | `pages/admin/rfid/RFIDFileUpload.tsx` | RFIDService |
| R700Simulator | `pages/admin/rfid/R700Simulator.tsx` | Dev tool |
| CertificatesList | `pages/admin/certificates/CertificatesList.tsx` | CertificateService |
| AddOrEditCertificate | `pages/admin/certificates/AddOrEditCertificate.tsx` | CertificateService |
| LoginPage | `pages/auth/LoginPage.tsx` | AuthService |
| RegisterPage | `pages/auth/RegisterPage.tsx` | AuthService |

### Shared Components (src/main/src/components/)
| Component | Purpose |
|-----------|---------|
| AuthLayout | Header-only layout for auth pages |
| DashboardLayout | Full layout with header + sidebar |
| PageContainer | Content wrapper for pages |
| DataGrid | AG Grid wrapper component |
| DataTable | Simple table component |
| ProtectedRoute | Route guard (checks auth) |
| TokenDebugger | Dev utility for JWT inspection |
| CertificateEditor | Canvas-based certificate editor |
| FormInput | React Hook Form text input |
| FormSelect | React Hook Form select |
| FormTextArea | React Hook Form textarea |
| FormFileUpload | React Hook Form file upload |

---

## Existing Services (src/main/src/services/)

| Service | Endpoints | Key Methods |
|---------|-----------|-------------|
| AuthService | auth/* | login, register, logout, refreshToken, getCurrentUser, isAuthenticated |
| EventService | Events/* | getAllEvents, getPastEvents, getFutureEvents, getEventById, createEvent, updateEvent, deleteEvent, uploadBannerImage, publishEvent, cancelEvent |
| RaceService | Races/{eventId}/* | getAllRaces, getRaceById, createRace, updateRace, deleteRace |
| ParticipantService | participants/* | uploadParticipantCSV, processParticipantImport, searchParticipants, addParticipant, editParticipant, deleteParticipant, getCategories, addParticipantRange, updateParticipantsByBib, getParticipantDetails |
| CheckpointsService | checkpoints/* | getAllCheckpoints, getCheckpointById, createCheckpoint, createCheckpoints, updateCheckpoint, cloneCheckpoints, deleteCheckpoint, deleteAllCheckpoints |
| RFIDService | rfid/* | uploadRFIDFileAuto, validateFileName, formatBytes, formatTimestamp, processAllResults, addManualTime, clearProcessedData |
| LeaderboardService | Results/leaderboard | getLeaderboard |
| CertificateService | certificates/* | getTemplatesByEvent, getTemplateByEventAndRace, getTemplate, createTemplate, updateTemplate, deleteTemplate, generateCertificate, generateBulkCertificates, previewCertificate |
| EventOrganizerService | EventOrganizer/* | getOrganizations, createOrganization |
| DashboardService | dashboard/stats | getDashboardStats |
| DevicesService | devices/* | Device management |
| SessionService | Sessions/* | getAppContext, resetSession |

---

## Existing Types (src/main/src/models/)

### Core
- `Auth.ts` — LoginRequest, LoginResponse, User, RegisterRequest, AuthState
- `Event.ts` — Event interface
- `ResponseBase.ts` — ResponseBase\<T\> generic API wrapper
- `SearchReponse.ts` — SearchResponse\<T\> generic search wrapper
- `ServiceUrls.ts` — API endpoint constants

### By Domain
- `participants/` — Participant, ParticipantSearchRequest, ParticipantSearchResponse, Category, AddParticipantRequest, EditParticipantRequest, etc.
- `races/` — Race, RaceSearchRequest, RaceSettings
- `checkpoints/` — Checkpoint
- `leaderboard/` — LeaderboardResponse, LeaderboardRequest, LeaderboardResult, LeaderboardSplit
- `rfid/` — RFIDImportRequest, RFIDImportResponse, RFIDValidationError, RFIDUploadState
- `raceResults/` — ParticipantResult
- `Dashboard/` — DashboardStatsResponse

---

## Hooks (src/main/src/hooks/)

| Hook | Purpose | Returns |
|------|---------|---------|
| useAuth | Auth state from AuthContext | user, login, logout, isAuthenticated |
| useRaceHub | SignalR connection for live race data | crossings, readerStatuses, isConnected, connectionError, clearCrossings |
| useRaceControl | Race lifecycle API actions | registerDevice, assignDevice, prepareRace, startRace, stopRace, getReaderStatuses |

---

## Route Params

All route parameters are **encrypted strings**:
- `:eventId` — encrypted event ID
- `:raceId` — encrypted race ID
- `:participantId` — encrypted participant ID
- `:id` — encrypted entity ID

---

## Session Log

<!--
Add entries below after each task. Format:
### YYYY-MM-DD — Brief task description
- **Components**: created/modified components
- **Services**: services used or created
- **Types**: new types/interfaces added
- **Endpoints**: API endpoints consumed
- **Decisions**: architectural decisions made
-->

### 2026-03-15 — Initial plugin setup
- **Components**: None created (documentation only)
- **Services**: Catalogued all 12 existing services
- **Types**: Catalogued all existing model directories
- **Decisions**: Established component folder convention (Name.tsx, Name.types.ts, useName.ts, index.ts), React Query as target pattern for data fetching, Zustand for client-only state

### 2026-03-15 — EPC-BIB Mapping feature
- **Components**: BibMapping (pages/admin/bibMapping/) — BibMapping.tsx, BibMapping.types.ts, useBibMapping.ts, BibMappingPage.tsx, index.ts
- **Services**: BibMappingService (services/BibMappingService.ts) — create, getByRace, delete
- **Hooks**: useBibMappingHub (hooks/useBibMappingHub.ts) — SignalR connection to /hubs/bib-mapping, listens for EpcDetected event
- **Types**: models/bibMapping/BibMapping.ts — CreateBibMappingRequest, BibMappingRecord
- **Endpoints**: POST bib-mappings, GET bib-mappings?raceId={id}, DELETE bib-mappings/{id}
- **ServiceUrls**: Added createBibMapping, getBibMappingsByRace, deleteBibMapping to ServiceUrls.ts
- **Route**: /events/event-details/:eventId/race/:raceId/bib-mapping → BibMappingPage
- **Decisions**: Service follows static class pattern on apiClient (not object literal); ResponseBase.message used for response data (matching existing convention); SignalR hub follows useRaceHub reconnect pattern; BibMappingPage wrapper extracts raceId from useParams and passes as prop; Enter key submits form for fast operator workflow

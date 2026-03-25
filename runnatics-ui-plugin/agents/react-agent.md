# Runnatics.Ui — React Agent

You are the primary development agent for **Runnatics.Ui**, a race-management SPA built with React 19, TypeScript 5.9 (strict), Vite, MUI 7, and AG Grid.

---

## FIRST STEP — ALWAYS

Before doing ANY work, read `.claude/CONTEXT.md` to understand:
- What components, services, and types already exist
- Recent decisions and patterns established in prior sessions
- API endpoints already consumed
- Any known issues or constraints

---

## Project Layout

```
Runnatics.Ui/src/
├── App.tsx                          # Root — routing via React Router 7
├── Routes.tsx                       # Route aggregation
├── main.tsx                         # Entry — dayjs, axios defaults, QueryClient
└── main/src/
    ├── components/                  # Shared UI components
    │   ├── AuthLayout.tsx           # Header-only layout (login/register)
    │   ├── DashboardLayout.tsx      # Full layout (header + sidebar)
    │   ├── PageContainer.tsx        # Page content wrapper
    │   ├── DataGrid.tsx             # AG Grid wrapper
    │   ├── DataTable.tsx            # Simple table component
    │   ├── CertificateEditor/       # Canvas-based cert editor
    │   ├── Form/                    # FormInput, FormSelect, FormTextArea, FormFileUpload
    │   └── auth/                    # ProtectedRoute, store.ts
    ├── config/
    │   └── environment.ts           # API base URL, env config
    ├── contexts/
    │   ├── AuthContext.tsx           # JWT auth context + provider
    │   └── SessionContext.tsx        # App session context
    ├── hooks/
    │   ├── useAuth.ts               # Auth state hook (wraps AuthContext)
    │   ├── useRaceHub.ts            # SignalR hub — CheckpointCrossings, RacePrepared, RaceStarted, RaceStopped, ReaderStatusChanged
    │   └── useRaceControl.ts        # Race API control — registerDevice, assignDevice, prepareRace, startRace, stopRace
    ├── models/                      # TypeScript interfaces & types
    │   ├── Auth.ts                  # LoginRequest, LoginResponse, User, RegisterRequest, AuthState
    │   ├── Event.ts                 # Event interface
    │   ├── ResponseBase.ts          # ResponseBase<T> generic wrapper
    │   ├── SearchReponse.ts         # SearchResponse<T> generic wrapper
    │   ├── ServiceUrls.ts           # API endpoint constants
    │   ├── participants/            # 17+ participant types
    │   ├── races/                   # Race, RaceSearchRequest, RaceSettings
    │   ├── checkpoints/             # Checkpoint types
    │   ├── leaderboard/             # LeaderboardResponse, LeaderboardResult, LeaderboardSplit
    │   ├── rfid/                    # RFIDImportRequest/Response, RFIDValidationError, RFIDUploadState
    │   ├── raceResults/             # ParticipantResult
    │   └── Dashboard/               # DashboardStatsResponse
    ├── pages/admin/                 # Page components
    │   ├── events/                  # EventsList, CreateEvent, EditEvent, ViewEvent
    │   ├── races/                   # RaceList, ViewRaces, AddRace, EditRace, RaceDashboard
    │   ├── participants/            # ViewParticipants, AddParticipant, EditParticipant, DeleteParticipant, ParticipantDetail, BulkUploadParticipants, UpdateParticipantsByBib, AddParticipantRangeDialog
    │   ├── checkpoints/             # ViewCheckPoints, AddOrEditCheckpoint
    │   ├── leaderboard/             # Leaderboard
    │   ├── rfid/                    # RFIDFileUpload, R700Simulator
    │   ├── certificates/            # CertificatesList, AddOrEditCertificate
    │   ├── raceResults/             # Race results pages
    │   └── shared/                  # LeaderboardSettings
    ├── pages/auth/                  # LoginPage, RegisterPage
    ├── services/                    # API service layer (12 services)
    │   ├── AuthService.ts           # login, register, logout, refreshToken, getCurrentUser
    │   ├── EventService.ts          # CRUD + publish, cancel, uploadBannerImage
    │   ├── RaceService.ts           # CRUD for races
    │   ├── ParticipantService.ts    # CRUD + CSV upload, bulk ops, search
    │   ├── RFIDService.ts           # uploadRFIDFileAuto, validateFileName, processAllResults, addManualTime
    │   ├── LeaderboardService.ts    # getLeaderboard
    │   ├── CheckpointsService.ts    # CRUD + clone, deleteAll
    │   ├── CertificateService.ts    # CRUD + generate, preview, bulk generate
    │   ├── EventOrganizerService.ts # getOrganizations, createOrganization
    │   ├── DashboardService.ts      # getDashboardStats
    │   ├── DevicesService.ts        # Device management
    │   ├── SessionService.ts        # getAppContext, resetSession
    │   └── index.ts                 # Barrel exports
    ├── styles/dataGrid/             # AG Grid custom styles
    ├── theme/                       # ThemeProvider, ThemeSwitcher, colorPalette
    ├── utility/                     # PrivateRoute, StringHelper, encryption, helpers
    └── utils/                       # axios.config.ts, dateTimeUtils.ts, encryption.ts
```

---

## Routing Structure

| Route Pattern | Component | Notes |
|---|---|---|
| `/login` | LoginPage | Auth layout |
| `/register` | RegisterPage | Auth layout |
| `/dashboard` | Dashboard | Protected |
| `/events/events-dashboard` | EventsList | Protected |
| `/events/events-create` | CreateEvent | Protected |
| `/events/events-edit/:id` | EditEvent | Protected, id = encrypted string |
| `/events/event-details/:eventId` | ViewEvent | Protected |
| `/events/event-details/:eventId/race/add` | AddRace | Protected |
| `/events/event-details/:eventId/race/edit/:raceId` | EditRace | Protected |
| `/events/event-details/:eventId/race/:raceId` | ViewRaces | Tabbed: Dashboard, Participants, Checkpoints, etc. |
| `/events/event-details/:eventId/race/:raceId/participant/:participantId` | ParticipantDetail | Protected |
| `/rfid/upload` | RFIDFileUpload | Protected |
| `/rfid/simulator` | R700Simulator | Dev only |

**All route params (`:eventId`, `:raceId`, `:participantId`, `:id`) are encrypted strings, NEVER numeric.**

---

## Absolute Rules

### TypeScript
- **`strict: true`** — no `any`, no `as unknown as`, no `@ts-ignore`
- All interfaces in `src/main/src/models/` grouped by feature domain
- Naming: `*Request`, `*Response`, `*Props`, `*State` suffixes
- API responses wrapped in `ResponseBase<T>` or `SearchResponse<T>`
- All IDs from the API are **encrypted strings** — type them as `string`, never `number`

### API & Services
- **ALL** HTTP calls go through services in `src/main/src/services/`
- Services use static class methods on the centralized `apiClient` (Axios)
- `apiClient` has a JWT interceptor — tokens injected automatically
- API base: `http://localhost:5286/api` proxied via Vite (`/api` → backend)
- **NEVER** put `axios.get()` or `fetch()` directly in a component
- Use `ServiceUrl` constants for endpoint paths

### Service Pattern
```typescript
// src/main/src/services/ExampleService.ts
import apiClient from '@/utils/axios.config';
import { ServiceUrl } from '@/models/ServiceUrls';
import { ResponseBase } from '@/models/ResponseBase';
import { ExampleItem } from '@/models/example/ExampleItem';

export class ExampleService {
  static async getAll(parentId: string): Promise<ExampleItem[]> {
    const response = await apiClient.get<ResponseBase<ExampleItem[]>>(
      `${ServiceUrl.EXAMPLE}/${parentId}`
    );
    return response.data.data;
  }

  static async create(parentId: string, data: CreateExampleRequest): Promise<ExampleItem> {
    const response = await apiClient.post<ResponseBase<ExampleItem>>(
      `${ServiceUrl.EXAMPLE}/${parentId}`,
      data
    );
    return response.data.data;
  }
}
```

### State Management
- **Server state**: Use React Query (`@tanstack/react-query`) for all data fetching
  - QueryClient configured in `main.tsx` (retry: 1, refetchOnWindowFocus: false)
  - Custom query hooks per feature: `useEvents()`, `useRace(raceId)`, etc.
  - Invalidate related queries on mutations
- **Client state**: Use Zustand for UI-only state (modals, filters, selections)
- **Auth state**: Via `AuthContext` + `useAuth()` hook
- **Form state**: React Hook Form + Yup validation

### React Query Pattern (target pattern)
```typescript
// src/main/src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventService } from '@/services';
import { Event } from '@/models/Event';

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.list(),
    queryFn: () => EventService.getAllEvents(),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => EventService.getEventById(id),
    enabled: !!id,
  });
}
```

### Component Structure
Every new component MUST follow this folder structure:
```
ComponentName/
├── ComponentName.tsx       # Component implementation
├── ComponentName.types.ts  # Props, local interfaces
├── useComponentName.ts     # Custom hook (data fetching, logic)
└── index.ts                # Barrel export
```

### Component Pattern
```typescript
// ComponentName.tsx
import React from 'react';
import { ComponentNameProps } from './ComponentName.types';
import { useComponentName } from './useComponentName';

const ComponentName: React.FC<ComponentNameProps> = ({ eventId, raceId }) => {
  const { data, isLoading, error, handleAction } = useComponentName(eventId, raceId);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <PageContainer title="Component Title">
      {/* UI here */}
    </PageContainer>
  );
};

export default ComponentName;
```

```typescript
// ComponentName.types.ts
export interface ComponentNameProps {
  eventId: string;
  raceId: string;
}

export interface ComponentNameState {
  // local UI state types
}
```

```typescript
// useComponentName.ts
import { useQuery } from '@tanstack/react-query';
import { SomeService } from '@/services';

export function useComponentName(eventId: string, raceId: string) {
  const query = useQuery({
    queryKey: ['feature', eventId, raceId],
    queryFn: () => SomeService.getData(eventId, raceId),
    enabled: !!eventId && !!raceId,
  });

  const handleAction = async () => {
    // mutation logic
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    handleAction,
  };
}
```

```typescript
// index.ts
export { default } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';
```

### SignalR / Real-Time
- Use `useRaceHub(raceId, hubUrl, maxCrossings)` from `src/main/src/hooks/useRaceHub.ts`
- Hub URL: `http://localhost:5000/hubs/race`
- Events: `CheckpointCrossings`, `RacePrepared`, `RaceStarted`, `RaceStopped`, `ReaderStatusChanged`
- Returns: `{ crossings, readerStatuses, isConnected, connectionError, clearCrossings }`
- Auto-reconnect with exponential backoff
- Use `useRaceControl()` for race API actions (start, stop, prepare, etc.)

### UI Framework
- **MUI 7** for layout, dialogs, forms, buttons, alerts, circular progress
- **AG Grid** via `<DataGrid>` wrapper for tables with sorting/filtering
- **Tailwind CSS 4** for utility styling alongside MUI
- **Lucide React** for icons
- **react-hot-toast** for notifications
- **dayjs** for all date/time (UTC + timezone plugin, default `Asia/Kolkata`)

### Existing Page Patterns
- Pages use `useParams<{ eventId: string; raceId: string }>()` for route params
- `useNavigate()` for programmatic navigation
- `initializedRef = useRef(false)` guard to prevent duplicate fetches in StrictMode
- Loading: `<CircularProgress />`, Error: `<Alert severity="error">`
- Lazy-loaded dialogs: `React.lazy(() => import('./DialogComponent'))`
- Forms use React Hook Form with Yup schema validation

### Path Alias
- `@/` maps to `src/` (configured in vite.config.ts)
- Always use `@/` for imports: `import { EventService } from '@/services'`

---

## LAST STEP — ALWAYS

After completing any task, update `.claude/CONTEXT.md` with:
- Component names created or modified
- API endpoints consumed (service + method)
- New types/interfaces added (file path + names)
- Architectural decisions made and why
- Any issues encountered or workarounds applied

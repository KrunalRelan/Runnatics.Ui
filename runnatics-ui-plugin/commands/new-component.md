# /new-component — Scaffold a Runnatics Component

## Usage
```
/new-component <ComponentName> [--page] [--service <ServiceName>] [--model <ModelName>]
```

## Before You Start
1. Read `.claude/CONTEXT.md` for existing components and patterns
2. Check if a similar component already exists in `src/main/src/components/` or `src/main/src/pages/admin/`

## Arguments
- `ComponentName` — PascalCase name (e.g., `RaceTimeline`, `ParticipantFilters`)
- `--page` — Place in `src/main/src/pages/admin/<feature>/` instead of `src/main/src/components/`
- `--service <ServiceName>` — Wire up an existing service (e.g., `RaceService`, `ParticipantService`)
- `--model <ModelName>` — Import an existing model from `src/main/src/models/`

## What Gets Created

For a component named `RaceTimeline`:

### 1. `RaceTimeline/RaceTimeline.tsx`
```typescript
import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { RaceTimelineProps } from './RaceTimeline.types';
import { useRaceTimeline } from './useRaceTimeline';

const RaceTimeline: React.FC<RaceTimelineProps> = ({ raceId, eventId }) => {
  const { data, isLoading, error } = useRaceTimeline(raceId, eventId);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* TODO: Implement RaceTimeline UI */}
    </Box>
  );
};

export default RaceTimeline;
```

### 2. `RaceTimeline/RaceTimeline.types.ts`
```typescript
export interface RaceTimelineProps {
  raceId: string;
  eventId: string;
}
```

All IDs MUST be typed as `string` (encrypted from API).

### 3. `RaceTimeline/useRaceTimeline.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
// Import the appropriate service if --service was specified

export function useRaceTimeline(raceId: string, eventId: string) {
  const query = useQuery({
    queryKey: ['raceTimeline', raceId, eventId],
    queryFn: async () => {
      // Wire up service call here
      return null;
    },
    enabled: !!raceId && !!eventId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
```

### 4. `RaceTimeline/index.ts`
```typescript
export { default } from './RaceTimeline';
export type { RaceTimelineProps } from './RaceTimeline.types';
```

## Rules
- **No `any`** — TypeScript strict mode. If you don't know the type, define an interface.
- **No API calls in components** — All fetching goes in the `useHook.ts` via services.
- **All IDs are `string`** — API returns encrypted IDs, never numbers.
- **Use `@/` path alias** for all imports from `src/`.
- **MUI components** for UI primitives (Box, Typography, Button, Dialog, etc.).
- **AG Grid** via `<DataGrid>` wrapper for tabular data.
- **dayjs** for any date/time handling.
- **React Hook Form + Yup** for forms.

## Existing Services Available
| Service | Key Methods |
|---|---|
| `AuthService` | login, register, logout, refreshToken, getCurrentUser |
| `EventService` | getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, publishEvent, cancelEvent |
| `RaceService` | getAllRaces, getRaceById, createRace, updateRace, deleteRace |
| `ParticipantService` | searchParticipants, addParticipant, editParticipant, deleteParticipant, getParticipantDetails, uploadParticipantCSV, addParticipantRange |
| `CheckpointsService` | getAllCheckpoints, getCheckpointById, createCheckpoint, updateCheckpoint, cloneCheckpoints, deleteCheckpoint |
| `RFIDService` | uploadRFIDFileAuto, validateFileName, processAllResults, addManualTime |
| `LeaderboardService` | getLeaderboard |
| `CertificateService` | getTemplatesByEvent, createTemplate, updateTemplate, generateCertificate, generateBulkCertificates, previewCertificate |
| `DashboardService` | getDashboardStats |
| `SessionService` | getAppContext, resetSession |

## Existing Model Directories
- `models/participants/` — Participant, ParticipantSearchRequest, ParticipantSearchResponse, Category, etc.
- `models/races/` — Race, RaceSearchRequest, RaceSettings
- `models/checkpoints/` — Checkpoint
- `models/leaderboard/` — LeaderboardResponse, LeaderboardResult, LeaderboardSplit
- `models/rfid/` — RFIDImportRequest, RFIDImportResponse, RFIDValidationError, RFIDUploadState
- `models/Dashboard/` — DashboardStatsResponse
- `models/raceResults/` — ParticipantResult

## After Creating
Update `.claude/CONTEXT.md` with the new component name, its location, and any services/models it uses.

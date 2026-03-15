# Skill: react-component

Generate a complete, production-ready React component following Runnatics.Ui conventions.

## Pre-flight
1. **Read `.claude/CONTEXT.md`** — check for existing components, services, and decisions.
2. Confirm the component name, its purpose, and which service/model it needs.
3. Determine placement: `src/main/src/components/` (shared) or `src/main/src/pages/admin/<feature>/` (page).

## Inputs
- `name`: PascalCase component name
- `purpose`: What this component does
- `service`: Which existing service to wire up (optional)
- `props`: Key props the component needs
- `has_form`: Whether this component contains a form (triggers React Hook Form + Yup)
- `has_grid`: Whether this component displays tabular data (triggers AG Grid)
- `has_realtime`: Whether this component needs SignalR (triggers useRaceHub)

## Output Files

### {Name}/{Name}.types.ts
Define all interfaces:
- `{Name}Props` — component props (all IDs as `string`)
- Form data types if `has_form`
- Grid row types if `has_grid`
- Any local state interfaces

```typescript
// Example: RaceTimeline.types.ts
export interface RaceTimelineProps {
  eventId: string;
  raceId: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  description: string;
  category: string;
}
```

### {Name}/use{Name}.ts
Custom hook encapsulating all logic:

**Standard data fetching:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SomeService } from '@/services';

export function useRaceTimeline(raceId: string, eventId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['raceTimeline', raceId, eventId],
    queryFn: () => SomeService.getTimeline(raceId),
    enabled: !!raceId && !!eventId,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTimelineEntry) => SomeService.createEntry(raceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raceTimeline', raceId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    createEntry: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
```

**With SignalR (if `has_realtime`):**
```typescript
import { useRaceHub } from '@/hooks/useRaceHub';

export function useLiveRaceDashboard(raceId: string) {
  const { crossings, readerStatuses, isConnected, connectionError, clearCrossings } =
    useRaceHub(raceId ? Number(raceId) : null);

  return {
    crossings,
    readerStatuses,
    isConnected,
    connectionError,
    clearCrossings,
  };
}
```

**With form (if `has_form`):**
```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  // ... fields
});

export function useAddParticipantForm(raceId: string) {
  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: FormData) => {
    await ParticipantService.addParticipant(raceId, data);
  };

  return { form, onSubmit };
}
```

### {Name}/{Name}.tsx
Component implementation:

```typescript
import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { {Name}Props } from './{Name}.types';
import { use{Name} } from './use{Name}';

const {Name}: React.FC<{Name}Props> = ({ eventId, raceId }) => {
  const { data, isLoading, error } = use{Name}(raceId, eventId);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6">{/* Title */}</Typography>
      {/* Component body */}
    </Box>
  );
};

export default {Name};
```

**With AG Grid (if `has_grid`):**
```typescript
import { DataGrid } from '@/components/DataGrid';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { useRef } from 'react';

// Inside component:
const gridRef = useRef<GridApi>(null);

const colDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', flex: 1 },
];

return (
  <DataGrid
    colDefs={colDefs}
    rowData={data}
    onGridReady={(event: GridReadyEvent) => {
      gridRef.current = event.api;
    }}
  />
);
```

**With form (if `has_form`):**
```typescript
import { FormInput } from '@/components/Form/FormInput';
import { FormSelect } from '@/components/Form/FormSelect';

// Inside component:
const { form, onSubmit } = useAddSomethingForm(raceId);

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormInput name="fieldName" control={form.control} label="Field" />
    <Button type="submit" variant="contained">Save</Button>
  </form>
);
```

### {Name}/index.ts
```typescript
export { default } from './{Name}';
export type { {Name}Props } from './{Name}.types';
```

## Validation Checklist
Before finishing, verify:
- [ ] No `any` types anywhere
- [ ] All IDs typed as `string`
- [ ] API calls only in the hook, via services — never in the .tsx
- [ ] Imports use `@/` path alias
- [ ] Types in `.types.ts`, logic in `useHook.ts`, UI in `.tsx`
- [ ] Loading state handled with `<CircularProgress />`
- [ ] Error state handled with `<Alert severity="error">`
- [ ] MUI components used for UI primitives
- [ ] dayjs used for any date/time display or manipulation
- [ ] React Query for server state, not useState+useEffect
- [ ] Barrel export in index.ts

## Post-flight
Update `.claude/CONTEXT.md`:
- Component name and path
- Services and endpoints used
- Types created
- Any decisions or patterns established

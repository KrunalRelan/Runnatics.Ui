# Events List API Response Fix

## Problem
The events list was not displaying because the code was trying to access `response.results`, but the backend API returns events directly in `response.message`.

## API Response Structure
```json
{
  "statusCode": 200,
  "message": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Test Event",
      "eventDate": "2025-02-01T00:00:00",
      // ... other event properties
    }
  ],
  "totalCount": 1,
  "isSuccess": true,
  "errorMessages": []
}
```

## Fix Applied
Updated `Dashboard.tsx` line 91 to correctly access the events array:

**Before:**
```typescript
setEvents(response.results || []);
```

**After:**
```typescript
// Backend returns events directly in the message property as an array
setEvents(response.message || []);
```

## Type Safety
The `SearchResponse<T>` interface was already correctly defined with the `message` property:
```typescript
export interface SearchResponse<T> {
    totalCount: number;
    message: T[];
}
```

## Result
✅ Events list now displays correctly
✅ All TypeScript errors resolved
✅ Type safety maintained with proper interface matching

## Files Changed
- `src/main/src/pages/admin/events/Dashboard.tsx` (line 91)

## Testing
After this fix, the events list should:
1. Load and display all events from the API
2. Show proper pagination based on `totalCount`
3. Handle empty results gracefully
4. Display event details correctly in the table

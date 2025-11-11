# Event Organizer ID Fix

## Issue
When selecting an event organizer from the dropdown, the system was sending the **organization ID** (e.g., 12) instead of the **event organizer ID** to the API.

## Root Cause
The dropdown was using `org.organizationId || org.id` as the value, which meant:
- If an `organizationId` existed (e.g., 12), it would use that value
- This `organizationId` is NOT the event organizer's ID, it's a reference to the organization entity
- The backend API expects `eventOrganizerId`, which should be the event organizer's unique ID

## The Fix

### Before:
```tsx
{organizations.map((org) => (
  <MenuItem key={org.id} value={org.organizationId || org.id}>
    {org.name || org.organizerName || `Organization ${org.id}`}
  </MenuItem>
))}
```
**Problem:** Used `org.organizationId` first, which sends the wrong ID (12 instead of the event organizer's ID)

### After:
```tsx
{organizations.map((org) => (
  <MenuItem key={org.id} value={org.id}>
    {org.name || org.organizerName || `Organization ${org.id}`}
  </MenuItem>
))}
```
**Solution:** Always use `org.id` (the event organizer's unique ID)

## Additional Improvements

### Updated Console Logging
**Before:**
```typescript
console.log('Organization ID being sent to API:', organizationIdForApi);
```

**After:**
```typescript
console.log('Event Organizer ID being sent to API:', eventOrganizerIdForApi);
```

### Clearer Variable Names
**Before:**
```typescript
let organizationIdForApi: number;
```

**After:**
```typescript
let eventOrganizerIdForApi: number;
```

### Updated Comments
Added clearer comments to explain that the form field named `organizationId` actually stores the event organizer's ID:

```typescript
// Get the event organizer ID from the dropdown selection
// The organizationId field actually stores the event organizer's ID (not organization ID)
let eventOrganizerIdForApi: number;
```

## Data Model Clarification

### EventOrganizer Model
```typescript
export interface EventOrganizer {
    id: number;                    // ← Event Organizer's unique ID (THIS is what we send to API)
    organizationId?: number;       // ← Organization reference (NOT used in API request)
    name?: string;
    organizerName?: string;
}
```

### API Payload
```json
{
  "eventOrganizerId": 5,  // ← Event Organizer's ID (from org.id)
  "name": "Marathon 2024",
  ...
}
```

## Testing Checklist

- [x] Dropdown now uses `org.id` as the value
- [x] Variable renamed to `eventOrganizerIdForApi` for clarity
- [x] Console log updated to show "Event Organizer ID"
- [x] Comments added to clarify the field naming
- [x] No TypeScript errors
- [ ] Test: Select an event organizer and verify console shows correct ID
- [ ] Test: Verify API receives the event organizer's ID (not organization ID)

## Expected Behavior

When you select an event organizer from the dropdown:
1. The dropdown stores the **event organizer's ID** (e.g., 5)
2. Console logs: `Event Organizer ID being sent to API: 5`
3. API receives: `{ "eventOrganizerId": 5, ... }`

## Why This Matters

The backend expects:
- `eventOrganizerId`: The unique ID of the event organizer entity
- This is NOT the same as `organizationId`, which is a reference field within the event organizer

Sending the wrong ID would cause:
- ❌ Invalid event organizer reference
- ❌ 404 or validation errors from the backend
- ❌ Event creation failures

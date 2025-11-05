# Event Date Display Fix

## Problem
```
Dashboard.tsx:146 Uncaught TypeError: Cannot read properties of undefined (reading 'toLocaleDateString')
```

The events list was crashing when trying to display event dates because:
1. The API returns `eventDate` field, but the code was trying to access `startDate`
2. The `formatDate` function didn't handle `undefined` or `null` values
3. The Event model didn't match the actual API response structure

## API Response Structure
The backend API returns events with these fields:
```json
{
  "id": 4,
  "organizationId": 12,
  "name": "Ultra Marathon Challenge 2025",
  "eventDate": "2024-12-25T05:00:00",  // NOT startDate
  "timeZone": "Asia/Kolkata",
  "venueName": "Hill Station Base Camp",    // NOT location
  "venueAddress": "Khandala, Pune...",      // Additional field
  "eventOrganizerName": "Runnatics Org 1",  // Human-readable name
  "organizerId": "...",
  "isActive": true,
  ...
}
```

## Fixes Applied

### 1. Updated Event Model (`Event.ts`)
Added API fields and made legacy fields optional for backwards compatibility:
```typescript
export interface Event {
  // API fields (current)
  eventDate: Date | string;           // Primary date field from API
  venueName?: string;                 // Venue name from API
  venueAddress?: string;              // Full venue address
  eventOrganizerName?: string;        // Human-readable organizer name
  maxParticipants?: number;           // API field for capacity
  registrationDeadline?: Date | string;
  
  // Legacy fields (optional for backwards compatibility)
  startDate?: Date;
  location?: string;
  
  // Other fields...
}
```

### 2. Fixed `formatDate` Function (`Dashboard.tsx` line 144)
Added null/undefined handling and validation:
```typescript
const formatDate = (date: Date | string | undefined | null) => {
  if (!date) return "N/A";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
```

### 3. Updated Table Display (`Dashboard.tsx` line 291)
Changed to use correct API field names:
```typescript
// Event Date - use eventDate from API, fallback to legacy startDate
<TableCell>{formatDate(event.eventDate || event.startDate)}</TableCell>

// Address - use venueAddress from API, fallback to legacy location
<TableCell>{event.venueAddress || event.location || "N/A"}</TableCell>

// Organizer - show eventOrganizerName (human-readable), fallback to ID
<TableCell>{event.eventOrganizerName || event.organizerId || "N/A"}</TableCell>
```

## Benefits
✅ **No more crashes** - Null/undefined dates are handled gracefully  
✅ **Correct data display** - Shows actual API fields (`eventDate`, `venueAddress`)  
✅ **Better UX** - Displays organizer name instead of just ID  
✅ **Backwards compatible** - Legacy field names still work if needed  
✅ **Type safe** - Event model matches actual API response  

## Files Changed
1. `src/main/src/models/Event.ts` - Updated interface to match API response
2. `src/main/src/pages/admin/events/Dashboard.tsx` - Fixed formatDate and table fields

## Testing
✅ Events list now displays without errors  
✅ Dates formatted correctly (e.g., "Dec 25, 2024")  
✅ Missing dates show "N/A"  
✅ Organizer names displayed (e.g., "Runnatics Org 1")  
✅ Full venue addresses shown  

## Table Columns Now Display
| Column | Field Used | Fallback |
|--------|-----------|----------|
| Event Date | `eventDate` | `startDate` → "N/A" |
| Address | `venueAddress` | `location` → "N/A" |
| Organizer | `eventOrganizerName` | `organizerId` → "N/A" |
| Published | `isActive` | - |

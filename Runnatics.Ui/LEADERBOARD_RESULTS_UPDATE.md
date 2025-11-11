# Leaderboard Results Update - Separate Result Counts

## Summary
Updated the leaderboard settings to support **separate result counts** for Overall Results and Category Results, replacing the previous single shared field.

## Changes Made

### 1. Model Update (`LeaderBoardSettings.ts`)
**Before:**
```typescript
export interface LeaderBoardSettings {
    // ... other fields
    NumberOfResultsToShow?: number;  // Single shared field
}
```

**After:**
```typescript
export interface LeaderBoardSettings {
    // ... other fields
    NumberOfResultsToShowOverall?: number;   // Separate field for overall results
    NumberOfResultsToShowCategory?: number;  // Separate field for category results
}
```

### 2. UI Changes (`CreateEvent.tsx`)

#### Default Values Updated:
- `NumberOfResultsToShowOverall`: **10** (default)
- `NumberOfResultsToShowCategory`: **5** (default)

#### UI Layout:
**Before:** Single centered input field that applied to both result types

**After:** Two side-by-side input fields:
- **Left:** "Overall Results to Show" - Visible only when ShowOverallResults is enabled
- **Right:** "Category Results to Show" - Visible only when ShowCategoryResults is enabled

Both fields use responsive layout (stack vertically on mobile, side-by-side on desktop).

### 3. API Payload Mapping

**Before:**
```typescript
leaderboardSettings: {
    numberOfResultsToShow: leaderBoardSettings.NumberOfResultsToShow || null,
    maxDisplayedRecords: leaderBoardSettings.NumberOfResultsToShow || 100,
}
```

**After:**
```typescript
leaderboardSettings: {
    numberOfResultsToShowOverall: leaderBoardSettings.NumberOfResultsToShowOverall || 10,
    numberOfResultsToShowCategory: leaderBoardSettings.NumberOfResultsToShowCategory || 5,
    maxDisplayedRecords: Math.max(
        leaderBoardSettings.NumberOfResultsToShowOverall || 10,
        leaderBoardSettings.NumberOfResultsToShowCategory || 5
    ),
}
```

**Note:** `maxDisplayedRecords` is now set to the **maximum** of both values to ensure the backend can handle both result types.

### 4. Documentation Updated
- Updated `API_REQUEST_MAPPING.md` to reflect the new separate fields
- Added this summary document

## User Experience

### Form Behavior:
1. **Overall Results enabled:** Shows "Overall Results to Show" input field (default: 10)
2. **Category Results enabled:** Shows "Category Results to Show" input field (default: 5)
3. **Both enabled:** Both input fields are displayed side-by-side (or stacked on mobile)
4. **Neither enabled:** No result count fields are shown

### Validation:
- Both fields accept only positive integers (minimum: 1)
- Each field can be independently configured
- Values are preserved when toggling the enable/disable switches

## API Integration

The payload now sends:
```json
{
  "leaderboardSettings": {
    "showOverallResults": true,
    "showCategoryResults": true,
    "numberOfResultsToShowOverall": 10,
    "numberOfResultsToShowCategory": 5,
    "maxDisplayedRecords": 10
  }
}
```

## Testing Checklist

- [x] Model types updated
- [x] Default values set correctly
- [x] UI displays two separate fields
- [x] Fields show/hide based on toggle state
- [x] Payload mapping uses correct field names
- [x] maxDisplayedRecords calculated correctly
- [x] Documentation updated
- [x] No TypeScript errors

## Next Steps

1. **Backend Verification:** Ensure the C# backend accepts `numberOfResultsToShowOverall` and `numberOfResultsToShowCategory` properties
2. **Testing:** Create an event and verify the payload is sent correctly
3. **Update EditEvent.tsx:** Apply the same changes to the Edit Event form when it's implemented
4. **ViewEvent.tsx:** Display both values separately when viewing event details

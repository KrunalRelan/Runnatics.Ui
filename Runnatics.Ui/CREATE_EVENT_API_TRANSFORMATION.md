# Create Event Form - API Request Transformation

## Overview
The Create Event form has been updated to keep capacity, price, and currency fields in the UI for future use, but they are excluded from the API request since the backend doesn't expect them.

## Changes Made

### 1. Form State Updated
The form state now includes capacity, price, and currency fields:
```typescript
capacity: 0,     // UI only, not sent to API
price: 0,        // UI only, not sent to API
currency: "INR", // UI only, not sent to API
```

### 2. Request Transformation
In the `handleSubmit` function, the request payload is transformed to match the working API structure:

#### Fields Excluded (UI Only)
- `capacity`
- `price`
- `currency`

#### Field Mappings
| Form Field | API Field |
|------------|-----------|
| `name` | `name` |
| `description` | `description` |
| `startDate` | `eventDate` |
| `location` | `venueName` |
| `city, state, country` | `venueAddress` (combined) |
| `timeZone` | `timeZone` |

#### Auto-Generated Fields
- `slug`: Generated from event name (lowercase, spaces replaced with hyphens)
- `status`: Set to "Draft" by default
- `maxParticipants`: Set to 1000 by default
- `registrationDeadline`: Uses `registrationCloseDate` or falls back to `startDate`

### 3. Settings Transformation

#### Event Settings
Form field names are transformed from PascalCase to camelCase:
```typescript
{
  removeBanner: eventSettings.RemoveBanner,
  published: eventSettings.PublishEvent,
  rankOnNet: eventSettings.RankOnNet,
  showResultSummaryForRaces: eventSettings.ShowResultsSummaryForRaces,
  useOldData: eventSettings.UseOldData,
  confirmedEvent: eventSettings.ConfirmedEvent,
  allowNameCheck: eventSettings.AllNameCheck,
  allowParticipantEdit: eventSettings.AllowParticipantsEdit,
}
```

#### Leaderboard Settings
Form settings are mapped and additional default fields are added:
```typescript
{
  showOverallResults: leaderBoardSettings.ShowOverallResults,
  showCategoryResults: leaderBoardSettings.ShowCategoryResults,
  // Default fields added by frontend
  showGenderResults: true,
  showAgeGroupResults: true,
  enableLiveLeaderboard: true,
  showSplitTimes: true,
  showPace: true,
  showTeamResults: false,
  showMedalIcon: true,
  allowAnonymousView: true,
  autoRefreshIntervalSec: 30,
  maxDisplayedRecords: leaderBoardSettings.NumberOfResultsToShow || 100,
}
```

### 4. UI Updates
The "Registration & Pricing" section now includes:
- A note indicating fields are for display purposes only
- "Optional" label on each field
- Helper text: "For UI display only"
- No validation or required attributes

## Example API Request

The form will send a request matching this structure:

```json
{
  "name": "Delhi Marathon 2026",
  "slug": "delhi-marathon-2026",
  "description": "Annual marathon event in Delhi",
  "eventDate": "2025-12-15T06:00:00Z",
  "timeZone": "Asia/Kolkata",
  "venueName": "India Gate",
  "venueAddress": "Delhi, Delhi, India",
  "status": "Draft",
  "maxParticipants": 1000,
  "registrationDeadline": "2025-12-01T23:59:59Z",
  "eventSettings": {
    "removeBanner": false,
    "published": false,
    "rankOnNet": true,
    "showResultSummaryForRaces": true,
    "useOldData": false,
    "confirmedEvent": false,
    "allowNameCheck": true,
    "allowParticipantEdit": true
  },
  "leaderboardSettings": {
    "showOverallResults": true,
    "showCategoryResults": true,
    "showGenderResults": true,
    "showAgeGroupResults": true,
    "enableLiveLeaderboard": true,
    "showSplitTimes": true,
    "showPace": true,
    "showTeamResults": false,
    "showMedalIcon": true,
    "allowAnonymousView": true,
    "autoRefreshIntervalSec": 30,
    "maxDisplayedRecords": 100
  }
}
```

## Testing Checklist

### Form Display
- [ ] All fields display correctly including capacity, price, and currency
- [ ] Capacity, price, and currency show as "Optional"
- [ ] Helper text indicates "For UI display only"
- [ ] Section header shows note about display purposes

### Form Submission
- [ ] Capacity, price, and currency are NOT included in the API request
- [ ] Event settings are transformed from PascalCase to camelCase
- [ ] Leaderboard settings include all required default fields
- [ ] Slug is auto-generated from event name
- [ ] Status defaults to "Draft"
- [ ] venueAddress combines city, state, and country

### API Request
- [ ] Request matches the working API structure
- [ ] Authorization header is included (Bearer token)
- [ ] All required fields are present
- [ ] No unexpected fields are sent

### Error Handling
- [ ] Validation errors display correctly
- [ ] API errors show in the Alert component
- [ ] No errors appear for capacity, price, or currency

## Future Enhancements

If the backend later supports capacity, price, and currency:

1. Remove the transformation logic that excludes these fields
2. Update validation to make them required
3. Remove "Optional" labels and helper text
4. Update the request payload to include them

Simply update the request payload section in `handleSubmit`:
```typescript
const requestPayload = {
  ...apiData,
  // Add these fields back when backend supports them:
  capacity: formData.capacity,
  price: formData.price,
  currency: formData.currency,
  // ...rest of the payload
};
```

## Files Modified

1. `/src/main/src/pages/admin/events/CreateEvent.tsx`
   - Updated form state to include capacity, price, currency
   - Added request transformation logic in handleSubmit
   - Updated UI to mark fields as optional with helper text
   - Removed validation for UI-only fields

## Console Logs for Debugging

The form logs the following for debugging:
- Token existence and preview before API call
- Complete request payload before sending
- Success message with created event data
- Detailed error information if the request fails

Check browser console for:
```
🔑 Token exists: true
🔑 Token preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📤 Calling EventService.createEvent with payload: {...}
✅ Event created successfully: {...}
```

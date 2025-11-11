# API Request Mapping - Frontend to Backend

## C# API Model vs Frontend Payload

This document shows how the frontend CreateEvent form maps to your C# `EventRequest` model.

## Required Fields Mapping

| C# Property (Backend) | Frontend Field | Type | Notes |
|----------------------|----------------|------|-------|
| `EventOrganizerId` | `eventOrganizerId` | `int` | ✅ Now correctly mapped from dropdown |
| `Name` | `name` | `string` | Event name from form |
| `Slug` | `slug` | `string` | Auto-generated from name (lowercase, hyphenated) |
| `EventDate` | `eventDate` | `DateTime` | Maps from `startDate` field |

## Optional Fields Mapping

| C# Property (Backend) | Frontend Field | Type | Default Value |
|----------------------|----------------|------|---------------|
| `Description` | `description` | `string?` | `null` |
| `TimeZone` | `timeZone` | `string` | `"Asia/Kolkata"` |
| `VenueName` | `venueName` | `string?` | Maps from `location` |
| `VenueAddress` | `venueAddress` | `string?` | Concatenated: `city, state, country` |
| `VenueLatitude` | `venueLatitude` | `decimal?` | `null` (not in form) |
| `VenueLongitude` | `venueLongitude` | `decimal?` | `null` (not in form) |
| `Status` | `status` | `string` | `"Draft"` |
| `MaxParticipants` | `maxParticipants` | `int?` | `1000` |
| `RegistrationDeadline` | `registrationDeadline` | `DateTime?` | Maps from `registrationCloseDate` |

## Nested Objects

### Event Settings (EventSettingsRequest)
All properties match the C# model exactly:

| C# Property | Frontend Property | Type | Default Value |
|-------------|------------------|------|---------------|
| `RemoveBanner` | `removeBanner` | `bool` | `false` |
| `Published` | `published` | `bool` | `false` |
| `RankOnNet` | `rankOnNet` | `bool` | `true` |
| `ShowResultSummaryForRaces` | `showResultSummaryForRaces` | `bool` | `true` |
| `UseOldData` | `useOldData` | `bool` | `false` |
| `ConfirmedEvent` | `confirmedEvent` | `bool` | `false` |
| `AllowNameCheck` | `allowNameCheck` | `bool` | `true` |
| `AllowParticipantEdit` | `allowParticipantEdit` | `bool` | `true` |

```typescript
eventSettings: {
    removeBanner: false,
    published: false,
    rankOnNet: true,                    // Default true
    showResultSummaryForRaces: true,    // Default true
    useOldData: false,
    confirmedEvent: false,
    allowNameCheck: true,                // Default true
    allowParticipantEdit: true,         // Default true
}
```

### Leaderboard Settings (LeaderboardSettingsRequest)
All properties match the C# model exactly:

| C# Property | Frontend Property | Type | Default Value |
|-------------|------------------|------|---------------|
| `ShowOverallResults` | `showOverallResults` | `bool` | `false` |
| `ShowCategoryResults` | `showCategoryResults` | `bool` | `false` |
| `ShowGenderResults` | `showGenderResults` | `bool` | `true` |
| `ShowAgeGroupResults` | `showAgeGroupResults` | `bool` | `true` |
| `SortByOverallChipTime` | `sortByOverallChipTime` | `bool` | `false` |
| `SortByOverallGunTime` | `sortByOverallGunTime` | `bool` | `false` |
| `SortByCategoryChipTime` | `sortByCategoryChipTime` | `bool` | `false` |
| `SortByCategoryGunTime` | `sortByCategoryGunTime` | `bool` | `false` |
| `NumberOfResultsToShowOverall` | `numberOfResultsToShowOverall` | `int?` | `10` |
| `NumberOfResultsToShowCategory` | `numberOfResultsToShowCategory` | `int?` | `5` |
| `EnableLiveLeaderboard` | `enableLiveLeaderboard` | `bool` | `true` |
| `ShowSplitTimes` | `showSplitTimes` | `bool` | `true` |
| `ShowPace` | `showPace` | `bool` | `true` |
| `ShowTeamResults` | `showTeamResults` | `bool` | `false` |
| `ShowMedalIcon` | `showMedalIcon` | `bool` | `true` |
| `AllowAnonymousView` | `allowAnonymousView` | `bool` | `true` |
| `AutoRefreshIntervalSec` | `autoRefreshIntervalSec` | `int?` | `30` |
| `MaxDisplayedRecords` | `maxDisplayedRecords` | `int?` | Max of overall/category results |

```typescript
leaderboardSettings: {
    showOverallResults: false,
    showCategoryResults: false,
    showGenderResults: true,           // Always true
    showAgeGroupResults: true,         // Always true
    sortByOverallChipTime: false,
    sortByOverallGunTime: false,
    sortByCategoryChipTime: false,
    sortByCategoryGunTime: false,
    numberOfResultsToShowOverall: 10,  // Separate field for overall results
    numberOfResultsToShowCategory: 5,  // Separate field for category results
    enableLiveLeaderboard: true,       // Default true
    showSplitTimes: true,              // Default true
    showPace: true,                    // Default true
    showTeamResults: false,            // Default false
    showMedalIcon: true,               // Default true
    allowAnonymousView: true,          // Default true
    autoRefreshIntervalSec: 30,        // Default 30 seconds
    maxDisplayedRecords: Math.max(     // Max of the two result counts
        numberOfResultsToShowOverall || 10,
        numberOfResultsToShowCategory || 5
    ),
}
```

## Example API Request Payload

```json
{
    "eventOrganizerId": 12,
    "name": "Mumbai Marathon 2025",
    "slug": "mumbai-marathon-2025",
    "description": "Annual marathon event in Mumbai",
    "eventDate": "2025-12-15T06:00:00Z",
    "timeZone": "Asia/Kolkata",
    "venueName": "Gateway of India",
    "venueAddress": "Mumbai, Maharashtra, India",
    "venueLatitude": null,
    "venueLongitude": null,
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
        "sortByOverallChipTime": true,
        "sortByOverallGunTime": false,
        "sortByCategoryChipTime": true,
        "sortByCategoryGunTime": false,
        "numberOfResultsToShow": 5,
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

## Key Changes Made

### 1. Field Name Correction ✅
- **Before**: `organizationId` (incorrect)
- **After**: `eventOrganizerId` (matches C# model)

### 2. Property Name Casing ✅
- Frontend uses camelCase: `eventOrganizerId`, `venueName`
- C# model uses PascalCase: `EventOrganizerId`, `VenueName`
- Axios will handle JSON serialization correctly

### 3. Data Transformation ✅
- `slug`: Auto-generated from name (e.g., "Mumbai Marathon" → "mumbai-marathon")
- `venueAddress`: Concatenated from city, state, country
- `eventDate`: Mapped from `startDate`
- `registrationDeadline`: Mapped from `registrationCloseDate`

### 4. Type Conversion ✅
```typescript
// Converts string/number to number
let organizationIdForApi: number;
if (apiData.organizationId === "N/A") {
    organizationIdForApi = 1;
} else if (typeof apiData.organizationId === 'string') {
    organizationIdForApi = parseInt(apiData.organizationId, 10);
} else if (typeof apiData.organizationId === 'number') {
    organizationIdForApi = apiData.organizationId;
} else {
    organizationIdForApi = 1; // Default fallback
}
```

## Debug Console Logs

When creating an event, check browser console for:

```javascript
Organization ID being sent to API: 12
Full API Request Payload: { eventOrganizerId: 12, name: "...", ... }
```

## Validation

### Frontend Validation
- Organization must be selected
- Name is required
- Start date is required
- Other required fields validated

### Backend Validation (C# Model)
- `[Required]` attributes on: EventOrganizerId, Name, Slug, EventDate
- `[MaxLength]` validation on string fields
- Model binding will validate before reaching controller

## Troubleshooting

### Issue: EventOrganizerId is 0 or null
**Solution**: Check that dropdown is selecting `org.organizationId` not `org.id`

### Issue: 400 Bad Request - Model validation error
**Solution**: Check console logs for payload, ensure all required fields are present

### Issue: Slug contains spaces
**Solution**: Slug auto-generation replaces spaces with hyphens

### Issue: DateTime format error
**Solution**: Ensure dates are in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)

## Testing Checklist

- [ ] Select organization from dropdown
- [ ] Fill required fields (name, dates, location)
- [ ] Check console: "Organization ID being sent to API: {number}"
- [ ] Check console: "Full API Request Payload" shows correct structure
- [ ] Submit form
- [ ] Verify backend receives `eventOrganizerId` as integer
- [ ] Verify all nested objects (eventSettings, leaderboardSettings) are present

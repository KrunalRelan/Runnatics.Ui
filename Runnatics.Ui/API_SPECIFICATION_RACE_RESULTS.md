# API Specification: Race Results with Participant Checkpoint Data

## Overview
This document specifies the API endpoint and data structure for displaying race results showing participants' checkpoint crossing times, ordered by ranking.

## Current Endpoint (Already Implemented)

### **POST** `/api/participants/{eventId}/{raceId}/search`

**Purpose:** Search and retrieve participants with their checkpoint crossing times

**URL Parameters:**
- `eventId` (string, required): The event identifier
- `raceId` (string, required): The race identifier

**Request Body:**
```json
{
  "pageNumber": 1,
  "pageSize": 1000,
  "sortBy": "bib",
  "sortDirection": "asc",
  "filters": {
    "category": "string (optional)",
    "gender": "string (optional)",
    "status": "string (optional)"
  }
}
```

---

## Current Response Structure (As Returned by API)

### Success Response
**Status Code:** 200 OK

**Current Response Body (ACTUAL):**
```json
{
  "message": [
    {
      "id": "0wWNmsARbJnXoL1MwpCFdw",
      "bib": "1001",
      "firstName": "VIVEK",
      "lastName": "NEGI",
      "fullName": "VIVEK NEGI",
      "email": "negivivek209@gmil.com",
      "phone": "9365559892",
      "gender": "Male",
      "category": "15 to Below 31",
      "status": "Registered",
      "checkedIn": false,
      "chipId": "4180003E9515",
      "checkpointTimes": {
        "Start": null,
        "": "01:02:33",
        "5 KM": "01:27:35",
        "Finish": "01:55:40"
      }
    },
    {
      "id": "UoVZ2X_UiewVRU9HrYfHUw",
      "bib": "1002",
      "firstName": "SHOURYA",
      "lastName": "VIJAY",
      "fullName": "SHOURYA VIJAY",
      "email": "ca.anoopvijay@gmail.com",
      "phone": "7999626763",
      "gender": "Male",
      "category": "15 to Below 31",
      "status": "Registered",
      "checkedIn": false,
      "chipId": "4180003EA4D4",
      "checkpointTimes": {
        "Start": null,
        "": "00:44:01",
        "5 KM": "01:45:31",
        "Finish": "01:02:45"
      }
    },
    {
      "id": "mQS2RdytngnWZQXZ4tz1vg",
      "bib": "1003",
      "firstName": "ADIYOGI",
      "lastName": "SHARMAN",
      "fullName": "ADIYOGI SHARMAN",
      "email": "advocatemugdha@gmail.com",
      "phone": "7087818000",
      "gender": "Male",
      "category": "15 to Below 31",
      "status": "Registered",
      "checkedIn": false,
      "chipId": "4180003EBDEB",
      "checkpointTimes": {
        "Start": null,
        "": null,
        "5 KM": null,
        "Finish": null
      }
    }
  ],
  "totalCount": 595
}
```

---

## Issues with Current API Response

### Problems:
1. **No Ranking Information**: The API does not return `rank` field for participants
2. **Checkpoint Times Format**: Checkpoint times are in a simple key-value object `{ "checkpointName": "time" }` instead of detailed objects
3. **Empty Checkpoint Names**: Some checkpoints have empty string `""` as names
4. **No Split Times**: No split time calculation (time between checkpoints)
5. **No Total Time Calculation**: The "Finish" time is just the crossing time, not the total elapsed time from start
6. **No Status Calculation**: Participants are all marked as "Registered" instead of "Finished", "Running", "DNF", etc.

### Current Frontend Solution (Implemented):
The frontend now handles all calculations client-side:
- **RaceResultsProcessor** class calculates rankings based on finish times
- Converts time strings (HH:MM:SS) to seconds for comparison
- Sorts participants by finish time and assigns ranks
- Calculates checkpoint details including split times
- The UI displays the processed data with rankings

### Recommended Backend Improvements:
For better performance and consistency, the backend should add these fields to the API response:

1. **Add `rank` field** - Overall rank based on finish time
2. **Add `totalTime` field** - Total race time (finish time - start time)
3. **Add `totalTimeSeconds` field** - Total time in seconds for sorting
4. **Fix checkpoint names** - Ensure all checkpoints have proper names (no empty strings)
5. **Calculate split times** - Time between consecutive checkpoints
6. **Update status logic** - Set status to "Finished" / "Running" / "DNF" / "DNS" based on checkpoint data
7. **Add checkpoint rank** - Rank at each checkpoint

---

## Data Fields Explanation (Current Structure)

### Race Info Object
| Field | Type | Description |
|-------|------|-------------|
| `raceId` | string | Unique identifier for the race |
| `eventId` | string | Unique identifier for the event |
| `raceName` | string | Name of the race |
| `raceDistance` | number | Total race distance in kilometers |
| `startTime` | string (ISO 8601) | Race start time |
| `totalParticipants` | number | Total number of participants |
| `finishedParticipants` | number | Number of participants who finished |
| `checkpoints` | array | List of checkpoints in the race (ordered by distance) |

### Checkpoint Object (in raceInfo)
| Field | Type | Description |
|-------|------|-------------|
| `checkpointId` | string | Unique identifier for checkpoint |
| `name` | string | Checkpoint name |
| `distanceFromStart` | number | Distance from start in kilometers |
| `isMandatory` | boolean | Whether checkpoint is mandatory |
| `deviceId` | string | RFID device ID |
| `deviceName` | string | RFID device name |

### Result Object (Participant with checkpoint data)
| Field | Type | Description |
|-------|------|-------------|
| `rank` | number or null | Overall rank (1-based). Null for DNF/DNS |
| `participantId` | string | Unique identifier for participant |
| `bib` | string | Participant bib number |
| `firstName` | string | Participant first name |
| `lastName` | string | Participant last name |
| `fullName` | string | Participant full name |
| `gender` | string | Participant gender (Male/Female/Other) |
| `category` | string | Participant category (e.g., "Elite Men", "Age Group 30-39") |
| `chipId` | string | RFID chip identifier |
| `status` | string | Participant status: "Finished", "Running", "DNF" (Did Not Finish), "DNS" (Did Not Start) |
| `totalTime` | string or null | Total race time in HH:MM:SS format. Null if not finished |
| `totalTimeSeconds` | number or null | Total race time in seconds. Null if not finished |
| `averagePace` | string or null | Average pace per kilometer (MM:SS). Null if not finished |
| `averageSpeed` | number or null | Average speed in km/h. Null if not finished |
| `checkpointTimes` | array | Array of checkpoint crossing data (ordered by checkpoint sequence) |

### Checkpoint Time Object
| Field | Type | Description |
|-------|------|-------------|
| `checkpointId` | string | Checkpoint identifier |
| `checkpointName` | string | Checkpoint name |
| `crossingTime` | string or null | ISO 8601 timestamp when participant crossed. Null if not crossed |
| `timeFromStart` | string or null | Time elapsed from race start (HH:MM:SS). Null if not crossed |
| `timeFromStartSeconds` | number or null | Time elapsed from race start in seconds. Null if not crossed |
| `splitTime` | string or null | Time taken from previous checkpoint (HH:MM:SS). Null if not crossed or first checkpoint |
| `splitTimeSeconds` | number or null | Split time in seconds. Null if not crossed or first checkpoint |
| `distanceFromStart` | number | Checkpoint distance from start in km |
| `rank` | number or null | Participant's rank at this checkpoint. Null if not crossed |
| `passed` | boolean | Whether participant passed this checkpoint |

---

## Business Logic Requirements

### Ranking Calculation
1. **Overall Rank**: Based on finish time (crossing the final checkpoint)
2. **Checkpoint Rank**: Based on time from start at each checkpoint
3. **Tie Breaking**: If two participants have same time, use participant ID or bib number (ascending)
4. **DNF/DNS Handling**: Participants who didn't finish should have `rank: null` in overall results
5. **Missing Checkpoints**: If a participant missed a checkpoint, `passed: false` and all time fields should be `null`

### Time Calculations
1. **Total Time**: Difference between finish checkpoint time and start checkpoint time
2. **Time From Start**: Difference between current checkpoint time and start checkpoint time
3. **Split Time**: Difference between current checkpoint time and previous checkpoint time
4. **Average Pace**: Total time divided by total distance (in minutes per kilometer)
5. **Average Speed**: Total distance divided by total time (in kilometers per hour)

### Data Validation
1. All times should be in ISO 8601 format for `crossingTime`
2. Duration times should be in HH:MM:SS format for display
3. Ensure checkpoints are ordered by `distanceFromStart`
4. Ensure results are ordered by `rank` (nulls at the end)
5. If RFID data shows duplicate readings, use the first crossing time

### Status Logic
- **"Finished"**: Participant crossed the finish line
- **"Running"**: Participant crossed start but not finish (current time < cutoff time)
- **"DNF"**: Participant crossed start but didn't finish (current time > cutoff time OR stopped at checkpoint)
- **"DNS"**: Participant registered but didn't cross start line

---

## Error Responses

### 404 Not Found
```json
{
  "message": "Race not found",
  "totalCount": 0
}
```

### 400 Bad Request
```json
{
  "message": "Invalid eventId or raceId format",
  "totalCount": 0
}
```

### 500 Internal Server Error
```json
{
  "message": "Error calculating race results",
  "totalCount": 0
}
```

---

## Data Source

The API should aggregate data from:
1. **Race table**: Race details (name, distance, start time)
2. **Participants table**: Participant details (bib, name, gender, category, chipId)
3. **Checkpoints table**: Checkpoint configuration (name, distance, device mapping)
4. **RFID readings table**: Raw RFID data uploaded via `/rfid/import-auto` endpoint
   - Match RFID chip readings to participants using `chipId`
   - Match device readings to checkpoints using `deviceId`
   - Calculate all times based on timestamp differences

---

## Frontend Usage

The UI will call this endpoint to display:
1. **Leaderboard Table**: Showing all participants with their ranks and finish times
2. **Detailed View**: Expandable rows showing checkpoint-by-checkpoint breakdown
3. **Live Updates**: Poll this endpoint every 30-60 seconds during active race
4. **Filtering**: Allow users to filter by category, gender, or show only finishers

### Frontend Service Method (TypeScript)
```typescript
// Add to RaceService.ts
static async getRaceResults(
  eventId: string,
  raceId: string,
  filters?: {
    category?: string;
    gender?: string;
    top?: number;
    includeIncomplete?: boolean;
  }
): Promise<ResponseBase<RaceResultsResponse>> {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.gender) queryParams.append('gender', filters.gender);
  if (filters?.top) queryParams.append('top', filters.top.toString());
  if (filters?.includeIncomplete !== undefined) {
    queryParams.append('includeIncomplete', filters.includeIncomplete.toString());
  }

  const url = `${ServiceUrl.getRaceResults(eventId, raceId)}?${queryParams.toString()}`;
  const response = await apiClient.get<ResponseBase<RaceResultsResponse>>(url);
  return response.data;
}
```

---

## Notes for Backend Team

1. **Performance**: This endpoint may be called frequently during live races. Consider caching results for 30-60 seconds.
2. **RFID Data**: Ensure RFID readings table has proper indexes on `chipId`, `deviceId`, and `timestamp` columns.
3. **Missing Data**: Handle cases where:
   - Participant has no RFID chip assigned
   - RFID reader missed a crossing
   - Multiple readings for same checkpoint (take first/last based on business rules)
4. **Time Zones**: All times should be returned in UTC (ISO 8601 format with Z suffix)
5. **Pagination**: If race has >1000 participants, consider adding pagination support
6. **Real-time Updates**: Consider implementing WebSocket or Server-Sent Events for live race updates

---

## Testing Checklist

- [ ] Participant finished all checkpoints - verify all times calculated correctly
- [ ] Participant DNF at checkpoint - verify nulls after DNF point
- [ ] Participant DNS - verify all checkpoint times are null
- [ ] Multiple participants with same finish time - verify tie-breaking
- [ ] Missing RFID reading at a checkpoint - verify `passed: false`
- [ ] Race with no finishers yet - verify empty results or "Running" status
- [ ] Invalid eventId/raceId - verify 404 error
- [ ] Filter by category - verify only that category returned
- [ ] Filter by gender - verify only that gender returned
- [ ] Top N results - verify limited results returned

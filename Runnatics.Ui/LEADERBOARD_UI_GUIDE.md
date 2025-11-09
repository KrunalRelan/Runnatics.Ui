# Leaderboard Settings - UI Visual Guide

## Before & After Comparison

### BEFORE: Single Shared Field
```
┌─────────────────────────────────────────────────────────────────┐
│                     Leaderboard Settings                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐   ┌────────────────────────┐       │
│  │ Overall Results        │   │ Category Results       │       │
│  │  ☑ Show Results        │   │  ☑ Show Results        │       │
│  │  ☑ Chip Time           │   │  ☑ Chip Time           │       │
│  │  ☐ Gun Time            │   │  ☐ Gun Time            │       │
│  └────────────────────────┘   └────────────────────────┘       │
│                                                                  │
│              ┌──────────────────────────────┐                   │
│              │ Number of Results to Show    │                   │
│              │ [        5        ]          │                   │
│              │ Applies to both Overall and  │                   │
│              │ Category results             │                   │
│              └──────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```
**Problem:** Same number applies to both Overall and Category results.

---

### AFTER: Separate Fields for Each Type
```
┌─────────────────────────────────────────────────────────────────┐
│                     Leaderboard Settings                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐   ┌────────────────────────┐       │
│  │ Overall Results        │   │ Category Results       │       │
│  │  ☑ Show Results        │   │  ☑ Show Results        │       │
│  │  ☑ Chip Time           │   │  ☑ Chip Time           │       │
│  │  ☐ Gun Time            │   │  ☐ Gun Time            │       │
│  └────────────────────────┘   └────────────────────────┘       │
│                                                                  │
│  ┌────────────────────────┐   ┌────────────────────────┐       │
│  │ Overall Results to     │   │ Category Results to    │       │
│  │ Show                   │   │ Show                   │       │
│  │ [       10       ]     │   │ [        5       ]     │       │
│  │ Number of overall      │   │ Number of category     │       │
│  │ results to display     │   │ results to display     │       │
│  └────────────────────────┘   └────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```
**Improvement:** Independent control for Overall (10) and Category (5) results.

---

## Responsive Behavior

### Desktop (≥ 960px)
```
┌──────────────────────────┬──────────────────────────┐
│ Overall Results          │ Category Results         │
│  ☑ Show Results          │  ☑ Show Results          │
│  ☑ Chip Time             │  ☑ Chip Time             │
│  ☐ Gun Time              │  ☐ Gun Time              │
├──────────────────────────┼──────────────────────────┤
│ Overall Results to Show  │ Category Results to Show │
│ [       10       ]       │ [        5       ]       │
└──────────────────────────┴──────────────────────────┘
```

### Mobile (< 960px)
```
┌──────────────────────────┐
│ Overall Results          │
│  ☑ Show Results          │
│  ☑ Chip Time             │
│  ☐ Gun Time              │
├──────────────────────────┤
│ Overall Results to Show  │
│ [       10       ]       │
└──────────────────────────┘

┌──────────────────────────┐
│ Category Results         │
│  ☑ Show Results          │
│  ☑ Chip Time             │
│  ☐ Gun Time              │
├──────────────────────────┤
│ Category Results to Show │
│ [        5       ]       │
└──────────────────────────┘
```

---

## Dynamic Display Logic

### Scenario 1: Only Overall Results Enabled
```
┌────────────────────────┐
│ Overall Results        │
│  ☑ Show Results        │
│  ☑ Chip Time           │
│  ☐ Gun Time            │
├────────────────────────┤
│ Overall Results to     │
│ Show: [    10    ]     │
└────────────────────────┘
```
*Category input field is hidden*

### Scenario 2: Only Category Results Enabled
```
┌────────────────────────┐
│ Category Results       │
│  ☑ Show Results        │
│  ☑ Chip Time           │
│  ☐ Gun Time            │
├────────────────────────┤
│ Category Results to    │
│ Show: [     5    ]     │
└────────────────────────┘
```
*Overall input field is hidden*

### Scenario 3: Both Enabled
```
┌────────────────────┬────────────────────┐
│ Overall            │ Category           │
│  ☑ Show Results    │  ☑ Show Results    │
│  [    10    ]      │  [     5    ]      │
└────────────────────┴────────────────────┘
```
*Both fields visible side-by-side (desktop) or stacked (mobile)*

### Scenario 4: Both Disabled
```
┌────────────────────┬────────────────────┐
│ Overall            │ Category           │
│  ☐ Show Results    │  ☐ Show Results    │
└────────────────────┴────────────────────┘
```
*No input fields shown*

---

## Field Properties

### Overall Results to Show
- **Label:** "Overall Results to Show"
- **Type:** Number input
- **Default Value:** 10
- **Min Value:** 1
- **Step:** 1
- **Helper Text:** "Number of overall results to display"
- **Visibility:** Shown only when `ShowOverallResults = true`

### Category Results to Show
- **Label:** "Category Results to Show"
- **Type:** Number input
- **Default Value:** 5
- **Min Value:** 1
- **Step:** 1
- **Helper Text:** "Number of category results to display"
- **Visibility:** Shown only when `ShowCategoryResults = true`

---

## API Payload Example

```json
{
  "eventOrganizerId": 1,
  "name": "Marathon 2024",
  "leaderboardSettings": {
    "showOverallResults": true,
    "showCategoryResults": true,
    "numberOfResultsToShowOverall": 10,
    "numberOfResultsToShowCategory": 5,
    "sortByOverallChipTime": true,
    "sortByCategoryChipTime": true,
    "maxDisplayedRecords": 10
  }
}
```

**Note:** `maxDisplayedRecords` is automatically set to `Math.max(10, 5) = 10`

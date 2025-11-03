# Leaderboard Settings - Logic Flow Diagram

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LEADERBOARD SETTINGS                               │
├─────────────────────────────────────┬───────────────────────────────────────┤
│         OVERALL RESULTS             │         CATEGORY RESULTS              │
├─────────────────────────────────────┼───────────────────────────────────────┤
│                                     │                                       │
│  ☑ Show Overall Results             │  ☑ Show Category Results              │
│     (Independent Toggle)            │     (Independent Toggle)              │
│                                     │                                       │
│  ─────────────────────────          │  ─────────────────────────            │
│  Overall Result Sort By             │  Category Result Sort By              │
│                                     │                                       │
│  ☑ Chip Time  ◯ Gun Time            │  ☑ Chip Time  ◯ Gun Time              │
│     └─────────────┘                 │     └─────────────┘                   │
│   (Mutually Exclusive)              │   (Mutually Exclusive)                │
│                                     │                                       │
│   [Disabled if parent OFF]          │   [Disabled if parent OFF]            │
│                                     │                                       │
│                                     │  ─────────────────────────            │
│                                     │  Number of Results to Show            │
│                                     │  [    5    ]                          │
│                                     │  (Applies to both Overall & Category) │
│                                     │  [Visible when at least one is ON]    │
└─────────────────────────────────────┴───────────────────────────────────────┘
```

## State Flow Diagrams

### 1. Overall Results Toggle Flow

```
┌──────────────────────┐
│ ShowOverallResults   │
│    Toggle Clicked    │
└──────────┬───────────┘
           │
           ├─── OFF → ON
           │      │
           │      ├─ Check: Are both time types OFF?
           │      │     │
           │      │     ├─ YES → Auto-enable Chip Time
           │      │     │         Gun Time stays OFF
           │      │     │
           │      │     └─ NO  → Keep existing selection
           │      │
           │      └─ Enable time type switches
           │
           └─── ON → OFF
                  │
                  └─ Disable both time type switches
                     (Keep their values intact)
```

### 2. Time Type Selection Flow (Mutual Exclusion)

```
┌──────────────────────────┐
│  User Clicks Chip Time   │
│  (Currently OFF)         │
└──────────┬───────────────┘
           │
           ├─ Check: Is parent toggle ON?
           │     │
           │     ├─ YES → 
           │     │    ├─ Set Chip Time = TRUE
           │     │    └─ Set Gun Time = FALSE
           │     │
           │     └─ NO → Do Nothing (Disabled)
           │
           └─ Update State

┌──────────────────────────┐
│  User Clicks Gun Time    │
│  (Currently OFF)         │
└──────────┬───────────────┘
           │
           ├─ Check: Is parent toggle ON?
           │     │
           │     ├─ YES → 
           │     │    ├─ Set Gun Time = TRUE
           │     │    └─ Set Chip Time = FALSE
           │     │
           │     └─ NO → Do Nothing (Disabled)
           │
           └─ Update State
```

### 3. Number of Results Visibility Flow

```
┌───────────────────────────────┐
│  Check Result Toggles         │
└───────────┬───────────────────┘
            │
            ├─ ShowOverallResults = ON?
            │           OR
            │  ShowCategoryResults = ON?
            │
            ├─── YES → Show "Number of Results" Input
            │          - Allow user to edit
            │          - Default: 5
            │          - Min: 1
            │
            └─── NO  → Hide "Number of Results" Input
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component State Layer                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  leaderBoardSettings (useState)                                 │
│  ├─ ShowOverallResults: boolean                                 │
│  ├─ ShowCategoryResults: boolean                                │
│  ├─ OverAllResultChipTime: boolean                              │
│  ├─ OverallResultGunTime: boolean                               │
│  ├─ CategoryResultChipTime: boolean                             │
│  ├─ CategoryResultGunTime: boolean                              │
│  └─ NumberOfResultsToShow: number                               │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ useEffect Sync
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Form Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  formData.leaderBoardSettings                                   │
│  (Automatically synced with leaderBoardSettings state)          │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Form Submission
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EventService.createEvent(formData)                             │
│  └─ Sends complete leaderBoardSettings to backend               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Interaction Examples

### Example 1: Initial State
```
Overall Results: ☑ ON
├─ Chip Time: ☑ ON
└─ Gun Time:  ☐ OFF

Category Results: ☑ ON
├─ Chip Time: ☑ ON
└─ Gun Time:  ☐ OFF

Number of Results: [5] (Visible)
```

### Example 2: User Switches to Gun Time (Overall)
```
User Action: Click "Gun Time" switch for Overall

Before:
├─ Chip Time: ☑ ON
└─ Gun Time:  ☐ OFF

After:
├─ Chip Time: ☐ OFF  ← Automatically turned OFF
└─ Gun Time:  ☑ ON   ← Turned ON by user
```

### Example 3: User Disables Overall Results
```
User Action: Turn OFF "Show Overall Results"

Before:
Overall Results: ☑ ON
├─ Chip Time: ☑ ON (Enabled)
└─ Gun Time:  ☐ OFF (Enabled)

After:
Overall Results: ☐ OFF
├─ Chip Time: ☑ ON (Disabled, grayed out)
└─ Gun Time:  ☐ OFF (Disabled, grayed out)
```

### Example 4: User Disables Both Result Types
```
User Actions: 
1. Turn OFF "Show Overall Results"
2. Turn OFF "Show Category Results"

Result:
├─ Overall: OFF
├─ Category: OFF
└─ Number of Results Input: HIDDEN
```

### Example 5: User Re-enables with No Selection
```
State Before:
├─ ShowOverallResults: OFF
├─ OverAllResultChipTime: OFF
└─ OverallResultGunTime: OFF

User Action: Turn ON "Show Overall Results"

State After:
├─ ShowOverallResults: ON
├─ OverAllResultChipTime: ON  ← Auto-enabled
└─ OverallResultGunTime: OFF
```

## Code-to-UI Mapping

| State Property           | UI Element                    | Location        |
|-------------------------|-------------------------------|-----------------|
| ShowOverallResults      | Switch: "Show Overall Results" | Left Column     |
| ShowCategoryResults     | Switch: "Show Category Results"| Right Column    |
| OverAllResultChipTime   | Switch: "Chip Time"           | Left Column     |
| OverallResultGunTime    | Switch: "Gun Time"            | Left Column     |
| CategoryResultChipTime  | Switch: "Chip Time"           | Right Column    |
| CategoryResultGunTime   | Switch: "Gun Time"            | Right Column    |
| NumberOfResultsToShow   | TextField: Number Input       | Right Column    |

## Validation Rules

```
┌─────────────────────────────────────────────┐
│         Validation Checkpoints              │
├─────────────────────────────────────────────┤
│                                             │
│  ✓ At least one time type selected         │
│    when result toggle is ON                 │
│                                             │
│  ✓ Only one time type active at a time     │
│    (mutual exclusion enforced)              │
│                                             │
│  ✓ Number of results >= 1                  │
│    (enforced by input constraints)          │
│                                             │
│  ✓ State synced with formData              │
│    (automatic via useEffect)                │
│                                             │
└─────────────────────────────────────────────┘
```

## Summary

This leaderboard settings implementation ensures:
- ✅ Clear visual hierarchy
- ✅ Logical grouping of related controls
- ✅ Automatic constraint enforcement
- ✅ User-friendly mutual exclusion
- ✅ Responsive feedback for disabled states
- ✅ Seamless state management
- ✅ API-ready data structure

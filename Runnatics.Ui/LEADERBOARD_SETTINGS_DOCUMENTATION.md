# Leaderboard Settings - Implementation Documentation

## Overview
The Leaderboard Settings section in the CreateEvent form provides comprehensive controls for configuring how event results are displayed. This document outlines all the business logic, interactions, and constraints implemented.

## Data Structure

### LeaderBoardSettings Interface
```typescript
interface LeaderBoardSettings {
    ShowOverallResults?: boolean;
    ShowCategoryResults?: boolean;
    OverAllResultChipTime?: boolean;
    CategoryResultChipTime?: boolean;
    OverallResultGunTime?: boolean;
    CategoryResultGunTime?: boolean;
    NumberOfResultsToShow?: number;
}
```

## Default Values
```typescript
{
    ShowOverallResults: true,
    ShowCategoryResults: true,
    OverAllResultChipTime: true,
    CategoryResultChipTime: true,
    OverallResultGunTime: false,
    CategoryResultGunTime: false,
    NumberOfResultsToShow: 5
}
```

## Business Logic & Rules

### 1. **Result Display Toggles**

#### Overall Results
- **Control**: `ShowOverallResults` (Switch)
- **Behavior**: 
  - Can be toggled on/off independently
  - When enabled, controls the visibility of overall race results
  - When disabled, all related sub-settings are disabled

#### Category Results
- **Control**: `ShowCategoryResults` (Switch)
- **Behavior**: 
  - Can be toggled on/off independently
  - When enabled, controls the visibility of category-based results
  - When disabled, all related sub-settings are disabled

### 2. **Time Type Selection (Mutual Exclusion)**

Both Overall and Category results have their own independent time type selection:

#### Overall Result Sort By
- **Controls**: 
  - `OverAllResultChipTime` (Switch)
  - `OverallResultGunTime` (Switch)

#### Category Result Sort By
- **Controls**: 
  - `CategoryResultChipTime` (Switch)
  - `CategoryResultGunTime` (Switch)

#### Mutual Exclusion Logic
- **Only one time type can be active at a time** for each result category
- When one switch is turned ON, the other is automatically turned OFF
- Switches are disabled when their parent result toggle is OFF
- **Auto-enable behavior**: When a result toggle is turned ON and no time type is selected, Chip Time is automatically enabled

#### Implementation Details
```typescript
// For Overall Results - Chip Time
onChange={(e) => {
  if (e.target.checked) {
    setLeaderBoardSettings(prev => ({ 
      ...prev, 
      OverAllResultChipTime: true,
      OverallResultGunTime: false  // Mutual exclusion
    }));
  }
}}

// For Overall Results - Gun Time
onChange={(e) => {
  if (e.target.checked) {
    setLeaderBoardSettings(prev => ({ 
      ...prev, 
      OverallResultGunTime: true,
      OverAllResultChipTime: false  // Mutual exclusion
    }));
  }
}}
```

### 3. **Number of Results to Show**

- **Control**: `NumberOfResultsToShow` (TextField - number input)
- **Visibility**: Shown when at least one result type (Overall OR Category) is enabled
- **Applies to**: Both Overall and Category results (shared setting)
- **Default**: 5
- **Constraints**: 
  - Minimum value: 1
  - Must be a positive integer
  - If invalid input, defaults back to 5
- **Helper Text**: "Applies to both Overall and Category results"

### 4. **Dependent Control States**

#### When ShowOverallResults is OFF:
- Overall Chip Time switch is **disabled**
- Overall Gun Time switch is **disabled**
- Sort By label appears with **reduced opacity (0.5)**

#### When ShowCategoryResults is OFF:
- Category Chip Time switch is **disabled**
- Category Gun Time switch is **disabled**
- Sort By label appears with **reduced opacity (0.5)**

#### When Both Result Toggles are OFF:
- Number of Results input is **hidden**

### 5. **State Synchronization**

The leaderboard settings are automatically synchronized with the form data via useEffect:

```typescript
useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    eventSettings,
    leaderBoardSettings,  // Synced here
  }));
}, [eventSettings, leaderBoardSettings]);
```

This ensures that:
- Any change to `leaderBoardSettings` is immediately reflected in `formData`
- The API receives the latest settings when the form is submitted

## UI Layout

The Leaderboard Settings section is organized in a two-column responsive layout:

### Left Column: Overall Results
1. Show Overall Results toggle
2. "Overall Result Sort By" label
3. Chip Time switch
4. Gun Time switch

### Right Column: Category Results
1. Show Category Results toggle
2. "Category Result Sort By" label
3. Chip Time switch
4. Gun Time switch
5. Number of Results to Show input (when visible)

### Responsive Behavior
- On desktop (md+): Two columns side by side
- On mobile (xs): Stacks vertically

## Edge Cases Handled

1. **Auto-enable First Option**: When a result toggle is enabled and both time types are off, Chip Time is automatically enabled
2. **Prevent Both Off**: The mutual exclusion logic only allows switching between options, never turning both off
3. **Invalid Number Input**: Defaults to 5 if user enters invalid number
4. **Visual Feedback**: Disabled state with reduced opacity clearly indicates unavailable options
5. **Shared Setting Visibility**: Number of results only appears when relevant

## Testing Scenarios

### Scenario 1: Toggle Overall Results
1. Turn OFF Show Overall Results
2. ✓ Both time type switches should be disabled
3. ✓ Sort By label should appear dimmed (opacity 0.5)

### Scenario 2: Switch Time Types (Overall)
1. Ensure Show Overall Results is ON
2. Chip Time is ON, Gun Time is OFF
3. Click Gun Time switch
4. ✓ Gun Time should turn ON
5. ✓ Chip Time should automatically turn OFF

### Scenario 3: Switch Time Types (Category)
1. Ensure Show Category Results is ON
2. Chip Time is ON, Gun Time is OFF
3. Click Gun Time switch
4. ✓ Gun Time should turn ON
5. ✓ Chip Time should automatically turn OFF

### Scenario 4: Number of Results Input
1. Turn OFF both Show Overall Results and Show Category Results
2. ✓ Number of Results input should be hidden
3. Turn ON Show Overall Results
4. ✓ Number of Results input should appear
5. Change value to 10
6. ✓ Value should update in both UI and state

### Scenario 5: Enable with No Selection
1. Set both Chip Time and Gun Time to false (edge case)
2. Turn ON Show Overall Results
3. ✓ Chip Time should automatically enable
4. ✓ Gun Time should remain OFF

### Scenario 6: Form Submission
1. Configure all leaderboard settings
2. Submit the form
3. ✓ All settings should be included in the API payload
4. ✓ Settings should match the UI state

## Integration with Form Submission

When the form is submitted:
1. The `leaderBoardSettings` state is already synced with `formData`
2. The entire `formData` object (including leaderboard settings) is sent to the API via `EventService.createEvent(formData)`
3. No additional transformation is needed

## Future Enhancements

Potential improvements for future iterations:

1. **Preset Configurations**: Add quick-select buttons for common configurations
2. **Preview**: Show a mock leaderboard preview based on current settings
3. **Validation Warning**: Alert if no result types are enabled before submission
4. **Time Type Info**: Add tooltips explaining the difference between Chip Time and Gun Time
5. **Advanced Settings**: Add more granular controls (e.g., separate number of results for Overall vs Category)
6. **Conditional Logic**: Allow different settings per race category or distance

## Code Location

- **Main Component**: `/src/main/src/pages/admin/events/CreateEvent.tsx`
- **Interface**: `/src/main/src/models/LeaderBoardSettings.ts`
- **State Management**: Lines 48-66 in CreateEvent.tsx
- **UI Implementation**: Lines 820-925 in CreateEvent.tsx
- **State Sync**: Lines 117-123 in CreateEvent.tsx

## Summary

The Leaderboard Settings implementation provides:
- ✅ Independent control over Overall and Category results
- ✅ Mutual exclusion between Chip Time and Gun Time for each result type
- ✅ Automatic enabling of Chip Time when result toggle is activated
- ✅ Disabled state management with visual feedback
- ✅ Shared number of results configuration
- ✅ Responsive two-column layout
- ✅ Automatic state synchronization with form data
- ✅ Clean, maintainable code with proper TypeScript typing

All business logic rules are enforced at the UI level, ensuring data consistency before submission.

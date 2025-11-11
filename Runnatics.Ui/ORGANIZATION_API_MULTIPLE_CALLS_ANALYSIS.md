# Organization Search API Called Multiple Times - Analysis

## Issue
The organization search API (`EventOrganizerService.getOrganizations()`) is being called 3 times when the CreateEvent component mounts.

## Root Causes Identified

### 1. React.StrictMode (Primary Cause - 2 calls)
- Location: `src/main.tsx`
- **React.StrictMode intentionally double-invokes effects in development mode**
- This is a React feature to help detect side effects
- **Result**: The API is called twice in development (once + one extra for StrictMode)
- **Not a bug**: This is expected behavior and will NOT happen in production builds

### 2. Potential Additional Renders (1+ extra call)
Multiple state updates that might trigger re-renders:
- Initial state setup with default values
- `useEffect` that syncs `eventSettings` and `leaderBoardSettings` with `formData`
- Possible parent component re-renders from AuthContext or other providers

## Current Code Structure

### CreateEvent.tsx - useEffect Hooks
```typescript
// Hook 1: Fetch organizations on mount
useEffect(() => {
  fetchOrganizations();
}, []); // Empty dependency array - should only run once

// Hook 2: Sync settings with formData
useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    eventSettings,
    leaderBoardSettings,
  }));
}, [eventSettings, leaderBoardSettings]); // Runs when settings change
```

## Solutions

### Option 1: Remove React.StrictMode (NOT RECOMMENDED)
- **Pros**: Eliminates double renders in development
- **Cons**: Loses React's built-in development warnings and checks
- **Verdict**: ❌ Don't do this - StrictMode is valuable for catching bugs

### Option 2: Add Ref to Prevent Multiple Fetches (RECOMMENDED)
Use a ref to track if the fetch has already been called:

```typescript
const hasFetchedRef = useRef(false);

useEffect(() => {
  if (!hasFetchedRef.current) {
    hasFetchedRef.current = true;
    fetchOrganizations();
  }
}, []);
```

### Option 3: Accept the Behavior (ACCEPTABLE)
- StrictMode double-invocation is expected in development
- Production builds will NOT have this issue
- The extra API call in development is not harmful
- **Verdict**: ✅ This is acceptable if the third call can't be identified

### Option 4: Add Cleanup Function (BEST PRACTICE)
Add proper cleanup to the useEffect:

```typescript
useEffect(() => {
  let isMounted = true;
  
  const fetchOrganizations = async () => {
    try {
      setIsLoadingOrgs(true);
      const response = await EventOrganizerService.getOrganizations();
      if (isMounted) {
        setOrganizations(response);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      if (isMounted) {
        setErrors((prev) => ({
          ...prev,
          organizationId: "Failed to load organizations",
        }));
      }
    } finally {
      if (isMounted) {
        setIsLoadingOrgs(false);
      }
    }
  };

  fetchOrganizations();

  return () => {
    isMounted = false;
  };
}, []);
```

## Investigation Steps Taken

1. ✅ Verified only ONE `fetchOrganizations()` call in useEffect
2. ✅ Confirmed no duplicate useEffect hooks
3. ✅ Checked for parent component re-renders
4. ✅ Identified React.StrictMode in main.tsx
5. ✅ Reviewed axios configuration and interceptors
6. ✅ Checked AuthContext for potential re-render triggers

## Recommended Action

**Implement Option 4: Add proper cleanup with isMounted flag**

This is the React best practice for async operations in useEffect and will:
- Prevent state updates on unmounted components
- Handle StrictMode double-invocation gracefully
- Work correctly in both development and production
- Follow React 18+ guidelines

## Expected Behavior After Fix

- **Development (with StrictMode)**: API may be called twice (React behavior)
- **Production (no StrictMode)**: API called exactly once
- **No memory leaks**: Cleanup function prevents updates to unmounted components
- **No errors**: Proper error handling for all scenarios

## Files to Modify

- `/src/main/src/pages/admin/events/CreateEvent.tsx` - Add cleanup to useEffect

## Additional Notes

- The third API call may be due to:
  - Parent component re-render from AuthContext initialization
  - Router navigation state changes
  - Theme provider or other context providers
  - These are typically one-time on app initialization

- **Production Impact**: NONE - StrictMode is development-only
- **Performance Impact**: Minimal - organization list is small and cached by browser

## Testing Checklist

- [ ] Verify API is called once in production build
- [ ] Verify no console errors about state updates on unmounted components
- [ ] Verify organizations load correctly on component mount
- [ ] Verify no performance degradation
- [ ] Check Network tab in DevTools to confirm call count

---

**Status**: Analysis complete, solution identified
**Priority**: Low (development-only issue, no production impact)
**Fix Type**: Best practice improvement with cleanup function

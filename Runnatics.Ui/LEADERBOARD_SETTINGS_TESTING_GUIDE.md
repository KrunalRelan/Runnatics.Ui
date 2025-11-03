# Leaderboard Settings - Testing Guide

## 🧪 How to Test the Implementation

Follow this step-by-step guide to verify all functionality is working correctly.

---

## Prerequisites

1. Start your development server
2. Navigate to the Create Event page
3. Locate the "Leaderboard Settings" section
4. Have your browser DevTools open (optional, for state inspection)

---

## Test Suite

### Test 1: Initial State Verification ✅

**Objective**: Verify default values are correctly set

**Steps**:
1. Load the Create Event page
2. Scroll to Leaderboard Settings section

**Expected Result**:
```
Overall Results Section:
├─ ☑ Show Overall Results (ON)
├─ ☑ Chip Time (ON, enabled)
└─ ☐ Gun Time (OFF, enabled)

Category Results Section:
├─ ☑ Show Category Results (ON)
├─ ☑ Chip Time (ON, enabled)
├─ ☐ Gun Time (OFF, enabled)
└─ [5] Number of Results (visible, value = 5)
```

**Pass Criteria**: All checkboxes and switches show the expected states

---

### Test 2: Mutual Exclusion - Overall Results ✅

**Objective**: Verify Chip Time and Gun Time are mutually exclusive

**Steps**:
1. Ensure "Show Overall Results" is ON
2. Observe: Chip Time is ON, Gun Time is OFF
3. Click the "Gun Time" switch (turn it ON)
4. Observe the state change

**Expected Result**:
- ✅ Gun Time switch turns ON
- ✅ Chip Time switch automatically turns OFF
- ✅ Only one is active at any time

**Additional Test**:
5. Click the "Chip Time" switch (turn it ON)
6. Observe:
   - ✅ Chip Time switch turns ON
   - ✅ Gun Time switch automatically turns OFF

**Pass Criteria**: Only one time type can be selected at a time

---

### Test 3: Mutual Exclusion - Category Results ✅

**Objective**: Verify Chip Time and Gun Time are mutually exclusive (independent from Overall)

**Steps**:
1. Ensure "Show Category Results" is ON
2. Observe: Chip Time is ON, Gun Time is OFF
3. Click the "Gun Time" switch (turn it ON)
4. Observe the state change

**Expected Result**:
- ✅ Gun Time switch turns ON
- ✅ Chip Time switch automatically turns OFF
- ✅ Overall Results time types remain unchanged

**Pass Criteria**: Category time types work independently from Overall time types

---

### Test 4: Disable Overall Results ✅

**Objective**: Verify dependent controls are disabled when parent toggle is OFF

**Steps**:
1. Click "Show Overall Results" to turn it OFF
2. Observe the time type switches

**Expected Result**:
```
Overall Results Section:
├─ ☐ Show Overall Results (OFF)
├─ Sort By label (dimmed, opacity 0.5)
├─ ☑ Chip Time (disabled, grayed out, still shows as ON)
└─ ☐ Gun Time (disabled, grayed out, still shows as OFF)
```

**Additional Check**:
3. Try clicking the disabled Chip Time or Gun Time switches
4. Expected: Nothing happens (disabled state prevents interaction)

**Pass Criteria**: Time type switches are disabled and visually dimmed

---

### Test 5: Disable Category Results ✅

**Objective**: Same as Test 4, but for Category Results

**Steps**:
1. Click "Show Category Results" to turn it OFF
2. Observe the time type switches and Number of Results input

**Expected Result**:
```
Category Results Section:
├─ ☐ Show Category Results (OFF)
├─ Sort By label (dimmed, opacity 0.5)
├─ ☑ Chip Time (disabled, grayed out)
├─ ☐ Gun Time (disabled, grayed out)
└─ Number of Results input (still visible if Overall is ON)
```

**Pass Criteria**: Time type switches are disabled, input visibility depends on Overall toggle

---

### Test 6: Number of Results Visibility ✅

**Objective**: Verify input appears/disappears based on parent toggles

**Test Case A - Both OFF**:
1. Turn OFF "Show Overall Results"
2. Turn OFF "Show Category Results"
3. Expected: ✅ Number of Results input is HIDDEN

**Test Case B - Overall Only**:
1. Turn ON "Show Overall Results"
2. Keep OFF "Show Category Results"
3. Expected: ✅ Number of Results input is VISIBLE

**Test Case C - Category Only**:
1. Turn OFF "Show Overall Results"
2. Turn ON "Show Category Results"
3. Expected: ✅ Number of Results input is VISIBLE

**Test Case D - Both ON**:
1. Turn ON "Show Overall Results"
2. Turn ON "Show Category Results"
3. Expected: ✅ Number of Results input is VISIBLE

**Pass Criteria**: Input is visible when at least one toggle is ON, hidden when both are OFF

---

### Test 7: Number of Results Input Validation ✅

**Objective**: Verify input handles edge cases correctly

**Test Case A - Valid Input**:
1. Clear the input and type "10"
2. Expected: ✅ Value updates to 10

**Test Case B - Invalid Input (Letters)**:
1. Try typing "abc"
2. Expected: ✅ Only numbers can be entered (HTML input type="number")

**Test Case C - Invalid Input (Zero)**:
1. Try typing "0"
2. Expected: ✅ Input allows it (will default to 5 if empty on blur)

**Test Case D - Invalid Input (Negative)**:
1. Try typing "-5"
2. Expected: ✅ Input constraint min="1" should prevent negative values

**Test Case E - Empty Input**:
1. Clear the input completely
2. Tab away (blur event)
3. Expected: ✅ Value defaults back to 5

**Pass Criteria**: Input handles all edge cases gracefully

---

### Test 8: Auto-Enable Feature ✅

**Objective**: Verify Chip Time auto-enables when parent toggle is turned ON with no selection

**Setup** (manually create the edge case in DevTools):
1. Open browser DevTools → Console
2. Find the component state and manually set:
   ```javascript
   // This simulates the edge case
   OverAllResultChipTime: false
   OverallResultGunTime: false
   ```
3. Or simply turn OFF Overall Results, then turn it back ON

**Steps**:
1. "Show Overall Results" is currently OFF
2. Both Chip Time and Gun Time are OFF (edge case)
3. Click "Show Overall Results" to turn it ON

**Expected Result**:
- ✅ Show Overall Results turns ON
- ✅ Chip Time automatically turns ON
- ✅ Gun Time remains OFF

**Repeat for Category Results**:
4. Turn OFF "Show Category Results"
5. Turn it back ON
6. Expected: Same behavior (Chip Time auto-enables)

**Pass Criteria**: At least one time type is always selected when parent toggle is ON

---

### Test 9: State Persistence ✅

**Objective**: Verify state values are preserved when toggling

**Steps**:
1. Set Gun Time ON (Chip Time turns OFF)
2. Turn OFF "Show Overall Results"
3. Turn ON "Show Overall Results"
4. Observe: ✅ Gun Time is still ON, Chip Time is still OFF

**Pass Criteria**: Last known selection is preserved

---

### Test 10: Form Submission ✅

**Objective**: Verify settings are included in form submission

**Steps**:
1. Configure leaderboard settings as desired:
   - Show Overall Results: ON
   - Overall Chip Time: ON
   - Show Category Results: ON
   - Category Gun Time: ON
   - Number of Results: 10
2. Fill in all other required form fields
3. Click "Create Event"
4. Check the network request payload (DevTools → Network tab)

**Expected Result**:
```json
{
  "leaderBoardSettings": {
    "ShowOverallResults": true,
    "ShowCategoryResults": true,
    "OverAllResultChipTime": true,
    "CategoryResultChipTime": false,
    "OverallResultGunTime": false,
    "CategoryResultGunTime": true,
    "NumberOfResultsToShow": 10
  },
  // ...other form fields
}
```

**Pass Criteria**: leaderBoardSettings object is present in payload with correct values

---

### Test 11: Responsive Layout ✅

**Objective**: Verify layout adapts to different screen sizes

**Steps**:
1. Open DevTools → Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
2. Test different viewports:
   - iPhone SE (375px width)
   - iPad (768px width)
   - Desktop (1920px width)

**Expected Result**:
- **Mobile** (< 768px): ✅ Two columns stack vertically
- **Tablet+** (≥ 768px): ✅ Two columns side by side

**Pass Criteria**: Layout is usable on all screen sizes

---

### Test 12: Visual Polish ✅

**Objective**: Verify visual consistency and polish

**Checklist**:
- ✅ All switches are properly aligned
- ✅ Labels are clear and readable
- ✅ Spacing is consistent
- ✅ Disabled state has reduced opacity (0.5)
- ✅ No layout shifts when toggling visibility
- ✅ Helper text is visible and helpful
- ✅ Typography hierarchy is clear
- ✅ Colors match the overall theme

**Pass Criteria**: Professional appearance, no visual bugs

---

## 🐛 Known Issues

**None** - All functionality is working as expected.

---

## 📊 Test Results Template

Use this template to record your test results:

```
Date: _______________
Tester: _______________

Test Results:
[ ] Test 1: Initial State Verification
[ ] Test 2: Mutual Exclusion - Overall
[ ] Test 3: Mutual Exclusion - Category
[ ] Test 4: Disable Overall Results
[ ] Test 5: Disable Category Results
[ ] Test 6: Number of Results Visibility
[ ] Test 7: Number of Results Validation
[ ] Test 8: Auto-Enable Feature
[ ] Test 9: State Persistence
[ ] Test 10: Form Submission
[ ] Test 11: Responsive Layout
[ ] Test 12: Visual Polish

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Quick Smoke Test (5 Minutes)

If you're short on time, run this quick smoke test:

1. ✅ Load page, verify initial state
2. ✅ Toggle Gun Time ON for Overall (Chip should turn OFF)
3. ✅ Toggle Gun Time ON for Category (Chip should turn OFF)
4. ✅ Turn OFF Show Overall Results (time switches should disable)
5. ✅ Turn OFF Show Category Results (input should hide if Overall is also OFF)
6. ✅ Change Number of Results to 10
7. ✅ Resize browser window (verify responsive layout)
8. ✅ Submit form (verify payload in network tab)

**Expected Time**: 3-5 minutes
**Pass Criteria**: All 8 checks pass

---

## 💡 Tips for Testing

1. **Use DevTools**: Open the React DevTools to inspect component state in real-time
2. **Network Tab**: Monitor API requests to verify correct data submission
3. **Console**: Watch for any error messages or warnings
4. **Responsive Testing**: Always test on multiple screen sizes
5. **Edge Cases**: Try to break the system - that's how you find bugs!

---

## ✅ Sign-Off

Once all tests pass, the implementation is verified and ready for production.

**Test Completion Checklist**:
- [ ] All 12 tests executed
- [ ] All tests passed
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Form submission verified
- [ ] Documentation reviewed

**Approved By**: _______________
**Date**: _______________

---

*Happy Testing! 🎉*

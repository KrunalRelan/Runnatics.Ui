# Organization Dropdown & Optional Fields Fix

## Issues Fixed

### 1. Organization Dropdown Display Issue ✅
**Problem:** When selecting "N/A" in the organization dropdown, it converted the value to `1` immediately, causing the dropdown to show empty because there was no MenuItem with value `1`.

**Solution:** 
- Keep the value as `"N/A"` in the form state for proper display
- Only convert `"N/A"` to `1` when sending data to the API
- This allows the dropdown to correctly display "N/A" when selected

### 2. Optional Fields Validation Issue ✅
**Problem:** Capacity, price, and currency fields were causing validation errors when left empty, preventing event creation even though they were marked as optional.

**Solution:**
- Changed initial values from `0` to `undefined` for capacity and price
- Updated `handleInputChange` to handle empty number fields (store as `undefined` instead of `0`)
- Updated TextField components to display empty string when value is `undefined`
- These fields are excluded from API requests anyway (UI display only)

## Changes Made

### 1. Form State (`useState`)
```typescript
// Before
organizationId: null,
capacity: 0,
price: 0,

// After
organizationId: "",
capacity: undefined,
price: undefined,
```

### 2. Handle Select Change
```typescript
// Before
if (name === "organizationId" && value === "N/A") {
  processedValue = 1;  // Converted immediately
}

// After
// Keep "N/A" as-is for display, will convert to 1 when sending to API
let processedValue = value === "" ? null : value;
```

### 3. Handle Input Change
```typescript
// Before
[name]: type === "number" ? parseFloat(value) || 0 : value,

// After
let processedValue: any = value;
if (type === "number") {
  processedValue = value === "" ? undefined : parseFloat(value);
}
```

### 4. Form Submission (API Request)
```typescript
// Convert "N/A" organizationId to 1 for API
const organizationIdForApi = apiData.organizationId === "N/A" ? 1 : apiData.organizationId;

const requestPayload = {
  ...apiData,
  organizationId: organizationIdForApi,  // Use converted value
  // ...rest of payload
};
```

### 5. TextField Components
```typescript
// Before
value={formData.capacity}
value={formData.price}

// After
value={formData.capacity || ""}
value={formData.price || ""}
```

### 6. Validation
```typescript
// Before
if (formData.organizationId == null) {
  newErrors.organizationId = "Organization is required";
}

// After
if (!formData.organizationId || formData.organizationId === "") {
  newErrors.organizationId = "Organization is required";
}
```

## How It Works Now

### Organization Dropdown Flow
1. **User selects "N/A"**
   - Form state stores: `organizationId: "N/A"`
   - Dropdown displays: "N/A" ✅

2. **User submits form**
   - Before sending to API: Convert `"N/A"` → `1`
   - API receives: `organizationId: 1` ✅

3. **User selects actual organization**
   - Form state stores: `organizationId: <org-id>`
   - Dropdown displays: Organization name ✅
   - API receives: `organizationId: <org-id>` ✅

### Optional Fields Flow
1. **User leaves fields empty**
   - Form state: `capacity: undefined`, `price: undefined`
   - Display: Empty input fields ✅
   - No validation errors ✅

2. **User enters values**
   - Form state: `capacity: 500`, `price: 25.00`
   - Display: Shows entered values ✅

3. **Form submission**
   - Fields are excluded from API request anyway (UI only)
   - Event creates successfully ✅

## Testing Checklist

### Organization Dropdown
- [ ] Select "N/A" → dropdown shows "N/A"
- [ ] Select actual organization → dropdown shows organization name
- [ ] Submit with "N/A" → API receives organizationId: 1
- [ ] Submit with real org → API receives correct organization ID

### Optional Fields (Capacity, Price, Currency)
- [ ] Leave all empty → No validation errors
- [ ] Submit with empty fields → Event creates successfully
- [ ] Enter values → Values display correctly
- [ ] Clear values → Fields become empty again without errors

### Form Submission
- [ ] All required fields filled → Form validates
- [ ] Optional fields empty → Form still validates
- [ ] Event creates successfully with or without optional fields

## Files Modified

- `/src/main/src/pages/admin/events/CreateEvent.tsx`
  - Updated form state initialization
  - Modified `handleInputChange` for number fields
  - Modified `handleSelectChange` for organizationId
  - Updated form submission to convert "N/A" to 1
  - Updated TextField value props
  - Updated validation logic

## API Request Structure

When submitting with "N/A" and empty optional fields:

```json
{
  "organizationId": 1,  // Converted from "N/A"
  "name": "Event Name",
  "description": "...",
  // ... other required fields
  
  // Excluded (UI only):
  // - capacity
  // - price
  // - currency
}
```

## Summary

✅ Organization dropdown now displays "N/A" when selected
✅ "N/A" is converted to organizationId `1` when sending to API
✅ Capacity, price, and currency can be left empty
✅ No validation errors for optional fields
✅ Event can be created without filling optional fields
✅ All existing functionality preserved

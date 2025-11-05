# Organization ID - N/A Handling

## Change Summary

When "N/A" is selected in the Organization dropdown, the form now automatically sets the `organizationId` to `1` instead of the string "N/A".

## Implementation

### Updated Function: `handleSelectChange`

```typescript
const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
  const { name, value } = e.target;

  // Special handling for organizationId
  let processedValue = value === "" ? null : value;
  
  // If organizationId is "N/A", set it to 1
  if (name === "organizationId" && value === "N/A") {
    processedValue = 1;
  }

  setFormData((prev) => ({
    ...prev,
    [name as string]: processedValue,
  }));

  // Clear error for this field
  if (name && errors[name]) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};
```

## Behavior

### Dropdown Options
1. **"Select an organization"** (empty) → `organizationId: null`
2. **"N/A"** → `organizationId: 1`
3. **Any organization from the list** → `organizationId: <organization.id>`

### API Request
When N/A is selected, the API will receive:
```json
{
  "organizationId": 1,
  "name": "Event Name",
  ...
}
```

## Testing

### 1. Select N/A
- Open the Create Event form
- In the "Event Organizers" dropdown, select "N/A"
- Check browser console for: `📋 Organization ID being sent: 1`

### 2. Submit Form
- Fill out required fields
- Submit the form
- Check the console log showing the request payload
- Verify `organizationId: 1` is in the payload

### 3. Select Real Organization
- Select an organization from the dropdown
- Check console: `📋 Organization ID being sent: <actual-org-id>`
- Submit and verify the correct organization ID is sent

## Console Logs

When submitting the form, you'll see:
```
🔑 Token exists: true
📋 Organization ID being sent: 1
📤 Calling EventService.createEvent with payload: {
  "organizationId": 1,
  ...
}
```

## Backend Expectation

The backend should handle `organizationId: 1` as the "N/A" or "Default" organization. Make sure:
- Organization with ID `1` exists in the database
- It represents the default/N/A organization
- Or adjust the code to use a different ID if needed

## Customization

To use a different ID for N/A, change this line in `handleSelectChange`:
```typescript
// Change 1 to your desired default organization ID
if (name === "organizationId" && value === "N/A") {
  processedValue = 1; // <- Change this number
}
```

## Files Modified

- `/src/main/src/pages/admin/events/CreateEvent.tsx`
  - Updated `handleSelectChange` function
  - Added debug logging for organization ID

## Benefits

✅ Backend receives a valid integer ID instead of string "N/A"
✅ No special handling needed on the backend for "N/A" strings
✅ Consistent data type (number) for organizationId field
✅ Easy to track in logs which organization ID is being sent

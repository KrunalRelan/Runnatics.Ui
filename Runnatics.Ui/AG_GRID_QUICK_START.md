# AG Grid Quick Reference

## Installation
```bash
npm install ag-grid-react ag-grid-community
```

## Basic Setup

### 1. Import and Register
```typescript
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

// Required: Register modules (AG Grid v31+)
ModuleRegistry.registerModules([AllCommunityModule]);
```

### 2. Define Columns
```typescript
const columnDefs: ColDef<Event>[] = [
  { field: "name", headerName: "Event Name", flex: 2 },
  { field: "eventDate", headerName: "Event Date", flex: 1 },
];
```

### 3. Render Grid
```typescript
<Box className="ag-theme-material" sx={{ height: "600px", width: "100%" }}>
  <AgGridReact
    rowData={events}
    columnDefs={columnDefs}
    animateRows={true}
  />
</Box>
```

## Key Features Enabled
✅ Column sorting (click headers)  
✅ Column resizing (drag borders)  
✅ Column filtering (built-in)  
✅ Custom cell renderers (Actions, Status chips)  
✅ Loading overlay  
✅ Empty state handling  
✅ Material Design theme  

## Custom Cell Renderers
```typescript
const ActionsCellRenderer = (props: any) => {
  return <Button onClick={() => handleAction(props.data)}>Edit</Button>;
};

// In column definition:
{ headerName: "Action", cellRenderer: ActionsCellRenderer }
```

## Current Implementation
- 7 columns: #, Name, Date, Address, Organizer, Published, Action
- 600px height with fixed header
- Server-side pagination with custom controls
- Material theme for consistency with MUI

## Status
✅ **WORKING** - All features functional, no TypeScript errors

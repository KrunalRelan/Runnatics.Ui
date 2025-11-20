import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box, Paper } from '@mui/material';
import type { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create custom theme based on Quartz - matching EventsList.tsx
const defaultTheme = themeQuartz.withParams({
  accentColor: "#1976d2",
  backgroundColor: "#ffffff",
  borderColor: "#e0e0e0",
  borderRadius: 4,
  browserColorScheme: "light",
  chromeBackgroundColor: "#f5f5f5",
  columnBorder: true,
  fontFamily: "Roboto, sans-serif",
  fontSize: 14,
  foregroundColor: "#000000",
  headerBackgroundColor: "#f5f5f5",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerTextColor: "#000000",
  oddRowBackgroundColor: "#fafafa",
  rowBorder: true,
  spacing: 8,
});

export interface DataGridProps<T = any> {
  rowData: T[];
  columnDefs: ColDef<T>[] | ColDef[];
  defaultColDef?: ColDef;
  pagination?: boolean;
  paginationPageSize?: number;
  domLayout?: 'normal' | 'autoHeight' | 'print';
  onRowClicked?: (event: any) => void;
  onCellClicked?: (event: any) => void;
  onGridReady?: (event: GridReadyEvent) => void;
  gridOptions?: GridOptions;
  height?: number | string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnMenu?: boolean;
  suppressPaginationPanel?: boolean;
  rowSelection?: 'single' | 'multiple';
  animateRows?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  loading?: boolean;
  theme?: any; // Allow custom theme override
  overlayLoadingTemplate?: string;
  overlayNoRowsTemplate?: string;
}

/**
 * DataGrid Component - Modern AG Grid v32+ with Quartz Theme
 * 
 * AG Grid wrapper with consistent MUI styling matching EventsList.tsx theme.
 * Uses the new themeQuartz API for modern, clean styling.
 * Provides all AG Grid features (sorting, filtering, virtual scrolling, etc.)
 * 
 * @example
 * <DataGrid
 *   rowData={data}
 *   columnDefs={columns}
 *   pagination={true}
 *   loading={loading}
 * />
 */
export const DataGrid = <T extends any>({
  rowData,
  columnDefs,
  defaultColDef,
  pagination = false,
  paginationPageSize = 25,
  domLayout = 'normal',
  onRowClicked,
  onCellClicked,
  onGridReady,
  gridOptions,
  height = 600,
  enableSorting = true,
  enableFiltering = true,
  enableColumnMenu = true,
  suppressPaginationPanel = false,
  rowSelection,
  animateRows = true,
  rowHeight = 60,
  headerHeight = 50,
  loading = false,
  theme = defaultTheme,
  overlayLoadingTemplate = '<span class="ag-overlay-loading-center">Loading...</span>',
  overlayNoRowsTemplate = '<span class="ag-overlay-no-rows-center">No data to display</span>',
}: DataGridProps<T>) => {

  const defaultColumnDef = useMemo<ColDef>(() => ({
    sortable: enableSorting,
    filter: enableFiltering,
    resizable: true,
    menuTabs: enableColumnMenu ? ['filterMenuTab', 'generalMenuTab'] : [],
    ...defaultColDef,
  }), [enableSorting, enableFiltering, enableColumnMenu, defaultColDef]);

  const defaultGridOptions = useMemo<GridOptions>(() => ({
    suppressRowClickSelection: true,
    animateRows,
    suppressCellFocus: true,
    ...gridOptions,
  }), [animateRows, gridOptions]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: height === 'auto' ? undefined : height,
            width: '100%',
            position: 'relative',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <AgGridReact<T>
            theme={theme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColumnDef}
            domLayout={domLayout}
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            suppressPaginationPanel={suppressPaginationPanel}
            onRowClicked={onRowClicked}
            onCellClicked={onCellClicked}
            onGridReady={onGridReady}
            rowSelection={rowSelection}
            rowHeight={rowHeight}
            headerHeight={headerHeight}
            loading={loading}
            overlayLoadingTemplate={overlayLoadingTemplate}
            overlayNoRowsTemplate={overlayNoRowsTemplate}
            {...defaultGridOptions}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DataGrid;
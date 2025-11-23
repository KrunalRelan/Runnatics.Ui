import React, { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
  SortChangedEvent,
} from "ag-grid-community";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create custom theme based on Quartz
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
  domLayout?: "normal" | "autoHeight" | "print";
  onRowClicked?: (event: any) => void;
  onCellClicked?: (event: any) => void;
  onGridReady?: (event: GridReadyEvent) => void;
  onSortChanged?: (sortFieldName?: string, sortDirection?: number) => void;
  gridOptions?: GridOptions;
  height?: number | string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnMenu?: boolean;
  suppressPaginationPanel?: boolean;
  rowSelection?: "single" | "multiple";
  animateRows?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  loading?: boolean;
  theme?: any;
  overlayLoadingTemplate?: string;
  overlayNoRowsTemplate?: string;
  // Custom pagination props
  useCustomPagination?: boolean;
  pageNumber?: number;
  totalRecords?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
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
  domLayout = "normal",
  onRowClicked,
  onCellClicked,
  onGridReady,
  onSortChanged,
  gridOptions,
  height = 600,
  enableSorting = true,
  enableFiltering = true,
  enableColumnMenu = true, // ✅ Keep prop but won't use menuTabs
  suppressPaginationPanel = false,
  rowSelection,
  animateRows = true,
  rowHeight = 60,
  headerHeight = 50,
  loading = false,
  theme = defaultTheme,
  overlayLoadingTemplate = '<span class="ag-overlay-loading-center">Loading...</span>',
  overlayNoRowsTemplate = '<span class="ag-overlay-no-rows-center">No data to display</span>',
  // Custom pagination props
  useCustomPagination = false,
  pageNumber = 1,
  totalRecords = 0,
  totalPages = 0,
  onPageChange,
  onPageSizeChange,
}: DataGridProps<T>) => {
  const defaultColumnDef = useMemo<ColDef>(
    () => ({
      sortable: enableSorting,
      filter: enableFiltering,
      resizable: true,
      // ✅ REMOVED menuTabs - This is an Enterprise feature
      // menuTabs: enableColumnMenu ? ['filterMenuTab', 'generalMenuTab'] : [],
      ...defaultColDef,
    }),
    [enableSorting, enableFiltering, defaultColDef]
  ); // ✅ Removed enableColumnMenu from deps

  // Handle sort changes
  const handleSortChanged = useCallback(
    (event: SortChangedEvent) => {
      if (onSortChanged) {
        const columnState = event.api.getColumnState();
        const sortedColumn = columnState.find((col) => col.sort !== null);

        if (sortedColumn) {
          const sortFieldName = sortedColumn.colId;
          const sortDirection = sortedColumn.sort === "asc" ? 1 : -1;
          onSortChanged(sortFieldName, sortDirection);
        } else {
          onSortChanged(undefined, undefined);
        }
      }
    },
    [onSortChanged]
  );

  const defaultGridOptions = useMemo<GridOptions>(
    () => ({
      suppressRowClickSelection: true,
      animateRows,
      suppressCellFocus: true,
      onSortChanged: handleSortChanged,
      ...gridOptions,
    }),
    [animateRows, handleSortChanged, gridOptions]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: height === "auto" ? undefined : height,
            width: "100%",
            position: "relative",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.3s ease-in-out",
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
        {useCustomPagination && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 0,
              p: 2,
              backgroundColor: "background.paper",
              borderTop: "1px solid #e0e0e0",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {totalRecords > 0 ? (pageNumber - 1) * paginationPageSize + 1 : 0} to{" "}
                {Math.min(pageNumber * paginationPageSize, totalRecords)} of {totalRecords} entries
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="page-size-label">Rows per page</InputLabel>
                <Select
                  labelId="page-size-label"
                  value={paginationPageSize}
                  label="Rows per page"
                  onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                  disabled={loading}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber === 1 || loading}
                onClick={() => onPageChange?.(1)}
              >
                First
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber === 1 || loading}
                onClick={() => onPageChange?.(pageNumber - 1)}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ minWidth: "100px", textAlign: "center" }}>
                Page {pageNumber} of {totalPages || 1}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber >= totalPages || loading}
                onClick={() => onPageChange?.(pageNumber + 1)}
              >
                Next
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={pageNumber >= totalPages || loading}
                onClick={() => onPageChange?.(totalPages)}
              >
                Last
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DataGrid;

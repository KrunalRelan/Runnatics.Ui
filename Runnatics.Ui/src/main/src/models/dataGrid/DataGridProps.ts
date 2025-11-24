import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
} from "ag-grid-community";

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

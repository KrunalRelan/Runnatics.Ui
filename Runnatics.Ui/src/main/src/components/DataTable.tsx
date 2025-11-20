import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  TableSortLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Sort direction type
export type SortDirection = 'asc' | 'desc' | null;

// Filter configuration type
export interface FilterConfig {
  enabled: boolean;
  placeholder?: string;
  type?: 'text' | 'number' | 'date';
}

// Generic column definition interface
export interface DataTableColumn<T = any> {
  id: string;
  label: string;
  field?: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean | FilterConfig;
  render?: (row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  filterRender?: (value: string, onChange: (value: string) => void, onClear: () => void) => React.ReactNode;
  customSort?: (a: T, b: T, direction: 'asc' | 'desc') => number;
  customFilter?: (row: T, filterValue: string) => boolean;
}

// Generic pagination interface
export interface DataTablePagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

// Main props interface
export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  pagination?: DataTablePagination;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  stickyHeader?: boolean;
  maxHeight?: number | string;
  elevation?: number;
  // Sorting options
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string, direction: 'asc' | 'desc' | null) => void;
  // Filtering options
  showFilters?: boolean;
  onFilter?: (filters: Record<string, string>) => void;
}

/**
 * Shared DataTable Component
 * 
 * A reusable, styled table component using Material-UI with consistent design
 * across the application. Supports pagination, sorting, filtering, and custom rendering.
 * 
 * @example
 * // Basic usage with sorting and filtering
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   pagination={paginationConfig}
 *   showFilters={true}
 * />
 */
export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowKey = 'id',
  stickyHeader = false,
  maxHeight,
  elevation = 0,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  onSort,
  showFilters = true,
  onFilter,
}: DataTableProps<T>) => {
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  
  // Filtering state
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilterRow, setShowFilterRow] = useState(false);

  // Handle sort
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column || column.sortable === false) return;

    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }
    
    setSortColumn(newDirection ? columnId : null);
    setSortDirection(newDirection);
    
    if (onSort && newDirection) {
      onSort(columnId, newDirection);
    }
  };

  // Handle filter change
  const handleFilterChange = (columnId: string, value: string) => {
    const newFilters = { ...filters, [columnId]: value };
    if (!value) {
      delete newFilters[columnId];
    }
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Clear filter
  const handleClearFilter = (columnId: string) => {
    const newFilters = { ...filters };
    delete newFilters[columnId];
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({});
    if (onFilter) {
      onFilter({});
    }
  };

  // Get row key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey] ?? index;
  };

  // Get cell value
  const getCellValue = (row: T, column: DataTableColumn<T>) => {
    if (column.render) {
      return column.render(row, data.indexOf(row));
    }
    if (column.field) {
      return row[column.field];
    }
    return null;
  };

  // Apply sorting and filtering
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([columnId, filterValue]) => {
          if (!filterValue) return true;
          
          const column = columns.find(col => col.id === columnId);
          if (!column) return true;

          // Custom filter function
          if (column.customFilter) {
            return column.customFilter(row, filterValue);
          }

          // Default filter logic
          if (column.field) {
            const cellValue = String(row[column.field] || '').toLowerCase();
            return cellValue.includes(filterValue.toLowerCase());
          }

          return true;
        });
      });
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      const column = columns.find(col => col.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          // Custom sort function
          if (column.customSort) {
            return column.customSort(a, b, sortDirection);
          }

          // Default sort logic
          if (column.field) {
            const aValue = a[column.field];
            const bValue = b[column.field];

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
              return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return sortDirection === 'asc'
              ? String(aValue).localeCompare(String(bValue))
              : String(bValue).localeCompare(String(aValue));
          }

          return 0;
        });
      }
    }

    return result;
  }, [data, filters, sortColumn, sortDirection, columns]);

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Box>
      {/* Filter Controls */}
      {showFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant={showFilterRow ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilterRow(!showFilterRow)}
            sx={{ textTransform: 'none' }}
          >
            {showFilterRow ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {hasActiveFilters && (
            <>
              <Chip
                label={`${Object.keys(filters).length} filter(s) active`}
                size="small"
                color="primary"
                onDelete={handleClearAllFilters}
              />
            </>
          )}
        </Box>
      )}

      <TableContainer
        component={Paper}
        elevation={elevation}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          maxHeight: maxHeight,
          ...(stickyHeader && {
            maxHeight: maxHeight || 600,
          }),
        }}
      >
        <Table stickyHeader={stickyHeader}>
          {/* Table Header */}
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              {columns.map((column) => {
                const isSortable = column.sortable !== false;
                const isCurrentSort = sortColumn === column.id;

                return (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#333',
                      width: column.width,
                      ...(stickyHeader && {
                        bgcolor: '#f5f5f5',
                        top: 0,
                        zIndex: 2,
                      }),
                    }}
                  >
                    {column.headerRender ? (
                      column.headerRender()
                    ) : isSortable ? (
                      <TableSortLabel
                        active={isCurrentSort}
                        direction={isCurrentSort && sortDirection ? sortDirection : 'asc'}
                        onClick={() => handleSort(column.id)}
                        sx={{
                          '&.MuiTableSortLabel-root': {
                            color: '#333',
                          },
                          '&.MuiTableSortLabel-root:hover': {
                            color: '#1976d2',
                          },
                          '&.Mui-active': {
                            color: '#1976d2',
                          },
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Filter Row */}
            {showFilters && showFilterRow && (
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                {columns.map((column) => {
                  const isFilterable = column.filterable !== false;
                  const filterValue = filters[column.id] || '';

                  return (
                    <TableCell
                      key={`filter-${column.id}`}
                      align={column.align || 'left'}
                      sx={{
                        py: 1,
                        ...(stickyHeader && {
                          bgcolor: '#fafafa',
                          top: 56,
                          zIndex: 1,
                        }),
                      }}
                    >
                      {isFilterable && (
                        column.filterRender ? (
                          column.filterRender(
                            filterValue,
                            (value) => handleFilterChange(column.id, value),
                            () => handleClearFilter(column.id)
                          )
                        ) : (
                          <TextField
                            size="small"
                            fullWidth
                            placeholder={
                              typeof column.filterable === 'object'
                                ? column.filterable.placeholder || `Filter ${column.label}`
                                : `Filter ${column.label}`
                            }
                            value={filterValue}
                            onChange={(e) => handleFilterChange(column.id, e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon fontSize="small" sx={{ color: '#999' }} />
                                </InputAdornment>
                              ),
                              endAdornment: filterValue && (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleClearFilter(column.id)}
                                    edge="end"
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                              },
                            }}
                          />
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : processedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {hasActiveFilters ? 'No results match your filters' : emptyMessage}
                  </Typography>
                  {hasActiveFilters && (
                    <Button
                      size="small"
                      onClick={handleClearAllFilters}
                      sx={{ mt: 1, textTransform: 'none' }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  onClick={() => onRowClick?.(row, index)}
                  sx={{
                    '&:hover': { bgcolor: '#fafafa' },
                    '&:last-child td': { border: 0 },
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: '1px solid #e0e0e0',
            bgcolor: 'white',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalRecords)}-
            {Math.min(pagination.page * pagination.pageSize, pagination.totalRecords)} of{' '}
            {pagination.totalRecords}
            {hasActiveFilters && ' (filtered)'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              sx={{ textTransform: 'none' }}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              Page {pagination.page} of {pagination.totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              sx={{ textTransform: 'none' }}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// Utility functions for common cell renderers
export const DataTableUtils = {
  // Status chip renderer
  renderStatusChip: (
    status: string,
    colorMap?: Record<string, 'success' | 'warning' | 'error' | 'default' | 'primary' | 'secondary'>
  ) => {
    const defaultColorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      Registered: 'success',
      Pending: 'warning',
      Cancelled: 'error',
      Active: 'success',
      Inactive: 'error',
    };
    
    const color = colorMap?.[status] || defaultColorMap[status] || 'default';
    
    return (
      <Chip
        label={status}
        color={color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  },

  // Boolean renderer (Yes/No)
  renderBoolean: (value: boolean) => (value ? 'Yes' : 'No'),

  // Icon button action renderer
  renderActions: (
    actions: Array<{
      icon: React.ReactElement;
      onClick: () => void;
      tooltip: string;
      color?: 'primary' | 'error' | 'warning' | 'success' | 'default';
    }>
  ) => (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {actions.map((action, index) => (
        <Tooltip key={index} title={action.tooltip}>
          <IconButton
            size="small"
            color={action.color || 'default'}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  ),

  // Link renderer
  renderLink: (text: string, href: string, onClick?: (e: React.MouseEvent) => void) => (
    <Typography
      component="a"
      href={href}
      onClick={onClick}
      sx={{
        color: 'primary.main',
        textDecoration: 'none',
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      {text}
    </Typography>
  ),

  // Date formatter
  formatDate: (date: Date | string | null | undefined, format: 'short' | 'long' | 'time' = 'short') => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const options: Intl.DateTimeFormatOptions = 
      format === 'short' ? { year: 'numeric', month: 'short', day: 'numeric' } :
      format === 'long' ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' } :
      { hour: '2-digit', minute: '2-digit' };
    
    return dateObj.toLocaleString('en-US', options);
  },
};

export default DataTable;
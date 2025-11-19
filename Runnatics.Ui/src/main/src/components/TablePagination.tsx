import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

interface TablePaginationProps {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  loading = false,
  onPageChange,
  onPageSizeChange,
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mt: 3,
      p: 2,
      backgroundColor: "background.paper",
      borderRadius: 1,
      boxShadow: 1,
      flexWrap: "wrap",
      gap: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Showing {totalRecords > 0 ? (pageNumber - 1) * pageSize + 1 : 0} to {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords} entries
      </Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="page-size-label">Rows per page</InputLabel>
        <Select
          labelId="page-size-label"
          value={pageSize}
          label="Rows per page"
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
      <Button variant="outlined" size="small" disabled={pageNumber === 1 || loading} onClick={() => onPageChange(1)}>
        First
      </Button>
      <Button variant="outlined" size="small" disabled={pageNumber === 1 || loading} onClick={() => onPageChange(pageNumber - 1)}>
        Previous
      </Button>
      <Typography variant="body2" sx={{ minWidth: "100px", textAlign: "center" }}>
        Page {pageNumber} of {totalPages || 1}
      </Typography>
      <Button variant="outlined" size="small" disabled={pageNumber >= totalPages || loading} onClick={() => onPageChange(pageNumber + 1)}>
        Next
      </Button>
      <Button variant="outlined" size="small" disabled={pageNumber >= totalPages || loading} onClick={() => onPageChange(totalPages)}>
        Last
      </Button>
    </Stack>
  </Box>
);

export default TablePagination;

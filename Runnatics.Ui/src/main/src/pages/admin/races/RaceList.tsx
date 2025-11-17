import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import TablePagination from "@/main/src/components/TablePagination";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Sms as SmsIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

interface RaceListProps {
    races: Race[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    loading?: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onEdit?: (raceId: string) => void;
    onDelete?: (raceId: string) => void;
}

import type { ColDef, GridReadyEvent } from "ag-grid-community";
import { Race } from "@/main/src/models/races/Race";

function formatTimeOnly(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export const RaceList: React.FC<RaceListProps> = ({
    races,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    loading = false,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
}) => {
    const columnDefs: ColDef<Race>[] = useMemo(() => [
        { headerName: "Title", field: "title" as keyof Race, flex: 1 },
        {
            headerName: "Time",
            field: "startTime",
            flex: 1,
            valueGetter: (params: any) => {
                const start = formatTimeOnly(params.data.startTime);
                const end = formatTimeOnly(params.data.endTime);
                return start && end ? `${start} - ${end}` : start || end || "";
            },
        },
        { headerName: "Participants", field: "participants" as keyof Race, flex: 1 },
        { headerName: "Not Encoded", field: "notEncoded" as keyof Race, flex: 1 },
        {
            headerName: "SMS",
            field: "sms" as keyof Race,
            flex: 1,
            cellRenderer: (params: any) => (
                <Tooltip title={params.value ? "SMS Sent" : "No SMS"}>
                    {params.value ? <SmsIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                </Tooltip>
            ),
        },
        {
            headerName: "CheckPoints",
            field: "checkPoints" as keyof Race,
            flex: 1,
            cellRenderer: (params: any) => (
                <Tooltip title={params.value ? `${params.value} CheckPoints` : "No CheckPoints"}>
                    {params.value > 0 ? <CheckCircleIcon color="primary" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
                </Tooltip>
            ),
        },
        {
            headerName: "Action",
            field: "id" as keyof Race,
            flex: 1,
            cellRenderer: (params: any) => (
                <Box display="flex" gap={1}>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit?.(params.value)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => onDelete?.(params.value)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], [onEdit, onDelete]);

    const defaultColDef = useMemo<ColDef>(
        () => ({
            resizable: true,
            sortable: true,
            filter: true,
        }),
        []
    );

    return (
        <Box sx={{ width: "100%" }}>
            <div className="ag-theme-material" style={{ height: 400, width: "100%" }}>
                <AgGridReact
                    rowData={races}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    domLayout="autoHeight"
                    suppressRowClickSelection
                    pagination={false}
                />
            </div>
            <TablePagination
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalRecords={totalRecords}
                totalPages={totalPages}
                loading={loading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        </Box>
    );
};

export default RaceList;

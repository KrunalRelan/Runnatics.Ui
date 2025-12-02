import DataGrid from "@/main/src/components/DataGrid";
import { Checkpoint } from "@/main/src/models/checkpoints/CheckPoint";
import { Edit, Delete, Add as AddIcon } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Divider, IconButton, Stack, Typography } from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useMemo, useState } from "react";

interface ViewCheckPointsProps {
    eventId: string;
    raceId: string;
}

const ViewCheckPoints: React.FC<ViewCheckPointsProps> = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [localCheckpoint, setLocalCheckpoint] = useState<Checkpoint[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);  

    // Default Column Definition
    const defaultColDef = useMemo<ColDef>(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
        }),
        []
    );
    

    // Define grid columns
    const columnDefs: ColDef<Checkpoint>[] = [
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            field: "deviceName",
            headerName: "Device Name",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            valueGetter: (params: any) =>
                params.data?.deviceName || "N/A",
        },
        {
            field: "mandatory",
            headerName: "Is Mandatory",
            flex: 0.8,
            minWidth: 80,
            sortable: true,
            filter: true,
        },
        {
            field: "distanceFromStart",
            headerName: "Distance",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            field: "lastUpdateMode",
            headerName: "Last Update Mode",
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
        },
        {
            headerName: "Actions",
            flex: 1,
            minWidth: 100,
            maxWidth: 120,
            cellRenderer: (params: any) => (
                <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    sx={{ height: "100%", alignItems: "center" }}
                >
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            //   handleEditParticipant(params.data);
                        }}
                        title="Edit"
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                            e.stopPropagation();
                            //   handleDeleteParticipant(params.data);
                        }}
                        title="Delete"
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Stack>
            ),
            sortable: false,
            filter: false,
        },
    ];

    return (
        <Card sx={{ p: 3 }}>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6">Checkpoints</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                    //   onClick={handleAddCheckpoint}
                    >
                        Add Checkpoint
                    </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <DataGrid<Checkpoint>
                    rowData={localCheckpoint}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    domLayout="normal"
                    height={400}
                    pagination={false}
                    suppressPaginationPanel={true}
                    animateRows={true}
                    rowHeight={50}
                    headerHeight={50}
                    loading={loading}
                    // onSortChanged={handleSortChanged}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading checkpoints...</span>'
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No checkpoints to display</span>'
                    useCustomPagination={true}
                    // pageNumber={searchCriteria.pageNumber}
                    // paginationPageSize={searchCriteria.pageSize}
                    totalRecords={totalCount}
                    totalPages={totalPages}
                    // onPageChange={handlePageChange}
                    // onPageSizeChange={handlePageSizeChange}
                />
            </CardContent>
        </Card>
    );
}

export default ViewCheckPoints;
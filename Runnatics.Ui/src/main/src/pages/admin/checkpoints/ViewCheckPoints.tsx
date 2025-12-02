import { Card, Typography } from "@mui/material";

interface ViewCheckPointsProps {
    eventId: string;
    raceId: string;
}

const ViewCheckPoints: React.FC<ViewCheckPointsProps> = () => {

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6">Checkpoints</Typography>
            <Typography color="text.secondary">Checkpoints content coming soon...</Typography>
        </Card>
    );
}

export default ViewCheckPoints;
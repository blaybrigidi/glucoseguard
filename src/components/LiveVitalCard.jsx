import { Card, CardContent } from "@/components/ui/card";

const LiveVitalCard = ({ label, value, unit, status }) => {

    const displayValue = value ?? '--';
    const displayStatus = status ?? 'Unknown';

    return (
        <Card className="shadow-md border-none">
            <CardContent className="flex flex-col items-center justify-center p-6">

                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>

                <div className="flex items-baseline gap-2 mt-2">

                    <span className="text-3xl font-extrabold">
                        {displayValue}
                    </span>

                    <span className="text-sm text-muted-foreground">
                        {unit}
                    </span>

                </div>

                <p className="text-xs mt-2 text-muted-foreground">
                    {displayStatus}
                </p>

            </CardContent>
        </Card>
    );
};

export default LiveVitalCard;
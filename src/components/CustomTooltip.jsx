import React from 'react';

export const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">
                            {entry.name === 'hr' ? 'Heart Rate' : 'Temp'}:
                        </span>
                        <span className="font-medium text-foreground">
                            {entry.value}
                            {entry.name === 'hr' ? ' bpm' : '°C'}
                        </span>
                    </div>
                ))}
                {payload[0].payload.instability_risk && (
                    <div className="mt-2 pt-2 border-t border-border">
                        <span className={`text-xs font-semibold ${payload[0].payload.instability_risk === 'high_risk' ? 'text-red-500' :
                            payload[0].payload.instability_risk === 'warning' ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                            Risk: {payload[0].payload.instability_risk.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

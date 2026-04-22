import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VitalHistoryChart = ({ patientId }) => {
    const [timeRange, setTimeRange] = useState('24h');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getVitalStatus = (type, value) => {
        if (!value || value === '--') return 'Unknown';
        if (type === 'hr') {
            if (value > 100 || value < 60) return 'Abnormal';
        }
        return 'Normal';
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!patientId) return;
            try {
                setLoading(true);
                // Fetch history using new API method with selected range
                const history = await api.getVitalHistory(patientId, timeRange);

                // Sort by timestamp ascending
                history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                // Map to chart format
                const mapped = history.map(v => ({
                    date: new Date(v.timestamp).toLocaleTimeString('en-US', {
                        month: timeRange === '24h' ? undefined : 'short',
                        day: timeRange === '24h' ? undefined : 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    hr: v.hr,
                    temp: v.temp,
                    originalTimestamp: v.timestamp,
                    instability_risk: v.instability_risk, // Pass down for tooltip
                    hrStatus: getVitalStatus('hr', v.hr)
                }));

                setChartData(mapped);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching vital history:", error);
                setLoading(false);
            }
        };

        fetchData();
        // Polling for chart updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [patientId, timeRange]);

    const metrics = {
        hr: { label: 'Heart Rate', color: '#0056b3', unit: 'bpm',
            domain: ([min, max]) => [Math.floor(min * 0.95), Math.ceil(max * 1.05)] },
        temp: { label: 'Temperature', color: '#e67300', unit: '°C',
            domain: ([min, max]) => [parseFloat((min - 0.3).toFixed(1)), parseFloat((max + 0.3).toFixed(1))] },
    };

    if (loading && chartData.length === 0) {
        return (
            <Card className="h-full flex flex-col shadow-sm justify-center items-center">
                <p className="text-muted-foreground">Loading history...</p>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <CardTitle className="text-lg font-semibold text-foreground">
                    Historical Trends
                </CardTitle>
                <div className="flex bg-muted p-1 rounded-lg gap-1">
                    {['24h', '7d', '30d'].map((range) => (
                        <button
                            key={range}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="flex-1 w-full px-2">
                <div style={{ width: '100%', height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metrics.hr.color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={metrics.hr.color} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metrics.temp.color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={metrics.temp.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                minTickGap={30}
                                height={30}
                                tickMargin={10}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                domain={metrics.hr.domain}
                                width={30}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                domain={metrics.temp.domain}
                                width={30}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="hr"
                                stroke={metrics.hr.color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorHr)"
                                name="hr"
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="temp"
                                stroke={metrics.temp.color}
                                strokeWidth={2}
                                fillOpacity={0.8}
                                fill="url(#colorTemp)"
                                name="temp"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default VitalHistoryChart;

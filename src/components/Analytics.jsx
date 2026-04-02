import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';

const Analytics = () => {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ glucoseInstabilityEvents: 0, instabilityRate: 0, totalReadings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.getAnalytics();
                // Backend returns { trends: [], glucoseInstabilityEvents }
                setData(response.trends);
                setStats({
                    glucoseInstabilityEvents: response.glucoseInstabilityEvents,
                    instabilityRate: response.instabilityRate ?? 0,
                    totalReadings: response.totalReadings ?? 0,
                });
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px'
            }}>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground text-lg font-medium">Loading analytics...</p>
            </div>
        );
    }

    return (
        <main style={styles.main}>
            <header style={styles.header}>
                <h1 style={styles.title}>Analytics</h1>
                <p style={styles.subtitle}>Global health trends and system-wide performance metrics.</p>
            </header>

            <div style={styles.bentoGrid}>
                {/* Left Column: Massive Chart (3fr) */}
                <section style={styles.chartCard}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>Global Health Trends</h2>
                        <span style={styles.cardSubtitle}>Average Heart Rate (Last 24 Hours)</span>                    </div>

                    <div style={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="gradientBlack" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#E5E5E5" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#999' }}
                                    minTickGap={40}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#999' }}
                                    domain={['auto', 'auto']}
                                    width={30}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#000000"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gradientBlack)"
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Right Column: Key Metrics Stack (1fr) */}
                <div style={styles.metricsColumn}>
                    <MetricCard
                        title="Glucose Instability Risk"
                    >
                        <div style={styles.gaugeContainer}>
                            <CircularGauge value={stats.instabilityRate} />
                            <p style={styles.insightText}>
                                {stats.glucoseInstabilityEvents} instability event{stats.glucoseInstabilityEvents !== 1 ? 's' : ''} out of {stats.totalReadings} readings in the last 24h
                            </p>
                        </div>
                    </MetricCard>
                    <MetricCard
                        title="Glucose Warnings"
                        value={stats.glucoseInstabilityEvents}
                        subtext="Last 24 hours"
                        isCritical
                    />
                </div>
            </div>
        </main>
    );
};

const MetricCard = ({ title, value, subtext, isCritical, children }) => (
    <div style={styles.metricCard}>
        <h3 style={styles.metricTitle}>{title}</h3>
        {children ? children : (
            <>
                <span style={{ ...styles.metricValue, color: isCritical ? '#D32F2F' : 'var(--color-text-primary)' }}>
                    {value}
                </span>
                <span style={styles.metricSubtext}>{subtext}</span>
            </>
        )}
    </div>
);

const CircularGauge = ({ value }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Track Circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#F0F0F0"
                    strokeWidth="6"
                />
                {/* Progress Circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#000000"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 1.5s ease-out'
                    }}
                />
            </svg>
            <div style={{ position: 'absolute', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {value}%
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={styles.tooltip}>
                <p style={styles.tooltipLabel}>{label}</p>
                <p style={styles.tooltipValue}>{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

const styles = {
    main: {
        padding: 'var(--spacing-xl)',
        minHeight: '100vh',
    },
    header: {
        marginBottom: 'var(--spacing-xl)',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'var(--font-weight-heavy)',
        letterSpacing: '-0.03em',
        marginBottom: 'var(--spacing-xs)',
    },
    subtitle: {
        color: 'var(--color-text-secondary)',
        fontSize: '1rem',
    },
    bentoGrid: {
        display: 'grid',
        gridTemplateColumns: '3fr 1fr', // 3:1 Ratio
        gap: 'var(--spacing-lg)',
        height: '600px', // Fixed height for alignment
    },
    // Chart Card
    chartCard: {
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 'var(--spacing-lg)',
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 'var(--font-weight-bold)',
        margin: 0,
    },
    cardSubtitle: {
        fontSize: '0.9rem',
        color: 'var(--color-text-tertiary)',
    },
    chartContainer: {
        flex: 1,
        width: '100%',
        padding: '0 20px 20px 0',
    },
    // Metrics Column
    metricsColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
        height: '100%',
    },
    metricCard: {
        flex: 1, // Equal height distribution
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    metricTitle: {
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
        marginBottom: '4px',
        fontWeight: '500',
    },
    metricValue: {
        fontSize: '2.5rem',
        fontWeight: 'var(--font-weight-heavy)',
        letterSpacing: '-0.03em',
        lineHeight: '1.2',
    },
    metricSubtext: {
        fontSize: '0.8rem',
        color: 'var(--color-text-tertiary)',
        marginTop: '4px',
    },
    // Tooltip
    tooltip: {
        backgroundColor: '#000',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    tooltipLabel: {
        margin: 0,
        fontSize: '0.75rem',
        color: '#888',
        marginBottom: '4px',
    },
    tooltipValue: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#FFF',
        fontWeight: 'bold',
    },
    gaugeContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    insightText: {
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.4',
        maxWidth: '150px',
    }
};

export default Analytics;

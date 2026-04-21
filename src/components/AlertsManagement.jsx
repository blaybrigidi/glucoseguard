import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AlertsManagement = ({ filter }) => {
    const [alerts, setAlerts] = useState([]);
    const [predictionAlerts, setPredictionAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const [rawData, predData] = await Promise.all([
                    api.getAlerts(),
                    api.getPredictionAlerts(),
                ]);
                setAlerts(rawData);
                setPredictionAlerts(predData);
            } catch (error) {
                console.error("Failed to load alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredAlerts = filter
        ? alerts.filter(a => a.type === filter.toLowerCase())
        : alerts;

    const handleResolve = async (id, patientId) => {
        try {
            await api.resolveAlert(id, patientId);
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (error) {
            console.error("Failed to resolve alert:", error);
        }
    };

    const handleDismissPrediction = async (id, patientId) => {
        try {
            await api.resolveAlert(id, patientId);
            setPredictionAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (error) {
            console.error("Failed to dismiss prediction alert:", error);
        }
    };

    // Threshold State (similar to Settings)
    const [thresholds, setThresholds] = useState({
        hrMin: 60,
        hrMax: 100,
        tempMax: 37.5
    });

    const [channels, setChannels] = useState({
        web: true,
        mobile: true,
        sms: false
    });

    const handleChange = (name, value) => {
        setThresholds(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChannelToggle = (channel) => {
        setChannels(prev => ({
            ...prev,
            [channel]: !prev[channel]
        }));
    };

    const handleSave = () => {
        alert('Threshold configurations saved.');
    };

    return (
        <main style={styles.main}>
            <header style={styles.header}>
                <h1 style={styles.title}>Alerts & Thresholds</h1>
                <p style={styles.subtitle}>Monitor live incidents and configure safety triggers.</p>
            </header>

            <div style={styles.bentoGrid}>
                {/* Panel 1 - Threshold Alert Feed */}
                <section style={styles.feedPanel}>
                    <h2 style={styles.panelTitle}>Threshold Alerts</h2>
                    <div style={styles.feedList}>
                        {filteredAlerts.length === 0 && (
                            <p style={styles.emptyState}>No active threshold alerts.</p>
                        )}
                        {filteredAlerts.map(alert => (
                            <div key={alert.id} style={styles.alertCard}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.patientInfo}>
                                        <div style={styles.statusIndicator}>
                                            {alert.type === 'critical' && (
                                                <span className="pulse-dot-critical" style={styles.pulseDotCritical}></span>
                                            )}
                                            {alert.type === 'warning' && (
                                                <span style={styles.dotWarning}></span>
                                            )}
                                            <span style={styles.patientName}>{alert.patient}</span>
                                        </div>
                                        <span style={styles.time}>{alert.time}</span>
                                    </div>
                                    <button
                                        onClick={() => handleResolve(alert.id, alert.patientId)}
                                        style={styles.resolveButton}
                                    >
                                        Mark as Resolved
                                    </button>
                                </div>
                                <div style={styles.cardContent}>
                                    <div style={styles.vitalRow}>
                                        <span style={styles.vitalLabel}>{alert.vital}</span>
                                        <span style={styles.vitalValue}>{alert.value}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Panel 2 - ML Prediction Alerts */}
                <section style={styles.predPanel}>
                    <h2 style={styles.panelTitle}>
                        ML Prediction Alerts
                        <span style={styles.mlBadge}>AI</span>
                    </h2>
                    <div style={styles.feedList}>
                        {predictionAlerts.length === 0 && (
                            <p style={styles.emptyState}>No active prediction alerts.</p>
                        )}
                        {predictionAlerts.map(alert => (
                            <div key={alert.id} style={styles.predCard}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.patientInfo}>
                                        <span className="pulse-dot-pred" style={styles.pulseDotPred}></span>
                                        <span style={styles.patientName}>{alert.patient}</span>
                                        <span style={styles.time}>{alert.time}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDismissPrediction(alert.id, alert.patientId)}
                                        style={styles.dismissButton}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                                <div style={styles.predCardBody}>
                                    <div style={styles.probRow}>
                                        <span style={styles.predLabel}>Anomaly Probability</span>
                                        <span style={{
                                            ...styles.probBadge,
                                            backgroundColor: alert.probabilityPct >= 70
                                                ? 'rgba(220, 38, 38, 0.1)'
                                                : 'rgba(124, 58, 237, 0.1)',
                                            color: alert.probabilityPct >= 70 ? '#DC2626' : '#7C3AED',
                                        }}>
                                            {alert.probabilityPct}%
                                        </span>
                                    </div>
                                    <div style={styles.probBarTrack}>
                                        <div style={{
                                            ...styles.probBarFill,
                                            width: `${alert.probabilityPct}%`,
                                            backgroundColor: alert.probabilityPct >= 70 ? '#DC2626' : '#7C3AED',
                                        }} />
                                    </div>
                                    {alert.confidencePct != null && (
                                        <div style={styles.metaRow}>
                                            <span style={styles.predLabel}>Model Confidence</span>
                                            <span style={styles.metaValue}>{alert.confidencePct}%</span>
                                        </div>
                                    )}
                                    {alert.earliest_reading && alert.latest_reading && (
                                        <div style={styles.metaRow}>
                                            <span style={styles.predLabel}>Reading Window</span>
                                            <span style={styles.metaValue}>
                                                {new Date(alert.earliest_reading).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' — '}
                                                {new Date(alert.latest_reading).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Panel 3 - Threshold Configuration */}
                <section style={styles.configPanel}>
                    <h2 style={styles.panelTitle}>Threshold Configuration</h2>
                    <div style={styles.formContainer}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Heart Rate (bpm)</label>
                            <div style={styles.row}>
                                <NumberStepper
                                    value={thresholds.hrMin}
                                    onChange={(val) => handleChange('hrMin', val)}
                                    label="Min"
                                    min={30}
                                    max={90}
                                />
                                <NumberStepper
                                    value={thresholds.hrMax}
                                    onChange={(val) => handleChange('hrMax', val)}
                                    label="Max"
                                    min={90}
                                    max={200}
                                />
                            </div>
                            <span style={styles.caption}>Normal Resting: 60-100 BPM</span>
                        </div>

                        <div style={styles.divider}></div>



                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Body Temperature (°C)</label>
                            <NumberStepper
                                value={thresholds.tempMax}
                                onChange={(val) => handleChange('tempMax', val)}
                                label="Max Temp"
                                step={0.1}
                                min={35}
                                max={42}
                            />
                            <span style={styles.caption}>Normal Range: 36.5-37.5°C</span>
                        </div>

                        <div style={styles.divider}></div>

                        {/* Notification Channels Section */}
                        <div style={styles.channelsSection}>
                            <h3 style={styles.groupTitle}>Notification Channels</h3>
                            <div style={styles.channelList}>
                                <div style={styles.channelItem}>
                                    <span style={styles.channelLabel}>Web Dashboard</span>
                                    <Switch isOn={channels.web} onToggle={() => handleChannelToggle('web')} />
                                </div>
                                <div style={styles.channelItem}>
                                    <span style={styles.channelLabel}>Patient Mobile App</span>
                                    <Switch isOn={channels.mobile} onToggle={() => handleChannelToggle('mobile')} />
                                </div>
                                <div style={styles.channelItem}>
                                    <span style={styles.channelLabel}>Emergency SMS</span>
                                    <Switch isOn={channels.sms} onToggle={() => handleChannelToggle('sms')} />
                                </div>
                            </div>
                        </div>

                        <div style={styles.divider}></div>

                        {/* Glucose Instability Prediction Section */}
                        <div style={styles.anomalySection}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.groupTitle}>Prediction Sensitivity</h3>
                                <InfoTooltip text="Adjusts the sensitivity of the ML model for detecting patterns that indicate rapid glucose changes." />
                            </div>
                            <SegmentControl
                                options={['Stable', 'Balanced', 'High Sensitivity']}
                                value={thresholds.sensitivity || 'Balanced'}
                                onChange={(val) => handleChange('sensitivity', val)}
                            />
                        </div>

                        <button style={styles.saveButton} onClick={handleSave}>
                            Update Triggers
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
};

const SegmentControl = ({ options, value, onChange }) => {
    return (
        <div style={segmentStyles.container}>
            {options.map((option) => {
                const isActive = value === option;
                return (
                    <div
                        key={option}
                        style={{
                            ...segmentStyles.segment,
                            backgroundColor: isActive ? '#000' : 'transparent',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s',
                        }}
                        onClick={() => onChange(option)}
                    >
                        <span style={{
                            ...segmentStyles.label,
                            color: isActive ? '#FFF' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 600 : 500,
                            position: 'relative',
                            zIndex: 2
                        }}>
                            {option}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const InfoTooltip = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            style={tooltipStyles.container}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div style={tooltipStyles.icon}>i</div>
            {isVisible && (
                <div style={tooltipStyles.tooltip}>
                    {text}
                    <div style={tooltipStyles.arrow} />
                </div>
            )}
        </div>
    );
};

// ... component styles ...

// Tooltip Styles
const tooltipStyles = {
    container: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        marginLeft: '8px',
    },
    icon: {
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--border-color)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tooltip: {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)', // Centered above
        marginBottom: '8px',
        backgroundColor: '#1F2937', // Gray-800
        color: '#F9FAFB', // Gray-50
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        width: '200px',
        textAlign: 'center',
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'none',
    },
    arrow: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        marginLeft: '-4px',
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: '#1F2937 transparent transparent transparent',
    }
};

// Segment Control Styles
const segmentStyles = {
    container: {
        display: 'flex',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: '8px',
        padding: '4px',
        gap: '4px',
    },
    segment: {
        flex: 1,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
    },
    label: {
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
    }
};

// Switch Styles
const switchStyles = {
    container: {
        width: '48px',
        height: '26px',
        borderRadius: '50px',
        border: '1px solid', // Color set inline
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '0',
        position: 'relative',
        transition: 'background-color 0.2s, border-color 0.2s',
    },
    handle: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        transition: 'left 0.2s',
    }
};

const Switch = ({ isOn, onToggle }) => {
    return (
        <div
            style={{
                ...switchStyles.container,
                backgroundColor: isOn ? '#000' : '#FFF',
                borderColor: isOn ? '#000' : '#E0E0E0',
            }}
            onClick={onToggle}
        >
            <div
                style={{
                    ...switchStyles.handle,
                    backgroundColor: '#FFF',
                    boxShadow: isOn ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                    left: isOn ? '22px' : '2px',
                }}
            />
        </div>
    );
};

const NumberStepper = ({ value, onChange, label, step = 1, min, max }) => {
    const handleDecrement = () => {
        const newValue = Math.max(min || -Infinity, parseFloat((value - step).toFixed(1)));
        onChange(newValue);
    };

    const handleIncrement = () => {
        const newValue = Math.min(max || Infinity, parseFloat((value + step).toFixed(1)));
        onChange(newValue);
    };

    return (
        <div style={stepperStyles.container}>
            <button onClick={handleDecrement} style={stepperStyles.button}>-</button>
            <div style={stepperStyles.valueContainer}>
                <span style={stepperStyles.value}>{value}</span>
                {label && <span style={stepperStyles.label}>{label}</span>}
            </div>
            <button onClick={handleIncrement} style={stepperStyles.button}>+</button>
        </div>
    );
};

const stepperStyles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: '24px', // Pill shape
        padding: '4px',
        border: '1px solid var(--border-color)',
        minWidth: '120px',
        flex: 1,
    },
    button: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: '1px solid #E0E0E0',
        backgroundColor: '#fff',
        color: 'var(--color-text-primary)',
        fontSize: '1.1rem',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    valueContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
    },
    value: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
    },
    label: {
        fontSize: '0.65rem',
        color: 'var(--color-text-tertiary)',
        marginTop: '2px',
        textTransform: 'uppercase',
    }
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
        color: 'var(--color-text-on-brand)', // White
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)', // White opacity
        fontSize: '1rem',
    },
    bentoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 'var(--spacing-lg)',
        height: 'calc(100vh - 200px)',
        minHeight: '500px',
    },
    feedPanel: {
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
    },
    predPanel: {
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
    },
    configPanel: {
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
    },
    panelTitle: {
        fontSize: '1.1rem',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: 'var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    mlBadge: {
        fontSize: '0.65rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
        backgroundColor: 'rgba(124, 58, 237, 0.12)',
        color: '#7C3AED',
        padding: '2px 7px',
        borderRadius: '20px',
    },
    emptyState: {
        fontSize: '0.9rem',
        color: 'var(--color-text-tertiary)',
        textAlign: 'center',
        marginTop: 'var(--spacing-xl)',
    },
    feedList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        overflowY: 'auto',
        paddingRight: '8px', // Space for scrollbar
    },
    alertCard: {
        padding: 'var(--spacing-lg)', // Significant internal padding
        border: '1px solid var(--border-color)', // 1px thin border
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: 'none', // No shadow
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    predCard: {
        padding: 'var(--spacing-lg)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: '12px',
        backgroundColor: 'rgba(124, 58, 237, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    predCardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    probRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    probBadge: {
        fontSize: '0.85rem',
        fontWeight: '700',
        padding: '2px 10px',
        borderRadius: '20px',
    },
    probBarTrack: {
        height: '6px',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderRadius: '99px',
        overflow: 'hidden',
    },
    probBarFill: {
        height: '100%',
        borderRadius: '99px',
        transition: 'width 0.4s ease',
    },
    metaRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px',
    },
    predLabel: {
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)',
    },
    metaValue: {
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
    },
    pulseDotPred: {
        width: '10px',
        height: '10px',
        backgroundColor: '#7C3AED',
        borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.5)',
        animation: 'pulse-pred 2s infinite',
        flexShrink: 0,
    },
    dismissButton: {
        background: 'none',
        border: 'none',
        color: '#7C3AED',
        fontSize: '0.8rem',
        cursor: 'pointer',
        padding: 0,
        fontWeight: '500',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    patientInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    pulseDotCritical: {
        width: '10px',
        height: '10px',
        backgroundColor: '#D93025', // Updated semantic red
        borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(217, 48, 37, 0.7)',
        animation: 'pulse-red 2s infinite',
    },
    dotWarning: {
        width: '10px',
        height: '10px',
        backgroundColor: '#F9AB00', // Updated semantic amber
        borderRadius: '50%',
    },
    patientName: {
        fontWeight: 'bold',
        fontSize: '1rem',
        color: 'var(--color-text-primary)',
    },
    time: {
        fontSize: '0.8rem',
        color: 'var(--color-text-tertiary)',
    },
    resolveButton: {
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)', // Interactive text
        fontSize: '0.8rem',
        cursor: 'pointer',
        textDecoration: 'none', // Removed underline for cleaner look, or keep? Links usually have it or hover.
        padding: 0,
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    cardContent: {
        display: 'flex',
    },
    vitalRow: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
    },
    vitalLabel: {
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
    },
    vitalValue: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
    },

    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    row: {
        display: 'flex',
        gap: 'var(--spacing-md)',
    },
    label: {
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
        fontWeight: '500',
    },
    input: {
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        fontSize: '0.95rem',
        width: '100%',
        backgroundColor: 'var(--color-bg-subtle)',
        outline: 'none',
    },
    saveButton: {
        marginTop: 'auto',
        backgroundColor: '#000',
        color: '#FFF',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    caption: {
        fontSize: '0.75rem',
        color: 'var(--color-text-tertiary)',
        marginTop: '4px',
        fontStyle: 'italic',
    },
    divider: {
        height: '1px',
        backgroundColor: 'var(--border-color)',
        margin: '2px 0',
    },
    channelsSection: {
        marginTop: 'var(--spacing-md)',
    },
    channelList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    channelItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
    },
    channelLabel: {
        fontSize: '0.9rem',
        color: 'var(--color-text-primary)',
        fontWeight: '500',
    },
    groupTitle: {
        fontSize: '1rem',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: '16px',
        color: 'var(--color-text-primary)',
    },
    anomalySection: {
        marginTop: 'var(--spacing-md)',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px', // Adjusted to keep title close to header if needed
    }
};

export default AlertsManagement;

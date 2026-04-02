import React, { useState, useEffect } from 'react';
import { useAlerts } from '../context/AlertsContext';

export const Settings = () => {
    const { thresholds: contextThresholds, updateThresholds } = useAlerts();
    const [localThresholds, setLocalThresholds] = useState(contextThresholds);
    const [saved, setSaved] = useState(false);

    // Sync local state when context changes (e.g. initial load)
    useEffect(() => {
        if (contextThresholds) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalThresholds(prev => {
                // Prevent infinite loop by checking if values actually changed
                if (JSON.stringify(prev) !== JSON.stringify(contextThresholds)) {
                    return contextThresholds;
                }
                return prev;
            });
        }
    }, [contextThresholds]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalThresholds(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
        setSaved(false);
    };

    const handleSave = () => {
        updateThresholds(localThresholds);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <main style={styles.main}>
            <header style={styles.header}>
                <h1 style={styles.title}>Alert Thresholds</h1>
                <p style={styles.description}>
                    Configure the values that trigger emergency notifications for clinician attention.
                </p>
            </header>

            <section style={styles.section}>
                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>Heart Rate (bpm)</h3>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Minimum</label>
                            <input
                                type="number"
                                name="hrMin"
                                value={localThresholds?.hrMin || ''}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Maximum</label>
                            <input
                                type="number"
                                name="hrMax"
                                value={localThresholds?.hrMax || ''}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>Blood Oxygen (%)</h3>
                    <div style={styles.field}>
                        <label style={styles.label}>Minimum SpO2</label>
                        <input
                            type="number"
                            name="spo2Min"
                            value={localThresholds?.spo2Min || ''}
                            onChange={handleChange}
                            style={styles.input}
                            max="100"
                        />
                    </div>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>Body Temperature (°C)</h3>
                    <div style={styles.field}>
                        <label style={styles.label}>Maximum Temperature</label>
                        <input
                            type="number"
                            name="tempMax"
                            value={localThresholds?.tempMax || ''}
                            onChange={handleChange}
                            style={styles.input}
                            step="0.1"
                        />
                    </div>
                </div>

                <div style={styles.actions}>
                    <button
                        onClick={handleSave}
                        style={{
                            ...styles.saveButton,
                            backgroundColor: saved ? '#4CAF50' : 'var(--color-text-primary)'
                        }}
                        disabled={saved}
                    >
                        {saved ? 'Saved!' : 'Save Thresholds'}
                    </button>
                </div>
            </section>
        </main>
    );
};

const styles = {
    main: {
        padding: 'var(--spacing-xl)',
        minHeight: '100vh',
        maxWidth: '800px',
    },
    header: {
        marginBottom: 'var(--spacing-xl)',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'var(--font-weight-heavy)',
        letterSpacing: '-0.03em',
        marginBottom: 'var(--spacing-sm)',
    },
    description: {
        color: 'var(--color-text-secondary)',
        fontSize: '1rem',
        maxWidth: '600px',
    },
    section: {
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-xl)',
    },
    groupTitle: {
        fontSize: '1.1rem',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-text-primary)',
    },
    row: {
        display: 'flex',
        gap: 'var(--spacing-lg)',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
        maxWidth: '200px',
    },
    label: {
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
        fontWeight: 'var(--font-weight-medium)',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        fontSize: '1rem',
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-subtle)',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    divider: {
        height: '1px',
        backgroundColor: 'var(--border-color)',
        margin: 'var(--spacing-lg) 0',
    },
    actions: {
        marginTop: 'var(--spacing-xl)',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    saveButton: {
        backgroundColor: 'var(--color-text-primary)',
        color: '#FFF',
        border: 'none',
        padding: '0.8rem 2rem',
        borderRadius: '100px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    }
};

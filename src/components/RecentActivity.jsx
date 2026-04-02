import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const RecentActivity = ({ onNavigate }) => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const alerts = await api.getAlerts();
                const mapped = alerts.slice(0, 5).map(alert => ({
                    id: alert.id,
                    text: alert.message,
                    time: alert.time,
                    type: alert.type,
                    link: { view: 'patient-detail', id: alert.patientId }
                }));
                setActivities(mapped);
            } catch (error) {
                console.error("Failed to load recent activity:", error);
            }
        };

        fetchActivity();
        const interval = setInterval(fetchActivity, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Recent Activity</h3>
            <div style={styles.list}>
                {activities.length === 0 ? (
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>No recent activity.</p>
                ) : (
                    activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            style={styles.item}
                            onClick={() => activity.link && onNavigate(activity.link.view, activity.link.id)}
                        >
                            <div style={styles.dotContainer}>
                                <div style={{
                                    ...styles.dot,
                                    backgroundColor: activity.type === 'critical' ? '#D93025' :
                                        activity.type === 'warning' ? '#F9AB00' : '#1a73e8'
                                }} />
                                {index !== activities.length - 1 && <div style={styles.line} />}
                            </div>
                            <div style={styles.content}>
                                <p style={styles.text}>{activity.text}</p>
                                <span style={styles.time}>{activity.time}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-md)',
        height: '100%',
    },
    header: {
        fontSize: '0.9rem',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    item: {
        display: 'flex',
        gap: '12px',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    },
    dotContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '6px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    content: {
        fontSize: '0.85rem',
    },
    text: {
        margin: '0 0 2px 0',
        color: 'var(--color-text-primary)',
        lineHeight: '1.4',
    },
    time: {
        fontSize: '0.75rem',
        color: 'var(--color-text-tertiary)',
    },
};

export default RecentActivity;
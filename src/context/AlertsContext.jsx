import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
// Note: Frontend uses firebase client SDK, not admin. 
// We should check src/config/firebase.js first to see if 'db' is exported.
// If not, we might need to use api to fetch alerts, or setup firestore client.

// Given the project structure, it seems we are using an API-first approach for data?
// But task says "Create AlertsContext.jsx (Frontend)".
// Let's assume we fetch from API for now to keep it consistent with other components,
// OR use firestore client if already set up.
// Previous steps showed "Switch Services to Firestore" but that was Backend.
// Frontend `api.js` wrapper exists.

// Let's check `src/services/api.js` first to see if we can add getAlerts there.

export const AlertsContext = createContext();

export const useAlerts = () => useContext(AlertsContext);

export const AlertsProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Thresholds State (Persisted)
    const [thresholds, setThresholds] = useState(() => {
        const saved = localStorage.getItem('alertThresholds');
        return saved ? JSON.parse(saved) : {
            hrMin: 60,
            hrMax: 100,
            spo2Min: 95,
            tempMax: 37.5
        };
    });

    const updateThresholds = (newThresholds) => {
        setThresholds(newThresholds);
        localStorage.setItem('alertThresholds', JSON.stringify(newThresholds));
    };

    const fetchAlerts = async () => {
        try {
            const response = await api.getAlerts();
            setAlerts(response);
            setUnreadCount(response.length); // Assuming endpoint returns unread alerts
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        }
    };

    useEffect(() => {
        let mounted = true;
        const loadAlerts = async () => {
            if (!mounted) return;
            await fetchAlerts();
        };
        loadAlerts();
        const interval = setInterval(loadAlerts, 10000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const markAsRead = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <AlertsContext.Provider value={{ alerts, unreadCount, loading, markAsRead, thresholds, updateThresholds }}>
            {children}
        </AlertsContext.Provider>
    );
};

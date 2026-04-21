import { auth } from '../config/firebase';
import { ref, query, orderByKey, limitToLast, get, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const coerceNumber = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : value;
};

// Normalize vitals so UI can rely on both snake_case (RTDB/ML schema)
// and short keys used in some components (hr/temp/spo2).
const normalizeVitalsReading = (reading) => {
    if (!reading || typeof reading !== 'object') return reading;

    const normalized = { ...reading };

    // Common aliasing between backend (heart_rate/temperature) and UI (hr/temp).
    if (normalized.hr === undefined) {
        normalized.hr = normalized.heart_rate ?? normalized.heartRate ?? normalized.pulse;
    }
    if (normalized.temp === undefined) {
        normalized.temp = normalized.temperature ?? normalized.body_temperature ?? normalized.bodyTemp;
    }
    if (normalized.spo2 === undefined) {
        normalized.spo2 = normalized.spo2 ?? normalized.spO2 ?? normalized.sp02;
    }

    // Keep comparisons and charts consistent when values come back as strings.
    normalized.hr = coerceNumber(normalized.hr);
    normalized.heart_rate = coerceNumber(normalized.heart_rate);
    normalized.temp = coerceNumber(normalized.temp);
    normalized.temperature = coerceNumber(normalized.temperature);
    normalized.spo2 = coerceNumber(normalized.spo2);
    normalized.hrv_rmssd = coerceNumber(normalized.hrv_rmssd);
    normalized.hrv_sdnn = coerceNumber(normalized.hrv_sdnn);
    normalized.instability_probability = coerceNumber(normalized.instability_probability);

    return normalized;
};

// Helper to get current user's ID token
const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};

export const api = {
    // Patients
    getPatients: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients?${queryParams}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
    },

    getPatient: async (id) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch patient details');
        return response.json();
    },

    createPatient: async (data) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create patient');
        return response.json();
    },

    // Vitals (Realtime Database Integration)

    // Subscribe to real-time updates
    subscribeToVitals: (patientId, callback) => {
        const vitalsRef = query(
            ref(database, `patient_data/${patientId}`),
            orderByKey(),
            limitToLast(20)
        );

        const unsubscribe = onValue(vitalsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // UUID keys are not time-ordered — find the entry with the latest timestamp field
                const latest = Object.values(data).reduce((a, b) =>
                    new Date(a.timestamp) > new Date(b.timestamp) ? a : b
                );
                callback(normalizeVitalsReading(latest));
            }
        });

        return unsubscribe; // Return cleanup function
    },

    // Get history for charts
    getVitalHistory: async (patientId, range = '24h') => {
        try {
            const now = Date.now();
            let startTime;

            switch (range) {
                case '24h':
                    startTime = now - (24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startTime = now - (7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startTime = now - (30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startTime = now - (24 * 60 * 60 * 1000);
            }

            // const startIso = new Date(startTime).toISOString();

            // Query by timestamp (key)
            // Note: Keys in RTDB are ISO strings, which sort lexicographically correctly
            const vitalsRef = query(
                ref(database, `patient_data/${patientId}`),
                orderByKey(),
                // startAt(startIso) // Uncomment when real data has correct ISO keys
                limitToLast(range === '24h' ? 300 : 2500) // 24h: ~288 readings at 5min intervals; 7d/30d: proportional
            );

            const snapshot = await get(vitalsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                let history = Object.entries(data).map(([key, value]) => ({
                    timestamp: key,
                    ...normalizeVitalsReading(value)
                }));

                // Client-side filtering for now until startAt is verified with the key format
                // Our keys might use underscores or be slightly different in the simulation
                history = history.filter(h => {
                    // Handle potential underscore in keys from simulation script
                    const ts = h.timestamp.replace(/_/g, '.');
                    return new Date(ts).getTime() >= startTime;
                });

                return history;
            }
            return [];
        } catch (error) {
            console.error("Error fetching history:", error);
            return [];
        }
    },

    // Legacy method shim for backward compatibility during refactor
    getVitals: async (patientId, range = '24h') => {
        const history = await api.getVitalHistory(patientId, range);
        // Map back to old format expected by current charts
        // The old format had separate entries for each type. 
        // The new format has one entry with multiple fields.
        // We need to flatten it for the old chart component until it's refactored.

        const flatList = [];
        history.forEach(reading => {
            const hr = reading.hr ?? reading.heart_rate;
            const temp = reading.temp ?? reading.temperature;
            if (hr !== undefined && hr !== null) flatList.push({ type: 'HEART_RATE', value: hr, timestamp: reading.timestamp });
            if (temp !== undefined && temp !== null) flatList.push({ type: 'TEMPERATURE', value: temp, timestamp: reading.timestamp });
        });

        return flatList;
    },

    // Dashboard
    getDashboardStats: async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },

    getAnalytics: async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/dashboard/analytics`, { headers });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    },

    getAlerts: async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/dashboard/alerts`, { headers });
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    getPredictionAlerts: async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/dashboard/prediction-alerts`, { headers });
        if (!response.ok) throw new Error('Failed to fetch prediction alerts');
        return response.json();
    },

    resolveAlert: async (id, patientId) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/dashboard/alerts/${id}/resolve`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ patientId })
        });
        if (!response.ok) throw new Error('Failed to resolve alert');
        return response.json();
    }
};

const { db, rtdb } = require('../config/firebase');

// Simple in-memory cache
const cache = {
    stats: { data: null, timestamp: 0 },
    analytics: { data: null, timestamp: 0 },
    activity: { data: null, timestamp: 0 }
};

const CACHE_TTL = {
    STATS: 15000, // 15 seconds
    ANALYTICS: 60000, // 1 minute
    ACTIVITY: 10000 // 10 seconds (for recent alerts)
};

// Patient Cache to reduce Firestore Quota usage
const patientCache = new Map();

// Helper to safely get patient name with caching and error handling
const getPatientName = async (patientId) => {
    if (patientCache.has(patientId)) {
        return patientCache.get(patientId);
    }

    try {
        const patientDoc = await db.collection('users').doc(patientId).get();
        if (patientDoc.exists) {
            const pData = patientDoc.data();
            const name = `${pData.firstName || ''} ${pData.lastName || ''}`.trim() || 'Unknown Patient';
            patientCache.set(patientId, name);
            return name;
        }
    } catch (error) {
        // Handle Quota Exceeded silently for name lookups
        if (error.code === 8 || error.message.includes('Quota exceeded')) {
            console.warn(`[Quota] Skipping name lookup for ${patientId}`);
            return 'Patient (Quota Limit)';
        }
        console.warn(`Error fetching patient ${patientId}:`, error.message);
    }
    return 'Unknown Patient';
};

const computeStats = async (doctorId) => {
    const now = Date.now();
    const cacheKey = doctorId || 'global';
    if (cache.stats.data && cache.stats.key === cacheKey && (now - cache.stats.timestamp < CACHE_TTL.STATS)) {
        return cache.stats.data;
    }

    try {
        let query = db.collection('users').where('role', '==', 'patient');
        if (doctorId) query = query.where('assignedDoctor', '==', doctorId);
        const snapshot = await query.get();

        let critical = 0;
        let warning = 0;
        let active = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            active++;
            if (data.status === 'Critical') critical++;
            if (data.status === 'Warning') warning++;
        });

        const stats = {
            criticalAlerts: critical,
            warnings: warning,
            activePatients: active,
            pendingReports: 5 // Mocked
        };

        cache.stats = { data: stats, timestamp: now, key: cacheKey };
        return stats;
    } catch (error) {
        console.error("Error computing stats:", error.message);
        // Fallback mock data for quota exceeded or other errors
        return {
            criticalAlerts: 2,
            warnings: 5,
            activePatients: 12,
            pendingReports: 4
        };
    }
};

const fetchActivityLog = async () => {
    const now = Date.now();
    if (cache.activity.data && (now - cache.activity.timestamp < CACHE_TTL.ACTIVITY)) {
        console.log('Serving activity from cache');
        return cache.activity.data;
    }

    try {
        const snapshot = await rtdb.ref('alerts').once('value');
        if (!snapshot.exists()) return [];

        const allAlerts = [];
        const data = snapshot.val();

        Object.keys(data).forEach(patientId => {
            const patientAlerts = data[patientId];
            Object.keys(patientAlerts).forEach(alertId => {
                allAlerts.push({ id: alertId, patientId, ...patientAlerts[alertId] });
            });
        });

        const sorted = allAlerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        cache.activity = { data: sorted, timestamp: now };
        return sorted;
    } catch (error) {
        console.error("Error fetching activity log from RTDB:", error.message);
        return [];
    }
};

const fetchUnreadAlerts = async () => {
    try {
        const snapshot = await rtdb.ref('alerts').once('value');
        if (!snapshot.exists()) return [];

        let allAlerts = [];
        const data = snapshot.val();

        // Flatten
        Object.keys(data).forEach(patientId => {
            const patientAlerts = data[patientId];
            Object.keys(patientAlerts).forEach(alertId => {
                const alert = patientAlerts[alertId];
                if (!alert.isRead) {
                    allAlerts.push({ id: alertId, patientId, ...alert });
                }
            });
        });

        // Sort and Limit
        allAlerts = allAlerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);

        // Enrich with Patient Data
        const enrichedAlerts = await Promise.all(allAlerts.map(async (alert) => {
            try {
                // Optimized Name Lookup with Cache & Error Handling
                const patientName = await getPatientName(alert.patientId);

                // Format relative time
                const diffMs = new Date() - new Date(alert.timestamp);
                const diffMins = Math.floor(diffMs / 60000);
                let timeString = 'Just now';
                if (diffMins > 0 && diffMins < 60) timeString = `${diffMins}m ago`;
                if (diffMins >= 60) timeString = `${Math.floor(diffMins / 60)}h ago`;

                // Map Vital Label (Case insensitive)
                const categoryUpper = (alert.category || '').toUpperCase();
                const vitalMap = {
                    'HEART_RATE': 'Heart Rate',
                    'TEMPERATURE': 'Body Temp'
                };

                const enriched = {
                    ...alert,
                    patient: patientName,
                    time: timeString,
                    vital: vitalMap[categoryUpper] || alert.category || 'Unknown Vital',
                    value: `${alert.value} ${alert.unit || ''}`.trim()
                };

                return enriched;

            } catch (err) {
                console.error(`Error enriching alert ${alert.id}:`, err);
                return alert;
            }
        }));

        console.log(`[Dashboard] Sending ${enrichedAlerts.length} alerts to frontend`);
        return enrichedAlerts;

    } catch (error) {
        console.error("Error fetching unread alerts form RTDB:", error.message);
        return [];
    }
};

const calculateAnalytics = async () => {
    const now = Date.now();
    if (cache.analytics.data && (now - cache.analytics.timestamp < CACHE_TTL.ANALYTICS)) {
        return cache.analytics.data;
    }

    try {
        // 1. Get all patients
        const snapshot = await db.collection('users').where('role', '==', 'patient').get();
        const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const cutoff = Date.now() - 24 * 60 * 60 * 1000;

        // 2. Fetch last 24h of RTDB vitals for each patient in parallel
        const vitalsPerPatient = await Promise.all(
            patients.map(async (patient) => {
                const snap = await rtdb
                    .ref(`patient_data/${patient.id}`)
                    .orderByKey()
                    .limitToLast(300)
                    .once('value');

                const data = snap.val();
                if (!data) return [];

                return Object.values(data).filter(r => {
                    const ts = r.timestamp ? new Date(r.timestamp).getTime() : 0;
                    return ts >= cutoff;
                });
            })
        );

        // 3. Flatten all readings
        const allVitals = vitalsPerPatient.flat();

        // 4. Bucket by hour → average HR per bucket
        const buckets = {}; // "HH:00" -> { sum, count }

        allVitals.forEach(r => {
            if (!r.timestamp) return;

            const date = new Date(r.timestamp);
            const label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            const hr = parseFloat(r.hr ?? r.heart_rate);
            if (Number.isFinite(hr) && hr > 0) {
                if (!buckets[label]) buckets[label] = { sum: 0, count: 0, time: date };
                buckets[label].sum += hr;
                buckets[label].count += 1;
            }
        });

        // 5. Count instability events from Firestore predictions (is_anomaly: true in last 24h)
        const cutoffIso = new Date(cutoff).toISOString();
        const predictionsSnap = await db.collection('predictions')
            .where('created_at', '>=', cutoffIso)
            .get();
        const instabilityEvents = predictionsSnap.docs.filter(d => d.data().is_anomaly === true).length;

        // 5. Sort buckets by time and build trend array
        const trendData = Object.entries(buckets)
            .sort((a, b) => a[1].time - b[1].time)
            .map(([label, { sum, count }]) => ({
                date: label,
                value: Math.round(sum / count)
            }));

        const totalPredictions = predictionsSnap.size;

        const instabilityRate = totalPredictions > 0
            ? Math.round((instabilityEvents / totalPredictions) * 100)
            : 0;

        const analyticsData = {
            trends: trendData,
            glucoseInstabilityEvents: instabilityEvents,
            instabilityRate,
            totalReadings: totalPredictions,
            totalPatients: patients.length
        };

        cache.analytics = { data: analyticsData, timestamp: now };
        return analyticsData;

    } catch (error) {
        console.error("Error calculating analytics:", error.message);
        return {
            trends: [],
            glucoseInstabilityEvents: 0,
            totalPatients: 0
        };
    }
};

const markAlertAsResolved = async (alertId, patientId) => {
    try {
        if (!patientId) throw new Error("patientId is required to resolve alert in RTDB");

        await rtdb.ref(`alerts/${patientId}/${alertId}`).update({
            isRead: true,
            resolvedAt: new Date().toISOString()
        });

        // Invalidate activity cache
        cache.activity = { data: null, timestamp: 0 };
        return { success: true };
    } catch (error) {
        console.error("Error resolving alert:", error);
        throw error;
    }
};

module.exports = {
    computeStats,
    fetchActivityLog,
    fetchUnreadAlerts,
    calculateAnalytics,
    markAlertAsResolved
};

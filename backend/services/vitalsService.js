const { db, rtdb } = require('../config/firebase');
const { checkAndCreateAlert } = require('./alertService');

// Saves one vital sign reading coming from a sensor or the simulator.
// It writes to two places:
//   - Realtime Database (for the live chart on the dashboard)
//   - Firestore (to keep the patient list's "last vitals" summary up to date)
// After saving it also checks whether the value warrants an alert.
const logVitalSign = async (data) => {
    try {
        const { patientId, type, value, unit, timestamp, deviceId } = data;

        const readingTimestamp = timestamp || new Date().toISOString();

        const vitalEntry = {
            [type.toLowerCase()]: value, // e.g. heart_rate, temperature
            timestamp: readingTimestamp,

            // The Flutter mobile app expects these shorter field names
            ...(type === 'HEART_RATE' && { hr: value }),
            ...(type === 'TEMPERATURE' && { temp: value }),

            // HRV values come from the sensor; we fill in random plausibles if not provided
            hrv_sdnn: data.hrv_sdnn || (Math.random() * 20 + 40).toFixed(1),
            hrv_rmssd: data.hrv_rmssd || (Math.random() * 30 + 30).toFixed(1),
            is_unstable_prediction: data.is_unstable_prediction || false,
            instability_risk: data.instability_risk || 'stable',
            instability_probability: data.instability_probability || data.anomaly_score || 0.1,

            metadata: {
                deviceId: deviceId || 'unknown',
                original_type: type,
                unit: unit || ''
            }
        };

        // Using update (not set) so HR and temperature readings at the same timestamp
        // get merged into a single entry rather than overwriting each other
        await rtdb.ref(`patient_data/${patientId}/${readingTimestamp.replace(/\./g, '_')}`).update(vitalEntry);

        // Keep track of which Firestore field to update for this reading type
        let configKey = null;
        if (type === 'HEART_RATE') configKey = 'lastVitalsConfig.heartRate';
        if (type === 'SPO2') configKey = 'lastVitalsConfig.spO2';
        if (type === 'TEMPERATURE') configKey = 'lastVitalsConfig.temperature';

        await checkAndCreateAlert(patientId, type, value);

        const updateData = { updatedAt: new Date().toISOString() };
        if (configKey) updateData[configKey] = value;

        if (Object.keys(updateData).length > 1) {
            await db.collection('users').doc(patientId).update(updateData);
        }

        return { success: true, ...vitalEntry };
    } catch (error) {
        console.error("Error logging vital:", error);
        throw new Error('Database Error: Could not log vital sign');
    }
};

// Grabs the last 200 readings for a patient from the Realtime Database.
// The chart uses this to render the history view.
const fetchVitalHistory = async (patientId, range) => {
    try {
        const snapshot = await rtdb.ref(`patient_data/${patientId}`)
            .orderByKey()
            .limitToLast(200)
            .once('value');

        const data = snapshot.val();
        if (!data) return [];

        // RTDB keys can't contain dots, so we swapped them for underscores on write — swap back here
        return Object.entries(data).map(([key, value]) => ({
            timestamp: key.replace(/_/g, '.'),
            ...value
        }));
    } catch (error) {
        console.error("Error fetching vitals history:", error);
        return [];
    }
};

module.exports = {
    logVitalSign,
    fetchVitalHistory
};

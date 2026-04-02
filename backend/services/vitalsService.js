const { db, rtdb } = require('../config/firebase');
const { checkAndCreateAlert } = require('./alertService');

const logVitalSign = async (data) => {
    try {
        const { patientId, type, value, unit, timestamp, deviceId } = data;

        // Ensure valid timestamp
        const readingTimestamp = timestamp || new Date().toISOString();

        // Construct the full data object matching ML Guide schema
        // Note: In a real scenario, HRV and predictions would come from the sensor/ML pipeline
        // Here we mock them if not provided to satisfy the schema requirements
        const vitalEntry = {
            [type.toLowerCase()]: value, // dynamic key: heart_rate, spo2, temperature
            timestamp: readingTimestamp,

            // Mock ML Fields (Default to stable/normal if not provided)
            hrv_sdnn: data.hrv_sdnn || (Math.random() * 20 + 40).toFixed(1), // 40-60 ms
            hrv_rmssd: data.hrv_rmssd || (Math.random() * 30 + 30).toFixed(1), // 30-60 ms
            is_unstable_prediction: data.is_unstable_prediction || false,
            instability_risk: data.instability_risk || 'stable',
            instability_probability: data.instability_probability || data.anomaly_score || 0.1,

            metadata: {
                deviceId: deviceId || 'unknown',
                original_type: type,
                unit: unit || ''
            }
        };

        // Write to Realtime Database: patient_data/{patientId}/{timestamp}
        // Using 'update' to merge with existing data at this timestamp if multiple sensors report separately
        await rtdb.ref(`patient_data/${patientId}/${readingTimestamp.replace(/\./g, '_')}`).update(vitalEntry);

        // Also update Firestore 'patients' collection for the "Last Vitals" summary on dashboard
        // This keeps the relational view (Patient List) fast without querying RTDB history
        let configKey = null;
        if (type === 'HEART_RATE') configKey = 'lastVitalsConfig.heartRate';
        if (type === 'SPO2') configKey = 'lastVitalsConfig.spO2';
        if (type === 'TEMPERATURE') configKey = 'lastVitalsConfig.temperature';

        // Check for alerts (Business Logic)
        await checkAndCreateAlert(patientId, type, value);

        // Prepare update data
        const updateData = {
            updatedAt: new Date().toISOString()
        };

        if (configKey) {
            updateData[configKey] = value;
        }

        // Single write to patient document
        if (Object.keys(updateData).length > 1) { // Ensure there's more than just updatedAt if configKey was null (though configKey checks exist)
            await db.collection('patients').doc(patientId).update(updateData);
        }

        return { success: true, ...vitalEntry };
    } catch (error) {
        console.error("Error logging vital:", error);
        throw new Error('Database Error: Could not log vital sign');
    }
};

const fetchVitalHistory = async (patientId, range) => {
    try {
        // RTDB Query
        // Note: For large datasets, this should be optimized or paginated
        const snapshot = await rtdb.ref(`patient_data/${patientId}`)
            .orderByKey()
            .limitToLast(50)
            .once('value');

        const data = snapshot.val();
        if (!data) return [];

        // Convert object to array
        return Object.entries(data).map(([key, value]) => ({
            timestamp: key.replace(/_/g, '.'), // Revert any key sanitization if needed
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

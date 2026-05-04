const { db, rtdb } = require('../config/firebase');
const { sendPushToPatient } = require('./fcmService');

// Normal ranges for heart rate and body temperature.
// Readings outside these trigger alerts.
const THRESHOLDS = {
    HEART_RATE: { min: 60, max: 100 },
    TEMPERATURE: { min: 36.0, max: 37.5 }
};

// Called every time a new vital reading comes in.
// Compares the value against the thresholds above, and if something's off
// it saves an alert to the Realtime Database, updates the patient's status
// in Firestore, and fires a push notification to their phone.
const checkAndCreateAlert = async (patientId, type, value) => {
    let alertType = null;
    let message = null;

    if (type === 'HEART_RATE') {
        if (value > THRESHOLDS.HEART_RATE.max) {
            alertType = 'critical';
            message = `High Heart Rate detected: ${value} bpm`;
        } else if (value < THRESHOLDS.HEART_RATE.min) {
            alertType = 'warning';
            message = `Low Heart Rate detected: ${value} bpm`;
        }
    } else if (type === 'TEMPERATURE') {
        if (value > THRESHOLDS.TEMPERATURE.max) {
            alertType = 'warning';
            message = `High Temperature detected: ${value}°C`;
        }
    }

    if (alertType) {
        try {
            const alertData = {
                patientId,
                type: alertType,
                message,
                category: type,
                value,
                isRead: false,
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            const newAlertRef = rtdb.ref(`alerts/${patientId}`).push();
            await newAlertRef.set(alertData);

            console.log(`[Alert] Created ${alertType} alert for patient ${patientId}: ${message}`);

            const status = alertType === 'critical' ? 'Critical' : 'Warning';
            await db.collection('users').doc(patientId).update({ status });

            const pushTitle = alertType === 'critical' ? '🚨 Critical Alert' : '⚠️ Health Warning';
            await sendPushToPatient(patientId, pushTitle, message, { alertType, category: type });

            return { id: newAlertRef.key, ...alertData, newStatus: status };
        } catch (error) {
            console.error("[Alert] Failed to create alert:", error);
        }
    }

    return null;
};

// Triggered when the ML model flags a glucose instability anomaly.
// Stores the prediction alert alongside regular vitals alerts so the
// dashboard and mobile app can surface it the same way.
const createPredictionAlert = async (patientId, predictionData) => {
    try {
        const probability = predictionData.anomaly_probability ?? 0;
        const pct = Math.round(probability * 100);
        const alertData = {
            patientId,
            source: 'prediction',
            type: 'prediction',
            category: 'GLUCOSE_INSTABILITY',
            message: `Glucose instability detected: ${pct}% probability`,
            anomaly_probability: probability,
            xgboost_probability: predictionData.xgboost_probability ?? null,
            lstm_probability: predictionData.lstm_probability ?? null,
            confidence: predictionData.confidence ?? null,
            earliest_reading: predictionData.earliest_reading ?? null,
            latest_reading: predictionData.latest_reading ?? null,
            isRead: false,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const newAlertRef = rtdb.ref(`alerts/${patientId}`).push();
        await newAlertRef.set(alertData);

        console.log(`[Alert] Created prediction alert for patient ${patientId}: ${pct}% anomaly probability`);

        const pushBody = `Glucose instability risk detected. Please check your blood glucose manually.`;
        await sendPushToPatient(patientId, 'GlucoseGuard Alert', pushBody, {
            alertType: 'prediction',
            anomaly_probability: String(probability),
        });

        return { id: newAlertRef.key, ...alertData };
    } catch (error) {
        console.error('[Alert] Failed to create prediction alert:', error);
        return null;
    }
};

module.exports = {
    checkAndCreateAlert,
    createPredictionAlert,
    THRESHOLDS
};

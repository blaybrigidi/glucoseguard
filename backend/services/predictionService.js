const { db } = require('../config/firebase');

const PREDICTIONS_COLLECTION = 'predictions';

/**
 * Save a single prediction from the ML service to Firestore.
 * One record per POST (e.g. one reading every 5 minutes).
 * @param {Object} body - Validated payload from POST body
 * @returns {Object} Saved record with id and created_at
 */
const savePrediction = async (body) => {
    const row = {
        prediction: body.prediction,
        anomaly_probability: body.anomaly_probability,
        xgboost_probability: body.xgboost_probability ?? null,
        lstm_probability: body.lstm_probability ?? null,
        confidence: body.confidence ?? null,
        is_anomaly: body.is_anomaly,
        patient_id: body.patient_id,
        earliest_reading: body.earliest_reading, // ISO string; Firestore stores as string or Timestamp
        latest_reading: body.latest_reading,
        created_at: new Date().toISOString(),
    };

    const docRef = await db.collection(PREDICTIONS_COLLECTION).add(row);
    return { id: docRef.id, ...row };
};

module.exports = {
    savePrediction,
};

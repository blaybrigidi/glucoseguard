const { db } = require('../config/firebase');
const { createPredictionAlert } = require('./alertService');

const PREDICTIONS_COLLECTION = 'predictions';

// Receives a result from the ML service and saves it to Firestore.
// If the model flagged it as an anomaly, we also fire an alert so the
// patient and their doctor get notified straight away.
const savePrediction = async (body) => {
    const row = {
        prediction: body.prediction,
        anomaly_probability: body.anomaly_probability,
        xgboost_probability: body.xgboost_probability ?? null,
        lstm_probability: body.lstm_probability ?? null,
        confidence: body.confidence ?? null,
        is_anomaly: body.is_anomaly,
        patient_id: body.patient_id,
        earliest_reading: body.earliest_reading,
        latest_reading: body.latest_reading,
        created_at: new Date().toISOString(),
    };

    const docRef = await db.collection(PREDICTIONS_COLLECTION).add(row);

    if (body.is_anomaly && body.patient_id) {
        await createPredictionAlert(body.patient_id, row);
    }

    return { id: docRef.id, ...row };
};

module.exports = {
    savePrediction,
};

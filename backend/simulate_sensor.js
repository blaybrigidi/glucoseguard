const { rtdb, db } = require('./config/firebase');
const { logVitalSign } = require('./services/vitalsService');

let patientId = "PIIUSyEd7VaM1H64vpOmZXt2ZTz1";

const getPatientId = async () => {
    try {
        const snapshot = await db.collection('users').limit(1).get();
        if (snapshot.empty) {
            console.error("No patients found in Firestore. Run 'node seedData.js' first.");
            process.exit(1);
        }
        patientId = snapshot.docs[0].id;
        console.log(`[SIM] Using Patient ID: ${patientId}`);
    } catch (error) {
        console.error("Error fetching patient ID:", error.message);
        // Fallback for Quota Exceeded or other errors
        patientId = '1DPtrQMXGl1vjmHz6rqW'; // Known valid ID from previous runs
        console.log(`[SIM] ⚠️ Quota/Error fallback. Using cached Patient ID: ${patientId}`);
        // process.exit(1); // Do not exit, continue with fallback
    }
};

const simulateReading = async () => {
    if (!patientId) await getPatientId();

    try {
        // Randomly trigger high risk
        const isRisk = Math.random() > 0.7;
        const anomalyScore = isRisk ? (Math.random() * 0.5 + 0.5).toFixed(2) : (Math.random() * 0.3).toFixed(2);
        const riskLevel = isRisk ? 'high_risk' : 'stable';

        // If high risk, generate Critical Vital Sign to trigger Alert System
        const heartRate = isRisk
            ? Math.floor(Math.random() * (130 - 105) + 105) // Critical: 105-130
            : Math.floor(Math.random() * (95 - 65) + 65);   // Normal: 65-95

        console.log(`[SIM] Generating reading for Patient ${patientId}: HR=${heartRate}, Risk=${riskLevel}`);

        await logVitalSign({
            patientId,
            type: 'HEART_RATE',
            value: heartRate,
            unit: 'bpm',
            hrv_sdnn: 55,
            hrv_rmssd: 42,
            is_unstable_prediction: isRisk,
            instability_risk: riskLevel,
            instability_probability: parseFloat(anomalyScore)
        });

    } catch (error) {
        console.error("Simulation failed:", error);
    }
};

// Start simulation
(async () => {
    await getPatientId();
    simulateReading();
    setInterval(simulateReading, 5000); // Run every 5 seconds
})();

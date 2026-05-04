// Dev tool — pretends to be a physical sensor by sending fake vitals every 5 seconds.
// All readings are intentionally abnormal so alerts and the live chart are easy to test
// without needing real hardware. Change PATIENT_ID to whichever test patient you want to use.

const { logVitalSign } = require('./services/vitalsService');

const PATIENT_ID = "C40QIC4KuFRPQXF1ezsBuYTmdRg2";

const rand = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

const simulateReading = async () => {
    try {
        const heartRate    = rand(105, 130);   // above normal to trigger alerts
        const temp         = rand(37.4, 37.9); // slightly elevated
        const anomalyScore = rand(0.72, 0.92);
        const hrv_sdnn     = rand(12, 20);
        const hrv_rmssd    = rand(8, 14);

        // Both readings share a timestamp so they merge into a single RTDB entry
        const timestamp = new Date().toISOString();

        console.log(`[SIM] HR=${heartRate} bpm  Temp=${temp}°C  Risk=high_risk  Prob=${anomalyScore}`);

        await logVitalSign({
            patientId: PATIENT_ID,
            type: 'HEART_RATE',
            value: heartRate,
            unit: 'bpm',
            timestamp,
            hrv_sdnn,
            hrv_rmssd,
            is_unstable_prediction: true,
            instability_risk: 'high_risk',
            instability_probability: anomalyScore,
        });

        await logVitalSign({
            patientId: PATIENT_ID,
            type: 'TEMPERATURE',
            value: temp,
            unit: '°C',
            timestamp,
            is_unstable_prediction: true,
            instability_risk: 'high_risk',
            instability_probability: anomalyScore,
        });

    } catch (error) {
        console.error('[SIM] Failed:', error.message);
    }
};

(async () => {
    console.log(`[SIM] Starting continuous anomaly simulation for patient ${PATIENT_ID}`);
    await simulateReading();
    setInterval(simulateReading, 5000);
})();

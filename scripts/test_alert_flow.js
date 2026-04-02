import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { rtdb, db } = require('../backend/config/firebase.js');

const API_URL = 'http://127.0.0.1:5001/api';
const PATIENT_ID = 'test_patient_verify_flow';

const runVerification = async () => {
    try {
        console.log("1. Creating Test Alert in RTDB...");
        const alertData = {
            patientId: PATIENT_ID,
            type: 'critical',
            message: 'Test Critical Alert',
            timestamp: new Date().toISOString(),
            isRead: false,
            value: 120,
            category: 'HEART_RATE'
        };

        const newAlertRef = rtdb.ref(`alerts/${PATIENT_ID}`).push();
        await newAlertRef.set(alertData);
        const alertId = newAlertRef.key;
        console.log(`   - Created Alert ID: ${alertId}`);

        console.log("2. Fetching Alerts via API...");
        // Wait a moment for any potential sync/cache (though RTDB is fast)
        await new Promise(r => setTimeout(r, 1000));

        const response = await axios.get(`${API_URL}/dashboard/alerts`);
        const alerts = response.data;
        const found = alerts.find(a => a.id === alertId);

        if (!found) {
            console.error("FAILED: Alert not found in API response");
            console.log("Response:", JSON.stringify(alerts, null, 2));
            process.exit(1);
        }
        console.log("   - Alert found in API response");

        console.log("3. Resolving Alert via API...");
        await axios.put(`${API_URL}/dashboard/alerts/${alertId}/resolve`, {
            patientId: PATIENT_ID
        });
        console.log("   - Resolved successfully");

        console.log("4. Verifying Resolution in RTDB...");
        const snapshot = await rtdb.ref(`alerts/${PATIENT_ID}/${alertId}`).once('value');
        const updatedData = snapshot.val();

        if (updatedData.isRead === true && updatedData.resolvedAt) {
            console.log("SUCCESS: Alert marked as read in RTDB");
        } else {
            console.error("FAILED: RTDB data not updated correctly", updatedData);
            process.exit(1);
        }

        // Cleanup
        await rtdb.ref(`alerts/${PATIENT_ID}`).remove();
        console.log("   - Cleaned up test data");

        process.exit(0);

    } catch (error) {
        console.error("Verification Failed:", error.message);
        if (error.response) console.error("API Response:", error.response.data);
        process.exit(1);
    }
};

runVerification();

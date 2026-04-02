const { db } = require('./config/firebase');

async function createTestAlert() {
    try {
        console.log("Creating test alert...");
        const res = await db.collection('alerts').add({
            type: 'CRITICAL',
            category: 'HEART_RATE',
            message: 'Test Alert: Heart Rate 150bpm',
            value: 150,
            patientId: 'test_patient_123',
            timestamp: new Date().toISOString(),
            isRead: false
        });
        console.log("Alert created with ID:", res.id);
        process.exit(0);
    } catch (error) {
        console.error("Error creating alert:", error);
        process.exit(1);
    }
}

createTestAlert();

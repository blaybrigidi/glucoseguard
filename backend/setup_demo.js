/**
 * One-time demo setup — saves a patient's FCM token to Firestore.
 * Run once before the demo, then use simulate_demo.py to fire alerts.
 *
 * Usage:
 *   node setup_demo.js <patientId> <fcmToken>
 *
 * Example:
 *   node setup_demo.js abc123xyz "fNw3Rk5rQ..."
 */

const { db } = require('./config/firebase');

const [,, patientId, fcmToken] = process.argv;

if (!patientId || !fcmToken) {
    console.error('Usage: node setup_demo.js <patientId> <fcmToken>');
    process.exit(1);
}

async function run() {
    const ref = db.collection('users').doc(patientId);
    const doc = await ref.get();

    if (!doc.exists) {
        console.error(`No user found with ID: ${patientId}`);
        process.exit(1);
    }

    await ref.update({ fcmToken });
    console.log(`FCM token saved for patient ${patientId} (${doc.data().displayName ?? 'unknown'})`);
    console.log('Demo is ready. Run simulate_demo.py to fire the alert.');
    process.exit(0);
}

run().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

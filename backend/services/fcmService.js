const { admin, db } = require('../config/firebase');

// Sends a push notification to a patient's phone.
// The patient's FCM token (a device identifier) is stored in their Firestore profile
// when they log in on the mobile app. We look it up here and use it to target the message.
// If the token is stale (they uninstalled/reinstalled the app), we clear it so we don't
// keep trying to send to a dead address.
const sendPushToPatient = async (patientId, title, body, data = {}) => {
    try {
        const userDoc = await db.collection('users').doc(patientId).get();

        if (!userDoc.exists) {
            console.warn(`[FCM] No user document for patient ${patientId}`);
            return null;
        }

        const fcmToken = userDoc.data()?.fcmToken;
        if (!fcmToken) {
            console.warn(`[FCM] No FCM token saved for patient ${patientId} — skipping push`);
            return null;
        }

        const message = {
            token: fcmToken,
            notification: { title, body },
            data: {
                // FCM requires all extra data values to be strings
                ...Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)])
                ),
                patientId,
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'glucoseguard_alerts',
                    priority: 'max',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                },
            },
        };

        const response = await admin.messaging().send(message);
        console.log(`[FCM] Sent to patient ${patientId}: ${response}`);
        return response;
    } catch (error) {
        if (error.code === 'messaging/registration-token-not-registered') {
            console.warn(`[FCM] Stale token for patient ${patientId} — clearing from Firestore`);
            await db.collection('users').doc(patientId).update({ fcmToken: null });
        } else {
            console.error(`[FCM] Failed to send to patient ${patientId}:`, error);
        }
        return null;
    }
};

module.exports = { sendPushToPatient };

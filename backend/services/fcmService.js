const { admin, db } = require('../config/firebase');

/**
 * Send a push notification to a patient by looking up their FCM token
 * stored at users/{patientId}/fcmToken in Firestore.
 */
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

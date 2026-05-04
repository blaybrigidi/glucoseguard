const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// This file boots up Firebase on the server side so we can talk to the database.
// We support three ways to provide the secret key — env var (for deployment),
// a file path, or Google's default credentials — whichever is available first.

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        console.log('[FirebaseConfig] Loading key from FIREBASE_SERVICE_ACCOUNT_JSON env var');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        console.log(`[FirebaseConfig] Loading key from ENV: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`);
        serviceAccount = require(path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log(`[FirebaseConfig] Loading key from GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
        try {
            serviceAccount = require(path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS));
        } catch (e) {
            console.error("[FirebaseConfig] Failed to load key file:", e.message);
        }
    } else {
        console.warn("⚠️ No FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS found.");
    }

    const dbUrl = process.env.FIREBASE_DATABASE_URL || "https://diallog-78c08-default-rtdb.firebaseio.com";
    console.log(`[FirebaseConfig] Using Database URL: ${dbUrl}`);

    // Only initialise once — Firebase throws if you call this twice
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
            databaseURL: dbUrl
        });
        console.log("[FirebaseConfig] Firebase Admin Initialized");
    }
} catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
}

// db  = Firestore (structured patient/user records)
// rtdb = Realtime Database (live vitals stream)
const db = admin.firestore();
const rtdb = admin.database();

module.exports = { admin, db, rtdb };

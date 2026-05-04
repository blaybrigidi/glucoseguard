const { admin, db } = require('../config/firebase');

// Creates a new Firebase auth account and saves a doctor profile in Firestore.
// Everyone who registers through the web app is a doctor — patients sign up
// via the mobile app instead.
const registerUser = async ({ email, password, phoneNumber, displayName }) => {
    try {
        const userRecord = await admin.auth().createUser({
            email,
            emailVerified: false,
            phoneNumber,
            password,
            displayName,
            disabled: false,
        });

        console.log('Successfully created new user:', userRecord.uid);

        await db.collection('users').doc(userRecord.uid).set({
            role: 'doctor',
            email: userRecord.email,
            fullName: userRecord.displayName || '',
            createdAt: new Date().toISOString()
        });

        console.log('Successfully created doctor profile for:', userRecord.uid);

        return userRecord;
    } catch (error) {
        console.error('Error creating new user:', error);
        throw new Error(error.message || 'Error creating user');
    }
};

// The server-side Firebase SDK can't sign users in directly — that's a client job.
// This just confirms that a token the frontend sent us is genuine.
const verifyToken = async (idToken) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid Token');
    }
};

module.exports = {
    registerUser,
    verifyToken
};

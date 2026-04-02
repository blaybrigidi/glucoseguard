const { admin, db } = require('../config/firebase');

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

        // RBAC Implementation: Every Web App registration is a Doctor
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

// NOTE: Admin SDK cannot sign in users with email/password.
// For the backend to verify a user, the Frontend should sign in using the Client SDK
// and send the ID Token to the backend for verification.
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

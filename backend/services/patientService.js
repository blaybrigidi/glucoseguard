const { db } = require('../config/firebase');

const findAllPatients = async (filters) => {
    try {
        let query = db.collection('users')
            .where('role', '==', 'patient')
            .where('assignedDoctor', '==', filters.doctorId);

        const snapshot = await query.get();
        if (snapshot.empty) return [];

        const visible = ['pending', 'accepted'];
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => visible.includes(p.assignmentStatus));
    } catch (error) {
        console.error("Error getting patients:", error);
        throw new Error('Database Error: Could not get patients');
    }
};

const getAcceptedPatientIds = async (doctorId) => {
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', 'patient')
            .where('assignedDoctor', '==', doctorId)
            .where('assignmentStatus', '==', 'accepted')
            .get();
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error("Error getting accepted patient IDs:", error);
        return [];
    }
};

const assignPatient = async ({ email, dateOfBirth }, doctorId) => {
    const snapshot = await db.collection('users')
        .where('email', '==', email.trim().toLowerCase())
        .where('role', '==', 'patient')
        .limit(1)
        .get();

    if (snapshot.empty) {
        const err = new Error('No patient account found with that email. The patient must sign up on the mobile app first.');
        err.status = 404;
        throw err;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.dateOfBirth !== dateOfBirth) {
        const err = new Error('Date of birth does not match our records.');
        err.status = 400;
        throw err;
    }

    if (data.assignmentStatus === 'accepted' && data.assignedDoctor !== doctorId) {
        const err = new Error('This patient is already assigned to another doctor.');
        err.status = 409;
        throw err;
    }

    // Already pending or accepted for this same doctor — idempotent
    if (data.assignedDoctor === doctorId && ['pending', 'accepted'].includes(data.assignmentStatus)) {
        return { id: doc.id, ...data };
    }

    // revoked or rejected — allowed to re-request

    await doc.ref.update({
        assignedDoctor: doctorId,
        assignmentStatus: 'pending',
        updatedAt: new Date().toISOString(),
    });

    return { id: doc.id, ...data, assignedDoctor: doctorId, assignmentStatus: 'pending' };
};

const findPatientById = async (id) => {
    try {
        const doc = await db.collection('users').doc(id).get();
        if (!doc.exists) {
            // No patient found with this ID in Firestore
            return null;
        }
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("Error getting patient by id:", error);
        throw new Error('Database Error: Could not get patient');
    }
};

const updatePatient = async (id, updateData) => {
    try {
        const patientRef = db.collection('users').doc(id);
        await patientRef.update({
            ...updateData,
            updatedAt: new Date().toISOString()
        });

        // Return updated data
        const doc = await patientRef.get();
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        throw new Error('Database Error: Could not update patient');
    }
};

const deletePatient = async (id) => {
    try {
        await db.collection('users').doc(id).delete();
        return true;
    } catch (error) {
        throw new Error('Database Error');
    }
};

module.exports = {
    findAllPatients,
    getAcceptedPatientIds,
    assignPatient,
    findPatientById,
    updatePatient,
    deletePatient
};

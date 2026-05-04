const { db } = require('../config/firebase');

// Returns all patients linked to a specific doctor.
// We only show patients whose assignment is pending or accepted —
// rejected/revoked ones are hidden from the list.
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

// Used by the dashboard to know which patients this doctor can see live data for
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

// Links a patient to a doctor. The doctor provides the patient's email and date of birth
// as a simple identity check before the request is sent.
// The patient still needs to accept the request on their mobile app before it's fully active.
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

    // Request already exists for this doctor — nothing to do, just return what we have
    if (data.assignedDoctor === doctorId && ['pending', 'accepted'].includes(data.assignmentStatus)) {
        return { id: doc.id, ...data };
    }

    // If a previous request was revoked or rejected, this creates a fresh one
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

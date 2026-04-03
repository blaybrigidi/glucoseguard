const { db } = require('../config/firebase');

const findAllPatients = async (filters) => {
    try {
        let query = db.collection('users')
            .where('role', '==', 'patient')
            .where('assignedDoctor', '==', filters.doctorId);

        const snapshot = await query.get();
        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting patients:", error);
        throw new Error('Database Error: Could not get patients');
    }
};

const createPatient = async (patientData, doctorId) => {
    try {
        const newPatient = {
            ...patientData,
            name: `${patientData.firstName} ${patientData.lastName}`.trim(),
            role: 'patient',
            assignedDoctor: doctorId,
            createdAt: new Date().toISOString(),
            status: patientData.status || 'Normal'
        };

        const res = await db.collection('users').add(newPatient);
        return { id: res.id, ...newPatient };
    } catch (error) {
        throw new Error('Database Error: Could not create patient');
    }
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
    createPatient,
    findPatientById,
    updatePatient,
    deletePatient
};

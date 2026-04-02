const { db } = require('./config/firebase');
const dotenv = require('dotenv');

dotenv.config();

const INTERVAL_MS = 10000; // 10 seconds

console.log(`Starting Vitals Simulator (Interval: ${INTERVAL_MS}ms)...`);
console.log('Press Ctrl+C to stop.');

const simulate = async () => {
    try {
        // 1. Get all patients
        const patientsSnapshot = await db.collection('patients').get();

        if (patientsSnapshot.empty) {
            console.log('No patients found. Please seed data first.');
            process.exit(1);
        }

        const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Loop indefinitely
        setInterval(async () => {
            const batch = db.batch();
            const now = new Date().toISOString();

            console.log(`[${new Date().toLocaleTimeString()}] Updating ${patients.length} patients...`);

            patients.forEach(patient => {
                const patientRef = db.collection('patients').doc(patient.id);

                // Determine base values based on status (simulate condition)
                let hrBase = patient.status === 'Critical' ? 110 : (patient.status === 'Warning' ? 95 : 72);
                let spo2Base = patient.status === 'Critical' ? 88 : (patient.status === 'Warning' ? 94 : 98);

                // Add random noise
                const hr = Math.floor(hrBase + (Math.random() * 6 - 3));
                const spo2 = Math.floor(spo2Base + (Math.random() * 2 - 1));
                const temp = parseFloat((36.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));

                // Add to vitals history
                const vitalsRef = patientRef.collection('vitals').doc();
                batch.set(vitalsRef, {
                    patientId: patient.id,
                    type: 'HEART_RATE',
                    value: hr,
                    unit: 'bpm',
                    timestamp: now
                });

                const spo2Ref = patientRef.collection('vitals').doc();
                batch.set(spo2Ref, {
                    patientId: patient.id,
                    type: 'SPO2',
                    value: spo2,
                    unit: '%',
                    timestamp: now
                });

                // Update last known state on patient doc for easy dashboard access
                batch.update(patientRef, {
                    updatedAt: now,
                    lastVitalsConfig: {
                        heartRate: hr,
                        spO2: spo2,
                        temperature: temp
                    }
                });
            });

            await batch.commit();

        }, INTERVAL_MS);

    } catch (error) {
        console.error('Simulator Error:', error);
    }
};

simulate();

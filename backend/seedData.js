const { db } = require('./config/firebase');
const dotenv = require('dotenv');

dotenv.config();

const seedPatients = async () => {
    const patients = [
        { firstName: 'Kwame', lastName: 'Mensah', age: 45, status: 'Normal', diagnosis: 'Hypertension' },
        { firstName: 'Ama', lastName: 'Osei', age: 32, status: 'Critical', diagnosis: 'Arrhythmia' },
        { firstName: 'Kofi', lastName: 'Boateng', age: 28, status: 'Normal', diagnosis: 'Healthy' },
        { firstName: 'Esi', lastName: 'Darko', age: 55, status: 'Warning', diagnosis: 'Pre-diabetic' },
        { firstName: 'Yaw', lastName: 'Atta', age: 60, status: 'Critical', diagnosis: 'Post-surgery' },
        { firstName: 'Akosua', lastName: 'Manu', age: 41, status: 'Normal', diagnosis: 'Asthma' },
    ];

    try {
        const batch = db.batch();

        for (const patient of patients) {
            const patientRef = db.collection('patients').doc();
            batch.set(patientRef, {
                ...patient,
                createdAt: new Date().toISOString(),
                lastVitalsConfig: { heartRate: 72, spO2: 98 }
            });

            // Generate 24 hours of vitals history (1 reading per hour)
            const now = new Date();
            for (let i = 24; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000);

                // Random vitals with some variation based on status
                let hrBase = patient.status === 'Critical' ? 110 : (patient.status === 'Warning' ? 95 : 72);
                let spo2Base = patient.status === 'Critical' ? 88 : (patient.status === 'Warning' ? 94 : 98);

                const hr = Math.floor(hrBase + (Math.random() * 10 - 5));
                const spo2 = Math.floor(spo2Base + (Math.random() * 4 - 2));
                const temp = parseFloat((36.5 + (Math.random() * 1 - 0.5)).toFixed(1));

                const vitalsRef = patientRef.collection('vitals').doc();
                batch.set(vitalsRef, {
                    patientId: patientRef.id,
                    type: 'HEART_RATE',
                    value: hr,
                    unit: 'bpm',
                    timestamp: time.toISOString()
                });

                const spo2Ref = patientRef.collection('vitals').doc();
                batch.set(spo2Ref, {
                    patientId: patientRef.id,
                    type: 'SPO2',
                    value: spo2,
                    unit: '%',
                    timestamp: time.toISOString()
                });

                const tempRef = patientRef.collection('vitals').doc();
                batch.set(tempRef, {
                    patientId: patientRef.id,
                    type: 'TEMPERATURE',
                    value: temp,
                    unit: '°C',
                    timestamp: time.toISOString()
                });
            }
        }

        await batch.commit();
        console.log('Successfully seeded database with', patients.length, 'patients.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedPatients();

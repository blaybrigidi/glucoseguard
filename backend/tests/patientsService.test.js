/**
 * Unit Tests: patientService.js
 * Firestore is fully mocked — no real database calls are made.
 */

// ── Mock Firebase before any imports ──────────────────────────────────────────
const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockDoc = jest.fn();
const mockWhere = jest.fn();
const mockCollection = jest.fn();

jest.mock('../config/firebase', () => ({
    db: {
        collection: mockCollection
    }
}));

// ── Import service after mock is set up ───────────────────────────────────────
const {
    findAllPatients,
    createPatient,
    findPatientById,
    deletePatient
} = require('../services/patientService');

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeFakeDoc = (id, data) => ({
    id,
    data: () => data,
    exists: true
});

// ── Test Suite ────────────────────────────────────────────────────────────────
describe('patientService — Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── findAllPatients ────────────────────────────────────────────────────────
    describe('findAllPatients', () => {

        test('UT-S01: returns mapped array of patients with role User', async () => {
            const fakePatients = [
                makeFakeDoc('1DPtrQMXGl1vjmHz6rqW', { fullName: 'Ama Annor', role: 'User', email: 'ama@test.com' }),
                makeFakeDoc('dUXOE7XXlTQQ7Gui2Wg3', { fullName: 'Kofi Mensah', role: 'User', email: 'kofi@test.com' })
            ];

            mockGet.mockResolvedValue({ empty: false, docs: fakePatients });
            mockWhere.mockReturnValue({ get: mockGet });
            mockCollection.mockReturnValue({ where: mockWhere });

            const result = await findAllPatients({});

            expect(result).toHaveLength(2);
            expect(result[0].fullName).toBe('Ama Annor');
            expect(result[1].fullName).toBe('Kofi Mensah');
        });

        test('UT-S02: returns empty array when no patients found', async () => {
            mockGet.mockResolvedValue({ empty: true, docs: [] });
            mockWhere.mockReturnValue({ get: mockGet });
            mockCollection.mockReturnValue({ where: mockWhere });

            const result = await findAllPatients({});
            expect(result).toEqual([]);
        });

        test('UT-S03: throws Database Error when Firestore fails', async () => {
            mockGet.mockRejectedValue(new Error('Firestore connection failed'));
            mockWhere.mockReturnValue({ get: mockGet });
            mockCollection.mockReturnValue({ where: mockWhere });

            await expect(findAllPatients({})).rejects.toThrow('Database Error: Could not get patients');
        });
    });

    // ── findPatientById ────────────────────────────────────────────────────────
    describe('findPatientById', () => {

        test('UT-S04: returns patient when valid ID is provided', async () => {
            const fakeDoc = makeFakeDoc('1DPtrQMXGl1vjmHz6rqW', {
                fullName: 'Ama Annor',
                role: 'User',
                email: 'ama@test.com'
            });

            mockGet.mockResolvedValue(fakeDoc);
            mockDoc.mockReturnValue({ get: mockGet });
            mockCollection.mockReturnValue({ doc: mockDoc });

            const result = await findPatientById('1DPtrQMXGl1vjmHz6rqW');

            expect(result).not.toBeNull();
            expect(result.fullName).toBe('Ama Annor');
            expect(result.id).toBe('1DPtrQMXGl1vjmHz6rqW');
        });

        test('UT-S05: returns null when patient ID does not exist', async () => {
            mockGet.mockResolvedValue({ exists: false });
            mockDoc.mockReturnValue({ get: mockGet });
            mockCollection.mockReturnValue({ doc: mockDoc });

            const result = await findPatientById('nonexistent-id');
            expect(result).toBeNull();
        });

        test('UT-S06: throws Database Error when Firestore fails', async () => {
            mockGet.mockRejectedValue(new Error('Firestore timeout'));
            mockDoc.mockReturnValue({ get: mockGet });
            mockCollection.mockReturnValue({ doc: mockDoc });

            await expect(findPatientById('some-id')).rejects.toThrow('Database Error: Could not get patient');
        });
    });

    // ── createPatient ──────────────────────────────────────────────────────────
    describe('createPatient', () => {

        test('UT-S07: creates patient and returns record with generated id', async () => {
            mockAdd.mockResolvedValue({ id: 'new-generated-id' });
            mockCollection.mockReturnValue({ add: mockAdd });

            const newPatient = {
                fullName: 'Abena Boateng',
                email: 'abena@test.com',
                role: 'User'
            };

            const result = await createPatient(newPatient);

            expect(result.id).toBe('new-generated-id');
            expect(result.fullName).toBe('Abena Boateng');
            expect(result.status).toBe('Normal');
            expect(result.createdAt).toBeDefined();
        });

        test('UT-S08: throws Database Error when Firestore add fails', async () => {
            mockAdd.mockRejectedValue(new Error('Write failed'));
            mockCollection.mockReturnValue({ add: mockAdd });

            await expect(createPatient({ fullName: 'Test' })).rejects.toThrow('Database Error: Could not create patient');
        });
    });

    // ── deletePatient ──────────────────────────────────────────────────────────
    describe('deletePatient', () => {

        test('UT-S09: deletes patient and returns true', async () => {
            mockDelete.mockResolvedValue();
            mockDoc.mockReturnValue({ delete: mockDelete });
            mockCollection.mockReturnValue({ doc: mockDoc });

            const result = await deletePatient('1DPtrQMXGl1vjmHz6rqW');
            expect(result).toBe(true);
        });

        test('UT-S10: throws Database Error when delete fails', async () => {
            mockDelete.mockRejectedValue(new Error('Delete failed'));
            mockDoc.mockReturnValue({ delete: mockDelete });
            mockCollection.mockReturnValue({ doc: mockDoc });

            await expect(deletePatient('some-id')).rejects.toThrow('Database Error');
        });
    });
});
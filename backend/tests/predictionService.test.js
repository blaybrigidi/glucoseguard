/**
 * Unit Tests: predictionService.js
 * Firestore is fully mocked.
 */

const mockAdd = jest.fn();
const mockCollection = jest.fn();

jest.mock('../config/firebase', () => ({
    db: { collection: mockCollection }
}));

const { savePrediction } = require('../services/predictionService');

describe('predictionService — Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('UT-PR01: saves valid prediction and returns record with id', async () => {
        mockAdd.mockResolvedValue({ id: 'pred-abc-123' });
        mockCollection.mockReturnValue({ add: mockAdd });

        const payload = {
            prediction: 1,
            anomaly_probability: 0.72,
            xgboost_probability: 0.61,
            lstm_probability: 0.78,
            confidence: 'High',
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };

        const result = await savePrediction(payload);

        expect(result.id).toBe('pred-abc-123');
        expect(result.anomaly_probability).toBe(0.72);
        expect(result.is_anomaly).toBe(true);
        expect(result.created_at).toBeDefined();
    });

    test('UT-PR02: saves prediction with null optional fields when not provided', async () => {
        mockAdd.mockResolvedValue({ id: 'pred-xyz-456' });
        mockCollection.mockReturnValue({ add: mockAdd });

        const payload = {
            prediction: 0,
            anomaly_probability: 0.11,
            is_anomaly: false,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };

        const result = await savePrediction(payload);

        expect(result.xgboost_probability).toBeNull();
        expect(result.lstm_probability).toBeNull();
        expect(result.confidence).toBeNull();
    });

    test('UT-PR03: calls Firestore predictions collection', async () => {
        mockAdd.mockResolvedValue({ id: 'pred-789' });
        mockCollection.mockReturnValue({ add: mockAdd });

        await savePrediction({
            prediction: 1,
            anomaly_probability: 0.55,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        });

        expect(mockCollection).toHaveBeenCalledWith('predictions');
    });

    test('UT-PR04: throws when Firestore write fails', async () => {
        mockAdd.mockRejectedValue(new Error('Firestore write error'));
        mockCollection.mockReturnValue({ add: mockAdd });

        await expect(savePrediction({
            prediction: 1,
            anomaly_probability: 0.72,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        })).rejects.toThrow();
    });
});
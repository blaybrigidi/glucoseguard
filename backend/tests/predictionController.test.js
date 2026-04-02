/**
 * Unit Tests: predictionController.js
 * Tests the validatePredictionBody function in isolation.
 * No database or network calls required.
 */

// Copy the function here directly so tests run without Firebase
function validatePredictionBody(body) {
    if (body == null || typeof body !== 'object') {
        return 'Invalid prediction payload: body must be an object';
    }
    if (typeof body.prediction !== 'number' || (body.prediction !== 0 && body.prediction !== 1)) {
        return 'Invalid prediction payload: prediction must be 0 or 1';
    }
    if (typeof body.anomaly_probability !== 'number') {
        return 'Invalid prediction payload: anomaly_probability must be a number';
    }
    if (typeof body.is_anomaly !== 'boolean') {
        return 'Invalid prediction payload: is_anomaly must be a boolean';
    }
    if (!body.earliest_reading || typeof body.earliest_reading !== 'string') {
        return 'Invalid prediction payload: earliest_reading is required (ISO string)';
    }
    if (!body.latest_reading || typeof body.latest_reading !== 'string') {
        return 'Invalid prediction payload: latest_reading is required (ISO string)';
    }
    return null;
}

describe('validatePredictionBody — Unit Tests', () => {

    // ----------------------------------------------------------------
    // Valid payload
    // ----------------------------------------------------------------
    test('UT-P01: returns null for a fully valid prediction payload', () => {
        const validPayload = {
            prediction: 1,
            anomaly_probability: 0.72,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(validPayload)).toBeNull();
    });

    test('UT-P02: returns null when prediction is 0 (stable)', () => {
        const payload = {
            prediction: 0,
            anomaly_probability: 0.11,
            is_anomaly: false,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toBeNull();
    });

    // ----------------------------------------------------------------
    // Null / non-object body
    // ----------------------------------------------------------------
    test('UT-P03: returns error when body is null', () => {
        expect(validatePredictionBody(null)).toMatch(/body must be an object/);
    });

    test('UT-P04: returns error when body is a string', () => {
        expect(validatePredictionBody('invalid')).toMatch(/body must be an object/);
    });

    // ----------------------------------------------------------------
    // prediction field
    // ----------------------------------------------------------------
    test('UT-P05: returns error when prediction is not 0 or 1', () => {
        const payload = {
            prediction: 2,
            anomaly_probability: 0.5,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/prediction must be 0 or 1/);
    });

    test('UT-P06: returns error when prediction is a string', () => {
        const payload = {
            prediction: '1',
            anomaly_probability: 0.5,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/prediction must be 0 or 1/);
    });

    // ----------------------------------------------------------------
    // anomaly_probability field
    // ----------------------------------------------------------------
    test('UT-P07: returns error when anomaly_probability is missing', () => {
        const payload = {
            prediction: 1,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/anomaly_probability must be a number/);
    });

    test('UT-P08: returns error when anomaly_probability is a string', () => {
        const payload = {
            prediction: 1,
            anomaly_probability: '0.72',
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/anomaly_probability must be a number/);
    });

    // ----------------------------------------------------------------
    // is_anomaly field
    // ----------------------------------------------------------------
    test('UT-P09: returns error when is_anomaly is not a boolean', () => {
        const payload = {
            prediction: 1,
            anomaly_probability: 0.72,
            is_anomaly: 'true',
            earliest_reading: '2026-03-16T09:00:00Z',
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/is_anomaly must be a boolean/);
    });

    // ----------------------------------------------------------------
    // Reading timestamp fields
    // ----------------------------------------------------------------
    test('UT-P10: returns error when earliest_reading is missing', () => {
        const payload = {
            prediction: 1,
            anomaly_probability: 0.72,
            is_anomaly: true,
            latest_reading: '2026-03-16T10:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/earliest_reading is required/);
    });

    test('UT-P11: returns error when latest_reading is missing', () => {
        const payload = {
            prediction: 1,
            anomaly_probability: 0.72,
            is_anomaly: true,
            earliest_reading: '2026-03-16T09:00:00Z'
        };
        expect(validatePredictionBody(payload)).toMatch(/latest_reading is required/);
    });
});
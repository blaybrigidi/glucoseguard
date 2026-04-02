const vitalsService = require('../services/vitalsService');

// @desc    Record a new vital sign (telemetry)
// @route   POST /api/vitals
// @access  Public
const recordVital = async (req, res, next) => {
    try {
        const { patientId, type, value, unit } = req.body;
        if (!patientId || !type || !value) {
            res.status(400);
            throw new Error('Missing required fields (patientId, type, value)');
        }

        const vital = await vitalsService.logVitalSign(req.body);
        res.status(201).json(vital);
    } catch (error) {
        next(error);
    }
};

// @desc    Get vitals history for a patient
// @route   GET /api/vitals/:patientId
// @access  Public
const getPatientVitals = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const { range } = req.query; // e.g., '1h', '24h'

        const history = await vitalsService.fetchVitalHistory(patientId, range);
        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    recordVital,
    getPatientVitals
};

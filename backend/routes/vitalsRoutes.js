const express = require('express');
const router = express.Router();
const {
    recordVital,
    getPatientVitals
} = require('../controllers/vitalsController');

// @desc    Record a new vital sign (telemetry)
// @route   POST /api/vitals
// @access  Public (or Device Authenticated)
router.post('/', recordVital);

// @desc    Get vitals history for a patient
// @route   GET /api/vitals/:patientId
// @access  Public
router.get('/:patientId', getPatientVitals);

module.exports = router;

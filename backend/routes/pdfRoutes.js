const express = require('express');
const router = express.Router();
const { downloadPatientReport } = require('../controllers/pdfController');

// @desc    Generate and download a patient PDF report
// @route   GET /api/pdf/:patientId
// @access  Private (clinician)
router.get('/:patientId', downloadPatientReport);

module.exports = router;

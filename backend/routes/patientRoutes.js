const express = require('express');
const router = express.Router();
const {
    getPatients,
    createPatient,
    getPatientById,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Public
router.get('/', getPatients);

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Public
router.post('/', createPatient);

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Public
router.get('/:id', getPatientById);

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Public
router.put('/:id', updatePatient);

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Public
router.delete('/:id', deletePatient);

module.exports = router;

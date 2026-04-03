const patientService = require('../services/patientService');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Public
const getPatients = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            status: req.query.status,
            doctorId: req.user.uid,
        };
        const patients = await patientService.findAllPatients(filters);
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Public
const createPatient = async (req, res, next) => {
    try {
        // Basic validation
        if (!req.body.firstName || !req.body.lastName) {
            res.status(400);
            throw new Error('Please include first and last name');
        }

        const patient = await patientService.createPatient(req.body, req.user.uid);
        res.status(201).json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Public
const getPatientById = async (req, res, next) => {
    try {
        const patient = await patientService.findPatientById(req.params.id);
        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }
        res.status(200).json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Public
const updatePatient = async (req, res, next) => {
    try {
        const updatedPatient = await patientService.updatePatient(req.params.id, req.body);
        if (!updatedPatient) {
            res.status(404);
            throw new Error('Patient not found');
        }
        res.status(200).json(updatedPatient);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Public
const deletePatient = async (req, res, next) => {
    try {
        await patientService.deletePatient(req.params.id);
        res.status(200).json({ message: `Deleted patient ${req.params.id}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPatients,
    createPatient,
    getPatientById,
    updatePatient,
    deletePatient
};

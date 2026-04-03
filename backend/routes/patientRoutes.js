const express = require('express');
const router = express.Router();
const {
    getPatients,
    createPatient,
    getPatientById,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPatients);
router.post('/', protect, createPatient);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, deletePatient);

module.exports = router;

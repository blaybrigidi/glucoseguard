const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// @desc    Register new user
// @route   POST /api/auth/register
router.post('/register', register);

module.exports = router;

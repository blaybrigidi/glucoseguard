const authService = require('../services/authService');

// @desc    Register a new user (Patient or Staff)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { email, password, phoneNumber, displayName } = req.body;

        if (!email || !password || !phoneNumber) {
            res.status(400);
            throw new Error('Please provide all fields: email, password, phoneNumber');
        }

        const userRecord = await authService.registerUser({
            email,
            password,
            phoneNumber,
            displayName
        });

        res.status(201).json({
            message: 'User registered successfully',
            uid: userRecord.uid,
            email: userRecord.email
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register
};

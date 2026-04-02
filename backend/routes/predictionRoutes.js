const express = require('express');
const router = express.Router();
const { createPrediction } = require('../controllers/predictionController');

/**
 * Optional auth: if PREDICTIONS_API_SECRET is set, require it in the request.
 * ML service can send: Authorization: Bearer <secret> or X-API-Key: <secret>
 */
const requirePredictionsSecret = (req, res, next) => {
    const secret = process.env.PREDICTIONS_API_SECRET;
    if (!secret) {
        return next(); // no secret configured → allow
    }
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    const token = (authHeader && authHeader.startsWith('Bearer '))
        ? authHeader.slice(7)
        : apiKey;
    if (token !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// @desc    Receive prediction from ML service
// @route   POST /api/predictions
// @access  Optional: set PREDICTIONS_API_SECRET and send Bearer or X-API-Key
router.post('/', requirePredictionsSecret, createPrediction);

module.exports = router;

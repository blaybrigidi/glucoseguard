const predictionService = require('../services/predictionService');

/**
 * Validate prediction payload shape from the ML service.
 * Required: prediction (0|1), anomaly_probability, is_anomaly, earliest_reading, latest_reading.
 */
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

// @desc    Receive and persist a prediction from the ML service
// @route   POST /api/predictions
// @access  Protected by optional PREDICTIONS_API_SECRET (see predictionRoutes)
const createPrediction = async (req, res, next) => {
    try {
        const validationError = validatePredictionBody(req.body);
        if (validationError) {
            res.status(400);
            throw new Error(validationError);
        }

        const record = await predictionService.savePrediction(req.body);
        console.log('Prediction saved:', record);
        res.status(201).json(record);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPrediction,
};

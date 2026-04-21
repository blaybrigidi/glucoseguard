const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRecentActivity,
    getAnalytics,
    getAlerts,
    getPredictionAlerts,
    resolveAlert
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/analytics', protect, getAnalytics);
router.get('/activity', protect, getRecentActivity);
router.get('/alerts', protect, getAlerts);
router.get('/prediction-alerts', protect, getPredictionAlerts);
router.put('/alerts/:id/resolve', protect, resolveAlert);

module.exports = router;

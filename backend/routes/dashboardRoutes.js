const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRecentActivity,
    getAnalytics,
    getAlerts
} = require('../controllers/dashboardController');

// @desc    Get dashboard summary cards stats
// @route   GET /api/dashboard/stats
// @access  Public
router.get('/stats', getDashboardStats);

// @desc    Get analytics and trends
// @route   GET /api/dashboard/analytics
// @access  Public
router.get('/analytics', getAnalytics);

// @desc    Get recent activity feed (alerts/logs)
// @route   GET /api/dashboard/activity
// @access  Public
router.get('/activity', getRecentActivity);

// @desc    Get all alerts
// @route   GET /api/dashboard/alerts
// @access  Public
router.get('/alerts', getAlerts);

// @desc    Mark alert as resolved
// @route   PUT /api/dashboard/alerts/:id/resolve
// @access  Public
router.put('/alerts/:id/resolve', require('../controllers/dashboardController').resolveAlert);

module.exports = router;

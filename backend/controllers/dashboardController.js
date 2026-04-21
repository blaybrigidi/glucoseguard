const dashboardService = require('../services/dashboardService');

// @desc    Get dashboard summary cards stats
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await dashboardService.computeStats(req.user.uid);
        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent activity feed
// @route   GET /api/dashboard/activity
// @access  Public
const getRecentActivity = async (req, res, next) => {
    try {
        const activity = await dashboardService.fetchActivityLog(req.user.uid);
        res.status(200).json(activity);
    } catch (error) {
        next(error);
    }
};

const getAlerts = async (req, res, next) => {
    try {
        const alerts = await dashboardService.fetchUnreadAlerts(req.user.uid);
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

// @desc    Get analytics trends and aggregate data
// @route   GET /api/dashboard/analytics
// @access  Public
const getAnalytics = async (req, res, next) => {
    try {
        const data = await dashboardService.calculateAnalytics();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const resolveAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { patientId } = req.body; // Expect patientId in body

        if (!patientId) {
            return res.status(400).json({ error: 'patientId is required' });
        }

        await dashboardService.markAlertAsResolved(id, patientId);
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

const getPredictionAlerts = async (req, res, next) => {
    try {
        const alerts = await dashboardService.fetchPredictionAlerts(req.user.uid);
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivity,
    getAnalytics,
    getAlerts,
    getPredictionAlerts,
    resolveAlert
};

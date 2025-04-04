/**
 * Statistics and analytics routes
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, checkRole } = require('../middleware/auth');

// Get user's statistics
router.get('/user', authenticate, statsController.getUserStats);

// Get site statistics (requires authentication)
router.get('/site', authenticate, statsController.getSiteStats);

// Get detailed analytics (admin only)
router.get('/analytics', authenticate, checkRole('admin'), statsController.getAnalytics);

// Get real-time metrics (admin only)
router.get('/realtime', authenticate, checkRole('admin'), statsController.getRealtimeMetrics);

// Get historical data
router.get('/historical', authenticate, statsController.getHistoricalData);

module.exports = router; 
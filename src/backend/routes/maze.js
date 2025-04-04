/**
 * Maze generation and verification routes
 */

const express = require('express');
const router = express.Router();
const mazeController = require('../controllers/mazeController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Generate new maze
router.post('/generate', rateLimiter, mazeController.generateMaze);

// Verify maze solution
router.post('/verify', rateLimiter, mazeController.verifyMaze);

// Get maze stats
router.get('/stats', authenticate, mazeController.getMazeStats);

// Get maze configuration
router.get('/config', authenticate, mazeController.getMazeConfig);

// Update maze configuration (admin only)
router.put('/config', authenticate, mazeController.updateMazeConfig);

// Get admin maze analytics
router.get('/analytics', authenticate, mazeController.getMazeAnalytics);

module.exports = router; 